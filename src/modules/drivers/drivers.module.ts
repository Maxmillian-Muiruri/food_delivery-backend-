import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import { Driver } from './entities/driver.entity';
import { DriverDocument } from './entities/driver-document.entity';
import { Order } from '../orders/entities/order.entity';
import { UploadsModule } from '../uploads/uploads.module';
import { OrdersModule } from '../orders/orders.module';
import { EmailModule } from '../email/email.module';
import { DriverAssignedListener } from './listeners/driver-assigned.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([Driver, DriverDocument, Order]),
    UploadsModule,
    forwardRef(() => OrdersModule),
    EmailModule,
  ],
  controllers: [DriversController],
  providers: [DriversService, DriverAssignedListener],
  exports: [DriversService],
})
export class DriversModule {}
