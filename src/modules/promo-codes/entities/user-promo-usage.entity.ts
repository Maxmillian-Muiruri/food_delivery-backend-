import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { PromoCode } from './promo-code.entity';
import { User } from '../../users/entities/user.entity';

@Entity('user_promo_usage')
export class UserPromoUsage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  promo_code_id: number;

  @Column()
  order_id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  discount_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  order_total: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => PromoCode, (promoCode) => promoCode.usages)
  @JoinColumn({ name: 'promo_code_id' })
  promoCode: PromoCode;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
