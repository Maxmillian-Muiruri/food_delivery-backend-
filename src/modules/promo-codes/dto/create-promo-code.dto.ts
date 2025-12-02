import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDateString,
  IsBoolean,
} from 'class-validator';

export class CreatePromoCodeDto {
  @ApiProperty({
    example: 'SAVE10',
    description: 'Unique promo code',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    example: 'Save 10% on your first order',
    description: 'Promo code description',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 'percentage',
    description: 'Type of discount: percentage, fixed_amount, or free_delivery',
    enum: ['percentage', 'fixed_amount', 'free_delivery'],
  })
  @IsString()
  @IsNotEmpty()
  discount_type: string;

  @ApiProperty({
    example: 10,
    description: 'Discount value (percentage or fixed amount)',
  })
  @IsNumber()
  @IsNotEmpty()
  discount_value: number;

  @ApiProperty({
    example: 50,
    description: 'Minimum order amount to apply the promo code',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  minimum_order_amount?: number;

  @ApiProperty({
    example: 100,
    description: 'Maximum discount amount for percentage discounts',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  maximum_discount_amount?: number;

  @ApiProperty({
    example: '2025-01-01T00:00:00Z',
    description: 'Start date for promo code validity',
  })
  @IsDateString()
  @IsNotEmpty()
  valid_from: string;

  @ApiProperty({
    example: '2025-12-31T23:59:59Z',
    description: 'End date for promo code validity',
  })
  @IsDateString()
  @IsNotEmpty()
  valid_until: string;

  @ApiProperty({
    example: 100,
    description: 'Total usage limit for the promo code',
    default: 1,
  })
  @IsNumber()
  @IsOptional()
  usage_limit?: number;

  @ApiProperty({
    example: false,
    description: 'Whether this promo is only for first-time users',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  is_first_order_only?: boolean;

  @ApiProperty({
    example: true,
    description: 'Whether the promo code is active',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
