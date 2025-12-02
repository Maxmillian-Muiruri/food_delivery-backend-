import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderTracking } from './entities/order-tracking.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { Address } from '../addresses/entities/address.entity';
import { MenuItem } from '../menu-items/entities/menu-item.entity';
import { DriversModule } from '../drivers/drivers.module';
import { PaymentsModule } from '../payments/payments.module';
import { EmailModule } from '../email/email.module';
import { OrderCreatedListener } from './listeners/order-created.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      OrderTracking,
      Restaurant,
      Address,
      MenuItem,
    ]),
    forwardRef(() => DriversModule),
    PaymentsModule,
    EmailModule,
    ConfigModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrderCreatedListener],
  exports: [OrdersService],
})
export class OrdersModule {}
