import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';

@Entity('order_tracking')
export class OrderTracking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  order_id: number;

  @Column({ type: 'varchar', length: 50 })
  status: string; // 'pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled'

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => Order, (order) => order.tracking_history)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
