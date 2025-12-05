import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { User } from '../users/entities/user.entity';

@ApiTags('addresses')
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new address' })
  @ApiResponse({ status: 201, description: 'Address created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(
    @Body() createAddressDto: CreateAddressDto,
    @Request() req: { user: User },
  ) {
    return this.addressesService.create(createAddressDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user addresses' })
  @ApiResponse({ status: 200, description: 'Addresses retrieved successfully' })
  findAll() {
    return this.addressesService.findAll();
  }

  @Get('default')
  @ApiOperation({ summary: 'Get user default address' })
  @ApiResponse({
    status: 200,
    description: 'Default address retrieved successfully',
  })
  findDefault(@Request() req: { user: User }) {
    return this.addressesService.findDefault(req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get address by ID' })
  @ApiResponse({ status: 200, description: 'Address retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: User },
  ) {
    return this.addressesService.findOne(id, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update address' })
  @ApiResponse({ status: 200, description: 'Address updated successfully' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAddressDto: UpdateAddressDto,
    @Request() req: { user: User },
  ) {
    return this.addressesService.update(id, updateAddressDto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete address' })
  @ApiResponse({ status: 200, description: 'Address deleted successfully' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: User },
  ) {
    return this.addressesService.remove(id, req.user);
  }

  @Post(':id/set-default')
  @ApiOperation({ summary: 'Set address as default' })
  @ApiResponse({
    status: 200,
    description: 'Address set as default successfully',
  })
  @ApiResponse({ status: 404, description: 'Address not found' })
  setDefault(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: User },
  ) {
    return this.addressesService.setDefault(id, req.user);
  }
}
