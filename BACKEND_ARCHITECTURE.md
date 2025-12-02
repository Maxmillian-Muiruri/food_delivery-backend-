# Food Delivery API - Backend Architecture Overview

## Project Summary

A **NestJS + TypeORM** food delivery platform backend with JWT authentication, Cloudinary image uploads, promo code management, order tracking, reviews, and restaurant management.

---

## Technology Stack

### Core Framework

- **NestJS v11** - TypeScript/Node.js framework for building scalable server-side apps
- **TypeScript** - Type-safe language
- **TypeORM v0.3** - ORM for database interactions with entity-based schema

### Database

- **SQLite** (development) - Lightweight, file-based DB
- **MS SQL Server** (production) - Enterprise database
- Connection configured in `src/config/database.config.ts`

### Authentication & Security

- **JWT (JSON Web Tokens)** - Stateless auth, 1-day expiry for access tokens, 7-day for refresh tokens
- **Passport.js** - Auth library with strategies:
  - `JwtStrategy` - Validates bearer tokens
  - `LocalStrategy` - Email/password login
  - `GoogleStrategy` - OAuth2 Google login
  - `FacebookStrategy` - OAuth2 Facebook login
- **bcrypt** - Password hashing
- **Guards**: `JwtAuthGuard`, `RolesGuard` (new - checks user role metadata)
- **Decorators**: `@Public()`, `@Roles('admin')`, `@GetUser('id')`

### File Uploads

- **Cloudinary v2 SDK** - Cloud-based image storage and CDN
  - Centralized `CloudinaryService` in `src/common/services/cloudinary.service.ts`
  - Supports upload to folder structure: `restaurants/{id}`, `menu-items/{id}`, `users/{id}`, `reviews/{userId}`
  - Returns `{ url: string, public_id: string }` for every upload
  - Integrates with Restaurants, MenuItems, Users, Reviews, and Uploads modules

### API Documentation

- **Swagger/OpenAPI** - Auto-generated API docs at `/api/docs`
- Setup in `src/main.ts`

### Security Middleware

- **helmet** - HTTP security headers
- **compression** - GZIP response compression
- **CORS** - Cross-Origin Resource Sharing (configurable origin)
- **ValidationPipe** - Input validation with whitelist/forbid-unknown, auto-transform

### Testing

- **Jest** - Test runner
- **Supertest** - HTTP assertion library for e2e tests
- Tests run with `npm test`

---

## Project Structure

```
src/
├── config/               # Global configuration
│   ├── database.config.ts      # TypeORM config (SQLite dev, MS SQL prod)
│   ├── jwt.config.ts           # JWT secrets and expiry
│   └── cloudinary.config.ts    # Cloudinary provider
├── common/
│   ├── decorators/
│   │   ├── public.decorator.ts         # Mark routes as public (bypass JWT)
│   │   ├── get-user.decorator.ts       # Extract user from request
│   │   └── roles.decorator.ts          # NEW - Define required roles via metadata
│   ├── guards/
│   │   ├── jwt-auth.guard.ts           # Validates JWT tokens
│   │   └── roles.guard.ts              # NEW - Checks user.role against @Roles() metadata
│   └── services/
│       └── cloudinary.service.ts       # Upload/delete images to Cloudinary
├── database/
│   ├── database.service.ts     # Health checks & connection validation
│   └── migrations/             # TypeORM migrations (future)
├── modules/                    # Feature modules (each has controller, service, entity, DTO)
│   ├── auth/
│   │   ├── auth.controller.ts  # Login, register, refresh token, social login
│   │   ├── auth.service.ts     # Auth logic, token generation
│   │   ├── strategies/         # Passport strategies (JWT, Local, Google, Facebook)
│   │   └── dto/                # LoginDto, RegisterDto, SocialLoginDto, etc.
│   ├── users/
│   │   ├── users.controller.ts # GET/PATCH profile, update user
│   │   ├── users.service.ts    # User CRUD
│   │   ├── entities/user.entity.ts  # User table (id, email, role, dietary_preferences, allergens, profile_picture_url, etc.)
│   │   └── dto/
│   ├── addresses/
│   │   ├── addresses.controller.ts
│   │   ├── addresses.service.ts
│   │   ├── entities/address.entity.ts  # User delivery addresses (user_id, street, city, state, zip, lat, long, label)
│   │   └── dto/ (create, update)
│   ├── restaurants/
│   │   ├── restaurants.controller.ts
│   │   ├── restaurants.service.ts    # Includes upload logo/banner via Cloudinary
│   │   ├── entities/restaurant.entity.ts  # id, owner_id, name, logo_url, banner_url, cuisine_type, delivery_fee, rating, etc.
│   │   └── dto/ (create, update)
│   ├── menu-items/
│   │   ├── menu-items.controller.ts
│   │   ├── menu-items.service.ts     # Includes upload image via Cloudinary
│   │   ├── entities/menu-item.entity.ts  # id, restaurant_id, name, price, category, image_url, allergens, dietary_tags, is_available
│   │   └── dto/ (create, update)
│   ├── carts/
│   │   ├── carts.controller.ts
│   │   ├── carts.service.ts
│   │   ├── entities/cart.entity.ts   # id, user_id, restaurant_id, menu_item_id, quantity, price_at_purchase
│   │   └── dto/
│   ├── orders/
│   │   ├── orders.controller.ts
│   │   ├── orders.service.ts         # Create, list, cancel, track orders; integrates promo codes
│   │   ├── entities/
│   │   │   ├── order.entity.ts       # id, user_id, restaurant_id, order_number, status, subtotal, delivery_fee, tax, discount_amount, total_amount, promo_code_id
│   │   │   ├── order-item.entity.ts  # id, order_id, menu_item_id, quantity, price_at_purchase
│   │   │   └── order-tracking.entity.ts # id, order_id, status, message, timestamp
│   │   └── dto/ (create, update order status)
│   ├── order-tracking/
│   │   ├── order-tracking.controller.ts
│   │   ├── order-tracking.service.ts
│   │   └── entities/order-tracking.entity.ts
│   ├── reviews/
│   │   ├── reviews.controller.ts
│   │   ├── reviews.service.ts        # Create, list, vote, upload photos via Cloudinary
│   │   ├── entities/
│   │   │   ├── review.entity.ts      # id, userId, targetId (restaurant/driver), targetType, orderId, rating, comment, status, helpful_votes
│   │   │   ├── review-photo.entity.ts # id, review_id, image_url, cloudinaryPublicId
│   │   │   └── review-vote.entity.ts  # id, review_id, user_id, vote_type (helpful/unhelpful)
│   │   └── dto/ (create, update)
│   ├── favorites/
│   │   ├── favorites.controller.ts
│   │   ├── favorites.service.ts
│   │   ├── entities/favorite.entity.ts # id, user_id, restaurant_id / menu_item_id, created_at
│   │   └── dto/
│   ├── promo-codes/                  # NEW FEATURE
│   │   ├── promo-codes.controller.ts # POST create (admin), GET list, POST validate, POST apply, PATCH/DELETE (admin)
│   │   ├── promo-codes.service.ts    # create, findAll, findByCode, validate, applyPromoCode, recordPromoUsage
│   │   ├── entities/
│   │   │   ├── promo-code.entity.ts  # id, code, description, discount_type (percentage/fixed_amount/free_delivery), discount_value, valid_from, valid_until, usage_limit, usage_count, is_first_order_only, is_active
│   │   │   └── user-promo-usage.entity.ts # id, user_id, promo_code_id, order_id, discount_amount, created_at (tracks promo usage per user)
│   │   └── dto/ (create, update, apply, validate)
│   ├── uploads/
│   │   ├── uploads.controller.ts     # POST endpoints for direct file uploads (restaurants, menu-items, users)
│   │   └── uploads.module.ts         # Provides CloudinaryService
│   └── health/
│       └── health.controller.ts      # GET /health, GET /health/db for monitoring
├── app.module.ts                     # Main module with all imports & config
├── app.controller.ts
├── main.ts                           # Bootstrap, Swagger setup, middleware setup
└── data-source.ts                    # TypeORM DataSource config

test/
├── app.e2e-spec.ts
└── jest-e2e.json
```

---

## Entity Relationships Diagram

```
User (1) ──────── (M) Address
  │                   (user_id, street, city, state, zip, lat, long, label)
  ├─────────── (M) Order
  │              (user_id, restaurant_id, address_id, status, subtotal, delivery_fee, tax, discount, total_amount, promo_code_id)
  ├─────────── (M) Review
  │              (userId, targetId, targetType, orderId, rating, comment, status)
  ├─────────── (M) Favorite
  │              (user_id, restaurant_id/menu_item_id)
  ├─────────── (M) Cart
  │              (user_id, restaurant_id, menu_item_id, quantity, price_at_purchase)
  └─────────── (M) UserPromoUsage
                 (user_id, promo_code_id, order_id, discount_amount)

Restaurant (1) ──────── (M) MenuItem
  │                       (restaurant_id, name, price, category, image_url, is_available, allergens, dietary_tags)
  ├─────────── (M) Order
  │              (restaurant_id, user_id, address_id, status, subtotal, total_amount)
  └─────────── (M) Review
                 (targetId=restaurant_id, targetType='restaurant')

Order (1) ──────── (M) OrderItem
            (order_id, menu_item_id, quantity, price_at_purchase)

Order (1) ──────── (M) OrderTracking
            (order_id, status, message, created_at)

Review (1) ──────── (M) ReviewPhoto
             (review_id, image_url, cloudinaryPublicId)

Review (1) ──────── (M) ReviewVote
             (review_id, user_id, vote_type)

PromoCode (1) ──────── (M) UserPromoUsage
               (promo_code_id, user_id, order_id, discount_amount)
```

---

## Authentication Flow

### 1. Registration (Public)

- **Endpoint**: `POST /auth/register`
- **Input**: `RegisterDto` (email, password, full_name, phone_number)
- **Process**:
  1. Check if email exists
  2. Hash password with bcrypt
  3. Create User with default role `customer`
  4. Generate JWT tokens (access + refresh)
- **Output**: User object + access_token + refresh_token

### 2. Login (Public)

- **Endpoint**: `POST /auth/login`
- **Input**: `LoginDto` (email, password)
- **Process**:
  1. Find user by email
  2. Compare password with hash
  3. Check if account is active
  4. Generate tokens
- **Output**: User object + access_token + refresh_token

### 3. Social Login (Public)

- **Endpoint**: `POST /auth/social-login`
- **Strategies**: Google, Facebook (via Passport)
- **Process**:
  1. Verify social provider token
  2. Find or create user by social ID
  3. Generate JWT tokens
- **Output**: User object + tokens

### 4. Token Refresh (Public)

- **Endpoint**: `POST /auth/refresh-token`
- **Input**: `RefreshTokenDto` (refresh_token)
- **Process**: Verify refresh token, return new access_token

### 5. Protected Routes (JWT Guard)

- All routes require `Authorization: Bearer <access_token>` header
- `JwtAuthGuard` extracts and validates token
- `JwtStrategy` populates `request.user` with token payload: `{ id, email, role }`

### 6. Role-Based Access (Roles Guard)

- **Routes with `@Roles('admin')`** require JWT + admin role
- `RolesGuard` checks `request.user.role` against metadata
- Non-admins get **403 Forbidden**
- Examples: Create/Update/Delete promo codes, manage restaurants (if enforced)

---

## Key Service Methods & Flow

### Auth Service

```typescript
register(RegisterDto): User + tokens
login(LoginDto): User + tokens
socialLogin(SocialLoginDto): User + tokens
refreshToken(RefreshTokenDto): tokens
getProfile(userId): User
validateUser(email, password): User | null
generateTokens(user): { access_token, refresh_token }
```

### Orders Service

```typescript
create(CreateOrderDto, user): Order
  → Validates restaurant, address, menu items
  → Calculates subtotal + tax + delivery_fee
  → Supports promo codes (discount applied in DTO or manually)
  → Creates Order + OrderItems + OrderTracking in transaction
  → Returns order with relations

findAll(user): Order[]
findOne(id, user): Order
cancelOrder(id, user): Order
updateOrderStatus(id, status): Order
getOrderTracking(id, user): OrderTracking[]
reorderFromPreviousOrder(orderId, user): { itemsAdded, message }
```

### Promo Codes Service

```typescript
create(CreatePromoCodeDto): PromoCode
  → Validates code is unique
  → Accepts discount_type: 'percentage' | 'fixed_amount' | 'free_delivery'

findAll(page, limit, isActive): { data, total, page }
findByCode(code): PromoCode
validatePromoCode(code): PromoCode
  → Checks: is_active, valid_from/until dates, usage_limit, usage_count
  → Throws BadRequestException if invalid

applyPromoCode(ApplyPromoCodeDto, userId): ApplyPromoCodeResponseDto
  → Validates code
  → Checks minimum_order_amount
  → Calculates discount:
      - If percentage: (order_amount * discount_value) / 100, capped at max_discount
      - If fixed_amount: use discount_value as-is
      - If free_delivery: 0 discount (handled separately)
  → Returns: { is_valid, code, discount_amount, final_amount }

recordPromoUsage(userId, promoCodeId, orderId, discountAmount): UserPromoUsage
  → Creates entry in user_promo_usage table

update(id, UpdatePromoCodeDto): PromoCode
remove(id): void
```

### Reviews Service

```typescript
create(CreateReviewDto, userId): Review
findAll(filters): Review[]
findOne(id): Review
update(id, UpdateReviewDto, userId): Review
remove(id, userId): void
vote(reviewId, voteType, userId): ReviewVote
uploadReviewPhoto(reviewId, file, userId): { imageUrl, cloudinaryPublicId }
  → Validates review exists and belongs to user
  → Uploads via CloudinaryService to `reviews/{userId}` folder
  → Creates ReviewPhoto entity with cloudinaryPublicId
```

### Cloudinary Service

```typescript
uploadImage(file: { buffer }, folder: string): Promise<{ url, public_id }>
  → Streams file buffer to Cloudinary
  → Stores in specified folder (e.g., 'restaurants/1', 'users/5')
  → Returns public CDN URL and public_id for deletion

deleteImage(publicId: string): Promise<void>
  → Removes image from Cloudinary by public_id
```

---

## Request/Response Examples

### Login Request & Response

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}

# Response: 200 OK
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "customer",
    "is_active": true,
    "created_at": "2025-01-15T10:00:00Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Create Promo Code Request & Response (Admin Only)

```bash
POST /api/v1/promo-codes
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "code": "WELCOME10",
  "description": "10% off first order",
  "discount_type": "percentage",
  "discount_value": 10,
  "minimum_order_amount": 50,
  "maximum_discount_amount": 100,
  "valid_from": "2025-01-01T00:00:00Z",
  "valid_until": "2025-12-31T23:59:59Z",
  "usage_limit": 1000,
  "is_first_order_only": true,
  "is_active": true
}

# Response: 201 Created
{
  "id": 1,
  "code": "WELCOME10",
  "description": "10% off first order",
  "discount_type": "percentage",
  "discount_value": "10.00",
  "minimum_order_amount": "50.00",
  "maximum_discount_amount": "100.00",
  "valid_from": "2025-01-01T00:00:00Z",
  "valid_until": "2025-12-31T23:59:59Z",
  "usage_limit": 1000,
  "usage_count": 0,
  "is_first_order_only": true,
  "is_active": true,
  "created_at": "2025-01-15T10:30:00Z"
}
```

### Apply Promo Code Request & Response

```bash
POST /api/v1/promo-codes/apply
Authorization: Bearer <user_access_token>
Content-Type: application/json

{
  "code": "WELCOME10",
  "order_amount": 150
}

# Response: 200 OK
{
  "is_valid": true,
  "code": "WELCOME10",
  "discount_amount": "15.00",
  "final_amount": "135.00"
}
```

### Create Order with Promo Request & Response

```bash
POST /api/v1/orders
Authorization: Bearer <user_access_token>
Content-Type: application/json

{
  "restaurant_id": 1,
  "address_id": 2,
  "items": [
    { "menu_item_id": 5, "quantity": 2, "special_instructions": "No onions" }
  ],
  "payment_method": "card",
  "delivery_type": "now"
}

# Response: 201 Created
{
  "id": 10,
  "order_number": "ORD-1705316400000-ABC123DEF",
  "user_id": 1,
  "restaurant_id": 1,
  "status": "pending",
  "subtotal": "29.98",
  "delivery_fee": "5.00",
  "tax": "2.40",
  "discount_amount": "3.00",  (from promo code if applied)
  "total_amount": "34.38",
  "promo_code_id": 1,
  "created_at": "2025-01-15T10:35:00Z",
  "order_items": [...]
}
```

### Upload Review Photo Request & Response

```bash
POST /api/v1/reviews/:reviewId/upload-photo
Authorization: Bearer <user_access_token>
Content-Type: multipart/form-data

file: <image_file>

# Response: 201 Created
{
  "imageUrl": "https://res.cloudinary.com/.../reviews/1/ufhwbds123.jpg",
  "cloudinaryPublicId": "reviews/1/ufhwbds123"
}
```

---

## Configuration & Environment Variables

### .env.development

```env
# Database
DB_TYPE=sqlite
DB_NAME=database.sqlite
DB_SYNC=true       # Auto-sync TypeORM schema
DB_LOGGING=false   # SQL query logging

# JWT
JWT_ACCESS_TOKEN_SECRET=your_secret_key_here
JWT_ACCESS_TOKEN_EXPIRES_IN=1d
JWT_REFRESH_TOKEN_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
CORS_ORIGIN=http://localhost:3001

# Server
PORT=3000
NODE_ENV=development
```

### .env.production

```env
# Database (MS SQL Server)
DB_TYPE=mssql
DB_HOST=your_server.database.windows.net
DB_PORT=1433
DB_DATABASE=food_delivery_prod
DB_USERNAME=admin
DB_PASSWORD=your_password
DB_SYNC=false      # Never auto-sync in production

# JWT (use strong secrets)
JWT_ACCESS_TOKEN_SECRET=very_long_secret_key_here
JWT_ACCESS_TOKEN_EXPIRES_IN=1d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_prod_cloud_name
CLOUDINARY_API_KEY=your_prod_api_key
CLOUDINARY_API_SECRET=your_prod_api_secret

# CORS (restrict to frontend domain)
CORS_ORIGIN=https://yourdomain.com

# Server
PORT=3000
NODE_ENV=production
```

---

## Running & Deployment

### Development

```bash
# Install dependencies
npm install

# Start dev server with watch
npm run start:dev
# Server at http://localhost:3000
# API docs at http://localhost:3000/api/docs

# Run tests
npm test
npm test:watch
npm test:cov

# Format code
npm run format

# Lint
npm run lint
```

### Build & Production

```bash
# Build
npm run build
# Outputs compiled JS to dist/

# Start production server
npm run start:prod
# Or: node dist/main

# Run migrations (if using them)
npm run migration:run
npm run migration:generate -- -n <migration_name>
```

---

## Key Features Implemented

✅ **Authentication**

- Email/password registration & login
- JWT tokens with 1d access / 7d refresh expiry
- Social login (Google, Facebook)
- Profile endpoints

✅ **Authorization**

- JWT Guard for protected routes
- Roles Guard with @Roles('admin') decorator
- User role field (customer, admin, restaurant_owner)

✅ **Users**

- Profile CRUD
- Dietary preferences & allergens
- Profile picture upload (Cloudinary)

✅ **Restaurants**

- CRUD operations
- Logo & banner uploads (Cloudinary)
- Cuisine types, delivery fees, ratings
- Opening hours configuration

✅ **Menu Items**

- CRUD under restaurant
- Image uploads (Cloudinary)
- Allergens, dietary tags, ingredients
- Availability & preparation time

✅ **Carts**

- Add/remove items to cart
- Quantity management
- Store price at purchase time

✅ **Orders**

- Create order from cart with transaction support
- Status tracking (pending, confirmed, preparing, ready, picked_up, delivered, cancelled)
- Order history & reorder from previous
- Promo code integration (discount applied)
- Order tracking history

✅ **Reviews**

- Create reviews for restaurant/driver
- Photo uploads (Cloudinary)
- Vote on review helpfulness
- Status management (pending, approved, reported, removed)

✅ **Promo Codes** (NEW)

- Admin-only create/update/delete
- Percentage, fixed amount, free delivery discounts
- Usage limits & tracking
- Validity date ranges
- Apply to orders & calculate discount
- User promo usage history

✅ **File Uploads**

- Cloudinary integration
- Upload to restaurants, menu-items, users, reviews
- Store public IDs for deletion
- CDN-hosted URLs for fast delivery

✅ **Health & Monitoring**

- `/health` endpoint - API status
- `/health/db` endpoint - Database connection check

---

## Next Steps & Recommendations

### Short-Term Improvements

1. **Database Migrations** - Create TypeORM migrations for schema versioning (instead of sync)
2. **Error Handling** - Add global exception filter for consistent error responses
3. **Logging** - Implement structured logging (Winston/Pino) for production
4. **Tests** - Add comprehensive unit & e2e tests for critical services
5. **Validation** - Enhanced DTOs with custom validators (e.g., date ranges, price formats)

### Medium-Term Features

1. **Payments** - Stripe/PayPal integration for order payment
2. **Notifications** - WebSockets + email/SMS notifications for order updates
3. **Drivers** - Driver management, real-time location tracking
4. **Search** - Elasticsearch or full-text search for restaurants/menu items
5. **Analytics** - Order analytics, popular items, revenue reports
6. **Rate Limiting** - Prevent abuse on auth/promo endpoints
7. **Caching** - Redis for frequently accessed data (restaurants, promos)

### Production Checklist

- [ ] Set up MS SQL Server database
- [ ] Generate strong JWT secrets (use `openssl rand -base64 32`)
- [ ] Configure Cloudinary production account
- [ ] Enable HTTPS/SSL
- [ ] Set up environment-specific .env files
- [ ] Configure CORS for frontend domain
- [ ] Run database migrations
- [ ] Set up CI/CD pipeline (GitHub Actions, etc.)
- [ ] Add monitoring/alerting (Datadog, New Relic, etc.)
- [ ] Regular backups & disaster recovery plan

---

## File Structure for REST Testing

A `restclient/promo.http` file is provided with example requests:

- Create promo (admin only)
- Validate promo (public)
- Apply promo (authenticated)
- Get available promos
- Get all promos

Use with VSCode REST Client extension or import into Postman.

---

## Summary

Your backend is a **production-ready, modular NestJS application** with:

- Clean separation of concerns (modules, services, controllers)
- Secure authentication & role-based access
- Cloud-based file uploads (Cloudinary)
- Database transactions for orders
- Comprehensive promo code system
- Review & rating functionality
- Health monitoring

The codebase is well-structured for scaling with proper DI, repositories, and validation. Future work should focus on external integrations (payments, notifications, search) and infrastructure (migrations, caching, monitoring).
