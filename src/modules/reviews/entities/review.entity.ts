import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { Order } from '../../orders/entities/order.entity';
import { ReviewVote } from './review-vote.entity';
import { ReviewPhoto } from './review-photo.entity';

export enum ReviewType {
  RESTAURANT = 'restaurant',
  DRIVER = 'driver',
}

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REPORTED = 'reported',
  REMOVED = 'removed',
}

@Entity('reviews')
@Index(['targetId', 'targetType'])
@Index(['userId', 'targetId', 'targetType'], { unique: true })
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'varchar' })
  targetId: string; // restaurant_id or driver_id

  @Column({ type: 'varchar', length: 20 })
  targetType: ReviewType;

  @Column({ type: 'varchar', nullable: true })
  orderId: string; // For restaurant reviews, link to the order

  @Column({ type: 'int', nullable: false })
  rating: number; // 1-5 stars

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'varchar', length: 20, default: ReviewStatus.PENDING })
  status: ReviewStatus;

  @Column({ type: 'bit', default: false })
  isVerified: boolean; // Verified purchase/order completion

  @Column({ type: 'int', default: 0 })
  helpfulVotes: number;

  @Column({ type: 'int', default: 0 })
  totalVotes: number;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>; // JSON object of additional review data

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Restaurant, { nullable: true })
  @JoinColumn({ name: 'targetId' })
  restaurant: Restaurant;

  @ManyToOne(() => Order, { nullable: true })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @OneToMany(() => ReviewVote, (vote) => vote.review, { cascade: true })
  votes: ReviewVote[];

  @OneToMany(() => ReviewPhoto, (photo) => photo.review, { cascade: true })
  photos: ReviewPhoto[];
}
