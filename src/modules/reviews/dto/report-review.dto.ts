import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class ReportReviewDto {
  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  description?: string;
}
