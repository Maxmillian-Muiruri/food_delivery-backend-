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
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReviewsService } from './reviews.service';
import {
  CreateReviewDto,
  UpdateReviewDto,
  VoteReviewDto,
  ReportReviewDto,
} from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  create(
    @Body() createReviewDto: CreateReviewDto,
    @GetUser('id') userId: string,
  ) {
    return this.reviewsService.create(createReviewDto, parseInt(userId));
  }

  @Get()
  findAll(@Query() query: any) {
    return this.reviewsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @GetUser('id') userId: string,
  ) {
    return this.reviewsService.update(id, updateReviewDto, parseInt(userId));
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.reviewsService.remove(id, parseInt(userId));
  }

  @Post(':id/vote')
  vote(
    @Param('id') reviewId: string,
    @Body() voteReviewDto: VoteReviewDto,
    @GetUser('id') userId: string,
  ) {
    return this.reviewsService.vote(reviewId, voteReviewDto, parseInt(userId));
  }

  @Post(':id/approve')
  approveReview(@Param('id') id: string) {
    return this.reviewsService.approveReview(id);
  }

  @Post(':id/reject')
  rejectReview(@Param('id') id: string) {
    return this.reviewsService.rejectReview(id);
  }

  @Post(':id/report')
  reportReview(
    @Param('id') id: string,
    @Body() reportReviewDto: ReportReviewDto,
    @GetUser('id') userId: string,
  ) {
    return this.reviewsService.reportReview(
      id,
      reportReviewDto,
      parseInt(userId),
    );
  }

  @Post(':reviewId/upload-photo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadReviewPhoto(
    @Param('reviewId') reviewId: string,
    @UploadedFile() file: any,
    @GetUser('id') userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    if (!file?.mimetype?.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }

    return await this.reviewsService.uploadReviewPhoto(
      reviewId,
      file,
      parseInt(userId),
    );
  }
}
