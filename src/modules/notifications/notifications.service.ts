import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationChannel } from './enums/notification-channel.enum';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const notification = new Notification();
    notification.user_id = createNotificationDto.user_id;
    notification.type = createNotificationDto.type;
    notification.title = createNotificationDto.title;
    notification.message = createNotificationDto.message;
    notification.data = createNotificationDto.data
      ? JSON.stringify(createNotificationDto.data)
      : undefined;

    notification.channel =
      createNotificationDto.channel || NotificationChannel.IN_APP;
    notification.is_read = false;

    return await this.notificationRepository.save(notification);
  }

  async findAll(userId: number): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return notification;
  }

  async update(
    id: number,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification> {
    const updateData: any = { ...updateNotificationDto };
    // Convert data to string for MSSQL storage
    if (updateNotificationDto.data !== undefined) {
      updateData.data = JSON.stringify(updateNotificationDto.data);
    }
    await this.notificationRepository.update(id, updateData);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.notificationRepository.delete(id);
  }

  async markAsRead(id: number): Promise<Notification> {
    return await this.update(id, { is_read: true });
  }

  async getUnreadCount(userId: number): Promise<number> {
    return await this.notificationRepository.count({
      where: { user_id: userId, is_read: false },
    });
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepository.update(
      { user_id: userId, is_read: false },
      { is_read: true },
    );
  }
}
