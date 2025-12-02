import { Module, forwardRef } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Order } from '../orders/entities/order.entity';
import { OrdersModule } from '../orders/orders.module';
import { Address } from '../addresses/entities/address.entity';
import { DriversModule } from '../drivers/drivers.module';
import { EmailModule } from '../email/email.module';
import { PaymentCompletedListener } from './listeners/payment-completed.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Order, Address]),
    forwardRef(() => OrdersModule),
    forwardRef(() => DriversModule),
    EmailModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentCompletedListener],
  exports: [PaymentsService],
})
export class PaymentsModule {}
