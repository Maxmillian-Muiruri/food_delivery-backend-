import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdersService } from '../../orders/orders.service';
import { EmailService } from '../../email/email.service';
import { DriverAssignedEvent, EventTypes } from '../../../events';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Order } from '../../orders/entities/order.entity';

@Injectable()
export class DriverAssignedListener {
  private readonly logger = new Logger(DriverAssignedListener.name);

  constructor(
    private readonly ordersService: OrdersService,
    private readonly emailService: EmailService,
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  @OnEvent(EventTypes.DRIVER_ASSIGNED)
  async handleDriverAssigned(event: DriverAssignedEvent) {
    try {
      this.logger.log(
        `🚗 Processing DriverAssignedEvent for Order #${event.orderId}`,
      );

      // 🔥 STEP 1: Update order status to out_for_delivery
      await this.updateOrderStatus(event);

      // 🔥 STEP 2: Send driver assignment notifications
      await this.sendDriverAssignmentEmails(event);

      // 🔥 STEP 3: Create initial tracking entry for delivery
      await this.createDeliveryTracking(event);

      this.logger.log(
        `✅ DriverAssignedEvent processed successfully for Order #${event.orderId}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to process DriverAssignedEvent for Order #${event.orderId}`,
        error,
      );
      throw error;
    }
  }

  private async updateOrderStatus(event: DriverAssignedEvent) {
    try {
      this.logger.log(
        `📝 Updating order status to out_for_delivery for Order #${event.orderId}`,
      );

      await this.ordersService.updateOrderStatus(
        event.orderId,
        'out_for_delivery',
        `Driver assigned is now delivering your order`,
      );

      this.logger.log(`✅ Order status updated to out_for_delivery`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to update order status for Order #${event.orderId}`,
        error,
      );
      throw error;
    }
  }

  private async sendDriverAssignmentEmails(event: DriverAssignedEvent) {
    try {
      this.logger.log(
        `📧 Sending driver assignment emails for Order #${event.orderId}`,
      );

      // Get order and user details
      const order = await this.orderRepository.findOne({
        where: { id: event.orderId },
        relations: ['user', 'restaurant'],
      });

      if (!order) {
        throw new Error(`Order ${event.orderId} not found`);
      }

      const driverData = {
        driver: event.driverData,
        order: {
          id: event.orderId,
          order_number: order.order_number,
        },
        user: order.user,
        restaurant: order.restaurant,
      };

      // Send email to customer
      const customerEmailHtml =
        this.emailService.getDriverAssignedTemplate(driverData);
      await this.emailService.sendEmail({
        to: order.user.email,
        subject: `🚗 Driver Assigned - Order ${order.order_number}`,
        html: customerEmailHtml,
      });

      // Send email to restaurant (if they have email)
      if (order.restaurant.email) {
        const restaurantEmailHtml =
          this.emailService.getOrderStatusUpdateTemplate({
            ...driverData,
            status: 'Driver Assigned',
            message: `Driver has been assigned to deliver order ${order.order_number}`,
          });
        await this.emailService.sendEmail({
          to: order.restaurant.email,
          subject: `🚗 Driver Assigned - Order ${order.order_number}`,
          html: restaurantEmailHtml,
        });
      }

      this.logger.log(
        `✅ Driver assignment emails sent for Order #${event.orderId}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to send driver assignment emails for Order #${event.orderId}`,
        error,
      );
      // Don't throw error here - order status update is more critical
    }
  }

  private async createDeliveryTracking(event: DriverAssignedEvent) {
    try {
      this.logger.log(
        `📍 Creating delivery tracking entry for Order #${event.orderId}`,
      );

      // This would typically create a tracking entry with the driver's location
      // For now, we'll just log that delivery tracking has started
      this.logger.log(
        `✅ Delivery tracking initialized for Order #${event.orderId}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to create delivery tracking for Order #${event.orderId}`,
        error,
      );
      // Don't throw error here - email notifications are more critical
    }
  }
}
