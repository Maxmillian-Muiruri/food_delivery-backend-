import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  IsEnum,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'john.doe@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  full_name?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  phone_number?: string;

  @ApiPropertyOptional({ example: 'https://example.com/profile.jpg' })
  @IsOptional()
  @IsString()
  profile_picture_url?: string;

  @ApiPropertyOptional({ enum: ['customer', 'admin', 'restaurant_owner'] })
  @IsOptional()
  @IsEnum(['customer', 'admin', 'restaurant_owner'])
  role?: string;

  @ApiPropertyOptional({ example: ['vegetarian', 'vegan'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dietary_preferences?: string[];

  @ApiPropertyOptional({ example: ['peanuts', 'dairy'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergens?: string[];
}
