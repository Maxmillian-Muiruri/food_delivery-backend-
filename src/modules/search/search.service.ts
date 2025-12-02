import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { MenuItem } from '../menu-items/entities/menu-item.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
  ) {}

  async search(query: string): Promise<{
    restaurants: Restaurant[];
    menu_items: MenuItem[];
  }> {
    const results = {
      restaurants: [] as Restaurant[],
      menu_items: [] as MenuItem[],
    };

    if (!query || query.trim().length === 0) {
      return results;
    }

    const searchTerm = `%${query.trim()}%`;

    // Search restaurants
    const restaurants = await this.restaurantRepository
      .createQueryBuilder('restaurant')
      .leftJoinAndSelect('restaurant.menuItems', 'menuItems')
      .where(
        'restaurant.name LIKE :searchTerm OR restaurant.description LIKE :searchTerm',
        { searchTerm },
      )
      .getMany();

    // Search menu items
    const menuItems = await this.menuItemRepository
      .createQueryBuilder('menuItem')
      .leftJoinAndSelect('menuItem.restaurant', 'restaurant')
      .where(
        'menuItem.name LIKE :searchTerm OR menuItem.description LIKE :searchTerm',
        { searchTerm },
      )
      .getMany();

    results.restaurants = restaurants;
    results.menu_items = menuItems;

    return results;
  }
}
