# 🍕 Food Delivery API

A comprehensive, production-ready food delivery backend API built with **NestJS**, **TypeORM**, and **Microsoft SQL Server**. Features real-time order tracking, secure payment processing with Paystack, restaurant management, and a complete customer-to-delivery workflow.

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TypeORM](https://img.shields.io/badge/TypeORM-262627?style=for-the-badge&logo=typeorm&logoColor=white)](https://typeorm.io/)
[![MSSQL](https://img.shields.io/badge/Microsoft_SQL_Server-CC2927?style=for-the-badge&logo=microsoft-sql-server&logoColor=white)](https://www.microsoft.com/en-us/sql-server)
[![Paystack](https://img.shields.io/badge/Paystack-175CE8?style=for-the-badge&logo=paystack&logoColor=white)](https://paystack.com/)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Setup](#-environment-setup)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Code Style & Conventions](#-code-style--conventions)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [API Endpoints Overview](#-api-endpoints-overview)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Features

### Core Functionality
- **🔐 Authentication & Authorization**: JWT-based auth with role-based access control
- **👥 User Management**: Customer, restaurant owner, and admin roles
- **🏪 Restaurant Management**: Complete CRUD operations with verification system
- **🍽️ Menu Management**: Dynamic menu items with categories and availability
- **🛒 Shopping Cart**: Persistent cart with item management
- **📦 Order Management**: Complete order lifecycle from creation to delivery
- **📍 Real-time Order Tracking**: GPS-enabled delivery tracking with status updates
- **💳 Payment Processing**: Secure payments via Paystack integration
- **🔄 Transfer System**: Automated payment distribution to restaurants and drivers
- **⭐ Reviews & Ratings**: Customer reviews with photo uploads
- **❤️ Favorites**: Save favorite restaurants and menu items
- **📧 Notifications**: Real-time notifications via WebSocket
- **🏷️ Promo Codes**: Discount system with validation
- **👨‍🚗 Driver Management**: Driver registration and assignment
- **📤 File Uploads**: Cloudinary integration for images
- **🔍 Search**: Advanced search capabilities

### Technical Features
- **🏗️ Modular Architecture**: Clean separation of concerns with NestJS modules
- **📊 Database Relations**: Complex entity relationships with TypeORM
- **🔒 Security**: Helmet, CORS, input validation, and secure headers
- **📈 Performance**: Compression, caching, and optimized queries
- **🔄 Real-time**: WebSocket support for live updates
- **📚 API Documentation**: Auto-generated Swagger/OpenAPI docs
- **🧪 Testing**: Comprehensive test suite with Jest
- **📝 Code Quality**: ESLint and Prettier configuration
- **🐳 Container Ready**: Docker-compatible setup

## 🛠️ Tech Stack

### Backend Framework
- **NestJS** - Progressive Node.js framework for building efficient, scalable applications
- **TypeScript** - Typed superset of JavaScript for better development experience

### Database & ORM
- **Microsoft SQL Server** - Enterprise-grade relational database
- **TypeORM** - TypeScript ORM for database operations and migrations

### Authentication & Security
- **JWT (JSON Web Tokens)** - Stateless authentication
- **Passport.js** - Authentication middleware with multiple strategies
- **bcrypt** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

### Payment & External Services
- **Paystack** - Payment processing and transfers
- **Cloudinary** - Image upload and management
- **OpenRouteService** - Route optimization and distance calculation

### Real-time & Communication
- **Socket.IO** - Real-time bidirectional communication
- **WebSocket** - Low-latency communication protocol

### Development Tools
- **ESLint** - Code linting and style enforcement
- **Prettier** - Code formatting
- **Jest** - Testing framework
- **Swagger/OpenAPI** - API documentation
- **TypeORM CLI** - Database migration management

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

### System Requirements
- **Node.js** >= 18.0.0
- **npm** >= 8.0.0 or **yarn** >= 1.22.0
- **Microsoft SQL Server** >= 2017 (or Azure SQL Database)
- **Git** for version control

### External Services
- **Paystack Account** - For payment processing
- **Cloudinary Account** - For image uploads
- **OpenRouteService API Key** - For route optimization (optional)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd food-delivery-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup** (see [Environment Setup](#-environment-setup) section)

4. **Database Setup** (see [Database Setup](#-database-setup) section)

5. **Start the application**
   ```bash
   npm run start:dev
   ```

## ⚙️ Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=sa
DB_PASSWORD=YourStrong!Passw0rd
DB_NAME=fooddelivery_prod_db
DB_SCHEMA=dbo
DB_SYNC=true
DB_LOGGING=true
DB_ENCRYPT=true
DB_TRUST_CERT=false
DB_POOL_MAX=10
DB_POOL_MIN=0
DB_POOL_IDLE_TIMEOUT=30000

# JWT Configuration
JWT_ACCESS_TOKEN_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_TOKEN_SECRET=your-refresh-token-secret-here
JWT_EXPIRES_IN=7d

# Application
NODE_ENV=development
PORT=3000
CORS_ORIGIN=*

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME

# Paystack (Payment Processing)
PAYSTACK_PUBLIC_KEY=pk_test_your-public-key
PAYSTACK_SECRET_KEY=sk_test_your-secret-key

# OpenRouteService (Route Optimization - Optional)
ORS_API_KEY=your-ors-api-key
USE_ORS=true
```

### Environment Variables Explanation

| Variable | Description | Required |
|----------|-------------|----------|
| `DB_*` | Database connection settings | ✅ |
| `JWT_*` | JWT token configuration | ✅ |
| `CLOUDINARY_*` | Image upload service | ✅ |
| `PAYSTACK_*` | Payment processing | ✅ |
| `ORS_*` | Route optimization (optional) | ❌ |

## 🗄️ Database Setup

### 1. Create Database
```sql
CREATE DATABASE fooddelivery_prod_db;
```

### 2. Run Migrations
```bash
# Run all pending migrations
npm run migration:run

# Check migration status
npm run migration:show
```

### 3. Generate Migration (if schema changes)
```bash
# Generate migration from entity changes
npm run migration:generate -- -n MigrationName

# Create empty migration
npm run migration:create -- -n MigrationName
```

### Database Schema Overview

The application uses the following main entities:

- **Users**: Customer, restaurant owners, admins
- **Restaurants**: Restaurant profiles with store functionality
- **Menu Items**: Food items with categories and pricing
- **Orders**: Customer orders with items and status
- **Order Tracking**: Real-time delivery tracking
- **Payments**: Payment records with Paystack integration
- **Transfers**: Payment distribution to restaurants/drivers
- **Reviews**: Customer reviews with photos
- **Addresses**: User delivery addresses
- **Carts**: Shopping cart persistence
- **Drivers**: Delivery driver management
- **Notifications**: System notifications

## 🚀 Running the Application

### Development Mode
```bash
npm run start:dev
```
- Hot reload enabled
- Debug mode available
- Full logging enabled

### Production Mode
```bash
npm run start:prod
```
- Optimized build
- Production logging
- Performance optimizations

### Debug Mode
```bash
npm run start:debug
```
- Debug breakpoints enabled
- Source maps included

### Build Only
```bash
npm run build
```
- TypeScript compilation
- Output in `dist/` directory

## 📚 API Documentation

### Swagger/OpenAPI Documentation
When the application is running, visit:
```
http://localhost:3000/api/docs
```

### REST Client Testing
The `restclient/` directory contains HTTP files for testing all endpoints:

```bash
# Available test files
restclient/
├── auth.http           # Authentication
├── users.http          # User management
├── addresses.http      # Address management
├── restaurants.http    # Restaurant operations
├── menu-items.http     # Menu management
├── carts.http          # Shopping cart
├── orders.http         # Order lifecycle
├── order-tracking.http # Delivery tracking
├── payments.http       # Payment processing
├── transfers.http      # Payment distribution
├── reviews.http        # Reviews & ratings
├── favorites.http      # Favorites management
├── drivers.http        # Driver operations
├── notifications.http  # Notifications
├── uploads.http        # File uploads
└── promo-codes.http    # Discount codes
```

### API Base URL
```
http://localhost:3000/api/v1
```

## 📁 Project Structure

```
food-delivery-api/
├── src/
│   ├── app.module.ts              # Root application module
│   ├── main.ts                    # Application bootstrap
│   ├── data-source.ts             # Database configuration
│   │
│   ├── common/                    # Shared utilities
│   │   ├── decorators/           # Custom decorators
│   │   ├── guards/               # Authentication guards
│   │   └── services/             # Shared services
│   │
│   ├── config/                   # Configuration modules
│   │   ├── database.config.ts    # Database config
│   │   ├── jwt.config.ts         # JWT config
│   │   └── cloudinary.config.ts  # Cloudinary config
│   │
│   ├── database/                 # Database utilities
│   │   └── migrations/           # TypeORM migrations
│   │
│   ├── health/                   # Health check endpoint
│   │
│   └── modules/                  # Feature modules
│       ├── auth/                 # Authentication module
│       ├── users/                # User management
│       ├── addresses/            # Address management
│       ├── restaurants/          # Restaurant operations
│       ├── menu-items/           # Menu management
│       ├── carts/                # Shopping cart
│       ├── orders/               # Order management
│       ├── order-tracking/       # Delivery tracking
│       ├── payments/             # Payment processing
│       ├── transfers/            # Payment distribution
│       ├── reviews/              # Reviews & ratings
│       ├── favorites/            # Favorites
│       ├── drivers/              # Driver management
│       ├── notifications/        # Notifications
│       ├── uploads/              # File uploads
│       └── promo-codes/          # Discount codes
│
├── restclient/                   # API testing files
├── test/                        # Test files
├── dist/                        # Compiled output
├── node_modules/                # Dependencies
├── .env                         # Environment variables
├── .prettierrc                  # Prettier config
├── eslint.config.mjs            # ESLint config
├── tsconfig.json                # TypeScript config
├── package.json                 # Package manifest
└── README.md                    # This file
```

### Module Structure Pattern

Each feature module follows this consistent structure:

```
modules/[feature]/
├── [feature].module.ts          # Module definition
├── [feature].controller.ts      # HTTP endpoints
├── [feature].service.ts         # Business logic
├── entities/                    # Database entities
├── dto/                         # Data transfer objects
└── enums/                       # TypeScript enums
```

## 💅 Code Style & Conventions

### TypeScript Configuration
- **Target**: ES2023
- **Module Resolution**: NodeNext
- **Strict Mode**: Enabled with some relaxations
- **Decorators**: Experimental decorators enabled

### ESLint Rules
```javascript
{
  "@typescript-eslint/no-explicit-any": "off",
  "@typescript-eslint/no-floating-promises": "warn",
  "@typescript-eslint/no-unsafe-argument": "warn",
  "prettier/prettier": ["error", { "endOfLine": "auto" }]
}
```

### Prettier Configuration
```json
{
  "singleQuote": true,
  "trailingComma": "all"
}
```

### Code Formatting
```bash
# Format all files
npm run format

# Lint and fix issues
npm run lint
```

### Naming Conventions
- **Files**: kebab-case (e.g., `user.service.ts`)
- **Classes**: PascalCase (e.g., `UserService`)
- **Methods**: camelCase (e.g., `createUser()`)
- **Constants**: UPPER_SNAKE_CASE
- **Interfaces**: PascalCase with 'I' prefix (e.g., `IUser`)

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:cov
```

### E2E Tests
```bash
npm run test:e2e
```

### Debug Tests
```bash
npm run test:debug
```

## 🚢 Deployment

### Production Build
```bash
npm run build
npm run start:prod
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Set `DB_SYNC=false` (use migrations)
- Configure production database credentials
- Set secure JWT secrets
- Configure production Paystack keys

## 📡 API Endpoints Overview

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/social-login` - Social authentication
- `POST /api/v1/auth/refresh-token` - Token refresh
- `GET /api/v1/auth/profile` - Get user profile

### Restaurants
- `GET /api/v1/restaurants` - List restaurants
- `POST /api/v1/restaurants` - Create restaurant (owner only)
- `GET /api/v1/restaurants/:id` - Get restaurant details
- `PATCH /api/v1/restaurants/:id` - Update restaurant
- `GET /api/v1/restaurants/analytics/overview` - Analytics (owner only)

### Orders
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders` - Get user orders
- `GET /api/v1/orders/:id` - Get order details
- `DELETE /api/v1/orders/:id/cancel` - Cancel order
- `GET /api/v1/orders/:id/tracking` - Get order tracking

### Order Tracking
- `POST /api/v1/order-tracking` - Create tracking update
- `GET /api/v1/order-tracking/order/:orderId` - Get tracking history
- `PATCH /api/v1/order-tracking/:id` - Update tracking status

### Payments
- `POST /api/v1/payments/initialize` - Initialize payment
- `GET /api/v1/payments/verify/:reference` - Verify payment
- `GET /api/v1/payments/user/:userId` - Get user payments

### Reviews
- `POST /api/v1/reviews` - Create review
- `GET /api/v1/reviews` - Get reviews
- `PATCH /api/v1/reviews/:id` - Update review
- `POST /api/v1/reviews/:id/vote` - Vote on review

### And many more endpoints...

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Workflow
1. Run tests before committing
2. Follow code style guidelines
3. Update documentation for new features
4. Ensure all tests pass
5. Update API documentation if endpoints change

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎯 Quick Start Guide

1. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

2. **Install & Run**
   ```bash
   npm install
   npm run migration:run
   npm run start:dev
   ```

3. **Test API**
   - Visit `http://localhost:3000/api/docs` for Swagger docs
   - Use REST client files in `restclient/` directory
   - Register a user and start testing endpoints

4. **Development**
   ```bash
   npm run lint        # Code quality
   npm run test        # Run tests
   npm run build       # Production build
   ```

## 📞 Support

- **API Documentation**: `http://localhost:3000/api/docs`
- **Health Check**: `GET /api/v1/health`
- **Database Health**: `GET /api/v1/health/db`

## 🔄 Recent Updates

- ✅ **Store Module Consolidation**: Merged store functionality into restaurant module
- ✅ **MSSQL Optimization**: Fixed column types for better performance
- ✅ **Payment Integration**: Enhanced Paystack integration with transfers
- ✅ **Real-time Tracking**: GPS-enabled order tracking system
- ✅ **Review System**: Photo uploads and voting system
- ✅ **Security Enhancements**: Helmet, CORS, and input validation

---

**Happy coding! 🚀**

Built with ❤️ using NestJS, TypeORM, and Microsoft SQL Server.




```
food-delivery-frontend/
├── public/
│   ├── favicon.ico
│   ├── manifest.json
│   └── assets/                 # Static images, icons
│
├── src/
│   ├── main.tsx               # App entry point
│   ├── App.tsx                # Main app component
│   ├── index.css              # Global styles & Tailwind imports
│   │
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── Toast.tsx
│   │   │
│   │   ├── layout/           # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   │
│   │   ├── forms/            # Form components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── AddressForm.tsx
│   │   │   ├── PaymentForm.tsx
│   │   │   └── ReviewForm.tsx
│   │   │
│   │   └── common/           # Shared components
│   │       ├── SearchBar.tsx
│   │       ├── CategoryFilter.tsx
│   │       ├── Rating.tsx
│   │       └── ImageUpload.tsx
│   │
│   ├── pages/                # Page components (route-based)
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── ForgotPassword.tsx
│   │   │
│   │   ├── customer/         # Customer role pages
│   │   │   ├── Home.tsx
│   │   │   ├── RestaurantList.tsx
│   │   │   ├── RestaurantDetails.tsx
│   │   │   ├── Cart.tsx
│   │   │   ├── Checkout.tsx
│   │   │   ├── OrderTracking.tsx
│   │   │   ├── OrderHistory.tsx
│   │   │   ├── Favorites.tsx
│   │   │   ├── Profile.tsx
│   │   │   └── Addresses.tsx
│   │   │
│   │   ├── restaurant/       # Restaurant owner pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── MenuManagement.tsx
│   │   │   ├── OrderManagement.tsx
│   │   │   ├── Analytics.tsx
│   │   │   └── Earnings.tsx
│   │   │
│   │   ├── driver/           # Driver pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Deliveries.tsx
│   │   │   └── Earnings.tsx
│   │   │
│   │   └── admin/            # Admin pages
│   │       ├── Dashboard.tsx
│   │       ├── RestaurantApproval.tsx
│   │       ├── UserManagement.tsx
│   │       └── SystemAnalytics.tsx
│   │
│   ├── features/             # Feature-based modules (RTK Query)
│   │   ├── auth/
│   │   │   ├── authSlice.ts
│   │   │   ├── authApi.ts
│   │   │   └── authTypes.ts
│   │   │
│   │   ├── restaurants/
│   │   │   ├── restaurantSlice.ts
│   │   │   ├── restaurantApi.ts
│   │   │   └── restaurantTypes.ts
│   │   │
│   │   ├── menu/
│   │   │   ├── menuSlice.ts
│   │   │   ├── menuApi.ts
│   │   │   └── menuTypes.ts
│   │   │
│   │   ├── cart/
│   │   │   ├── cartSlice.ts
│   │   │   └── cartTypes.ts
│   │   │
│   │   ├── orders/
│   │   │   ├── orderSlice.ts
│   │   │   ├── orderApi.ts
│   │   │   └── orderTypes.ts
│   │   │
│   │   ├── payments/
│   │   │   ├── paymentSlice.ts
│   │   │   ├── paymentApi.ts
│   │   │   └── paymentTypes.ts
│   │   │
│   │   ├── reviews/
│   │   │   ├── reviewSlice.ts
│   │   │   ├── reviewApi.ts
│   │   │   └── reviewTypes.ts
│   │   │
│   │   ├── notifications/
│   │   │   ├── notificationSlice.ts
│   │   │   ├── notificationApi.ts
│   │   │   └── notificationTypes.ts
│   │   │
│   │   └── uploads/
│   │       ├── uploadSlice.ts
│   │       ├── uploadApi.ts
│   │       └── uploadTypes.ts
│   │
│   ├── store/                # Redux store configuration
│   │   ├── index.ts
│   │   ├── rootReducer.ts
│   │   └── middleware.ts
│   │
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   ├── useWebSocket.ts
│   │   ├── useLocalStorage.ts
│   │   └── useDebounce.ts
│   │
│   ├── utils/                # Utility functions
│   │   ├── api.ts           # Axios instance & interceptors
│   │   ├── constants.ts     # App constants
│   │   ├── helpers.ts       # Helper functions
│   │   ├── validation.ts    # Form validation
│   │   └── formatters.ts    # Data formatters
│   │
│   ├── types/               # Global TypeScript types
│   │   ├── index.ts
│   │   ├── api.ts
│   │   ├── entities.ts
│   │   └── ui.ts
│   │
│   ├── services/            # External service integrations
│   │   ├── websocket.ts     # WebSocket connection
│   │   ├── geolocation.ts   # GPS services
│   │   ├── notifications.ts # Push notifications
│   │   └── cloudinary.ts    # Image upload service
│   │
│   ├── contexts/            # React contexts (for non-Redux state)
│   │   ├── ThemeContext.tsx
│   │   └── WebSocketContext.tsx
│   │
│   ├── routes/              # Route definitions
│   │   ├── index.tsx
│   │   ├── publicRoutes.tsx
│   │   ├── customerRoutes.tsx
│   │   ├── restaurantRoutes.tsx
│   │   ├── driverRoutes.tsx
│   │   └── adminRoutes.tsx
│   │
│   ├── styles/              # Additional styles
│   │   ├── animations.css
│   │   └── components.css
│   │
│   └── lib/                 # Third-party library configurations
│       ├── redux.ts
│       ├── rtk-query.ts
│       └── tailwind.ts
│
├── tests/                   # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example            # Environment variables template
├── tailwind.config.js      # Tailwind configuration
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── package.json
└── README.md

```



```
food-delivery-frontend/
├── public/
│   ├── favicon.ico
│   ├── manifest.json
│   └── assets/
│       ├── images/
│       └── icons/
│
├── src/
│   ├── main.tsx                    # App entry point
│   ├── App.tsx                     # Main app component
│   ├── index.css                   # Global styles & Tailwind imports
│   │
│   ├── app/                        # App-level configurations
│   │   ├── store.ts                # Redux store setup
│   │   ├── router.tsx              # React Router setup
│   │   └── constants.ts            # App constants
│   │
│   ├── components/                 # Feature-based components
│   │   ├── Auth/                   # Authentication components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   │
│   │   ├── Restaurants/            # Restaurant components
│   │   │   ├── RestaurantCard.tsx
│   │   │   ├── RestaurantList.tsx
│   │   │   └── RestaurantDetails.tsx
│   │   │
│   │   ├── Orders/                 # Order components
│   │   │   ├── OrderCard.tsx
│   │   │   ├── OrderTracker.tsx
│   │   │   └── CartItem.tsx
│   │   │
│   │   ├── Drivers/                # Driver-specific components ⭐ NEW
│   │   │   ├── DriverCard.tsx
│   │   │   ├── DeliveryMap.tsx
│   │   │   └── EarningsChart.tsx
│   │   │
│   │   ├── Admin/                  # Admin-specific components ⭐ NEW
│   │   │   ├── UserManagement.tsx
│   │   │   ├── RestaurantApproval.tsx
│   │   │   └── AnalyticsDashboard.tsx
│   │   │
│   │   ├── UI/                     # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── Badge.tsx
│   │   │
│   │   ├── Layout/                 # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Sidebar.tsx
│   │   │
│   │   └── Common/                 # Shared components
│   │       ├── SearchBar.tsx
│   │       ├── Rating.tsx
│   │       └── ImageUpload.tsx
│   │
│   ├── features/                   # RTK Query features
│   │   ├── auth/                   # Authentication
│   │   │   ├── authApi.ts
│   │   │   ├── authSlice.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── restaurants/            # Restaurants
│   │   │   ├── restaurantApi.ts
│   │   │   ├── restaurantSlice.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── orders/                 # Orders
│   │   │   ├── orderApi.ts
│   │   │   ├── orderSlice.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── cart/                   # Shopping cart
│   │   │   ├── cartSlice.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── payments/               # Payments
│   │   │   ├── paymentApi.ts
│   │   │   ├── paymentSlice.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── reviews/                # Reviews ⭐ NEW
│   │   │   ├── reviewApi.ts
│   │   │   ├── reviewSlice.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── uploads/                # File uploads ⭐ NEW
│   │   │   ├── uploadApi.ts
│   │   │   ├── uploadSlice.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── users/                  # User management
│   │   │   ├── userApi.ts
│   │   │   ├── userSlice.ts
│   │   │   └── index.ts
│   │   │
│   │   └── notifications/          # Notifications
│   │       ├── notificationApi.ts
│   │       ├── notificationSlice.ts
│   │       └── index.ts
│   │
│   ├── pages/                      # Page components
│   │   ├── Home.tsx                # Landing page
│   │   ├── Login.tsx               # Login page
│   │   ├── Register.tsx            # Registration page
│   │   ├── Dashboard.tsx           # User dashboard
│   │   ├── Restaurants.tsx         # Restaurant listing
│   │   ├── RestaurantDetails.tsx   # Restaurant details
│   │   ├── Cart.tsx                # Shopping cart
│   │   ├── Checkout.tsx            # Checkout process
│   │   ├── OrderTracking.tsx       # Order tracking
│   │   ├── OrderHistory.tsx        # Order history
│   │   ├── Profile.tsx             # User profile
│   │   ├── Favorites.tsx           # Favorite restaurants
│   │   ├── Addresses.tsx           # Address management
│   │   ├── RestaurantDashboard.tsx # Restaurant owner dashboard
│   │   ├── MenuManagement.tsx      # Menu management
│   │   ├── DriverDashboard.tsx     # Driver dashboard
│   │   └── AdminDashboard.tsx      # Admin dashboard
│   │
│   ├── services/                   # External integrations ⭐ NEW
│   │   ├── cloudinary.ts           # Cloudinary image service
│   │   ├── paystack.ts             # Paystack payment service
│   │   ├── websocket.ts            # WebSocket connection service
│   │   ├── geolocation.ts          # GPS location service
│   │   └── notifications.ts        # Push notification service
│   │
│   ├── types/                      # TypeScript types
│   │   ├── index.ts                # Main types export
│   │   ├── api.ts                  # API response types
│   │   ├── entities.ts             # Entity types
│   │   └── ui.ts                   # UI component types
│   │
│   ├── utils/                      # Utility functions
│   │   ├── api.ts                  # Axios instance
│   │   ├── helpers.ts              # Helper functions
│   │   ├── constants.ts            # App constants
│   │   ├── validation.ts           # Form validation
│   │   └── storage.ts              # Local storage utilities
│   │
│   ├── hooks/                      # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   ├── useWebSocket.ts
│   │   └── useLocalStorage.ts
│   │
│   └── assets/                     # Static assets
│       ├── images/
│       └── icons/
│
├── .env.example                    # Environment variables
├── tailwind.config.js              # Tailwind config
├── vite.config.ts                  # Vite config
├── tsconfig.json                   # TypeScript config
├── package.json
└── README.md
