import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { User } from '../users/entities/user.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { MenuItem } from '../menu-items/entities/menu-item.entity';
import { AddFavoriteDto } from './dto/add-favorite.dto';
import { RemoveFavoriteDto } from './dto/remove-favorite.dto';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
  ) {}

  async addFavorite(
    user: User,
    addFavoriteDto: AddFavoriteDto,
  ): Promise<Favorite> {
    const { restaurantId, menuItemId } = addFavoriteDto;

    // Check if the favorite already exists
    const existingFavorite = await this.favoriteRepository.findOne({
      where: {
        user: { id: user.id },
        restaurant: restaurantId ? { id: restaurantId } : undefined,
        menuItem: menuItemId ? { id: menuItemId } : undefined,
      },
    });

    if (existingFavorite) {
      throw new ConflictException('This item is already in favorites');
    }

    // Validate that the restaurant or menu item exists
    if (restaurantId) {
      const restaurant = await this.restaurantRepository.findOne({
        where: { id: restaurantId },
      });
      if (!restaurant) {
        throw new NotFoundException('Restaurant not found');
      }
    }

    if (menuItemId) {
      const menuItem = await this.menuItemRepository.findOne({
        where: { id: menuItemId },
      });
      if (!menuItem) {
        throw new NotFoundException('Menu item not found');
      }
    }

    const favorite = new Favorite();
    favorite.user = user;
    if (restaurantId) {
      favorite.restaurant = { id: restaurantId } as Restaurant;
    }
    if (menuItemId) {
      favorite.menuItem = { id: menuItemId } as MenuItem;
    }

    return this.favoriteRepository.save(favorite);
  }

  async removeFavorite(
    user: User,
    removeFavoriteDto: RemoveFavoriteDto,
  ): Promise<void> {
    const { restaurantId, menuItemId } = removeFavoriteDto;

    const favorite = await this.favoriteRepository.findOne({
      where: {
        user: { id: user.id },
        restaurant: restaurantId ? { id: restaurantId } : undefined,
        menuItem: menuItemId ? { id: menuItemId } : undefined,
      },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.favoriteRepository.remove(favorite);
  }

  async getUserFavorites(user: User): Promise<Favorite[]> {
    return this.favoriteRepository.find({
      where: { user: { id: user.id } },
      relations: ['restaurant', 'menuItem'],
      order: { createdAt: 'DESC' },
    });
  }

  async getFavoriteRestaurants(user: User): Promise<Restaurant[]> {
    const favorites = await this.favoriteRepository.find({
      where: { user: { id: user.id } },
      relations: ['restaurant'],
    });

    return favorites
      .map((fav) => fav.restaurant)
      .filter((r): r is Restaurant => r !== undefined);
  }

  async getFavoriteMenuItems(user: User): Promise<MenuItem[]> {
    const favorites = await this.favoriteRepository.find({
      where: { user: { id: user.id } },
      relations: ['menuItem'],
    });

    return favorites
      .map((fav) => fav.menuItem)
      .filter((m): m is MenuItem => m !== undefined);
  }
}
