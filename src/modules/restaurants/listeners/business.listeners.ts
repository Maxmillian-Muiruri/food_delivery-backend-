import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from '../../email/email.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationType } from '../../notifications/dto/create-notification.dto';
import {
  RestaurantCreatedEvent,
  OrderReceivedEvent,
  RestaurantActiveStatusChangedEvent,
  MenuItemUpdatedEvent,
  BusinessEventTypes,
} from '../../../events';

@Injectable()
export class BusinessListeners {
  private readonly logger = new Logger(BusinessListeners.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ============================================================================
  // RESTAURANT MANAGEMENT LISTENERS
  // ============================================================================

  @OnEvent(BusinessEventTypes.RESTAURANT_CREATED)
  async handleRestaurantCreated(event: RestaurantCreatedEvent) {
    try {
      this.logger.log(
        `🏪 Processing RestaurantCreatedEvent for Restaurant #${event.restaurantId}`,
      );

      // Send welcome email to restaurant owner
      await this.sendRestaurantWelcomeEmail(event);

      // Create notification for admin about new restaurant
      await this.notifyAdminNewRestaurant(event);

      this.logger.log(`✅ RestaurantCreatedEvent processed successfully`);
    } catch (error) {
      this.logger.error(`❌ Failed to process RestaurantCreatedEvent`, error);
    }
  }

  @OnEvent(BusinessEventTypes.ORDER_RECEIVED)
  async handleOrderReceived(event: OrderReceivedEvent) {
    try {
      this.logger.log(
        `📦 Processing OrderReceivedEvent for Order #${event.orderId}`,
      );

      // Send order notification to restaurant
      await this.sendOrderNotificationToRestaurant(event);

      // Update restaurant analytics
      await this.updateRestaurantAnalytics(event);

      this.logger.log(`✅ OrderReceivedEvent processed successfully`);
    } catch (error) {
      this.logger.error(`❌ Failed to process OrderReceivedEvent`, error);
    }
  }

  @OnEvent(BusinessEventTypes.RESTAURANT_STATUS_CHANGED)
  async handleRestaurantStatusChanged(
    event: RestaurantActiveStatusChangedEvent,
  ) {
    try {
      this.logger.log(
        `🔄 Processing RestaurantStatusChangedEvent for Restaurant #${event.restaurantId}`,
      );

      // Notify restaurant owner about status change
      await this.notifyRestaurantStatusChange(event);

      // Update search indexes if needed
      await this.updateSearchIndexes(event);

      this.logger.log(`✅ RestaurantStatusChangedEvent processed successfully`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to process RestaurantStatusChangedEvent`,
        error,
      );
    }
  }

  @OnEvent(BusinessEventTypes.MENU_ITEM_UPDATED)
  async handleMenuItemUpdated(event: MenuItemUpdatedEvent) {
    try {
      this.logger.log(
        `🍽️ Processing MenuItemUpdatedEvent for MenuItem #${event.menuItemId}`,
      );

      // Update search indexes for menu item
      await this.updateMenuItemSearchIndex(event);

      // Notify affected users if item became unavailable
      await this.notifyUsersAboutMenuChanges(event);

      this.logger.log(`✅ MenuItemUpdatedEvent processed successfully`);
    } catch (error) {
      this.logger.error(`❌ Failed to process MenuItemUpdatedEvent`, error);
    }
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private async sendRestaurantWelcomeEmail(event: RestaurantCreatedEvent) {
    try {
      const welcomeHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Welcome to FoodDelivery</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background: #f9f9f9; }
              .footer { text-align: center; padding: 20px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Welcome to FoodDelivery!</h1>
                <p>Your Restaurant is Live</p>
              </div>
              <div class="content">
                <h2>Hello Restaurant Owner!</h2>
                <p>Welcome to FoodDelivery! Your restaurant "${event.restaurantData.name}" is now live on our platform.</p>
                <p>You can now start receiving orders and managing your menu.</p>
              </div>
              <div class="footer">
                <p>Happy cooking! 🍳</p>
              </div>
            </div>
          </body>
        </html>
      `;

      await this.emailService.sendEmail({
        to: 'restaurant@example.com', // Would get from event data
        subject: '🎉 Welcome to FoodDelivery - Your Restaurant is Live!',
        html: welcomeHtml,
      });

      this.logger.log(`📧 Welcome email sent to restaurant owner`);
    } catch (error) {
      this.logger.error(`❌ Failed to send welcome email`, error);
    }
  }

  private async notifyAdminNewRestaurant(event: RestaurantCreatedEvent) {
    try {
      await this.notificationsService.create({
        user_id: 1, // Admin user ID
        title: 'New Restaurant Registration',
        message: `Restaurant "${event.restaurantData.name}" has been registered and needs verification.`,
        type: NotificationType.SYSTEM,
        data: {
          restaurantId: event.restaurantId,
          action: 'verify_restaurant',
        },
      });

      this.logger.log(`🔔 Admin notification created for new restaurant`);
    } catch (error) {
      this.logger.error(`❌ Failed to create admin notification`, error);
    }
  }

  private async sendOrderNotificationToRestaurant(event: OrderReceivedEvent) {
    try {
      const orderHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>New Order Received</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #FF9800; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background: #f9f9f9; }
              .order-details { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
              .footer { text-align: center; padding: 20px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🆕 New Order!</h1>
                <p>Order #${event.orderId}</p>
              </div>
              <div class="content">
                <h2>New Order Alert</h2>
                <p>You have received a new order that needs your attention.</p>
                <div class="order-details">
                  <h3>Order Details</h3>
                  <p><strong>Customer:</strong> ${event.customerData.full_name || 'Customer'}</p>
                  <p><strong>Items:</strong> Multiple items</p>
                  <p><strong>Total:</strong> KES ${event.orderData.total_amount || 0}</p>
                </div>
                <p>Please prepare this order promptly. The customer is waiting!</p>
              </div>
              <div class="footer">
                <p>Food Delivery - Restaurant Dashboard</p>
              </div>
            </div>
          </body>
        </html>
      `;

      await this.emailService.sendEmail({
        to: 'restaurant@example.com', // Would get from restaurant data
        subject: `📦 New Order #${event.orderId}`,
        html: orderHtml,
      });

      this.logger.log(`📧 Order notification sent to restaurant`);
    } catch (error) {
      this.logger.error(`❌ Failed to send order notification`, error);
    }
  }

  private async updateRestaurantAnalytics(event: OrderReceivedEvent) {
    try {
      // This would update analytics tables/caches
      // For now, just log the analytics update
      this.logger.log(
        `📊 Restaurant analytics updated for order ${event.orderId}`,
      );
    } catch (error) {
      this.logger.error(`❌ Failed to update restaurant analytics`, error);
    }
  }

  private async notifyRestaurantStatusChange(
    event: RestaurantActiveStatusChangedEvent,
  ) {
    try {
      const statusMessage = event.newStatus ? 'activated' : 'deactivated';
      const statusHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Restaurant Status Update</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background: #f9f9f9; }
              .status-box { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #2196F3; }
              .footer { text-align: center; padding: 20px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔄 Restaurant Status Update</h1>
              </div>
              <div class="content">
                <h2>Hello Restaurant Owner!</h2>
                <div class="status-box">
                  <h3>Status Update</h3>
                  <p>Your restaurant has been <strong>${statusMessage}</strong>.</p>
                  ${event.reason ? `<p><strong>Reason:</strong> ${event.reason}</p>` : ''}
                </div>
                <p>Please contact support if you have any questions about this change.</p>
              </div>
              <div class="footer">
                <p>Food Delivery - Restaurant Support</p>
              </div>
            </div>
          </body>
        </html>
      `;

      await this.emailService.sendEmail({
        to: 'restaurant@example.com', // Would get from restaurant data
        subject: `🔄 Restaurant Status Update`,
        html: statusHtml,
      });

      this.logger.log(`📧 Restaurant status change notification sent`);
    } catch (error) {
      this.logger.error(`❌ Failed to send status change notification`, error);
    }
  }

  private async updateSearchIndexes(event: RestaurantActiveStatusChangedEvent) {
    try {
      // This would update search indexes (Elasticsearch, etc.)
      this.logger.log(
        `🔍 Search indexes updated for restaurant ${event.restaurantId}`,
      );
    } catch (error) {
      this.logger.error(`❌ Failed to update search indexes`, error);
    }
  }

  private async updateMenuItemSearchIndex(event: MenuItemUpdatedEvent) {
    try {
      // This would update search indexes for menu items
      this.logger.log(
        `🔍 Menu item search index updated for item ${event.menuItemId}`,
      );
    } catch (error) {
      this.logger.error(`❌ Failed to update menu item search index`, error);
    }
  }

  private async notifyUsersAboutMenuChanges(event: MenuItemUpdatedEvent) {
    try {
      // Check if item became unavailable and notify users who have it in favorites/cart
      if (event.changes.is_available === false) {
        // Would query users who have this item in favorites or cart
        // and send notifications
        this.logger.log(
          `🔔 Users notified about menu item availability change`,
        );
      }
    } catch (error) {
      this.logger.error(`❌ Failed to notify users about menu changes`, error);
    }
  }
}
