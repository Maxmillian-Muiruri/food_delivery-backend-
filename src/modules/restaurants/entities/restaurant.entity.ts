import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Address } from '../../addresses/entities/address.entity';
import { Order } from '../../orders/entities/order.entity';

export enum CuisineType {
  ITALIAN = 'italian',
  CHINESE = 'chinese',
  MEXICAN = 'mexican',
  AMERICAN = 'american',
  INDIAN = 'indian',
  JAPANESE = 'japanese',
  THAI = 'thai',
  FRENCH = 'french',
  MEDITERRANEAN = 'mediterranean',
  FAST_FOOD = 'fast_food',
  PIZZA = 'pizza',
  BURGER = 'burger',
  SEAFOOD = 'seafood',
  VEGETARIAN = 'vegetarian',
  OTHER = 'other',
}

@Entity('restaurants')
export class Restaurant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  owner_id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  logo_url: string;

  @Column({ type: 'text', nullable: true })
  logo_public_id: string; // Cloudinary public_id for logo

  @Column({ type: 'text', nullable: true })
  banner_url: string;

  @Column({ type: 'text', nullable: true })
  banner_public_id: string; // Cloudinary public_id for banner

  @Column({ type: 'simple-json', nullable: true })
  cuisine_type: string[]; // ['Italian', 'Chinese', 'Mexican']

  @Column({ length: 255 })
  address: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 100 })
  state: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @Column({ length: 50, nullable: true })
  phone_number: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ type: 'simple-json', nullable: true })
  opening_hours: any; // { "monday": "9:00-22:00", ... }

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating_average: number;

  @Column({ default: 0 })
  total_ratings: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  delivery_fee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  minimum_order_amount: number;

  @Column({ default: 30 })
  estimated_delivery_time: number; // in minutes

  @Column({ type: 'bit', default: true })
  is_active: boolean;

  @Column({ type: 'bit', default: false })
  is_featured: boolean;

  @Column({ type: 'bit', default: false })
  is_verified: boolean;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  restaurant_code: string;

  // Store fields (migrated from Store entity)
  @Column({ type: 'varchar', length: 50, nullable: true })
  store_code: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  account_number: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  business_rating: number;

  @Column({ default: 0 })
  business_total_reviews: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToOne(() => Address, (address) => address.restaurant)
  @JoinColumn({ name: 'address_id' })
  address_relation: Address;

  @Column({ nullable: true })
  address_id: number;

  @OneToMany(() => Order, (order) => order.restaurant)
  orders: Order[];
}
