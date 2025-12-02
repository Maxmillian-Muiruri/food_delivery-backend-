/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromoCode } from './entities/promo-code.entity';
import { UserPromoUsage } from './entities/user-promo-usage.entity';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';
import { ApplyPromoCodeDto } from './dto/apply-promo-code.dto';
import { ApplyPromoCodeResponseDto } from './dto/promo-code-response.dto';

@Injectable()
export class PromoCodesService {
  constructor(
    @InjectRepository(PromoCode)
    private promoCodeRepository: Repository<PromoCode>,
    @InjectRepository(UserPromoUsage)
    private userPromoUsageRepository: Repository<UserPromoUsage>,
  ) {}

  async create(createPromoCodeDto: CreatePromoCodeDto): Promise<PromoCode> {
    // Check if code already exists
    const existing = await this.promoCodeRepository.findOne({
      where: { code: createPromoCodeDto.code },
    });

    if (existing) {
      throw new ConflictException(
        `Promo code ${createPromoCodeDto.code} already exists`,
      );
    }

    const promoCode = this.promoCodeRepository.create({
      ...createPromoCodeDto,
      valid_from: new Date(createPromoCodeDto.valid_from),
      valid_until: new Date(createPromoCodeDto.valid_until),
    });

    return this.promoCodeRepository.save(promoCode);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    isActive: boolean = true,
  ): Promise<{ data: PromoCode[]; total: number; page: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.promoCodeRepository.findAndCount({
      where: { is_active: isActive },
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return { data, total, page };
  }

  async findOne(id: number): Promise<PromoCode> {
    const promoCode = await this.promoCodeRepository.findOne({
      where: { id },
    });

    if (!promoCode) {
      throw new NotFoundException(`Promo code with ID ${id} not found`);
    }

    return promoCode;
  }

  async findByCode(code: string): Promise<PromoCode> {
    const promoCode = await this.promoCodeRepository.findOne({
      where: { code: code.toUpperCase() },
    });

    if (!promoCode) {
      throw new NotFoundException(`Promo code ${code} not found`);
    }

    return promoCode;
  }

  async update(
    id: number,
    updatePromoCodeDto: UpdatePromoCodeDto,
  ): Promise<PromoCode> {
    const promoCode = await this.findOne(id);

    // If code is being changed, check for duplicates
    if (updatePromoCodeDto.code && updatePromoCodeDto.code !== promoCode.code) {
      const existing = await this.promoCodeRepository.findOne({
        where: { code: updatePromoCodeDto.code },
      });

      if (existing) {
        throw new ConflictException(
          `Promo code ${updatePromoCodeDto.code} already exists`,
        );
      }
    }

    const updated = Object.assign(promoCode, {
      ...updatePromoCodeDto,
      valid_from: updatePromoCodeDto.valid_from
        ? new Date(updatePromoCodeDto.valid_from)
        : promoCode.valid_from,
      valid_until: updatePromoCodeDto.valid_until
        ? new Date(updatePromoCodeDto.valid_until)
        : promoCode.valid_until,
    });

    return this.promoCodeRepository.save(updated);
  }

  async remove(id: number): Promise<void> {
    const promoCode = await this.findOne(id);
    await this.promoCodeRepository.remove(promoCode);
  }

  async validatePromoCode(code: string): Promise<PromoCode> {
    const promoCode = await this.findByCode(code);

    const now = new Date();

    // Check if code is active
    if (!promoCode.is_active) {
      throw new BadRequestException('This promo code is not active');
    }

    // Check validity dates
    if (now < promoCode.valid_from) {
      throw new BadRequestException('This promo code is not yet valid');
    }

    if (now > promoCode.valid_until) {
      throw new BadRequestException('This promo code has expired');
    }

    // Check usage limit
    if (
      promoCode.usage_limit > 0 &&
      promoCode.usage_count >= promoCode.usage_limit
    ) {
      throw new BadRequestException(
        'This promo code has reached its usage limit',
      );
    }

    return promoCode;
  }

  async applyPromoCode(
    applyPromoCodeDto: ApplyPromoCodeDto,
    userId: number,
  ): Promise<ApplyPromoCodeResponseDto> {
    const promoCode = await this.validatePromoCode(applyPromoCodeDto.code);

    const { order_amount } = applyPromoCodeDto;

    // Check minimum order amount
    if (
      promoCode.minimum_order_amount &&
      order_amount < promoCode.minimum_order_amount
    ) {
      throw new BadRequestException(
        `Minimum order amount of ${promoCode.minimum_order_amount} required`,
      );
    }

    // Calculate discount
    let discountAmount = 0;

    if (promoCode.discount_type === 'percentage') {
      discountAmount = (order_amount * promoCode.discount_value) / 100;

      if (
        promoCode.maximum_discount_amount &&
        discountAmount > promoCode.maximum_discount_amount
      ) {
        discountAmount = promoCode.maximum_discount_amount;
      }
    } else if (promoCode.discount_type === 'fixed_amount') {
      discountAmount = promoCode.discount_value;
    } else if (promoCode.discount_type === 'free_delivery') {
      // Free delivery will be handled separately in order service
      discountAmount = 0;
    }

    const finalAmount = Math.max(0, order_amount - discountAmount);

    return {
      is_valid: true,
      code: promoCode.code,
      discount_amount: discountAmount,
      final_amount: finalAmount,
    };
  }

  async recordPromoUsage(
    userId: number,
    promoCodeId: number,
    orderId: number,
    discountAmount: number,
    orderTotal: number,
  ): Promise<UserPromoUsage> {
    // Increment usage count
    const promoCode = await this.findOne(promoCodeId);
    promoCode.usage_count += 1;
    await this.promoCodeRepository.save(promoCode);

    // Record usage
    const usage = this.userPromoUsageRepository.create({
      user_id: userId,
      promo_code_id: promoCodeId,
      order_id: orderId,
      discount_amount: discountAmount,
      order_total: orderTotal,
    });

    return this.userPromoUsageRepository.save(usage);
  }

  async getUserPromoHistory(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: UserPromoUsage[]; total: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.userPromoUsageRepository.findAndCount({
      where: { user_id: userId },
      relations: ['promoCode'],
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return { data, total };
  }

  async getAvailatePromoCodes(): Promise<PromoCode[]> {
    const now = new Date();

    return this.promoCodeRepository.find({
      where: {
        is_active: true,
      },
      order: { created_at: 'DESC' },
    });
  }
}
