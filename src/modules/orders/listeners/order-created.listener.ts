import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PaymentsService } from '../../payments/payments.service';
import { EmailService } from '../../email/email.service';
import type { OrderCreatedEvent } from '../../../events';
import { EventTypes } from '../../../events';
import {
  PaymentMethod,
  PaymentGateway,
  PaymentStatus,
} from '../../payments/entities/payment.entity';

@Injectable()
export class OrderCreatedListener {
  private readonly logger = new Logger(OrderCreatedListener.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly emailService: EmailService,
  ) {}

  @OnEvent(EventTypes.ORDER_CREATED)
  async handleOrderCreated(event: OrderCreatedEvent) {
    try {
      this.logger.log(
        `🎯 Processing OrderCreatedEvent for Order #${event.orderId}`,
      );

      // 🔥 STEP 1: Automatically initialize payment
      await this.initializePayment(event);

      // 🔥 STEP 2: Send order confirmation email
      await this.sendOrderConfirmationEmail(event);

      this.logger.log(
        `✅ OrderCreatedEvent processed successfully for Order #${event.orderId}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to process OrderCreatedEvent for Order #${event.orderId}`,
        error,
      );
      throw error;
    }
  }

  private async initializePayment(event: OrderCreatedEvent) {
    try {
      this.logger.log(
        `💳 Auto-initializing payment for Order #${event.orderId}`,
      );

      const paymentData = {
        user_id: event.userId,
        order_id: event.orderId,
        amount: event.totalAmount,
        email: await this.getUserEmail(event.userId),
        callback_url: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/payment/callback`,
        currency: 'KES',
        payment_method: PaymentMethod.CARD,
        reference: `PAY_${Date.now()}_${event.orderId}`,
        gateway_reference: PaymentGateway.PAYSTACK,
        status: PaymentStatus.PENDING,
        refunded_amount: 0,
      };

      const payment = await this.paymentsService.initializePayment(paymentData);

      this.logger.log(
        `✅ Payment initialized successfully: ${payment.payment_reference}`,
      );
      return payment;
    } catch (error) {
      this.logger.error(
        `❌ Failed to initialize payment for Order #${event.orderId}`,
        error,
      );
      throw error;
    }
  }

  private async sendOrderConfirmationEmail(event: OrderCreatedEvent) {
    try {
      this.logger.log(
        `📧 Sending order confirmation email for Order #${event.orderId}`,
      );

      const [user, restaurant] = await Promise.all([
        this.getUserDetails(event.userId),
        this.getRestaurantDetails(event.restaurantId),
      ]);

      const orderData = {
        order: {
          id: event.orderId,
          order_number: await this.getOrderNumber(event.orderId),
          total_amount: event.totalAmount,
          estimated_delivery_time: 30, // Default 30 minutes
          address: await this.getOrderAddress(event.orderId),
        },
        user,
        restaurant,
      };

      const emailHtml =
        this.emailService.getOrderConfirmationTemplate(orderData);

      await this.emailService.sendEmail({
        to: user.email,
        subject: `🍕 Order Confirmed - ${orderData.order.order_number}`,
        html: emailHtml,
      });

      this.logger.log(`✅ Order confirmation email sent to ${user.email}`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to send order confirmation email for Order #${event.orderId}`,
        error,
      );
      // Don't throw error here - payment initialization is more critical
    }
  }

  private async getUserEmail(userId: number): Promise<string> {
    // This would typically come from a User repository/service
    // For now, return a placeholder - in real implementation, inject UserService
    return `user${userId}@example.com`;
  }

  private async getUserDetails(userId: number): Promise<any> {
    // This would typically come from a User repository/service
    // For now, return placeholder data
    return {
      id: userId,
      name: `User ${userId}`,
      email: `user${userId}@example.com`,
    };
  }

  private async getRestaurantDetails(restaurantId: number): Promise<any> {
    // This would typically come from a Restaurant repository/service
    // For now, return placeholder data
    return {
      id: restaurantId,
      name: `Restaurant ${restaurantId}`,
      address: 'Restaurant Address',
    };
  }

  private async getOrderNumber(orderId: number): Promise<string> {
    // This would typically come from Order repository
    // For now, return placeholder
    return `ORD-${Date.now()}-${orderId}`;
  }

  private async getOrderAddress(orderId: number): Promise<any> {
    // This would typically come from Order repository with address relation
    // For now, return placeholder
    return {
      street_address: '123 Main Street',
    };
  }
}
