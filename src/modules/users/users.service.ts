import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  UserPreferencesUpdatedEvent,
  UserAllergensUpdatedEvent,
  EventTypes,
} from '../../events';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private eventEmitter: EventEmitter2,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: [
        'id',
        'email',
        'full_name',
        'phone_number',
        'profile_picture_url',
        'profile_picture_public_id',
        'role',
        'dietary_preferences',
        'allergens',
        'social_provider',
        'social_provider_id',
        'is_active',
        'created_at',
        'updated_at',
      ],
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'full_name',
        'phone_number',
        'profile_picture_url',
        'profile_picture_public_id',
        'role',
        'dietary_preferences',
        'allergens',
        'social_provider',
        'social_provider_id',
        'is_active',
        'created_at',
        'updated_at',
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check if email is being updated and if it's already taken
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }
    }

    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async deactivate(id: number): Promise<User> {
    await this.usersRepository.update(id, { is_active: false });
    return this.findOne(id);
  }

  async activate(id: number): Promise<User> {
    await this.usersRepository.update(id, { is_active: true });
    return this.findOne(id);
  }

  async updateProfilePicture(
    id: number,
    profilePictureUrl: string,
  ): Promise<User> {
    await this.usersRepository.update(id, {
      profile_picture_url: profilePictureUrl,
    });
    return this.findOne(id);
  }

  async updateDietaryPreferences(
    id: number,
    preferences: string[],
  ): Promise<User> {
    const user = await this.findOne(id);
    await this.usersRepository.update(id, { dietary_preferences: preferences });

    // Emit preferences updated event for personalization
    this.eventEmitter.emit(
      EventTypes.USER_PREFERENCES_UPDATED,
      new UserPreferencesUpdatedEvent(
        id,
        {
          dietary_restrictions: preferences,
          favorite_cuisines: [],
          price_range: '',
          spice_level: '',
        },
        user.allergens || [],
      ),
    );

    return this.findOne(id);
  }

  async updateAllergens(id: number, allergens: string[]): Promise<User> {
    await this.usersRepository.update(id, { allergens });

    // Emit allergens updated event for personalization
    this.eventEmitter.emit(
      EventTypes.USER_ALLERGENS_UPDATED,
      new UserAllergensUpdatedEvent(id, allergens),
    );

    return this.findOne(id);
  }
}
