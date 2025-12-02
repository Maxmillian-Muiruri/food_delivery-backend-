import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Address } from '../../addresses/entities/address.entity';
import { Order } from '../../orders/entities/order.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 255, nullable: true })
  password_hash: string;

  @Column({ length: 255 })
  full_name: string;

  @Column({ length: 50, nullable: true })
  phone_number: string;

  @Column({ type: 'text', nullable: true })
  profile_picture_url: string;

  @Column({ type: 'text', nullable: true })
  profile_picture_public_id: string; // Cloudinary public_id

  @Column({ type: 'varchar', length: 50, nullable: true })
  role: string; // 'customer', 'admin', 'restaurant_owner'

  @Column({ type: 'simple-json', nullable: true })
  dietary_preferences: string[]; // ['vegetarian', 'vegan', 'gluten-free']

  @Column({ type: 'simple-json', nullable: true })
  allergens: string[]; // ['peanuts', 'dairy', 'shellfish']

  @Column({ type: 'varchar', length: 50, nullable: true })
  social_provider: string; // 'google', 'facebook'

  @Column({ nullable: true })
  social_provider_id: string;

  @Column({ type: 'bit', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToMany(() => Address, (address) => address.user)
  addresses: Address[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Restaurant, (restaurant) => restaurant.owner)
  restaurants: Restaurant[];

  // @OneToMany(() => Favorite, (favorite) => favorite.user)
  // favorites: Favorite[];

  // @OneToMany(() => Review, (review) => review.user)
  // reviews: Review[];
}
