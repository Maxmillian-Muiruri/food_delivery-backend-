import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async create(
    createAddressDto: CreateAddressDto,
    user: User,
  ): Promise<Address> {
    // If this is set as default, unset other default addresses for this user
    if (createAddressDto.is_default) {
      await this.addressRepository.update(
        { userId: user.id },
        { is_default: false },
      );
    }

    const address = this.addressRepository.create({
      ...createAddressDto,
      userId: user.id,
    });

    return this.addressRepository.save(address);
  }

  async findAll(user: User): Promise<Address[]> {
    return this.addressRepository.find({
      where: { userId: user.id },
      order: { is_default: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: number, user: User): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { id, userId: user.id },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }

  async update(
    id: number,
    updateAddressDto: UpdateAddressDto,
    user: User,
  ): Promise<Address> {
    const address = await this.findOne(id, user);

    // If this is set as default, unset other default addresses for this user
    if (updateAddressDto.is_default) {
      await this.addressRepository.update(
        { userId: user.id },
        { is_default: false },
      );
    }

    Object.assign(address, updateAddressDto);
    return this.addressRepository.save(address);
  }

  async remove(id: number, user: User): Promise<void> {
    const address = await this.findOne(id, user);
    await this.addressRepository.remove(address);
  }

  async setDefault(id: number, user: User): Promise<Address> {
    const address = await this.findOne(id, user);

    // Unset other default addresses for this user
    await this.addressRepository.update(
      { userId: user.id },
      { is_default: false },
    );

    // Set this address as default
    address.is_default = true;
    return this.addressRepository.save(address);
  }

  async findDefault(user: User): Promise<Address | null> {
    return this.addressRepository.findOne({
      where: { userId: user.id, is_default: true },
    });
  }
}
