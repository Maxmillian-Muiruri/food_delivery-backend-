import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Order } from '../../orders/entities/order.entity';
import { OrdersService } from '../../orders/orders.service';
import { DriversService } from '../../drivers/drivers.service';
import { EmailService } from '../../email/email.service';
import {
  PaymentCompletedEvent,
  DriverAssignedEvent,
  EventTypes,
} from '../../../events';

@Injectable()
export class PaymentCompletedListener {
  private readonly logger = new Logger(PaymentCompletedListener.name);

  constructor(
    private readonly ordersService: OrdersService,
    private readonly driversService: DriversService,
    private readonly emailService: EmailService,
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  @OnEvent(EventTypes.PAYMENT_COMPLETED)
  async handlePaymentCompleted(event: PaymentCompletedEvent) {
    try {
      this.logger.log(
        `💰 Processing PaymentCompletedEvent for Order #${event.orderId}`,
      );

      // 🔥 STEP 1: Update order status to confirmed
      await this.updateOrderStatus(event);

      // 🔥 STEP 2: Automatically assign driver
      const assignedDriver = await this.assignDriver(event);

      // 🔥 STEP 3: Send payment success email
      await this.sendPaymentSuccessEmail(event);

      // 🔥 STEP 4: Emit driver assigned event
      if (assignedDriver) {
        this.eventEmitter.emit(
          EventTypes.DRIVER_ASSIGNED,
          new DriverAssignedEvent(
            event.orderId,
            assignedDriver.id,
            assignedDriver,
          ),
        );
      }

      this.logger.log(
        `✅ PaymentCompletedEvent processed successfully for Order #${event.orderId}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to process PaymentCompletedEvent for Order #${event.orderId}`,
        error,
      );
      throw error;
    }
  }

  private async updateOrderStatus(event: PaymentCompletedEvent) {
    try {
      this.logger.log(
        `📝 Updating order status to confirmed for Order #${event.orderId}`,
      );

      await this.ordersService.updateOrderStatus(
        event.orderId,
        'confirmed',
        'Payment completed successfully',
      );

      this.logger.log(`✅ Order status updated to confirmed`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to update order status for Order #${event.orderId}`,
        error,
      );
      throw error;
    }
  }

  private async assignDriver(event: PaymentCompletedEvent) {
    try {
      this.logger.log(`🚗 Auto-assigning driver for Order #${event.orderId}`);

      // Get order details to find delivery location
      const order = await this.orderRepository.findOne({
        where: { id: event.orderId },
        relations: ['address'],
      });

      if (!order) {
        throw new Error(`Order ${event.orderId} not found`);
      }

      // Find available drivers near the delivery location
      const availableDrivers = await this.driversService.findNearbyAvailable(
        order.address.latitude || 0,
        order.address.longitude || 0,
        10, // 10km radius
      );

      if (availableDrivers.length === 0) {
        this.logger.warn(
          `⚠️ No available drivers found for Order #${event.orderId}`,
        );
        return null;
      }

      // Assign the first available driver (in a real system, you'd have more sophisticated logic)
      const assignedDriver = availableDrivers[0];

      // Update order with driver assignment
      await this.orderRepository.update(event.orderId, {
        driver_id: assignedDriver.id,
      });

      // Update driver status to busy
      await this.driversService.updateAvailability(
        assignedDriver.userId,
        'busy',
      );

      this.logger.log(
        `✅ Driver ${assignedDriver.licensePlate} assigned to Order #${event.orderId}`,
      );
      return assignedDriver;
    } catch (error) {
      this.logger.error(
        `❌ Failed to assign driver for Order #${event.orderId}`,
        error,
      );
      throw error;
    }
  }

  private async sendPaymentSuccessEmail(event: PaymentCompletedEvent) {
    try {
      this.logger.log(
        `📧 Sending payment success email for Order #${event.orderId}`,
      );

      // Get order and user details
      const order = await this.orderRepository.findOne({
        where: { id: event.orderId },
        relations: ['user'],
      });

      if (!order) {
        throw new Error(`Order ${event.orderId} not found`);
      }

      const paymentData = {
        payment: {
          id: event.paymentId,
          amount: event.amount,
          transaction_id: event.transactionId,
          payment_method: 'card',
        },
        order: {
          id: event.orderId,
          order_number: order.order_number,
        },
        user: order.user,
      };

      const emailHtml =
        this.emailService.getPaymentSuccessTemplate(paymentData);

      await this.emailService.sendEmail({
        to: order.user.email,
        subject: `💳 Payment Successful - Order ${order.order_number}`,
        html: emailHtml,
      });

      this.logger.log(`✅ Payment success email sent to ${order.user.email}`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to send payment success email for Order #${event.orderId}`,
        error,
      );
      // Don't throw error here - driver assignment is more critical
    }
  }
}
