import {
  IsNotEmpty,
  IsString,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsUUID,
  IsEnum,
  IsArray,
} from 'class-validator';
import { ReviewType } from '../entities/review.entity';

export class CreateReviewDto {
  @IsNotEmpty()
  @IsString()
  targetId: string;

  @IsNotEmpty()
  @IsEnum(ReviewType)
  targetType: ReviewType;

  @IsOptional()
  @IsUUID()
  orderId?: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photoUrls?: string[];
}
