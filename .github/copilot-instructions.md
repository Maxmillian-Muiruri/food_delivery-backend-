# Food Delivery API - Copilot Instructions

## Architecture Overview

**Food Delivery API** is a NestJS-based REST API for a food delivery platform using:

- **Framework**: NestJS 11 with TypeScript
- **Database**: MS SQL Server (production), SQLite (development)
- **Authentication**: JWT + Passport (local, JWT, Google OAuth, Facebook OAuth)
- **ORM**: TypeORM with async config
- **API Documentation**: Swagger/OpenAPI

### Module Structure

Organized into feature-based modules under `src/modules/`:

1. **auth** - Login, registration, social login, password reset, OTP
2. **users** - User profiles, dietary preferences, allergens
3. **restaurants** - Restaurant CRUD, filtering by cuisine type
4. **menu-items** - Menu items per restaurant with availability toggle
5. **addresses** - User address management (home, work, other) with default address
6. Other modules commented out: carts, orders, payments, favorites, reviews, promo codes, drivers, notifications, uploads, search

Each module follows the pattern: `entity.ts` → `dto/` → `service.ts` → `controller.ts` → `module.ts`

## Key Architectural Patterns

### 1. Module Configuration with Async Factory

Modules use `registerAsync` with `useFactory` for dynamic config:

```typescript
// src/app.module.ts - Global JWT setup
JwtModule.registerAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    secret: configService.get('jwt.accessTokenSecret'),
    signOptions: { expiresIn: '1d' },
  }),
  inject: [ConfigService],
});
```

### 2. TypeORM with Repository Pattern

Services inject repositories via `@InjectRepository()`:

```typescript
// src/modules/users/users.service.ts
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}
}
```

### 3. Ownership-Based Authorization

Resources check user ownership via `owner_id` field:

```typescript
// src/modules/restaurants/restaurants.service.ts - update() method
const restaurant = await this.restaurantRepository.findOne({
  where: { id, owner_id: owner.id },
});
if (!restaurant) {
  throw new NotFoundException(
    'Restaurant not found or does not belong to user',
  );
}
```

### 4. JWT Authentication Flow

- `JwtAuthGuard` protects routes (extends `AuthGuard('jwt')`)
- `@Public()` decorator bypasses guard on public routes (auth, health)
- Payload extracted to `req.user` containing `{ id, email, role }`

### 5. Entity Relations with Lazy Loading

Avoid unnecessary joins in base queries; select relations explicitly:

```typescript
// src/modules/restaurants/restaurants.service.ts - findAll()
.leftJoinAndSelect('restaurant.owner', 'owner')
.leftJoinAndSelect('restaurant.address_relation', 'address')
.select([...specific fields...])  // Explicit field selection
```

## Development Workflows

### Running the Application

```bash
npm run start:dev        # Watch mode (recommended for development)
npm run start            # Production build and run
npm run start:prod       # Production (requires build first)
npm run build            # TypeScript compilation to dist/
```

### Testing

```bash
npm run test             # Unit tests (src/**/*.spec.ts)
npm run test:e2e         # E2E tests (test/**/*.e2e-spec.ts)
npm run test:cov         # Coverage report
npm run test:watch       # Watch mode for tests
```

### Code Quality

```bash
npm run lint             # ESLint with auto-fix
npm run format           # Prettier formatting
```

### Health Check

- `GET /api/v1/health` - Basic health status
- `GET /api/v1/health/db` - Database connectivity
- Both endpoints are public (`@Public()`)

## Configuration & Environment

**Configuration files:**

- `.env` - Environment variables (DB, JWT, CORS, NODE_ENV)
- `src/config/database.config.ts` - TypeORM options (SQLite for dev)
- `src/config/jwt.config.ts` - JWT secrets and expiration
- `src/data-source.ts` - Standalone data source (CLI migrations)

**Key environment variables:**

```
DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME
JWT_ACCESS_TOKEN_SECRET, JWT_REFRESH_TOKEN_SECRET, JWT_EXPIRES_IN
NODE_ENV=development|production, PORT=3000, CORS_ORIGIN=*
```

**Note:** Database config has mismatch - `app.module.ts` loads SQLite config, but `.env` and `data-source.ts` use MS SQL. Use MS SQL for production.

## Project-Specific Conventions

### DTO & Validation

- Use `class-validator` decorators on all DTOs
- Export DTOs from `index.ts` file (see `src/modules/auth/dto/index.ts`)
- `UpdateDto` extends `PartialType(CreateDto)` for consistency
- Swagger docs via `@ApiProperty()` / `@ApiPropertyOptional()`

### Error Handling

- Use NestJS exceptions: `NotFoundException`, `ForbiddenException`, `BadRequestException`
- Ownership checks throw `ForbiddenException` (not 404 to prevent enumeration)
- Password never returned in API responses; use `sanitizeUser()` method

### Entity Design

- All entities have `@CreateDateColumn()` / `@UpdateDateColumn()`
- Use `@Column({ type: 'simple-json', nullable: true })` for arrays (dietary_preferences, allergens, cuisine_type)
- Foreign key relations via `@ManyToOne()` + `@JoinColumn()`
- Commented-out relations in entities show planned features (orders, favorites, reviews)

### Service Patterns

- `findOne()` throws `NotFoundException` (auto handled by NestJS filter)
- `create()` validates foreign keys exist before creating
- `update()` uses `Object.assign()` + `.save()` for atomic updates
- Soft deletes via `is_active` flag (users, restaurants)

### API Route Versioning

- Base path: `/api/v1/` (set in `main.ts` via `setGlobalPrefix()`)
- Auth routes: `/auth/*` (no version prefix)
- Health check: `/api/v1/health` (public)

## Integration Points

### Authentication

- **Strategies**: LocalStrategy (email/password), JwtStrategy, GoogleStrategy, FacebookStrategy
- **Social login**: DTOs accept access tokens; actual verification incomplete (`TODO` comments in `auth.service.ts`)
- **Token refresh**: 1-day access token, 7-day refresh token

### Database Connections

- `DatabaseService` logs connection on module init
- Health check endpoint tests connectivity with dummy query
- Connection pooling configured in `.env` (max: 10, min: 0)

### Validation Pipeline

Global validation in `main.ts`:

```typescript
new ValidationPipe({
  whitelist: true, // Strip unknown properties
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: { enableImplicitConversion: true },
});
```

## Common Tasks

### Adding a New Module

1. Create `src/modules/{name}/` directory structure
2. Define entity in `entities/{name}.entity.ts` with relations
3. Create DTOs in `dto/create-{name}.dto.ts`, `update-{name}.dto.ts`
4. Implement service with CRUD + business logic
5. Implement controller with routes and Swagger docs
6. Create module and export service
7. Import into `app.module.ts`

### Adding Protected Routes

```typescript
@UseGuards(JwtAuthGuard)
@Patch(':id')
@ApiBearerAuth()
update(@Param('id', ParseIntPipe) id: number, @Request() req) {
  const user = req.user as User;  // Type casting for clarity
  return this.service.update(id, dto, user);
}
```

### Ownership Checks

Always verify resource belongs to authenticated user:

```typescript
const resource = await repo.findOne({ where: { id, user_id: user.id } });
if (!resource) throw new ForbiddenException('Access denied');
```

## Notes for AI Agents

- **Incomplete features**: Social login token verification, OTP logic, email sending (search for `TODO`)
- **Database mismatch**: Fix database config for MS SQL vs SQLite
- **MenuItems module**: Commented out in `app.module.ts` but fully implemented
- **Relations**: Some relations (User→Orders, Restaurant→MenuItems) incomplete or commented
- **Testing**: E2E test exists but minimal; add unit tests as features expand
- **CORS**: Currently set to `*` (wildcard) - restrict in production
