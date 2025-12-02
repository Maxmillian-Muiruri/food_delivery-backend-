import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { Address } from '../../addresses/entities/address.entity';
import { OrderItem } from './order-item.entity';
import { OrderTracking } from './order-tracking.entity';
import { Payment } from '../../payments/entities/payment.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  order_number: string;

  @Column()
  user_id: number;

  @Column()
  restaurant_id: number;

  @Column({ nullable: true })
  driver_id: number;

  @Column()
  address_id: number;

  @Column({ type: 'varchar', length: 50 })
  status: string; // 'pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled'

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  delivery_fee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tip_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_amount: number;

  @Column({ nullable: true })
  promo_code_id: number;

  @Column({ type: 'varchar', length: 50 })
  payment_method: string; // 'card', 'cash', 'wallet'

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  payment_status: string;

  @Column({ type: 'varchar', length: 50, default: 'now' })
  delivery_type: string; // 'now', 'scheduled'

  @Column({ type: 'datetime', nullable: true })
  scheduled_delivery_time: Date;

  @Column({ type: 'text', nullable: true })
  delivery_instructions: string;

  @Column({ default: 30 })
  estimated_delivery_time: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'datetime', nullable: true })
  delivered_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.orders)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @ManyToOne(() => Address)
  @JoinColumn({ name: 'address_id' })
  address: Address;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  order_items: OrderItem[];

  @OneToMany(() => OrderTracking, (tracking) => tracking.order)
  tracking_history: OrderTracking[];

  // Add payments relation
  @OneToMany(() => Payment, (payment) => payment.order)
  payments: Payment[];
}
