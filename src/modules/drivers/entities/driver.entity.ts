import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('drivers')
export class Driver {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({
    name: 'license_plate',
    type: 'varchar',
    length: 50,
    nullable: true,
    unique: true,
  })
  licensePlate: string;

  @Column({ name: 'vehicle_type', type: 'varchar', length: 50, nullable: true })
  vehicleType: string;

  @Column({
    name: 'availability_status',
    type: 'varchar',
    length: 20,
    default: 'offline',
  })
  availabilityStatus: string;

  @Column({
    name: 'current_latitude',
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  currentLatitude: number;

  @Column({
    name: 'current_longitude',
    type: 'decimal',
    precision: 11,
    scale: 7,
    nullable: true,
  })
  currentLongitude: number;

  @Column({
    name: 'average_rating',
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
  })
  averageRating: number;

  @Column({ name: 'total_deliveries', type: 'int', default: 0 })
  totalDeliveries: number;

  @Column({
    name: 'total_earnings',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  totalEarnings: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
