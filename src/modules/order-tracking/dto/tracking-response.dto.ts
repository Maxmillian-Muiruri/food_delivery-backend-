import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TrackingResponseDto {
  @ApiProperty({
    description: 'Tracking entry ID',
    example: 1,
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: 'Order ID',
    example: 123,
  })
  @Expose()
  order_id: number;

  @ApiProperty({
    description: 'Order status',
    example: 'confirmed',
    enum: [
      'pending',
      'confirmed',
      'preparing',
      'ready',
      'picked_up',
      'delivered',
      'cancelled',
    ],
  })
  @Expose()
  status: string;

  @ApiProperty({
    description: 'Status message',
    example: 'Order confirmed and being prepared',
  })
  @Expose()
  message: string;

  @ApiProperty({
    description: 'Current latitude for location tracking',
    example: 40.7128,
    required: false,
  })
  @Expose()
  latitude?: number;

  @ApiProperty({
    description: 'Current longitude for location tracking',
    example: -74.006,
    required: false,
  })
  @Expose()
  longitude?: number;

  @ApiProperty({
    description: 'Timestamp when tracking entry was created',
    example: '2025-11-14T12:30:00Z',
  })
  @Expose()
  created_at: Date;
}
