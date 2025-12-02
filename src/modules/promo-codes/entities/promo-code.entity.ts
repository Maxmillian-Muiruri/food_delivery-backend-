import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserPromoUsage } from './user-promo-usage.entity';

@Entity('promo_codes')
export class PromoCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  discount_type: string; // 'percentage', 'fixed_amount', 'free_delivery'

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  discount_value: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minimum_order_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maximum_discount_amount: number;

  @Column({ type: 'datetime' })
  valid_from: Date;

  @Column({ type: 'datetime' })
  valid_until: Date;

  @Column({ default: 1 })
  usage_limit: number;

  @Column({ default: 0 })
  usage_count: number;

  @Column({ type: 'bit', default: false })
  is_first_order_only: boolean;

  @Column({ type: 'bit', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => UserPromoUsage, (usage) => usage.promoCode)
  usages: UserPromoUsage[];
}
