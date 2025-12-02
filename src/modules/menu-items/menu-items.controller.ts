/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
import { MenuItemsService } from './menu-items.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { QueryMenuItemDto } from './dto/query-menu-item.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';

@ApiTags('menu-items')
@Controller('menu-items')
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new menu item' })
  @ApiResponse({
    status: 201,
    description: 'Menu item created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  create(@Body() createMenuItemDto: CreateMenuItemDto, @Request() req) {
    const user = req.user as User;
    return this.menuItemsService.create(createMenuItemDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all menu items with advanced filtering' })
  @ApiResponse({
    status: 200,
    description: 'List of menu items retrieved successfully',
  })
  findAll(@Query() queryDto: QueryMenuItemDto) {
    return this.menuItemsService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get menu item by ID' })
  @ApiParam({ name: 'id', description: 'Menu item ID' })
  @ApiResponse({
    status: 200,
    description: 'Menu item retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menuItemsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update menu item' })
  @ApiParam({ name: 'id', description: 'Menu item ID' })
  @ApiResponse({
    status: 200,
    description: 'Menu item updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
    @Request() req,
  ) {
    const user = req.user as User;
    return this.menuItemsService.update(id, updateMenuItemDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete menu item' })
  @ApiParam({ name: 'id', description: 'Menu item ID' })
  @ApiResponse({
    status: 200,
    description: 'Menu item deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const user = req.user as User;
    return this.menuItemsService.remove(id, user);
  }

  @Post(':id/toggle-availability')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle menu item availability' })
  @ApiParam({ name: 'id', description: 'Menu item ID' })
  @ApiResponse({
    status: 200,
    description: 'Menu item availability toggled successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  toggleAvailability(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const user = req.user as User;
    return this.menuItemsService.toggleAvailability(id, user);
  }

  @Post('bulk-toggle-availability')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk toggle availability for multiple menu items' })
  @ApiResponse({
    status: 200,
    description: 'Menu items availability toggled successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'One or more menu items not found' })
  bulkToggleAvailability(@Body() body: { ids: number[] }, @Request() req) {
    const user = req.user as User;
    return this.menuItemsService.bulkToggleAvailability(body.ids, user);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all menu item categories' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
  })
  @ApiQuery({
    name: 'restaurant_id',
    required: false,
    description: 'Filter categories by restaurant ID',
  })
  getCategories(
    @Query('restaurant_id', new ParseIntPipe({ optional: true }))
    restaurantId?: number,
  ) {
    return this.menuItemsService.getCategories(restaurantId);
  }

  @Post(':id/upload-image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload menu item image to Cloudinary' })
  @ApiParam({ name: 'id', description: 'Menu item ID' })
  @ApiResponse({
    status: 200,
    description: 'Image uploaded successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - no file or invalid file',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  async uploadImage(
    @Param('id', ParseIntPipe) id: number,

    @UploadedFile() file: any,

    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    if (!file?.mimetype?.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }

    const user = req.user as User;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.menuItemsService.updateMenuItemImage(id, file, user);
  }
}
