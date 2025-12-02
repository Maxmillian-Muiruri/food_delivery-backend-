# Cloudinary Image Upload Integration - Implementation Summary

## Overview

Successfully integrated Cloudinary for image uploads across the Food Delivery API. Images are now uploaded directly to Cloudinary and URLs are stored in the database.

## What Was Implemented

### 1. **Cloudinary Service** (`src/common/services/cloudinary.service.ts`)

- Centralized service for handling all Cloudinary operations
- Methods:
  - `uploadImage(file, folder)` - Uploads files to Cloudinary and returns secure URL + public_id
  - `deleteImage(publicId)` - Deletes images from Cloudinary by public_id
- Configuration loaded from environment variables:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`

### 2. **Database Schema Updates**

#### Restaurant Entity (`src/modules/restaurants/entities/restaurant.entity.ts`)

- Added `logo_public_id: string` - Stores Cloudinary public_id for logo
- Added `banner_public_id: string` - Stores Cloudinary public_id for banner
- Both are nullable and linked to the image URLs for easy deletion

#### Menu Item Entity (`src/modules/menu-items/entities/menu-item.entity.ts`)

- Added `image_public_id: string` - Stores Cloudinary public_id for menu item image
- Allows deletion of old images when updating

#### User Entity (`src/modules/users/entities/user.entity.ts`)

- Added `profile_picture_public_id: string` - Stores Cloudinary public_id for profile picture

### 3. **Uploads Module** (`src/modules/uploads/`)

Complete file upload module with three endpoints:

#### DTOs (`src/modules/uploads/dto/upload-image.dto.ts`)

- `UploadImageDto` - For file input in Swagger
- `ImageResponseDto` - Returns uploaded image URL and public_id

#### Controller (`src/modules/uploads/uploads.controller.ts`)

- `POST /api/v1/uploads/restaurants` - Upload restaurant logos
- `POST /api/v1/uploads/menu-items` - Upload menu item images
- `POST /api/v1/uploads/users` - Upload user profile pictures
- All endpoints:
  - Require JWT authentication
  - Validate file is an image
  - Return `{ url, public_id }`
  - Organized images by type and user ID in Cloudinary folders

#### Module (`src/modules/uploads/uploads.module.ts`)

- Provides `CloudinaryService` for use across the app
- Exports service for dependency injection

### 4. **Restaurant Image Upload Endpoints**

#### Service Methods (`src/modules/restaurants/restaurants.service.ts`)

- `updateRestaurantLogo(id, file, owner)` - Uploads and stores logo
- `updateRestaurantBanner(id, file, owner)` - Uploads and stores banner
- Both methods:
  - Verify ownership (user owns the restaurant)
  - Delete old images from Cloudinary before uploading new ones
  - Store secure URL + public_id in database

#### Controller Endpoints (`src/modules/restaurants/restaurants.controller.ts`)

- `POST /api/v1/restaurants/:id/upload-logo` - Upload restaurant logo
- `POST /api/v1/restaurants/:id/upload-banner` - Upload restaurant banner
- Both require:
  - JWT authentication
  - multipart/form-data with "file" field
  - File to be an image

### 5. **Menu Item Image Upload**

#### Service Method (`src/modules/menu-items/menu-items.service.ts`)

- `updateMenuItemImage(id, file, owner)` - Uploads menu item image
- Verifies:
  - Menu item exists
  - User owns the restaurant that owns the menu item
  - Deletes old image before uploading new one

#### Controller Endpoint (`src/modules/menu-items/menu-items.controller.ts`)

- `POST /api/v1/menu-items/:id/upload-image` - Upload menu item image
- Requires JWT authentication and multipart/form-data

### 6. **Module Configuration**

- Updated `app.module.ts` to import `UploadsModule`
- Updated `RestaurantsModule` to provide `CloudinaryService`
- Updated `MenuItemsModule` to provide `CloudinaryService`

## API Usage Examples

### Upload Restaurant Logo

```bash
curl -X POST http://localhost:3000/api/v1/restaurants/1/upload-logo \
  -H "Authorization: Bearer <token>" \
  -F "file=@logo.jpg"
```

Response:

```json
{
  "url": "https://res.cloudinary.com/.../image.jpg",
  "public_id": "food-delivery/restaurants/1/abc123"
}
```

### Upload Menu Item Image

```bash
curl -X POST http://localhost:3000/api/v1/menu-items/5/upload-image \
  -H "Authorization: Bearer <token>" \
  -F "file=@menu-item.jpg"
```

### Upload via Uploads Module

```bash
curl -X POST http://localhost:3000/api/v1/uploads/restaurants \
  -H "Authorization: Bearer <token>" \
  -F "file=@logo.jpg"
```

## Cloudinary Folder Structure

Images are organized by type and user ID:

```
food-delivery/
├── restaurants/{userId}/
│   ├── logo-1.jpg
│   └── banner-1.jpg
├── menu-items/{userId}/
│   └── item-1.jpg
└── users/{userId}/
    └── profile.jpg
```

## Database Integration

- Public IDs stored in `{entity}_public_id` columns
- URLs stored in existing `{entity}_url` columns
- On image deletion:
  1. Delete from Cloudinary using public_id
  2. Clear both URL and public_id from database
- Ownership verification before any upload/delete operation

## Security Features

✅ JWT authentication required for all upload endpoints
✅ Ownership verification (users can only upload to their own resources)
✅ File type validation (image only)
✅ Automatic cleanup of old images in Cloudinary
✅ Public IDs stored for easy deletion

## Environment Variables Required

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Next Steps (Optional)

1. Add image cropping/resizing on frontend before upload
2. Implement maximum file size limits
3. Add image compression via Cloudinary transformations
4. Implement image deletion on cascade (delete restaurant → delete all images)
5. Add bulk upload endpoints for multiple images
