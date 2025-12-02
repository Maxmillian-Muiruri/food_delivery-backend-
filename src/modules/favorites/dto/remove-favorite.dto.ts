import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class RemoveFavoriteDto {
  @IsOptional()
  @IsNumber()
  restaurantId?: number;

  @IsOptional()
  @IsNumber()
  menuItemId?: number;

  // Ensure at least one is provided
  @IsNotEmpty({ message: 'Either restaurantId or menuItemId must be provided' })
  get validateOneRequired() {
    return this.restaurantId || this.menuItemId;
  }
}
