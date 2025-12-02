import { Expose } from 'class-transformer';

export class NotificationResponseDto {
  @Expose()
  id: number;

  @Expose()
  user_id: number;

  @Expose()
  type: string;

  @Expose()
  title: string;

  @Expose()
  message: string;

  @Expose()
  data?: Record<string, any>;

  @Expose()
  channel: string;

  @Expose()
  is_read: boolean;

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date;
}
