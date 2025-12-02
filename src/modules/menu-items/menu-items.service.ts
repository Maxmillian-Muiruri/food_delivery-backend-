import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem } from './entities/menu-item.entity';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { QueryMenuItemDto } from './dto/query-menu-item.dto';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { User } from '../users/entities/user.entity';
import { CloudinaryService } from '../../common/services/cloudinary.service';

@Injectable()
export class MenuItemsService {
  constructor(
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    createMenuItemDto: CreateMenuItemDto,
    owner: User,
  ): Promise<MenuItem> {
    // Verify the restaurant exists and belongs to the user
    const restaurant = await this.restaurantRepository.findOne({
      where: { id: createMenuItemDto.restaurant_id, owner_id: owner.id },
    });

    if (!restaurant) {
      throw new NotFoundException(
        'Restaurant not found or does not belong to user',
      );
    }

    // Check for unique name per restaurant
    const existingMenuItem = await this.menuItemRepository.findOne({
      where: {
        name: createMenuItemDto.name,
        restaurant_id: createMenuItemDto.restaurant_id,
      },
    });

    if (existingMenuItem) {
      throw new BadRequestException(
        'Menu item with this name already exists for this restaurant',
      );
    }

    const menuItem = this.menuItemRepository.create({
      ...createMenuItemDto,
    });

    return this.menuItemRepository.save(menuItem);
  }

  async findAll(queryDto: QueryMenuItemDto): Promise<MenuItem[]> {
    const query = this.menuItemRepository
      .createQueryBuilder('menuItem')
      .leftJoinAndSelect('menuItem.restaurant', 'restaurant');

    // Search by name
    if (queryDto.search) {
      query.andWhere('menuItem.name ILIKE :search', {
        search: `%${queryDto.search}%`,
      });
    }

    // Filter by category
    if (queryDto.category) {
      query.andWhere('menuItem.category = :category', {
        category: queryDto.category,
      });
    }

    // Filter by dietary tags
    if (queryDto.dietary_tags && queryDto.dietary_tags.length > 0) {
      query.andWhere('menuItem.dietary_tags && :dietaryTags', {
        dietaryTags: queryDto.dietary_tags,
      });
    }

    // Filter by allergens
    if (queryDto.allergens && queryDto.allergens.length > 0) {
      query.andWhere('NOT (menuItem.allergens && :allergens)', {
        allergens: queryDto.allergens,
      });
    }

    // Filter by price range
    if (queryDto.min_price !== undefined) {
      query.andWhere('menuItem.price >= :minPrice', {
        minPrice: queryDto.min_price,
      });
    }
    if (queryDto.max_price !== undefined) {
      query.andWhere('menuItem.price <= :maxPrice', {
        maxPrice: queryDto.max_price,
      });
    }

    // Filter by availability
    if (queryDto.is_available !== undefined) {
      query.andWhere('menuItem.is_available = :isAvailable', {
        isAvailable: queryDto.is_available,
      });
    }

    // Filter by restaurant (legacy support)
    if (queryDto.restaurant_id) {
      query.andWhere('menuItem.restaurant_id = :restaurantId', {
        restaurantId: queryDto.restaurant_id,
      });
    }

    // Sorting
    const sortBy = queryDto.sort_by || 'created_at';
    const order = queryDto.order || 'DESC';
    query.orderBy(`menuItem.${sortBy}`, order);

    // Pagination
    if (queryDto.page && queryDto.limit) {
      query.skip((queryDto.page - 1) * queryDto.limit).take(queryDto.limit);
    }

    return query.getMany();
  }

  async findOne(id: number): Promise<MenuItem> {
    const menuItem = await this.menuItemRepository.findOne({
      where: { id },
      relations: ['restaurant'],
    });

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    return menuItem;
  }

  async update(
    id: number,
    updateMenuItemDto: UpdateMenuItemDto,
    owner: User,
  ): Promise<MenuItem> {
    const menuItem = await this.menuItemRepository.findOne({
      where: { id },
      relations: ['restaurant'],
    });

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    // Check if the restaurant owner matches
    if (menuItem.restaurant.owner_id !== owner.id) {
      throw new ForbiddenException(
        'You can only update menu items for your own restaurants',
      );
    }

    // Check for unique name per restaurant if name is being updated
    if (updateMenuItemDto.name && updateMenuItemDto.name !== menuItem.name) {
      const existingMenuItem = await this.menuItemRepository.findOne({
        where: {
          name: updateMenuItemDto.name,
          restaurant_id: menuItem.restaurant_id,
        },
      });

      if (existingMenuItem) {
        throw new BadRequestException(
          'Menu item with this name already exists for this restaurant',
        );
      }
    }

    Object.assign(menuItem, updateMenuItemDto);
    return this.menuItemRepository.save(menuItem);
  }

  async remove(id: number, owner: User): Promise<void> {
    const menuItem = await this.menuItemRepository.findOne({
      where: { id },
      relations: ['restaurant'],
    });

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    // Check if the restaurant owner matches
    if (menuItem.restaurant.owner_id !== owner.id) {
      throw new ForbiddenException(
        'You can only delete menu items for your own restaurants',
      );
    }

    await this.menuItemRepository.remove(menuItem);
  }

  async toggleAvailability(id: number, owner: User): Promise<MenuItem> {
    const menuItem = await this.menuItemRepository.findOne({
      where: { id },
      relations: ['restaurant'],
    });

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    // Check if the restaurant owner matches
    if (menuItem.restaurant.owner_id !== owner.id) {
      throw new ForbiddenException(
        'You can only update menu items for your own restaurants',
      );
    }

    menuItem.is_available = !menuItem.is_available;
    return this.menuItemRepository.save(menuItem);
  }

  async bulkToggleAvailability(
    ids: number[],
    owner: User,
  ): Promise<MenuItem[]> {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('At least one menu item ID is required');
    }

    // Find all menu items and verify ownership
    const menuItems = await this.menuItemRepository
      .createQueryBuilder('menuItem')
      .leftJoinAndSelect('menuItem.restaurant', 'restaurant')
      .where('menuItem.id IN (:...ids)', { ids })
      .getMany();

    if (menuItems.length !== ids.length) {
      throw new NotFoundException('One or more menu items not found');
    }

    // Check ownership for all items
    for (const menuItem of menuItems) {
      if (menuItem.restaurant.owner_id !== owner.id) {
        throw new ForbiddenException(
          'You can only update menu items for your own restaurants',
        );
      }
    }

    // Toggle availability for all items
    menuItems.forEach((item) => {
      item.is_available = !item.is_available;
    });

    return this.menuItemRepository.save(menuItems);
  }

  async getCategories(restaurantId?: number): Promise<string[]> {
    const query = this.menuItemRepository
      .createQueryBuilder('menuItem')
      .select('DISTINCT menuItem.category')
      .where('menuItem.category IS NOT NULL')
      .andWhere("menuItem.category != ''");

    if (restaurantId) {
      query.andWhere('menuItem.restaurant_id = :restaurantId', {
        restaurantId,
      });
    }

    const result = await query.getRawMany();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
    return result.map((row: any) => row.category).filter(Boolean) as string[];
  }

  async updateMenuItemImage(
    id: number,
    file: { buffer: Buffer },
    owner: User,
  ): Promise<MenuItem> {
    const menuItem = await this.menuItemRepository.findOne({
      where: { id },
      relations: ['restaurant'],
    });

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    if (menuItem.restaurant.owner_id !== owner.id) {
      throw new ForbiddenException(
        'You can only update images for menu items in your own restaurants',
      );
    }

    // Delete old image if exists
    if (menuItem.image_public_id) {
      await this.cloudinaryService.deleteImage(menuItem.image_public_id);
    }

    // Upload new image
    const { url, public_id } = await this.cloudinaryService.uploadImage(
      file,
      `menu-items/${owner.id}`,
    );

    menuItem.image_url = url;
    menuItem.image_public_id = public_id;
    return this.menuItemRepository.save(menuItem);
  }
}
