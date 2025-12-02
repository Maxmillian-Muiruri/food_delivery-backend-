import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { TransfersService, PaymentParticipant } from './transfers.service';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('transfers')
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @Post('process')
  @Roles('admin')
  async process(
    @Body()
    paymentRequest: {
      order_id: number;
      delivery_id: number;
      store: PaymentParticipant;
      driver: PaymentParticipant;
    },
  ) {
    return this.transfersService.processDeliveryPayments(paymentRequest);
  }

  @Get('verify/:reference')
  @Roles('admin')
  async verify(@Param('reference') reference: string) {
    return this.transfersService.verifyAndUpdateTransferStatus(reference);
  }
}
