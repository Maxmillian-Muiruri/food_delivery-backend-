import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadImageDto {
  @ApiProperty({ type: 'string', format: 'binary', description: 'Image file' })
  file: any;
}

export class ImageResponseDto {
  @ApiProperty({ example: 'https://res.cloudinary.com/...' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ example: 'food-delivery/restaurants/abc123' })
  @IsString()
  @IsNotEmpty()
  public_id: string;
}
