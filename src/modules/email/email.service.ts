import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      this.logger.log(`Email sent successfully to ${options.to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error);
      throw error;
    }
  }

  // Order-related email templates
  getOrderConfirmationTemplate(orderData: any): string {
    const { order, user, restaurant } = orderData;
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .order-details { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; }
            .button { background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍕 Order Confirmed!</h1>
              <p>Order #${order.order_number}</p>
            </div>

            <div class="content">
              <h2>Hello ${user.name}!</h2>
              <p>Your order has been confirmed and is being prepared.</p>

              <div class="order-details">
                <h3>Order Details</h3>
                <p><strong>Restaurant:</strong> ${restaurant.name}</p>
                <p><strong>Order Total:</strong> KES ${order.total_amount}</p>
                <p><strong>Estimated Delivery:</strong> ${order.estimated_delivery_time} minutes</p>
                <p><strong>Delivery Address:</strong> ${order.address?.street_address}</p>
              </div>

              <p>You'll receive updates as your order progresses. Track your order in real-time through our app!</p>

              <div style="text-align: center; margin: 20px 0;">
                <a href="#" class="button">Track Your Order</a>
              </div>
            </div>

            <div class="footer">
              <p>Thank you for choosing Food Delivery!</p>
              <p>Need help? Contact us at support@fooddelivery.com</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  getOrderStatusUpdateTemplate(orderData: any): string {
    const { order, status, user, restaurant } = orderData;
    const statusMessages = {
      preparing: 'Your order is now being prepared',
      ready: 'Your order is ready for pickup',
      picked_up: 'Your order has been picked up by the driver',
      delivered: 'Your order has been delivered successfully',
    };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Status Update</title>
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
              <h1>📦 Order Update</h1>
              <p>Order #${order.order_number}</p>
            </div>

            <div class="content">
              <h2>Hello ${user.name}!</h2>

              <div class="status-box">
                <h3>Status Update</h3>
                <p>${statusMessages[status] || 'Your order status has been updated'}</p>
                <p><strong>Current Status:</strong> ${status.replace('_', ' ').toUpperCase()}</p>
              </div>

              <p>Track your order in real-time through our app for live updates!</p>
            </div>

            <div class="footer">
              <p>Food Delivery - Your favorite food, delivered fast!</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  getDriverAssignedTemplate(orderData: any): string {
    const { order, driver, user } = orderData;
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Driver Assigned</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #FF9800; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .driver-info { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚚 Driver Assigned!</h1>
              <p>Order #${order.order_number}</p>
            </div>

            <div class="content">
              <h2>Hello ${user.name}!</h2>
              <p>Great news! A driver has been assigned to deliver your order.</p>

              <div class="driver-info">
                <h3>Driver Information</h3>
                <p><strong>Name:</strong> ${driver.name}</p>
                <p><strong>Phone:</strong> ${driver.phone_number}</p>
                <p><strong>Vehicle:</strong> ${driver.vehicle_type || 'Standard Delivery Vehicle'}</p>
              </div>

              <p>You can now track your driver's location in real-time through our app!</p>
            </div>

            <div class="footer">
              <p>Safe travels and enjoy your meal!</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Payment-related email templates
  getPaymentSuccessTemplate(paymentData: any): string {
    const { payment, order, user } = paymentData;
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Payment Successful</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .payment-details { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💳 Payment Successful!</h1>
              <p>Transaction ID: ${payment.transaction_id}</p>
            </div>

            <div class="content">
              <h2>Hello ${user.name}!</h2>
              <p>Your payment has been processed successfully.</p>

              <div class="payment-details">
                <h3>Payment Details</h3>
                <p><strong>Amount:</strong> KES ${payment.amount}</p>
                <p><strong>Order:</strong> #${order.order_number}</p>
                <p><strong>Payment Method:</strong> ${payment.payment_method}</p>
                <p><strong>Transaction ID:</strong> ${payment.transaction_id}</p>
              </div>

              <p>Your order is now being prepared. You'll receive updates as it progresses.</p>
            </div>

            <div class="footer">
              <p>Thank you for your business!</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  getPaymentFailedTemplate(paymentData: any): string {
    const { payment, order, user, failureReason } = paymentData;
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Payment Failed</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f44336; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .error-details { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #f44336; }
            .footer { text-align: center; padding: 20px; color: #666; }
            .button { background: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ Payment Failed</h1>
              <p>Order #${order.order_number}</p>
            </div>

            <div class="content">
              <h2>Hello ${user.name}!</h2>
              <p>Unfortunately, your payment could not be processed.</p>

              <div class="error-details">
                <h3>Payment Details</h3>
                <p><strong>Amount:</strong> KES ${payment.amount}</p>
                <p><strong>Reason:</strong> ${failureReason || 'Payment was declined'}</p>
              </div>

              <p>Please try again with a different payment method or contact your bank if the issue persists.</p>

              <div style="text-align: center; margin: 20px 0;">
                <a href="#" class="button">Try Payment Again</a>
              </div>
            </div>

            <div class="footer">
              <p>Need help? Contact our support team.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // User-related email templates
  getWelcomeEmailTemplate(userData: any): string {
    const { user } = userData;
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to Food Delivery</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .features { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; }
            .button { background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍕 Welcome to Food Delivery!</h1>
              <p>Your culinary journey begins here</p>
            </div>

            <div class="content">
              <h2>Hello ${user.name}!</h2>
              <p>Welcome to Food Delivery! We're excited to help you discover amazing food from your favorite restaurants.</p>

              <div class="features">
                <h3>What you can do:</h3>
                <ul>
                  <li>🍽️ Order from hundreds of restaurants</li>
                  <li>🚚 Real-time delivery tracking</li>
                  <li>💳 Secure payments</li>
                  <li>⭐ Rate and review your orders</li>
                  <li>🎁 Exclusive promotions and discounts</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 20px 0;">
                <a href="#" class="button">Start Ordering Now</a>
              </div>
            </div>

            <div class="footer">
              <p>Happy ordering! 🍕🚚</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  getPasswordResetTemplate(userData: any): string {
    const { user, resetToken } = userData;
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Password Reset</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .reset-box { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; text-align: center; }
            .footer { text-align: center; padding: 20px; color: #666; }
            .button { background: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset</h1>
            </div>

            <div class="content">
              <h2>Hello ${user.name}!</h2>
              <p>You requested a password reset for your Food Delivery account.</p>

              <div class="reset-box">
                <p><strong>Your reset token:</strong></p>
                <h2 style="color: #2196F3; letter-spacing: 2px;">${resetToken}</h2>
                <p>This token will expire in 15 minutes.</p>
              </div>

              <p>If you didn't request this reset, please ignore this email.</p>

              <div style="text-align: center; margin: 20px 0;">
                <a href="#" class="button">Reset Password</a>
              </div>
            </div>

            <div class="footer">
              <p>For security, never share this token with anyone.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Restaurant notifications
  getNewOrderNotificationTemplate(orderData: any): string {
    const { order, customer, items } = orderData;
    return `
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
              <p>Order #${order.order_number}</p>
            </div>

            <div class="content">
              <h2>New Order Alert</h2>
              <p>You have received a new order that needs your attention.</p>

              <div class="order-details">
                <h3>Order Details</h3>
                <p><strong>Customer:</strong> ${customer.name}</p>
                <p><strong>Phone:</strong> ${customer.phone_number}</p>
                <p><strong>Items:</strong> ${items.length} item(s)</p>
                <p><strong>Total:</strong> KES ${order.total_amount}</p>
                <p><strong>Delivery Address:</strong> ${order.address?.street_address}</p>
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
  }

  // Driver notifications
  getDeliveryAssignmentTemplate(assignmentData: any): string {
    const { order, customer, restaurant } = assignmentData;
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Delivery Assignment</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #9C27B0; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .delivery-details { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; }
            .button { background: #9C27B0; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚚 New Delivery!</h1>
              <p>Order #${order.order_number}</p>
            </div>

            <div class="content">
              <h2>Delivery Assignment</h2>
              <p>You have been assigned a new delivery.</p>

              <div class="delivery-details">
                <h3>Delivery Details</h3>
                <p><strong>Restaurant:</strong> ${restaurant.name}</p>
                <p><strong>Customer:</strong> ${customer.name}</p>
                <p><strong>Phone:</strong> ${customer.phone_number}</p>
                <p><strong>Address:</strong> ${order.address?.street_address}</p>
                <p><strong>Order Value:</strong> KES ${order.total_amount}</p>
              </div>

              <div style="text-align: center; margin: 20px 0;">
                <a href="#" class="button">Accept Delivery</a>
              </div>
            </div>

            <div class="footer">
              <p>Complete deliveries quickly and safely!</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
