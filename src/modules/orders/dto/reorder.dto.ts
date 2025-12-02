import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ReorderDto {
  @ApiPropertyOptional({ description: 'Order ID to reorder from', example: 1 })
  @IsNumber()
  orderId: number;

  @ApiPropertyOptional({
    description: 'Special instructions for the reordered items',
    example: 'Make it extra spicy',
  })
  @IsOptional()
  @IsString()
  specialInstructions?: string;
}
