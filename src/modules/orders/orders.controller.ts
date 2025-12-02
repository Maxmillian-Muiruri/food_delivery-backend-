import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ReorderDto } from './dto/reorder.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Restaurant or address not found' })
  create(@Body() createOrderDto: CreateOrderDto, @GetUser() user: User) {
    return this.ordersService.create(createOrderDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  findAll(@GetUser() user: User) {
    return this.ordersService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific order by ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.ordersService.findOne(+id, user);
  }

  @Delete(':id/cancel')
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Order cannot be cancelled' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  cancelOrder(@Param('id') id: string, @GetUser() user: User) {
    return this.ordersService.cancelOrder(+id, user);
  }

  @Get(':id/tracking')
  @ApiOperation({ summary: 'Get order tracking history' })
  @ApiResponse({
    status: 200,
    description: 'Tracking history retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  getOrderTracking(@Param('id') id: string, @GetUser() user: User) {
    return this.ordersService.getOrderTracking(+id, user);
  }

  @Get('recent/reorder')
  @ApiOperation({ summary: 'Get recent orders for quick reordering' })
  @ApiResponse({
    status: 200,
    description: 'Recent orders retrieved successfully',
  })
  getRecentOrdersForReorder(
    @GetUser() user: User,
    @Query('limit') limit?: string,
  ) {
    return this.ordersService.getRecentOrdersForReorder(
      user,
      limit ? +limit : 10,
    );
  }

  @Post(':id/reorder')
  @ApiOperation({ summary: 'Reorder from a previous order' })
  @ApiResponse({
    status: 200,
    description: 'Reorder initiated successfully',
  })
  @ApiResponse({ status: 400, description: 'Cannot reorder from this order' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  reorderFromPreviousOrder(
    @Param('id') id: string,
    @GetUser() user: User,
    @Body() reorderDto?: ReorderDto,
  ) {
    return this.ordersService.reorderFromPreviousOrder(+id, user);
  }

  @Get('frequently-ordered/items')
  @ApiOperation({ summary: 'Get frequently ordered menu items' })
  @ApiResponse({
    status: 200,
    description: 'Frequently ordered items retrieved successfully',
  })
  getFrequentlyOrderedItems(
    @GetUser() user: User,
    @Query('limit') limit?: string,
  ) {
    return this.ordersService.getFrequentlyOrderedItems(
      user,
      limit ? +limit : 10,
    );
  }
}
