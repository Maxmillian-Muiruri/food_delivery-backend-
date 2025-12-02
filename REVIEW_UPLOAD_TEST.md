# Review Photo Upload - cURL Testing Guide

This guide shows how to test the review photo upload endpoint using curl.

## Prerequisites

1. Start the application: `npm run start:dev`
2. Have a valid JWT token (from login or registration)
3. Have an existing review ID in the database
4. Have a test image file ready

## Test Steps

### 1. Get a JWT Token (if you don't have one)

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

This will return a response with `access_token`. Copy this token for the next steps.

### 2. Get an Existing Review ID

```bash
curl -X GET http://localhost:3000/api/v1/reviews \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Note the `id` of a review you own.

### 3. Upload a Photo to a Review

**Create a test image first:**

```bash
# Create a simple test image (1x1 pixel JPEG)
echo -e '\xFF\xD8\xFF\xE0\x00\x10JFIF' > test.jpg
```

**Upload the image:**

```bash
curl -X POST http://localhost:3000/api/v1/reviews/REVIEW_ID/upload-photo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@test.jpg"
```

Replace:

- `YOUR_JWT_TOKEN` with your actual JWT token
- `REVIEW_ID` with an actual review ID you own

### 4. Expected Success Response (201 Created)

```json
{
  "imageUrl": "https://res.cloudinary.com/.../image/upload/v.../reviews_...jpg",
  "cloudinaryPublicId": "reviews/user-id/..."
}
```

### 5. Test Error Cases

**Missing file:**

```bash
curl -X POST http://localhost:3000/api/v1/reviews/REVIEW_ID/upload-photo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Expected: `400 Bad Request - No file provided`

**Invalid file type (non-image):**

```bash
echo "not an image" > test.txt
curl -X POST http://localhost:3000/api/v1/reviews/REVIEW_ID/upload-photo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@test.txt"
```

Expected: `400 Bad Request - File must be an image`

**No authentication:**

```bash
curl -X POST http://localhost:3000/api/v1/reviews/REVIEW_ID/upload-photo \
  -F "file=@test.jpg"
```

Expected: `401 Unauthorized`

**Review not owned by user:**

```bash
curl -X POST http://localhost:3000/api/v1/reviews/DIFFERENT_USER_REVIEW_ID/upload-photo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@test.jpg"
```

Expected: `400/403 Error - Unauthorized access`

## Database Verification

After uploading a photo, verify in the database:

```sql
-- Check if ReviewPhoto was created
SELECT * FROM review_photo WHERE review_id = 'REVIEW_ID';

-- Should show:
-- - imageUrl: The Cloudinary secure URL
-- - cloudinaryPublicId: The Cloudinary public ID for deletion
```

## Complete Test Workflow

```bash
#!/bin/bash

# Set your variables
JWT_TOKEN="your-jwt-token-here"
REVIEW_ID="review-123"
BASE_URL="http://localhost:3000/api/v1"

# Create test image
dd if=/dev/zero of=test.jpg bs=1 count=100 2>/dev/null
echo -e '\xFF\xD8\xFF\xE0' | dd of=test.jpg bs=1 count=4 conv=notrunc 2>/dev/null

# Upload photo
echo "Uploading photo to review $REVIEW_ID..."
curl -X POST $BASE_URL/reviews/$REVIEW_ID/upload-photo \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -F "file=@test.jpg" \
  -H "Accept: application/json"

echo "\nUpload complete!"

# Cleanup
rm -f test.jpg
```

## Troubleshooting

### 401 Unauthorized

- JWT token is invalid or expired
- Token format should be: `Authorization: Bearer <token>`

### 400 Bad Request

- File field name must be `file` (not `image` or `photo`)
- File MIME type must be `image/*`
- Review ID must be valid

### 500 Internal Server Error

- Check server logs: `npm run start:dev`
- Verify Cloudinary credentials in .env file:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`

## Environment Setup

Ensure these are in your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_URL=cloudinary://your-api-key:your-api-secret@your-cloud-name
```

## Architecture Overview

```
POST /api/v1/reviews/:reviewId/upload-photo
    ↓
ReviewsController.uploadReviewPhoto()
    ├─ Validate JWT (JwtAuthGuard)
    ├─ Validate file exists and is image
    ├─ Call ReviewsService.uploadReviewPhoto()
    │   ├─ Verify review exists
    │   ├─ Verify user owns review
    │   ├─ Call CloudinaryService.uploadImage()
    │   │   └─ Upload to Cloudinary (folder: reviews/:userId)
    │   ├─ Create ReviewPhoto entity
    │   ├─ Save to database
    │   └─ Return { imageUrl, cloudinaryPublicId }
    └─ Return response (201 Created)
```

## Related Endpoints

- `POST /api/v1/uploads/restaurants` - Upload restaurant images
- `POST /api/v1/uploads/menu-items` - Upload menu item images
- `POST /api/v1/uploads/users` - Upload user profile pictures
- `POST /api/v1/restaurants/:id/upload-logo` - Update restaurant logo
- `POST /api/v1/restaurants/:id/upload-banner` - Update restaurant banner
- `POST /api/v1/menu-items/:id/upload-image` - Update menu item image
