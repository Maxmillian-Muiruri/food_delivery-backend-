import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

@Entity('menu_items')
export class MenuItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  restaurant_id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ length: 100, nullable: true })
  category: string; // 'Appetizers', 'Main Course', 'Desserts'

  @Column({ type: 'text', nullable: true })
  image_url: string;

  @Column({ type: 'text', nullable: true })
  image_public_id: string; // Cloudinary public_id for image

  @Column({ type: 'bit', default: true })
  is_available: boolean;

  @Column({ type: 'simple-json', nullable: true })
  allergens: string[];

  @Column({ type: 'simple-json', nullable: true })
  dietary_tags: string[]; // ['vegetarian', 'vegan', 'gluten-free']

  @Column({ type: 'text', nullable: true })
  ingredients: string;

  @Column({ default: 0 })
  preparation_time: number; // in minutes

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Restaurant)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;
}
