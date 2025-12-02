import { IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SocialLoginDto {
  @ApiProperty({ enum: ['google', 'facebook'] })
  @IsEnum(['google', 'facebook'])
  @IsNotEmpty()
  provider: string;

  @ApiProperty({ example: 'ya29.a0AfH6SMC...' })
  @IsString()
  @IsNotEmpty()
  access_token: string;
}
