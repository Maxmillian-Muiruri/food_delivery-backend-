import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { PromoCodesService } from './promo-codes.service';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';
import { ApplyPromoCodeDto } from './dto/apply-promo-code.dto';
import { ValidatePromoCodeDto } from './dto/validate-promo-code.dto';
import {
  PromoCodeResponseDto,
  ApplyPromoCodeResponseDto,
} from './dto/promo-code-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('promo-codes')
@Controller('api/v1/promo-codes')
export class PromoCodesController {
  constructor(private readonly promoCodesService: PromoCodesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new promo code (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Promo code created',
    type: PromoCodeResponseDto,
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createPromoCodeDto: CreatePromoCodeDto,
  ): Promise<PromoCodeResponseDto> {
    return this.promoCodesService.create(createPromoCodeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all available promo codes' })
  @ApiResponse({
    status: 200,
    description: 'List of promo codes',
  })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('active') isActive: boolean = true,
  ) {
    return this.promoCodesService.findAll(page, limit, isActive);
  }

  @Get('available')
  @ApiOperation({ summary: 'Get currently available promo codes for users' })
  @ApiResponse({
    status: 200,
    description: 'List of available promo codes',
    type: [PromoCodeResponseDto],
  })
  async getAvailable() {
    return this.promoCodesService.getAvailatePromoCodes();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a promo code by ID' })
  @ApiResponse({
    status: 200,
    description: 'Promo code details',
    type: PromoCodeResponseDto,
  })
  async findOne(@Param('id') id: string): Promise<PromoCodeResponseDto> {
    return this.promoCodesService.findOne(+id);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate a promo code' })
  @ApiResponse({
    status: 200,
    description: 'Promo code is valid',
    type: PromoCodeResponseDto,
  })
  async validate(
    @Body() validatePromoCodeDto: ValidatePromoCodeDto,
  ): Promise<PromoCodeResponseDto> {
    return this.promoCodesService.validatePromoCode(validatePromoCodeDto.code);
  }

  @Post('apply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apply a promo code to cart/order' })
  @ApiResponse({
    status: 200,
    description: 'Promo code applied successfully',
    type: ApplyPromoCodeResponseDto,
  })
  async apply(
    @Body() applyPromoCodeDto: ApplyPromoCodeDto,
    @GetUser('id') userId: number,
  ): Promise<ApplyPromoCodeResponseDto> {
    return this.promoCodesService.applyPromoCode(applyPromoCodeDto, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a promo code (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Promo code updated',
    type: PromoCodeResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updatePromoCodeDto: UpdatePromoCodeDto,
  ): Promise<PromoCodeResponseDto> {
    return this.promoCodesService.update(+id, updatePromoCodeDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a promo code (Admin only)' })
  @ApiResponse({ status: 204, description: 'Promo code deleted' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.promoCodesService.remove(+id);
  }

  @Get('user/history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user's promo code usage history" })
  @ApiResponse({
    status: 200,
    description: 'User promo usage history',
  })
  async getUserHistory(
    @GetUser('id') userId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.promoCodesService.getUserPromoHistory(userId, page, limit);
  }
}
