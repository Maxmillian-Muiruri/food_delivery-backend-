/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

interface FileUpload {
  buffer: Buffer;
}

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(
    file: FileUpload,
    folder: string,
  ): Promise<{ url: string; public_id: string }> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `food-delivery/${folder}`,
          resource_type: 'auto',
          quality: 'auto',
        },
        (error: any, result: any) => {
          if (error) {
            const errorMsg = error?.message || 'Unknown error';
            reject(new Error(`Cloudinary upload failed: ${errorMsg}`));
          } else if (result) {
            resolve({
              url: result.secure_url as string,
              public_id: result.public_id as string,
            });
          } else {
            reject(new Error('Cloudinary upload failed: no result'));
          }
        },
      );

      stream.end(file.buffer);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      void cloudinary.uploader.destroy(publicId, (error: any) => {
        if (error) {
          const errorMsg = error?.message || 'Unknown error';
          reject(new Error(`Cloudinary delete failed: ${errorMsg}`));
        } else {
          resolve();
        }
      });
    });
  }
}
