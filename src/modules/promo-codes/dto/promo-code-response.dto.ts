import { ApiProperty } from '@nestjs/swagger';

export class PromoCodeResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  code: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  discount_type: string;

  @ApiProperty()
  discount_value: number;

  @ApiProperty({ nullable: true })
  minimum_order_amount: number | null;

  @ApiProperty({ nullable: true })
  maximum_discount_amount: number | null;

  @ApiProperty()
  valid_from: Date;

  @ApiProperty()
  valid_until: Date;

  @ApiProperty()
  usage_limit: number;

  @ApiProperty()
  usage_count: number;

  @ApiProperty()
  is_first_order_only: boolean;

  @ApiProperty()
  is_active: boolean;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}

export class ApplyPromoCodeResponseDto {
  @ApiProperty()
  is_valid: boolean;

  @ApiProperty()
  code: string;

  @ApiProperty()
  discount_amount: number;

  @ApiProperty()
  final_amount: number;

  @ApiProperty({ nullable: true })
  message?: string;
}
