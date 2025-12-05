import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('restaurants')
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new restaurant' })
  @ApiResponse({
    status: 201,
    description: 'Restaurant created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  create(@Body() createRestaurantDto: CreateRestaurantDto) {
    return this.restaurantsService.create(createRestaurantDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all restaurants' })
  @ApiResponse({
    status: 200,
    description: 'List of restaurants retrieved successfully',
  })
  @ApiQuery({
    name: 'cuisine_type',
    required: false,
    description: 'Filter by cuisine type',
  })
  @ApiQuery({
    name: 'is_active',
    required: false,
    description: 'Filter by active status',
  })
  findAll() {
    return this.restaurantsService.findAll();
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all restaurants (public)' })
  @ApiResponse({
    status: 200,
    description: 'List of restaurants retrieved successfully',
  })
  findAllPublic() {
    return this.restaurantsService.findAll();
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get restaurants owned by current user' })
  @ApiResponse({
    status: 200,
    description: 'User restaurants retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findMyRestaurants(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const user = req.user as User;
    return this.restaurantsService.findByOwner(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get restaurant by ID' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiResponse({
    status: 200,
    description: 'Restaurant retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.restaurantsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update restaurant' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiResponse({
    status: 200,
    description: 'Restaurant updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Restaurant or address not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
    @Request() req,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const user = req.user as User;
    return this.restaurantsService.update(id, updateRestaurantDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete restaurant' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiResponse({
    status: 200,
    description: 'Restaurant deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const user = req.user as User;
    return this.restaurantsService.remove(id, user);
  }

  @Post(':id/toggle-active')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle restaurant active status' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiResponse({
    status: 200,
    description: 'Restaurant status toggled successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  toggleActive(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const user = req.user as User;
    return this.restaurantsService.toggleActive(id, user);
  }

  @Post(':id/upload-logo')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload restaurant logo to Cloudinary' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiResponse({
    status: 200,
    description: 'Logo uploaded successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - no file or invalid file',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  async uploadLogo(
    @Param('id', ParseIntPipe) id: number,

    @UploadedFile() file: any,

    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    if (!file?.mimetype?.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const user = req.user as User;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.restaurantsService.updateRestaurantLogo(id, file, user);
  }

  @Post(':id/upload-banner')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload restaurant banner to Cloudinary' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiResponse({
    status: 200,
    description: 'Banner uploaded successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - no file or invalid file',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  async uploadBanner(
    @Param('id', ParseIntPipe) id: number,

    @UploadedFile() file: any,

    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    if (!file?.mimetype?.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const user = req.user as User;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.restaurantsService.updateRestaurantBanner(id, file, user);
  }

  // Location-based filtering (from Stores module)
  @Get('location/:city')
  @ApiOperation({ summary: 'Get restaurants by location' })
  @ApiParam({ name: 'city', description: 'City name' })
  @ApiQuery({
    name: 'state',
    required: false,
    description: 'State/County filter',
  })
  @ApiQuery({
    name: 'country',
    required: false,
    description: 'Country filter',
  })
  findByLocation(
    @Param('city') city: string,
    @Query('state') state?: string,
    @Query('country') country?: string,
  ) {
    return this.restaurantsService.findByLocation(city, state, country);
  }

  // Rating system (from Stores module)
  @Post(':id/rate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Rate a restaurant' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiResponse({
    status: 200,
    description: 'Restaurant rated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  rateRestaurant(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { rating: number },
  ) {
    return this.restaurantsService.updateRating(id, body.rating);
  }

  // Verification system (from Stores module)
  @Patch(':id/verify')
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify restaurant (Admin only)' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiResponse({
    status: 200,
    description: 'Restaurant verified successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  verifyRestaurant(@Param('id', ParseIntPipe) id: number) {
    return this.restaurantsService.verifyRestaurant(id);
  }

  // Analytics dashboard (from Stores module)
  @Get('analytics/overview')
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get restaurant analytics (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Analytics retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  getRestaurantAnalytics() {
    return this.restaurantsService.getRestaurantAnalytics();
  }

  // Unverified restaurants (from Stores module)
  @Get('unverified/all')
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all unverified restaurants (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Unverified restaurants retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  findUnverifiedRestaurants() {
    return this.restaurantsService.findUnverifiedRestaurants();
  }

  // Find restaurants by owner ID (from Stores module)
  @Get('owner/:ownerId')
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get restaurants by owner ID (Admin only)' })
  @ApiParam({ name: 'ownerId', description: 'Owner ID' })
  @ApiResponse({
    status: 200,
    description: 'Restaurants retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  findByOwnerId(@Param('ownerId', ParseIntPipe) ownerId: number) {
    return this.restaurantsService.findByOwnerId(ownerId);
  }

  // View Menu - Get menu items for a specific restaurant
  @Get(':id/menu')
  @ApiOperation({ summary: 'Get menu items for a specific restaurant' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiResponse({
    status: 200,
    description: 'Menu items retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  getRestaurantMenu(@Param('id', ParseIntPipe) id: number) {
    return this.restaurantsService.getRestaurantMenu(id);
  }

  // Restaurant Owner Dashboard Stats
  @Get(':id/dashboard-stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get dashboard statistics for restaurant owner' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not restaurant owner' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  getRestaurantDashboardStats(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const user = req.user as User;
    return this.restaurantsService.getRestaurantDashboardStats(id, user);
  }
}
