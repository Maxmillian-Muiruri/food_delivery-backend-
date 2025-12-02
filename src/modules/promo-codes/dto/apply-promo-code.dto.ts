import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class ApplyPromoCodeDto {
  @ApiProperty({
    example: 'SAVE10',
    description: 'Promo code to apply',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    example: 1,
    description: 'Restaurant ID (optional, for restaurant-specific codes)',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  restaurant_id?: number;

  @ApiProperty({
    example: 150.5,
    description: 'Order total amount before discount',
  })
  @IsNumber()
  @IsNotEmpty()
  order_amount: number;
}
