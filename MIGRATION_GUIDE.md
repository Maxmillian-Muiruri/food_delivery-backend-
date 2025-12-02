# Database Migration Guide - Food Delivery API

## Overview

Your backend is now configured to connect to **Azure SQL Database** and has a migration file ready to create all necessary tables.

## Prerequisites

1. Azure SQL Database is provisioned and running
2. Your Azure SQL Server credentials (host, username, password)
3. Network connectivity to Azure SQL Server (firewall rules configured)

## Steps to Run Migrations

### Step 1: Update .env with Your Azure SQL Credentials

Update `/home/max/Dev/corhort2/final-project/food-delivery-api/.env` with your actual Azure SQL details:

```env
# Azure SQL Database Configuration
DB_HOST=your-actual-server.database.windows.net    # Replace with your server name
DB_PORT=1433
DB_USERNAME=your-actual-username                   # Replace with your admin username
DB_PASSWORD=YourActualSecurePassword123!           # Replace with your password
DB_NAME=food_delivery
DB_SCHEMA=dbo

DB_SYNC=false
DB_LOGGING=true

# Azure SQL requires encryption
DB_ENCRYPT=true
DB_TRUST_CERT=false

DB_POOL_MAX=10
DB_POOL_MIN=0
DB_POOL_IDLE_TIMEOUT=30000
```

**Important**:

- `DB_HOST` should be like: `myserver.database.windows.net` (without `https://`)
- `DB_USERNAME` and `DB_PASSWORD` are your Azure SQL admin credentials
- Do NOT commit `.env` with credentials to git - use `.gitignore`

### Step 2: Build the Project

```bash
cd /home/max/Dev/corhort2/final-project/food-delivery-api
npm run build
```

This compiles TypeScript and generates the `dist/` folder needed for migrations.

### Step 3: Run the Migration

```bash
npm run migration:run
```

This will:

1. Connect to your Azure SQL Database
2. Create the `migrations` table if it doesn't exist
3. Execute the `InitialSchema` migration
4. Create all tables: users, addresses, restaurants, menu_items, orders, reviews, promo_codes, etc.

**Expected Output:**

```
query: SELECT * FROM [dbo].[migrations]
query: SELECT * FROM [dbo].[migrations] WHERE [id] = @param0
migration: InitialSchema
query: CREATE TABLE [dbo].[users] (...)
query: CREATE TABLE [dbo].[addresses] (...)
... (more tables)
Migration InitialSchema has been executed successfully.
```

### Step 4: Verify Tables Were Created

Connect to your Azure SQL Database using Azure Data Studio, SQL Server Management Studio, or Azure Portal:

```sql
SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo';
```

You should see these tables:

- users
- addresses
- restaurants
- menu_items
- carts
- orders
- order_items
- order_tracking
- promo_codes
- user_promo_usage
- reviews
- review_photos
- review_votes
- favorites

### Step 5: Start Your Backend

```bash
npm run start:dev
# or
npm start:prod
```

Your API will now read/write to Azure SQL Database!

---

## Troubleshooting

### Connection Error: "Failed to connect to your-server.database.windows.net"

**Cause**: Placeholder values in `.env` or Azure SQL Server is unreachable

**Solution**:

1. Double-check `DB_HOST` - should be like `myserver.database.windows.net`
2. Verify Azure SQL Server is running (check Azure Portal)
3. Check Azure SQL firewall rules - add your IP address or allow "All Azure Services"
4. Ensure network connectivity: `ping your-server.database.windows.net`

### Error: "Invalid login for user 'your-actual-username'"

**Cause**: Incorrect username or password

**Solution**:

1. Verify credentials in `.env`
2. Reset password in Azure Portal if needed
3. Ensure you're using the admin account (not a database user)

### Error: "Cannot connect to database; the database is locked"

**Cause**: Another connection is using the database

**Solution**:

1. Close other connections (stop other instances)
2. Wait a few seconds and retry

### Migration Already Run Error

If you see: "Migration InitialSchema has already been executed"

This means the migration was already applied. To run it again:

```bash
# Option 1: Skip (if tables already exist)
npm run start:dev  # Just start the app

# Option 2: Reset database (CAUTION - deletes all data)
# Delete the migration record manually via SQL, then re-run:
npm run migration:run
```

---

## Migration Management Commands

### Check Migration Status

```bash
npm run migration:show
```

### Revert Last Migration (DESTRUCTIVE)

```bash
npm run migration:revert
```

### Create a New Migration

```bash
npm run migration:create -- -n AddNewFeature
# Then edit src/database/migrations/TIMESTAMP-AddNewFeature.ts
npm run migration:run
```

### Generate Migration from Entity Changes

After modifying entities:

```bash
npm run build
npm run migration:generate -- src/database/migrations/UpdateSchema
npm run migration:run
```

---

## Database Schema Overview

### Users Table

```sql
CREATE TABLE users (
  id INT PRIMARY KEY IDENTITY(1,1),
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  full_name VARCHAR(255),
  phone_number VARCHAR(50),
  profile_picture_url NVARCHAR(MAX),
  profile_picture_public_id NVARCHAR(MAX),
  role VARCHAR(50) DEFAULT 'customer',  -- 'customer', 'admin', 'restaurant_owner'
  dietary_preferences NVARCHAR(MAX),
  allergens NVARCHAR(MAX),
  social_provider VARCHAR(50),
  social_provider_id NVARCHAR(MAX),
  is_active BIT DEFAULT 1,
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME DEFAULT GETDATE()
);
```

### Restaurants Table

```sql
CREATE TABLE restaurants (
  id INT PRIMARY KEY IDENTITY(1,1),
  owner_id INT FOREIGN KEY REFERENCES users(id),
  name VARCHAR(255),
  description NVARCHAR(MAX),
  logo_url NVARCHAR(MAX),
  logo_public_id NVARCHAR(MAX),
  banner_url NVARCHAR(MAX),
  banner_public_id NVARCHAR(MAX),
  cuisine_type NVARCHAR(MAX),  -- JSON array
  delivery_fee DECIMAL(10,2),
  minimum_order_amount DECIMAL(10,2),
  estimated_delivery_time INT,
  rating_average DECIMAL(3,2),
  is_active BIT DEFAULT 1,
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME DEFAULT GETDATE()
);
```

### Orders Table

```sql
CREATE TABLE orders (
  id INT PRIMARY KEY IDENTITY(1,1),
  order_number VARCHAR(100) UNIQUE,
  user_id INT FOREIGN KEY REFERENCES users(id),
  restaurant_id INT FOREIGN KEY REFERENCES restaurants(id),
  address_id INT FOREIGN KEY REFERENCES addresses(id),
  status VARCHAR(50),  -- 'pending', 'confirmed', 'ready', 'delivered'
  subtotal DECIMAL(10,2),
  delivery_fee DECIMAL(10,2),
  tax DECIMAL(10,2),
  discount_amount DECIMAL(10,2),
  total_amount DECIMAL(10,2),
  promo_code_id INT FOREIGN KEY REFERENCES promo_codes(id),
  payment_method VARCHAR(50),
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME DEFAULT GETDATE()
);
```

### Promo Codes Table

```sql
CREATE TABLE promo_codes (
  id INT PRIMARY KEY IDENTITY(1,1),
  code VARCHAR(50) UNIQUE,
  description NVARCHAR(MAX),
  discount_type VARCHAR(50),  -- 'percentage', 'fixed_amount', 'free_delivery'
  discount_value DECIMAL(10,2),
  minimum_order_amount DECIMAL(10,2),
  maximum_discount_amount DECIMAL(10,2),
  valid_from DATETIME,
  valid_until DATETIME,
  usage_limit INT,
  usage_count INT DEFAULT 0,
  is_first_order_only BIT DEFAULT 0,
  is_active BIT DEFAULT 1,
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME DEFAULT GETDATE()
);
```

### Reviews Table

```sql
CREATE TABLE reviews (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36),
  targetId VARCHAR(100),  -- restaurant_id or driver_id
  targetType VARCHAR(20),  -- 'restaurant' or 'driver'
  orderId VARCHAR(36),
  rating INT,  -- 1-5
  comment NVARCHAR(MAX),
  status VARCHAR(20) DEFAULT 'pending',  -- 'approved', 'reported', 'removed'
  isVerified BIT DEFAULT 0,
  helpfulVotes INT DEFAULT 0,
  totalVotes INT DEFAULT 0,
  createdAt DATETIME DEFAULT GETDATE(),
  updatedAt DATETIME DEFAULT GETDATE()
);
```

---

## Next Steps After Migration

1. **Verify Connection**: Run your API and check database logs

   ```bash
   npm run start:dev
   curl http://localhost:3000/health/db
   ```

2. **Seed Sample Data** (Optional):
   - Create admin user
   - Add test restaurants
   - Add menu items
   - Create sample promo codes

3. **Run Tests**:

   ```bash
   npm test
   npm run test:e2e
   ```

4. **Monitor Migrations**: Keep track of applied migrations
   ```bash
   npm run migration:show
   ```

---

## Production Considerations

### Before Deploying to Production:

1. **Backup Your Data**
   - Enable automated backups in Azure SQL
   - Set retention policy

2. **Review Migration**
   - Test on staging database first
   - Have rollback plan ready

3. **Monitor Performance**
   - Check query execution plans
   - Add indexes if needed
   - Monitor connection pool

4. **Security**
   - Use Azure Key Vault for credentials (not hardcoded .env)
   - Enable Azure SQL auditing
   - Restrict firewall rules to specific IPs

5. **Environment Separation**
   ```
   .env.development  (local SQLite or dev Azure DB)
   .env.production   (production Azure DB)
   .env.staging      (staging Azure DB)
   ```

---

## File References

- **Migration File**: `src/database/migrations/1705433200000-InitialSchema.ts`
- **Database Config**: `src/config/database.config.ts`
- **ORM Config**: `ormconfig.ts`
- **Environment**: `.env`

---

## Support & Documentation

- [TypeORM Migrations](https://typeorm.io/migrations)
- [Azure SQL Database Docs](https://learn.microsoft.com/en-us/azure/azure-sql/database/)
- [MSSQL Connection Strings](https://www.connectionstrings.com/sql-server/)
