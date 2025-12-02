import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { ReviewPhoto } from './entities/review-photo.entity';
import { ReviewVote } from './entities/review-vote.entity';
import {
  CreateReviewDto,
  UpdateReviewDto,
  VoteReviewDto,
  ReportReviewDto,
} from './dto';
import { User } from '../users/entities/user.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { Order } from '../orders/entities/order.entity';
import { ReviewType, ReviewStatus } from './entities/review.entity';
import { VoteType } from './entities/review-vote.entity';
import { CloudinaryService } from '../../common/services/cloudinary.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(ReviewPhoto)
    private readonly reviewPhotoRepository: Repository<ReviewPhoto>,
    @InjectRepository(ReviewVote)
    private readonly reviewVoteRepository: Repository<ReviewVote>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    createReviewDto: CreateReviewDto,
    userId: number,
  ): Promise<Review> {
    const { targetId, targetType, orderId, photoUrls, ...reviewData } =
      createReviewDto;

    // Check if user already reviewed this target
    const existingReview = await this.reviewRepository.findOne({
      where: { userId, targetId, targetType },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this item');
    }

    // Validate target exists
    if (targetType === ReviewType.RESTAURANT) {
      const restaurant = await this.restaurantRepository.findOne({
        where: { id: parseInt(targetId) },
      });
      if (!restaurant) {
        throw new NotFoundException('Restaurant not found');
      }
    }

    // Validate order if provided
    if (orderId) {
      const order = await this.orderRepository.findOne({
        where: { id: parseInt(orderId), user_id: userId },
      });
      if (!order) {
        throw new NotFoundException(
          'Order not found or does not belong to user',
        );
      }
    }

    const review = this.reviewRepository.create({
      ...reviewData,
      userId,
      targetId,
      targetType,
      orderId,
      status: ReviewStatus.PENDING,
    });

    const savedReview = await this.reviewRepository.save(review);

    // Handle photo uploads
    if (photoUrls && photoUrls.length > 0) {
      const reviewPhotos = photoUrls.map((url) =>
        this.reviewPhotoRepository.create({
          reviewId: savedReview.id,
          imageUrl: url,
        }),
      );
      await this.reviewPhotoRepository.save(reviewPhotos);
    }

    const reviewWithPhotos = await this.reviewRepository.findOne({
      where: { id: savedReview.id },
      relations: ['photos'],
    });

    if (!reviewWithPhotos) {
      throw new NotFoundException('Review not found after creation');
    }

    return reviewWithPhotos;
  }

  async findAll(query: any = {}): Promise<Review[]> {
    const {
      targetId,
      targetType,
      userId,
      status,
      page = 1,
      limit = 10,
    } = query;

    const where: any = {};
    if (targetId) where.targetId = targetId;
    if (targetType) where.targetType = targetType;
    if (userId) where.userId = userId;
    if (status) where.status = status;

    return this.reviewRepository.find({
      where,
      relations: ['user', 'photos', 'votes'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['user', 'photos', 'votes'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async update(
    id: string,
    updateReviewDto: UpdateReviewDto,
    userId: number,
  ): Promise<Review> {
    const review = await this.findOne(id);

    if (review.userId !== userId) {
      throw new BadRequestException('You can only update your own reviews');
    }

    if (review.status !== ReviewStatus.PENDING) {
      throw new BadRequestException(
        'Cannot update a review that is not pending',
      );
    }

    Object.assign(review, updateReviewDto);
    return this.reviewRepository.save(review);
  }

  async remove(id: string, userId: number): Promise<void> {
    const review = await this.findOne(id);

    if (review.userId !== userId) {
      throw new BadRequestException('You can only delete your own reviews');
    }

    await this.reviewRepository.remove(review);
  }

  async vote(
    reviewId: string,
    voteReviewDto: VoteReviewDto,
    userId: number,
  ): Promise<ReviewVote> {
    // Verify review exists
    await this.findOne(reviewId);

    // Check if user already voted
    const existingVote = await this.reviewVoteRepository.findOne({
      where: { reviewId, userId },
    });

    if (existingVote) {
      if (existingVote.voteType === voteReviewDto.voteType) {
        // Remove vote if same type
        await this.reviewVoteRepository.remove(existingVote);
        await this.updateVoteCounts(reviewId);
        throw new BadRequestException('Vote removed');
      } else {
        // Update vote type
        existingVote.voteType = voteReviewDto.voteType;
        await this.reviewVoteRepository.save(existingVote);
      }
    } else {
      // Create new vote
      const vote = this.reviewVoteRepository.create({
        reviewId,
        userId,
        voteType: voteReviewDto.voteType,
      });
      await this.reviewVoteRepository.save(vote);
    }

    await this.updateVoteCounts(reviewId);
    const updatedVote = await this.reviewVoteRepository.findOne({
      where: { reviewId, userId },
    });
    if (!updatedVote) {
      throw new NotFoundException('Vote not found after update');
    }
    return updatedVote;
  }

  private async updateVoteCounts(reviewId: string): Promise<void> {
    const helpfulVotes = await this.reviewVoteRepository.count({
      where: { reviewId, voteType: VoteType.HELPFUL },
    });

    const totalVotes = await this.reviewVoteRepository.count({
      where: { reviewId },
    });

    await this.reviewRepository.update(reviewId, {
      helpfulVotes,
      totalVotes,
    });
  }

  async approveReview(id: string): Promise<Review> {
    const review = await this.findOne(id);
    review.status = ReviewStatus.APPROVED;
    return this.reviewRepository.save(review);
  }

  async rejectReview(id: string): Promise<Review> {
    const review = await this.findOne(id);
    review.status = ReviewStatus.REPORTED;
    return this.reviewRepository.save(review);
  }

  async getAverageRating(
    targetId: string,
    targetType: ReviewType,
  ): Promise<number> {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'average')
      .where('review.targetId = :targetId', { targetId })
      .andWhere('review.targetType = :targetType', { targetType })
      .andWhere('review.status = :status', { status: ReviewStatus.APPROVED })
      .getRawOne();

    return result?.average ? parseFloat(result.average) : 0;
  }

  async reportReview(
    id: string,
    reportReviewDto: ReportReviewDto,
    userId: number,
  ): Promise<void> {
    const review = await this.findOne(id);

    // Check if user already reported this review
    const existingReport = await this.reviewRepository.findOne({
      where: { id, status: ReviewStatus.REPORTED },
    });

    if (existingReport) {
      throw new BadRequestException('This review has already been reported');
    }

    // Update review status to reported
    review.status = ReviewStatus.REPORTED;
    await this.reviewRepository.save(review);
  }

  async uploadReviewPhoto(
    reviewId: string,
    file: { buffer: Buffer },
    userId: number,
  ): Promise<{ imageUrl: string; cloudinaryPublicId: string }> {
    const review = await this.findOne(reviewId);

    // Verify user owns this review
    if (review.userId !== userId) {
      throw new Error(
        'Unauthorized: You can only add photos to your own reviews',
      );
    }

    // Upload to Cloudinary
    const { url, public_id } = await this.cloudinaryService.uploadImage(
      file,
      `reviews/${userId}`,
    );

    // Save photo metadata
    const reviewPhoto = this.reviewPhotoRepository.create({
      reviewId,
      imageUrl: url,
      cloudinaryPublicId: public_id,
    });

    await this.reviewPhotoRepository.save(reviewPhoto);

    return {
      imageUrl: url,
      cloudinaryPublicId: public_id,
    };
  }
}
