import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from '../../email/email.service';
import { UserRegisteredEvent, EventTypes } from '../../../events';

@Injectable()
export class UserRegistrationListener {
  private readonly logger = new Logger(UserRegistrationListener.name);

  constructor(private readonly emailService: EmailService) {}

  @OnEvent(EventTypes.USER_REGISTERED)
  async handleUserRegistered(event: UserRegisteredEvent) {
    try {
      this.logger.log(`📧 Sending welcome email to new user: ${event.email}`);

      const welcomeEmailHtml = this.emailService.getWelcomeEmailTemplate({
        user: {
          name: event.name,
          email: event.email,
        },
      });

      await this.emailService.sendEmail({
        to: event.email,
        subject: '🍕 Welcome to Food Delivery - Your Culinary Journey Begins!',
        html: welcomeEmailHtml,
      });

      this.logger.log(`✅ Welcome email sent successfully to ${event.email}`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to send welcome email to ${event.email}`,
        error,
      );
      // Don't throw error here - user registration should succeed even if email fails
    }
  }
}
