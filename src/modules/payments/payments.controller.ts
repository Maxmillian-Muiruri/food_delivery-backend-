import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PaymentsService, VerifyResponse } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentCompletedEvent, EventTypes } from '../../events';

@ApiBearerAuth('access-token')
@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post('all')
  @Roles('customer')
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Post('initialize')
  @Roles('customer')
  initialize(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.initializePayment(createPaymentDto);
  }
  // verify
  @Get('verify/:reference')
  @Roles('customer')
  verifTransaction(
    @Param('reference') reference: string,
  ): Promise<VerifyResponse> {
    return this.paymentsService.verifyTransaction(reference);
  }

  // user payments
  @Get('user/:userId')
  @Roles('customer', 'admin', 'restaurant')
  findUserPayments(@Param('userId') userId: number) {
    return this.paymentsService.findUserPayments(userId);
  }

  @Get()
  @Roles('customer', 'admin', 'restaurant')
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get(':id')
  @Roles('customer', 'admin', 'restaurant')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(+id);
  }

  @Patch(':id')
  @Roles('customer', 'admin', 'restaurant')
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(+id, updatePaymentDto);
  }

  @Delete(':id')
  @Roles('customer', 'admin', 'restaurant')
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(+id);
  }

  @Post('test/complete/:paymentId')
  @Roles('customer', 'admin')
  async testCompletePayment(@Param('paymentId') paymentId: string) {
    const payment = await this.paymentsService.findOne(+paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    // Emit PAYMENT_COMPLETED event to trigger email
    this.eventEmitter.emit(EventTypes.PAYMENT_COMPLETED, {
      paymentId: payment.payment_id,
      orderId: payment.order_id,
      amount: payment.amount,
      userId: payment.user_id,
    } as PaymentCompletedEvent);

    return { message: 'Payment completion event emitted' };
  }
}
