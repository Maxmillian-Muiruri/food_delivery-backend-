import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { User } from '../users/entities/user.entity';
import { MenuItem } from '../menu-items/entities/menu-item.entity';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
  ) {}

  async addToCart(user: User, addToCartDto: AddToCartDto): Promise<Cart> {
    const { menu_item_id, quantity, special_instructions } = addToCartDto;

    // Check if menu item exists and is available
    const menuItem = await this.menuItemRepository.findOne({
      where: { id: menu_item_id },
      relations: ['restaurant'],
    });

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    if (!menuItem.is_available) {
      throw new BadRequestException('Menu item is not available');
    }

    // Check if item already exists in cart for this user and restaurant
    const existingCartItem = await this.cartRepository.findOne({
      where: {
        user_id: user.id,
        menu_item_id,
        restaurant_id: menuItem.restaurant_id,
      },
    });

    if (existingCartItem) {
      // Update quantity
      existingCartItem.quantity += quantity;
      existingCartItem.special_instructions =
        special_instructions || existingCartItem.special_instructions;
      existingCartItem.price_at_purchase = menuItem.price;
      return await this.cartRepository.save(existingCartItem);
    } else {
      // Create new cart item
      const cartItem = this.cartRepository.create({
        user_id: user.id,
        restaurant_id: menuItem.restaurant_id,
        menu_item_id,
        quantity,
        special_instructions,
        price_at_purchase: menuItem.price,
      });
      return await this.cartRepository.save(cartItem);
    }
  }

  async getCart(user: User): Promise<Cart[]> {
    return await this.cartRepository.find({
      where: { user_id: user.id },
      relations: ['menu_item', 'restaurant'],
      order: { created_at: 'ASC' },
    });
  }

  async updateCartItem(
    user: User,
    cartItemId: number,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<Cart> {
    const cartItem = await this.cartRepository.findOne({
      where: { id: cartItemId, user_id: user.id },
      relations: ['menu_item'],
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    // Update fields
    if (updateCartItemDto.quantity !== undefined) {
      if (updateCartItemDto.quantity <= 0) {
        throw new BadRequestException('Quantity must be greater than 0');
      }
      cartItem.quantity = updateCartItemDto.quantity;
    }

    if (updateCartItemDto.special_instructions !== undefined) {
      cartItem.special_instructions = updateCartItemDto.special_instructions;
    }

    return await this.cartRepository.save(cartItem);
  }

  async removeCartItem(user: User, cartItemId: number): Promise<void> {
    const result = await this.cartRepository.delete({
      id: cartItemId,
      user_id: user.id,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Cart item not found');
    }
  }

  async clearCart(user: User): Promise<void> {
    await this.cartRepository.delete({ user_id: user.id });
  }

  async getCartTotal(user: User): Promise<{ total: number; items: number }> {
    const cartItems = await this.cartRepository.find({
      where: { user_id: user.id },
    });

    const total = cartItems.reduce(
      (sum, item) => sum + item.price_at_purchase * item.quantity,
      0,
    );
    const items = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return { total, items };
  }
}
