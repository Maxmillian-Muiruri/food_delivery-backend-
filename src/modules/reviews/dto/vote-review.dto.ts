import { IsNotEmpty, IsEnum } from 'class-validator';
import { VoteType } from '../entities/review-vote.entity';

export class VoteReviewDto {
  @IsNotEmpty()
  @IsEnum(VoteType)
  voteType: VoteType;
}
