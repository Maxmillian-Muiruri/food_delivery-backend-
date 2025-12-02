import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  Min,
  Max,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMenuItemDto {
  @ApiProperty({ description: 'Menu item name', example: 'Margherita Pizza' })
  @IsString()
  @Length(2, 255)
  name: string;

  @ApiProperty({
    description: 'Menu item description',
    example: 'Classic pizza with tomato sauce, mozzarella, and basil',
  })
  @IsString()
  @Length(10, 1000)
  description: string;

  @ApiProperty({ description: 'Menu item price', example: 12.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  price: number;

  @ApiPropertyOptional({
    description: 'Menu item category',
    example: 'Main Course',
  })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  category?: string;

  @ApiPropertyOptional({
    description: 'Menu item image URL',
    example: 'https://example.com/pizza.jpg',
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  image_url?: string;

  @ApiPropertyOptional({
    description: 'Allergens array',
    example: ['dairy', 'gluten'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergens?: string[];

  @ApiPropertyOptional({
    description: 'Dietary tags array',
    example: ['vegetarian'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dietary_tags?: string[];

  @ApiPropertyOptional({
    description: 'Ingredients list',
    example: 'Tomato sauce, mozzarella cheese, fresh basil',
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  ingredients?: string;

  @ApiPropertyOptional({
    description: 'Preparation time in minutes',
    example: 15,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  preparation_time?: number;

  @ApiProperty({ description: 'Restaurant ID', example: 1 })
  @IsNumber()
  restaurant_id: number;
}
