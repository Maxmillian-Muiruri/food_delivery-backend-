import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { DriversService } from './drivers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { CloudinaryService } from '../../common/services/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('drivers')
export class DriversController {
  constructor(
    private driversService: DriversService,
    private cloudinaryService: CloudinaryService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('register')
  async register(@GetUser('id') userId: number, @Body() dto: CreateDriverDto) {
    return this.driversService.register(userId, dto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.driversService.findOne(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/availability')
  async updateAvailability(
    @GetUser('id') userId: number,
    @Body() dto: UpdateAvailabilityDto,
  ) {
    return this.driversService.updateAvailability(
      userId,
      dto.availabilityStatus,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/location')
  async updateLocation(
    @GetUser('id') userId: number,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.driversService.updateLocation(
      userId,
      dto.latitude,
      dto.longitude,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  async findAll() {
    return this.driversService.findAll();
  }

  // upload document (license/insurance) — file handled by UploadsModule
  @UseGuards(JwtAuthGuard)
  @Post(':id/documents')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Param('id') id: string,
    @UploadedFile() file: any,
    @Body() body: any,
  ) {
    // Upload via CloudinaryService and create DriverDocument
    const uploaded = await this.cloudinaryService.uploadImage(
      file,
      `drivers/${id}`,
    );
    return this.driversService.addDocument(
      Number(id),
      uploaded.url || '',
      uploaded.public_id || '',
      body.documentType || body.document_type,
    );
  }
}
