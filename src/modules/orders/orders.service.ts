import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderTracking } from './entities/order-tracking.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from '../users/entities/user.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { Address } from '../addresses/entities/address.entity';
import { MenuItem } from '../menu-items/entities/menu-item.entity';
import { OrderCreatedEvent, EventTypes } from '../../events';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(OrderTracking)
    private readonly orderTrackingRepository: Repository<OrderTracking>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createOrderDto: CreateOrderDto, user: User): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate restaurant exists and is active
      const restaurant = await this.restaurantRepository.findOne({
        where: { id: createOrderDto.restaurant_id, is_active: true },
      });
      if (!restaurant) {
        throw new NotFoundException('Restaurant not found or inactive');
      }

      // Validate address belongs to user
      const address = await this.addressRepository.findOne({
        where: { id: createOrderDto.address_id },
      });
      if (!address || address.userId !== user.id) {
        throw new NotFoundException('Address not found');
      }
      if (!address) {
        throw new NotFoundException('Address not found');
      }

      // Validate menu items and calculate totals
      let subtotal = 0;
      const orderItems: OrderItem[] = [];

      for (const item of createOrderDto.items) {
        const menuItem = await this.menuItemRepository.findOne({
          where: { id: item.menu_item_id, restaurant_id: restaurant.id },
        });
        if (!menuItem) {
          throw new NotFoundException(
            `Menu item ${item.menu_item_id} not found in this restaurant`,
          );
        }

        const priceAtPurchase = menuItem.price;
        subtotal += priceAtPurchase * item.quantity;

        const orderItem = this.orderItemRepository.create({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          price_at_purchase: priceAtPurchase,
          special_instructions: item.special_instructions,
        });
        orderItems.push(orderItem);
      }

      // Calculate totals
      const tax = subtotal * 0.08; // 8% tax
      const deliveryFee = restaurant.delivery_fee;
      const totalAmount = subtotal + tax + deliveryFee;

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)
        .toUpperCase()}`;

      // Create order
      const newOrder = this.orderRepository.create({
        order_number: orderNumber,
        user_id: user.id,
        restaurant_id: createOrderDto.restaurant_id,
        address_id: createOrderDto.address_id,
        status: 'pending',
        subtotal,
        delivery_fee: deliveryFee,
        tax,
        total_amount: totalAmount,
        payment_method: createOrderDto.payment_method,
        delivery_type: createOrderDto.delivery_type,
        scheduled_delivery_time: createOrderDto.scheduled_delivery_time
          ? new Date(createOrderDto.scheduled_delivery_time)
          : undefined,
        delivery_instructions: createOrderDto.delivery_instructions,
        estimated_delivery_time: restaurant.estimated_delivery_time,
      });

      const savedOrder = await queryRunner.manager.save(Order, newOrder);

      // Save order items
      for (const orderItem of orderItems) {
        orderItem.order_id = savedOrder.id;
        await queryRunner.manager.save(OrderItem, orderItem);
      }

      // Create initial tracking entry
      const tracking = this.orderTrackingRepository.create({
        order_id: savedOrder.id,
        status: 'pending',
        message: 'Order placed successfully',
      });
      await queryRunner.manager.save(OrderTracking, tracking);

      await queryRunner.commitTransaction();

      // 🔥 EMIT ORDER CREATED EVENT - This triggers automatic payment initialization and email sending
      this.eventEmitter.emit(
        EventTypes.ORDER_CREATED,
        new OrderCreatedEvent(
          savedOrder.id,
          user.id,
          createOrderDto.restaurant_id,
          totalAmount,
          {
            orderNumber: orderNumber,
            restaurant: restaurant,
            user: user,
            totalAmount: totalAmount,
          },
        ),
      );

      // Return order with relations
      const order = await this.orderRepository.findOne({
        where: { id: savedOrder.id },
        relations: [
          'user',
          'restaurant',
          'address',
          'order_items',
          'order_items.menu_item',
        ],
      });
      if (!order) {
        throw new NotFoundException('Order not found');
      }
      return order;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(user: User): Promise<Order[]> {
    return this.orderRepository.find({
      where: { user_id: user.id },
      relations: [
        'restaurant',
        'address',
        'order_items',
        'order_items.menu_item',
      ],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number, user: User): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id, user_id: user.id },
      relations: [
        'user',
        'restaurant',
        'address',
        'order_items',
        'order_items.menu_item',
        'tracking_history',
      ],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async cancelOrder(id: number, user: User): Promise<Order> {
    const order = await this.findOne(id, user);

    if (!['pending', 'confirmed'].includes(order.status)) {
      throw new BadRequestException('Order cannot be cancelled at this stage');
    }

    order.status = 'cancelled';
    await this.orderRepository.save(order);

    // Add tracking entry
    const tracking = this.orderTrackingRepository.create({
      order_id: order.id,
      status: 'cancelled',
      message: 'Order cancelled by customer',
    });
    await this.orderTrackingRepository.save(tracking);

    return order;
  }

  async updateOrderStatus(
    id: number,
    status: string,
    message?: string,
  ): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: [
        'restaurant',
        'address',
        'order_items',
        'order_items.menu_item',
      ],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.status = status;
    if (status === 'delivered') {
      order.delivered_at = new Date();
    }

    await this.orderRepository.save(order);

    // Add tracking entry
    const tracking = this.orderTrackingRepository.create({
      order_id: order.id,
      status,
      message: message || `Order status updated to ${status}`,
    });
    await this.orderTrackingRepository.save(tracking);

    return order;
  }

  async getOrderTracking(id: number, user: User): Promise<OrderTracking[]> {
    const order = await this.findOne(id, user);
    return this.orderTrackingRepository.find({
      where: { order_id: order.id },
      order: { created_at: 'ASC' },
    });
  }

  async getRecentOrdersForReorder(
    user: User,
    limit: number = 10,
  ): Promise<Order[]> {
    return this.orderRepository.find({
      where: { user_id: user.id, status: 'delivered' },
      relations: [
        'restaurant',
        'address',
        'order_items',
        'order_items.menu_item',
      ],
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  async reorderFromPreviousOrder(orderId: number, user: User): Promise<any> {
    const order = await this.findOne(orderId, user);

    if (order.status !== 'delivered') {
      throw new BadRequestException('Can only reorder from delivered orders');
    }

    const reorderResult = {
      orderId: order.id,
      restaurantId: order.restaurant_id,
      itemsAdded: 0,
      message: 'Reorder initiated successfully',
    };

    // Add each item from the previous order to cart
    for (const orderItem of order.order_items) {
      try {
        // Check if menu item still exists and is available
        const menuItem = await this.menuItemRepository.findOne({
          where: { id: orderItem.menu_item_id, is_available: true },
        });

        if (menuItem) {
          // For now, we'll just count the items that could be added
          reorderResult.itemsAdded++;
        }
      } catch (error) {
        // Skip items that can't be added
        continue;
      }
    }

    return reorderResult;
  }

  async getFrequentlyOrderedItems(
    user: User,
    limit: number = 10,
  ): Promise<any[]> {
    // Get order items grouped by menu_item_id with count
    const frequentlyOrdered = await this.orderItemRepository
      .createQueryBuilder('oi')
      .select('oi.menu_item_id', 'menuItemId')
      .addSelect('COUNT(oi.id)', 'orderCount')
      .addSelect('SUM(oi.quantity)', 'totalQuantity')
      .addSelect('MAX(o.created_at)', 'lastOrderedAt')
      .innerJoin(
        'oi.order',
        'o',
        'o.user_id = :userId AND o.status = :status',
        {
          userId: user.id,
          status: 'delivered',
        },
      )
      .groupBy('oi.menu_item_id')
      .orderBy('orderCount', 'DESC')
      .addOrderBy('lastOrderedAt', 'DESC')
      .limit(limit)
      .getRawMany();

    // Get menu item details for each frequently ordered item
    const menuItemIds = frequentlyOrdered.map((item) => item.menuItemId);
    const menuItems = await this.menuItemRepository.find({
      where: { id: In(menuItemIds) },
      relations: ['restaurant'],
    });

    // Combine the data
    return frequentlyOrdered
      .map((item) => {
        const menuItem = menuItems.find((mi) => mi.id === item.menuItemId);
        return {
          menuItem: menuItem || null,
          orderCount: parseInt(item.orderCount),
          totalQuantity: parseInt(item.totalQuantity),
          lastOrderedAt: item.lastOrderedAt,
        };
      })
      .filter((item) => item.menuItem !== null);
  }
}
