import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { CloudinaryService } from '../../common/services/cloudinary.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { ReviewPhoto } from './entities/review-photo.entity';
import { ReviewVote } from './entities/review-vote.entity';

describe('Reviews Upload - CloudinaryService Integration', () => {
  let reviewsService: ReviewsService;
  let cloudinaryService: CloudinaryService;

  const mockFile = {
    buffer: Buffer.from('fake-image-data'),
    mimetype: 'image/jpeg',
    originalname: 'test.jpg',
    size: 1024,
  };

  const mockReview = {
    id: 'review-123',
    userId: 'user-123',
    targetId: 'restaurant-1',
    targetType: 'restaurant',
    rating: 5,
  };

  const mockCloudinaryResponse = {
    url: 'https://res.cloudinary.com/test/image/upload/test.jpg',
    public_id: 'reviews/user-123/test',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: CloudinaryService,
          useValue: {
            uploadImage: jest.fn().mockResolvedValue(mockCloudinaryResponse),
            deleteImage: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: getRepositoryToken(Review),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn().mockResolvedValue(mockReview),
            findOneBy: jest.fn().mockResolvedValue(mockReview),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ReviewPhoto),
          useValue: {
            create: jest.fn().mockReturnValue({
              id: 'photo-123',
              reviewId: 'review-123',
              imageUrl: mockCloudinaryResponse.url,
              cloudinaryPublicId: mockCloudinaryResponse.public_id,
            }),
            save: jest.fn().mockResolvedValue({
              id: 'photo-123',
              reviewId: 'review-123',
              imageUrl: mockCloudinaryResponse.url,
              cloudinaryPublicId: mockCloudinaryResponse.public_id,
            }),
          },
        },
        {
          provide: getRepositoryToken(ReviewVote),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            count: jest.fn(),
          },
        },
      ],
    }).compile();

    reviewsService = module.get<ReviewsService>(ReviewsService);
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
  });

  describe('uploadReviewPhoto', () => {
    it('should successfully upload a review photo', async () => {
      const result = await reviewsService.uploadReviewPhoto(
        'review-123',
        mockFile,
        'user-123',
      );

      expect(result).toEqual({
        imageUrl: mockCloudinaryResponse.url,
        cloudinaryPublicId: mockCloudinaryResponse.public_id,
      });
    });

    it('should call CloudinaryService.uploadImage with correct parameters', async () => {
      await reviewsService.uploadReviewPhoto(
        'review-123',
        mockFile,
        'user-123',
      );

      expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(
        mockFile,
        'reviews/user-123',
      );
    });

    it('should return imageUrl and cloudinaryPublicId', async () => {
      const result = await reviewsService.uploadReviewPhoto(
        'review-123',
        mockFile,
        'user-123',
      );

      expect(result).toHaveProperty('imageUrl');
      expect(result).toHaveProperty('cloudinaryPublicId');
      expect(result.imageUrl).toBe(mockCloudinaryResponse.url);
      expect(result.cloudinaryPublicId).toBe(mockCloudinaryResponse.public_id);
    });

    it('should throw error if user does not own the review', async () => {
      jest
        .spyOn(reviewsService, 'findOne')
        .mockResolvedValueOnce({ ...mockReview, userId: 'different-user' });

      await expect(
        reviewsService.uploadReviewPhoto('review-123', mockFile, 'user-123'),
      ).rejects.toThrow();
    });
  });

  describe('CloudinaryService.uploadImage', () => {
    it('should be called when uploading review photo', async () => {
      const uploadSpy = jest.spyOn(cloudinaryService, 'uploadImage');

      await reviewsService.uploadReviewPhoto(
        'review-123',
        mockFile,
        'user-123',
      );

      expect(uploadSpy).toHaveBeenCalledTimes(1);
      expect(uploadSpy).toHaveBeenCalledWith(mockFile, 'reviews/user-123');
    });

    it('should return url and public_id', async () => {
      const result = await cloudinaryService.uploadImage(
        mockFile,
        'reviews/user-123',
      );

      expect(result).toEqual(mockCloudinaryResponse);
      expect(result.url).toBeDefined();
      expect(result.public_id).toBeDefined();
    });
  });
});
