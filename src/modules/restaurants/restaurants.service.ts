import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { User } from '../users/entities/user.entity';
import { Address, AddressType } from '../addresses/entities/address.entity';
import { MenuItem } from '../menu-items/entities/menu-item.entity';
import { CloudinaryService } from '../../common/services/cloudinary.service';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
    private readonly cloudinaryService: CloudinaryService,
    private dataSource: DataSource,
  ) {}

  async create(createRestaurantDto: CreateRestaurantDto): Promise<Restaurant> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.userRepository.findOne({
        where: { id: createRestaurantDto.owner_id },
        select: ['id', 'role'],
      });

      if (!user) {
        throw new NotFoundException(
          `User with ID ${createRestaurantDto.owner_id} not found`,
        );
      }

      if (user.role !== 'restaurant_owner') {
        throw new ForbiddenException(
          'Only users with restaurant_owner role can create restaurants',
        );
      }

      const existingRestaurant = await this.restaurantRepository.findOne({
        where: { owner_id: createRestaurantDto.owner_id },
      });

      if (existingRestaurant) {
        throw new ConflictException('User already has a restaurant');
      }

      // Generate unique restaurant code
      const restaurantCode = await this.generateRestaurantCode();

      const restaurant = this.restaurantRepository.create({
        owner_id: createRestaurantDto.owner_id,
        name: createRestaurantDto.name,
        description: createRestaurantDto.description,
        logo_url: createRestaurantDto.image_url || '',
        phone_number: createRestaurantDto.contact_info || '',
        delivery_fee: createRestaurantDto.delivery_fee || 0,
        restaurant_code: restaurantCode,
        is_active: true,
        is_verified: false,
        rating_average: 0,
        total_ratings: 0,
        // Required fields
        address: createRestaurantDto.area || 'Restaurant Address',
        city: createRestaurantDto.town || 'Nairobi',
        state: createRestaurantDto.county || 'Nairobi',
        latitude: 0, // Default coordinates
        longitude: 0, // Default coordinates
      });
      const savedRestaurant = await queryRunner.manager.save(restaurant);

      const address = this.addressRepository.create({
        label: createRestaurantDto.area || 'Restaurant Address',
        street_address: createRestaurantDto.county || '',
        street: createRestaurantDto.county || '', // Required field
        city: createRestaurantDto.town || '',
        state: '',
        postal_code: '',
        zip_code: '00000', // Required field
        country: createRestaurantDto.country || 'Kenya',
        type: AddressType.OTHER,
        is_default: true,
        userId: createRestaurantDto.owner_id, // Use userId (camelCase)
      });
      const savedAddress = await queryRunner.manager.save(address);

      // Update the restaurant with the address_id
      savedRestaurant.address_id = savedAddress.id;
      const finalRestaurant = await queryRunner.manager.save(savedRestaurant);

      await queryRunner.commitTransaction();

      const createdRestaurant = await this.restaurantRepository.findOne({
        where: { id: finalRestaurant.id },
        relations: ['owner', 'address_relation'],
        select: {
          owner: {
            id: true,
            email: true,
          },
        },
      });
      if (!createdRestaurant) {
        throw new NotFoundException(
          `Restaurant with ID ${finalRestaurant.id} not found`,
        );
      }

      return createdRestaurant;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Restaurant[]> {
    return await this.restaurantRepository.find({
      relations: ['owner', 'address_relation'],
      select: {
        owner: {
          id: true,
          email: true,
        },
      },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository
      .createQueryBuilder('restaurant')
      .leftJoinAndSelect('restaurant.owner', 'owner')
      .leftJoinAndSelect('restaurant.address_relation', 'address')
      .select([
        'restaurant.id',
        'restaurant.name',
        'restaurant.description',
        'restaurant.logo_url',
        'restaurant.phone_number',
        'restaurant.email',
        'restaurant.rating_average',
        'restaurant.estimated_delivery_time',
        'restaurant.minimum_order_amount',
        'restaurant.delivery_fee',
        'restaurant.cuisine_type',
        'restaurant.is_active',
        'restaurant.opening_hours',
        'restaurant.created_at',
        'restaurant.updated_at',
        'owner.id',
        'owner.full_name',
        'owner.email',
        'address.id',
        'address.street_address',
        'address.city',
        'address.state',
        'address.postal_code',
        'address.country',
      ])
      .where('restaurant.id = :id', { id })
      .andWhere('restaurant.is_active = :is_active', { is_active: true })
      .getOne();

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    return restaurant;
  }

  async findByOwner(ownerId: number): Promise<Restaurant[]> {
    return this.restaurantRepository.find({
      where: { owner_id: ownerId },
      relations: ['address_relation'],
      select: [
        'id',
        'name',
        'description',
        'logo_url',
        'phone_number',
        'email',
        'rating_average',
        'estimated_delivery_time',
        'minimum_order_amount',
        'delivery_fee',
        'cuisine_type',
        'is_active',
        'opening_hours',
        'created_at',
        'updated_at',
      ],
    });
  }

  async update(
    id: number,
    updateRestaurantDto: UpdateRestaurantDto,
    owner: User,
  ): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id, owner_id: owner.id },
    });

    if (!restaurant) {
      throw new NotFoundException(
        'Restaurant not found or does not belong to user',
      );
    }

    Object.assign(restaurant, updateRestaurantDto);
    return this.restaurantRepository.save(restaurant);
  }

  async remove(id: number, owner: User): Promise<void> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id, owner_id: owner.id },
    });

    if (!restaurant) {
      throw new NotFoundException(
        'Restaurant not found or does not belong to user',
      );
    }

    await this.restaurantRepository.remove(restaurant);
  }

  async toggleActive(id: number, owner: User): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id, owner_id: owner.id },
    });

    if (!restaurant) {
      throw new NotFoundException(
        'Restaurant not found or does not belong to user',
      );
    }

    restaurant.is_active = !restaurant.is_active;
    return this.restaurantRepository.save(restaurant);
  }

  async updateRestaurantLogo(
    id: number,
    file: { buffer: Buffer },
    owner: User,
  ): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id, owner_id: owner.id },
    });

    if (!restaurant) {
      throw new NotFoundException(
        'Restaurant not found or does not belong to user',
      );
    }

    // Delete old image if exists
    if (restaurant.logo_public_id) {
      await this.cloudinaryService.deleteImage(restaurant.logo_public_id);
    }

    // Upload new image
    const { url, public_id } = await this.cloudinaryService.uploadImage(
      file,
      `restaurants/${owner.id}`,
    );

    restaurant.logo_url = url;
    restaurant.logo_public_id = public_id;
    return this.restaurantRepository.save(restaurant);
  }

  async updateRestaurantBanner(
    id: number,
    file: { buffer: Buffer },
    owner: User,
  ): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id, owner_id: owner.id },
    });

    if (!restaurant) {
      throw new NotFoundException(
        'Restaurant not found or does not belong to user',
      );
    }

    // Delete old image if exists
    if (restaurant.banner_public_id) {
      await this.cloudinaryService.deleteImage(restaurant.banner_public_id);
    }

    // Upload new image
    const { url, public_id } = await this.cloudinaryService.uploadImage(
      file,
      `restaurants/${owner.id}`,
    );

    restaurant.banner_url = url;
    restaurant.banner_public_id = public_id;
    return this.restaurantRepository.save(restaurant);
  }

  // Location-based filtering (from Stores module)
  async findByLocation(
    city: string,
    state?: string,
    country?: string,
  ): Promise<Restaurant[]> {
    const query = this.restaurantRepository
      .createQueryBuilder('restaurant')
      .leftJoinAndSelect('restaurant.owner', 'owner')
      .leftJoinAndSelect('restaurant.address_relation', 'address')
      .where('LOWER(restaurant.city) = LOWER(:city)', { city });

    if (state) {
      query.andWhere('LOWER(restaurant.state) = LOWER(:state)', { state });
    }

    if (country) {
      query.andWhere('LOWER(address.country) = LOWER(:country)', { country });
    }

    query.andWhere('restaurant.is_active = :is_active', { is_active: true });

    return await query.orderBy('restaurant.rating_average', 'DESC').getMany();
  }

  // Rating system (from Stores module)
  async updateRating(id: number, rating: number): Promise<Restaurant> {
    const restaurant = await this.findOne(id);

    const totalRatings = restaurant.business_total_reviews || 0;
    const currentAverage = restaurant.business_rating || 0;

    // Calculate new average rating
    const newTotalRatings = totalRatings + 1;
    const newAverage =
      (currentAverage * totalRatings + rating) / newTotalRatings;

    restaurant.business_total_reviews = newTotalRatings;
    restaurant.business_rating = Math.round(newAverage * 100) / 100; // Round to 2 decimal places

    await this.restaurantRepository.save(restaurant);
    return restaurant;
  }

  // Verification system (from Stores module)
  async verifyRestaurant(id: number): Promise<Restaurant> {
    const restaurant = await this.findOne(id);
    restaurant.is_verified = true;
    await this.restaurantRepository.save(restaurant);
    return restaurant;
  }

  // Analytics dashboard (from Stores module)
  async getRestaurantAnalytics(): Promise<any> {
    const totalRestaurants = await this.restaurantRepository.count();
    const verifiedRestaurants = await this.restaurantRepository.count({
      where: { is_verified: true },
    });
    const unverifiedRestaurants = await this.restaurantRepository.count({
      where: { is_verified: false },
    });
    const activeRestaurants = await this.restaurantRepository.count({
      where: { is_active: true },
    });

    // Restaurant with most orders
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const topPerformingRestaurant = await this.restaurantRepository
      .createQueryBuilder('restaurant')
      .leftJoin('restaurant.orders', 'order')
      .select([
        'restaurant.id',
        'restaurant.name',
        'COUNT(order.id) as "orderCount"',
      ])
      .groupBy('restaurant.id')
      .addGroupBy('restaurant.name')
      .orderBy('"orderCount"', 'DESC')
      .getRawOne();

    // Handle case where no restaurants have orders yet
    const defaultTopRestaurant = topPerformingRestaurant || {
      id: null,
      name: 'No orders yet',
      orderCount: 0,
    };

    // Calculate total revenue per restaurant
    const restaurantRevenue = await this.restaurantRepository
      .createQueryBuilder('restaurant')
      .leftJoin('restaurant.orders', 'order')
      .select([
        'restaurant.id',
        'restaurant.name',
        'SUM(order.total_amount) as "totalRevenue"',
      ])
      .groupBy('restaurant.id')
      .addGroupBy('restaurant.name')
      .getRawMany();

    // Trend of new restaurants over time (MSSQL compatible)
    const newRestaurantsTrend = await this.restaurantRepository
      .createQueryBuilder('restaurant')
      .select(
        "FORMAT(restaurant.created_at, 'yyyy-MM') AS month, COUNT(restaurant.id) AS restaurantCount",
      )
      .groupBy("FORMAT(restaurant.created_at, 'yyyy-MM')")
      .orderBy('month', 'ASC')
      .getRawMany();

    // Restaurant order volume trends (MSSQL compatible)
    const restaurantOrderVolume = await this.restaurantRepository
      .createQueryBuilder('restaurant')
      .leftJoin('restaurant.orders', 'order')
      .select([
        'restaurant.id',
        'restaurant.name',
        "FORMAT(order.created_at, 'yyyy-MM') AS month",
        'COUNT(order.id) AS orderCount',
      ])
      .groupBy('restaurant.id')
      .addGroupBy('restaurant.name')
      .addGroupBy("FORMAT(order.created_at, 'yyyy-MM')")
      .orderBy('month', 'ASC')
      .getRawMany();

    return {
      totalRestaurants,
      verifiedRestaurants,
      unverifiedRestaurants,
      activeRestaurants,
      restaurantRevenue,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      topPerformingRestaurant: defaultTopRestaurant,
      newRestaurantsTrend,
      restaurantOrderVolume,
    };
  }

  // Generate unique restaurant code
  private async generateRestaurantCode(): Promise<string> {
    const date = new Date();
    const prefix = `REST${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}`;

    const lastRestaurant = await this.restaurantRepository
      .createQueryBuilder('restaurant')
      .where('restaurant.restaurant_code LIKE :prefix', {
        prefix: `${prefix}%`,
      })
      .orderBy('restaurant.restaurant_code', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastRestaurant && lastRestaurant.restaurant_code) {
      const lastSequence = parseInt(lastRestaurant.restaurant_code.slice(-4));
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(4, '0')}`;
  }

  // Unverified restaurants (from Stores module)
  async findUnverifiedRestaurants(): Promise<Restaurant[]> {
    return await this.restaurantRepository.find({
      where: { is_verified: false },
      relations: ['owner', 'address_relation'],
      order: { created_at: 'DESC' },
    });
  }

  // Find restaurants by owner ID (from Stores module)
  async findByOwnerId(ownerId: number): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { owner_id: ownerId },
      relations: ['owner', 'address_relation'],
      select: {
        owner: {
          id: true,
          email: true,
        },
      },
    });

    if (!restaurant) {
      throw new NotFoundException(
        `Restaurant not found for owner ID ${ownerId}`,
      );
    }

    return restaurant;
  }

  async findByOwnerIdOrNull(ownerId: number): Promise<Restaurant | null> {
    return await this.restaurantRepository.findOne({
      where: { owner_id: ownerId },
      relations: ['owner', 'address_relation'],
      select: {
        owner: {
          id: true,
          email: true,
        },
      },
    });
  }

  // View Menu - Get menu items for a specific restaurant
  async getRestaurantMenu(restaurantId: number): Promise<any[]> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    // Get menu items for this restaurant
    const menuItems = await this.menuItemRepository.find({
      where: {
        restaurant_id: restaurantId,
        is_available: true,
      },
      order: { category: 'ASC', name: 'ASC' },
    });

    return menuItems;
  }
}
