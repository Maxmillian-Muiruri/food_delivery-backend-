import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsEmail,
  Min,
  Max,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CuisineType } from '../entities/restaurant.entity';

export class CreateRestaurantDto {
  @ApiProperty({ description: 'Owner ID', example: 1 })
  @IsNumber()
  owner_id: number;

  @ApiProperty({ description: 'Restaurant name', example: 'Pizza Palace' })
  @IsString()
  @Length(2, 255)
  name: string;

  @ApiPropertyOptional({
    description: 'Restaurant description',
    example: 'Best pizza in town',
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Contact information',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  contact_info?: string;

  @ApiPropertyOptional({
    description: 'Delivery fee',
    example: 2.99,
    default: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  delivery_fee?: number;

  @ApiPropertyOptional({
    description: 'Restaurant image URL',
    example: 'https://example.com/image.jpg',
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  image_url?: string;

  @ApiPropertyOptional({
    description: 'Area/Location label',
    example: 'Westlands',
  })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  area?: string;

  @ApiPropertyOptional({
    description: 'County/Street address',
    example: 'Westlands Road',
  })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  county?: string;

  @ApiPropertyOptional({
    description: 'Town/City',
    example: 'Nairobi',
  })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  town?: string;

  @ApiPropertyOptional({
    description: 'Country',
    example: 'Kenya',
  })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  country?: string;

  @ApiPropertyOptional({
    description: 'Store code for payment identification',
    example: 'STORE001',
  })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  store_code?: string;

  @ApiPropertyOptional({
    description: 'Account number for payments',
    example: '1234567890',
  })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  account_number?: string;

  @ApiPropertyOptional({
    description: 'Business rating',
    example: 4.5,
    default: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(5)
  business_rating?: number;

  @ApiPropertyOptional({
    description: 'Total business reviews',
    example: 100,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  business_total_reviews?: number;
}
