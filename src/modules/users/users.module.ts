import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { PersonalizationListener } from './listeners/personalization.listener';
import { RestaurantsModule } from '../restaurants/restaurants.module';
import { MenuItemsModule } from '../menu-items/menu-items.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    RestaurantsModule,
    MenuItemsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, PersonalizationListener],
  exports: [UsersService],
})
export class UsersModule {}
