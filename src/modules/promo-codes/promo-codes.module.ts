import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromoCodesService } from './promo-codes.service';
import { PromoCodesController } from './promo-codes.controller';
import { PromoCode } from './entities/promo-code.entity';
import { UserPromoUsage } from './entities/user-promo-usage.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PromoCode, UserPromoUsage])],
  controllers: [PromoCodesController],
  providers: [PromoCodesService],
  exports: [PromoCodesService],
})
export class PromoCodesModule {}
