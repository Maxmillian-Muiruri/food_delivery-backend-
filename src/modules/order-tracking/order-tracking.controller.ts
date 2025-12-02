import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OrderTrackingService } from './order-tracking.service';
import { CreateTrackingDto } from './dto/create-tracking.dto';
import { UpdateTrackingDto } from './dto/update-tracking.dto';
import { TrackingResponseDto } from './dto/tracking-response.dto';

@ApiTags('Order Tracking')
@ApiBearerAuth()
@Controller('order-tracking')
@UseGuards(JwtAuthGuard)
export class OrderTrackingController {
  constructor(private readonly trackingService: OrderTrackingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tracking entry' })
  @ApiResponse({
    status: 201,
    description: 'Tracking entry created successfully',
    type: TrackingResponseDto,
  })
  create(@Body() createTrackingDto: CreateTrackingDto) {
    return this.trackingService.create(createTrackingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tracking entries' })
  @ApiResponse({
    status: 200,
    description: 'List of all tracking entries',
    type: [TrackingResponseDto],
  })
  findAll() {
    return this.trackingService.findAll();
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get tracking entries for a specific order' })
  @ApiResponse({
    status: 200,
    description: 'List of tracking entries for the order',
    type: [TrackingResponseDto],
  })
  findByOrderId(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.trackingService.findByOrderId(orderId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific tracking entry' })
  @ApiResponse({
    status: 200,
    description: 'Tracking entry details',
    type: TrackingResponseDto,
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.trackingService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a tracking entry' })
  @ApiResponse({
    status: 200,
    description: 'Tracking entry updated successfully',
    type: TrackingResponseDto,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTrackingDto: UpdateTrackingDto,
  ) {
    return this.trackingService.update(id, updateTrackingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tracking entry' })
  @ApiResponse({
    status: 200,
    description: 'Tracking entry deleted successfully',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.trackingService.remove(id);
  }
}
