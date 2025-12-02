import { IsString, IsOptional, IsObject, IsEnum } from 'class-validator';

export enum NotificationType {
  ORDER_STATUS = 'order_status',
  PROMOTION = 'promotion',
  SYSTEM = 'system',
  DELIVERY = 'delivery',
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
}

export class CreateNotificationDto {
  @IsString()
  user_id: number;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel = NotificationChannel.IN_APP;
}
