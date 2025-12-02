import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review } from './entities/review.entity';
import { ReviewPhoto } from './entities/review-photo.entity';
import { ReviewVote } from './entities/review-vote.entity';
import { User } from '../users/entities/user.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { Order } from '../orders/entities/order.entity';
import { CloudinaryProvider } from '../../config/cloudinary.config';
import { CloudinaryService } from '../../common/services/cloudinary.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Review,
      ReviewPhoto,
      ReviewVote,
      User,
      Restaurant,
      Order,
    ]),
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService, CloudinaryService, CloudinaryProvider],
  exports: [ReviewsService],
})
export class ReviewsModule {}
