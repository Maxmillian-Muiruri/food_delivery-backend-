import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderTracking } from './entities/order-tracking.entity';
import { CreateTrackingDto } from './dto/create-tracking.dto';
import { UpdateTrackingDto } from './dto/update-tracking.dto';
import { TrackingResponseDto } from './dto/tracking-response.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class OrderTrackingService {
  constructor(
    @InjectRepository(OrderTracking)
    private readonly trackingRepository: Repository<OrderTracking>,
  ) {}

  async create(createTrackingDto: CreateTrackingDto): Promise<OrderTracking> {
    const tracking = this.trackingRepository.create(createTrackingDto);
    return await this.trackingRepository.save(tracking);
  }

  async findAll(): Promise<OrderTracking[]> {
    return await this.trackingRepository.find({
      relations: ['order'],
      order: { created_at: 'DESC' },
    });
  }

  async findByOrderId(orderId: number): Promise<TrackingResponseDto[]> {
    const tracking = await this.trackingRepository.find({
      where: { order_id: orderId },
      order: { created_at: 'ASC' },
    });

    return plainToClass(TrackingResponseDto, tracking, {
      excludeExtraneousValues: true,
    });
  }

  async findOne(id: number): Promise<OrderTracking> {
    const tracking = await this.trackingRepository.findOne({
      where: { id },
      relations: ['order'],
    });

    if (!tracking) {
      throw new NotFoundException(`Order tracking with ID ${id} not found`);
    }

    return tracking;
  }

  async update(
    id: number,
    updateTrackingDto: UpdateTrackingDto,
  ): Promise<OrderTracking> {
    const tracking = await this.findOne(id);
    Object.assign(tracking, updateTrackingDto);
    return await this.trackingRepository.save(tracking);
  }

  async remove(id: number): Promise<void> {
    const tracking = await this.findOne(id);
    await this.trackingRepository.remove(tracking);
  }

  async createTrackingEntry(
    orderId: number,
    status: string,
    message?: string,
    latitude?: number,
    longitude?: number,
  ): Promise<OrderTracking> {
    const trackingDto: CreateTrackingDto = {
      order_id: orderId,
      status,
      message,
      latitude,
      longitude,
    };

    return await this.create(trackingDto);
  }

  async getLatestTracking(orderId: number): Promise<OrderTracking | null> {
    return await this.trackingRepository.findOne({
      where: { order_id: orderId },
      order: { created_at: 'DESC' },
    });
  }
}
