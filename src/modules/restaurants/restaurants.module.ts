import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsService } from './restaurants.service';
import { RestaurantsController } from './restaurants.controller';
import { Restaurant } from './entities/restaurant.entity';
import { Address } from '../addresses/entities/address.entity';
import { User } from '../users/entities/user.entity';
import { MenuItem } from '../menu-items/entities/menu-item.entity';
import { CloudinaryService } from '../../common/services/cloudinary.service';
import { BusinessListeners } from './listeners/business.listeners';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Restaurant, Address, User, MenuItem]),
    EmailModule,
    NotificationsModule,
  ],
  controllers: [RestaurantsController],
  providers: [RestaurantsService, CloudinaryService, BusinessListeners],
  exports: [RestaurantsService],
})
export class RestaurantsModule {}
