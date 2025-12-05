import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

export enum AddressType {
  HOME = 'home',
  WORK = 'work',
  OTHER = 'other',
}

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'userId', nullable: true })
  userId: number | null;

  @Column({ type: 'varchar', length: 255 })
  label: string;

  @Column({ type: 'varchar', length: 500 })
  street_address: string;

  @Column({ name: 'street', type: 'varchar', length: 255 })
  street: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  postal_code: string;

  @Column({ name: 'zip_code', type: 'varchar', length: 20 })
  zip_code: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({
    name: 'type_col',
    type: 'varchar',
    length: 20,
    default: AddressType.OTHER,
  })
  type: AddressType;

  @Column({ type: 'bit', default: false })
  is_default: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToOne(() => Restaurant, (restaurant) => restaurant.address_relation)
  restaurant: Restaurant;
}
