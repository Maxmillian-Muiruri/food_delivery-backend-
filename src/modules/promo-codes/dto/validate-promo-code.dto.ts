import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ValidatePromoCodeDto {
  @ApiProperty({
    example: 'SAVE10',
    description: 'Promo code to validate',
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}
