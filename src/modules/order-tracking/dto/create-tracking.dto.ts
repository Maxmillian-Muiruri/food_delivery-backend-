import {
  IsString,
  IsOptional,
  IsNumber,
  IsIn,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTrackingDto {
  @ApiPropertyOptional({
    description: 'Order ID',
    example: 1,
  })
  @IsNumber()
  order_id: number;

  @ApiPropertyOptional({
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
  @IsString()
  @IsIn([
    'pending',
    'confirmed',
    'preparing',
    'ready',
    'picked_up',
    'delivered',
    'cancelled',
  ])
  status: string;

  @ApiPropertyOptional({
    description: 'Status message',
    example: 'Order confirmed and being prepared',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;

  @ApiPropertyOptional({
    description: 'Current latitude for location tracking',
    example: 40.7128,
  })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Current longitude for location tracking',
    example: -74.006,
  })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}
