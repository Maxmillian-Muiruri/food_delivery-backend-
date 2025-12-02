import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Configs
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';

// Controllers
import { HealthController } from './health/health.controller';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { RestaurantsModule } from './modules/restaurants/restaurants.module';
import { MenuItemsModule } from './modules/menu-items/menu-items.module';
import { CartsModule } from './modules/carts/carts.module';
import { OrdersModule } from './modules/orders/orders.module';
import { OrderTrackingModule } from './modules/order-tracking/order-tracking.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PromoCodesModule } from './modules/promo-codes/promo-codes.module';
import { DriversModule } from './modules/drivers/drivers.module';
import { TransfersModule } from './modules/transfers/transfers.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { EmailModule } from './modules/email/email.module';
// import { SearchModule } from './modules/search/search.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
      cache: true,
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        configService.get<TypeOrmModuleOptions>('database')!,
      inject: [ConfigService],
    }),

    // JWT Global
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.accessTokenSecret'),
        signOptions: {
          expiresIn: configService.get('jwt.accessTokenExpiresIn'),
        },
      }),
      inject: [ConfigService],
    }),

    // Event Emitter for event-driven architecture
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 20,
    }),

    // Feature Modules
    AuthModule,
    UsersModule,
    AddressesModule,
    RestaurantsModule,
    MenuItemsModule,
    CartsModule,
    OrdersModule,
    OrderTrackingModule,
    FavoritesModule,
    ReviewsModule,
    UploadsModule,
    PaymentsModule,
    TransfersModule,
    PromoCodesModule,
    DriversModule,
    NotificationsModule,
    EmailModule,
    // SearchModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
