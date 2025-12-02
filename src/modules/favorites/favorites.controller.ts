import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { AddFavoriteDto } from './dto/add-favorite.dto';
import { RemoveFavoriteDto } from './dto/remove-favorite.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  async addFavorite(
    @GetUser() user: User,
    @Body() addFavoriteDto: AddFavoriteDto,
  ) {
    return this.favoritesService.addFavorite(user, addFavoriteDto);
  }

  @Delete()
  async removeFavorite(
    @GetUser() user: User,
    @Body() removeFavoriteDto: RemoveFavoriteDto,
  ) {
    await this.favoritesService.removeFavorite(user, removeFavoriteDto);
    return { message: 'Favorite removed successfully' };
  }

  @Get()
  async getUserFavorites(@GetUser() user: User) {
    return this.favoritesService.getUserFavorites(user);
  }

  @Get('restaurants')
  async getFavoriteRestaurants(@GetUser() user: User) {
    return this.favoritesService.getFavoriteRestaurants(user);
  }

  @Get('menu-items')
  async getFavoriteMenuItems(@GetUser() user: User) {
    return this.favoritesService.getFavoriteMenuItems(user);
  }
}
