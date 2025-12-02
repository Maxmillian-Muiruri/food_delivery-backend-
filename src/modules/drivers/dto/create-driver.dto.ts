import { IsOptional, IsString } from 'class-validator';

export class CreateDriverDto {
  @IsOptional()
  @IsString()
  licensePlate?: string;

  @IsOptional()
  @IsString()
  vehicleType?: string;
}
