import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateOrderDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  restaurant_id: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  address_id: number;

  @ApiProperty({
    example: [
      { menu_item_id: 1, quantity: 2, special_instructions: 'No onions' },
    ],
  })
  @IsArray()
  @IsNotEmpty()
  items: Array<{
    menu_item_id: number;
    quantity: number;
    special_instructions?: string;
  }>;

  @ApiProperty({ enum: ['now', 'scheduled'] })
  @IsEnum(['now', 'scheduled'])
  @IsNotEmpty()
  delivery_type: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  scheduled_delivery_time?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  delivery_instructions?: string;

  @ApiProperty({ enum: ['card', 'cash', 'wallet'] })
  @IsEnum(['card', 'cash', 'wallet'])
  @IsNotEmpty()
  payment_method: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  tip_amount?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  promo_code?: string;
}
