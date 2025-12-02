import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { User } from '../users/entities/user.entity';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('carts')
@UseGuards(JwtAuthGuard)
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post()
  addToCart(@GetUser() user: User, @Body() addToCartDto: AddToCartDto) {
    return this.cartsService.addToCart(user, addToCartDto);
  }

  @Get()
  getCart(@GetUser() user: User) {
    return this.cartsService.getCart(user);
  }

  @Patch(':id')
  updateCartItem(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) cartItemId: number,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartsService.updateCartItem(
      user,
      cartItemId,
      updateCartItemDto,
    );
  }

  @Delete(':id')
  removeCartItem(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) cartItemId: number,
  ) {
    return this.cartsService.removeCartItem(user, cartItemId);
  }

  @Delete()
  clearCart(@GetUser() user: User) {
    return this.cartsService.clearCart(user);
  }

  @Get('total')
  getCartTotal(@GetUser() user: User) {
    return this.cartsService.getCartTotal(user);
  }
}
