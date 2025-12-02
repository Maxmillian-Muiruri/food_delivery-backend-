import { IsIn } from 'class-validator';

export class UpdateAvailabilityDto {
  @IsIn(['offline', 'available', 'busy'])
  availabilityStatus: 'offline' | 'available' | 'busy';
}
