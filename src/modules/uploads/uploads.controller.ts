/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CloudinaryService } from '../../common/services/cloudinary.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ImageResponseDto } from './dto/upload-image.dto';

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('restaurants')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload restaurant image to Cloudinary' })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    type: ImageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - no file or invalid file',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadRestaurantImage(@UploadedFile() file: any, @Request() req: any) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userId = req.user.id;
    const result = await this.cloudinaryService.uploadImage(
      file,
      `restaurants/${userId}`,
    );

    return result;
  }

  @Post('menu-items')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload menu item image to Cloudinary' })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    type: ImageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - no file or invalid file',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadMenuItemImage(@UploadedFile() file: any, @Request() req: any) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userId = req.user.id;
    const result = await this.cloudinaryService.uploadImage(
      file,
      `menu-items/${userId}`,
    );

    return result;
  }

  @Post('users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload user profile picture to Cloudinary' })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    type: ImageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - no file or invalid file',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadUserProfilePicture(
    @UploadedFile() file: any,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userId = req.user.id;
    const result = await this.cloudinaryService.uploadImage(
      file,
      `users/${userId}`,
    );

    return result;
  }
}
