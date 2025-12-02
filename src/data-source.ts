import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Load environment variables
config();

export const AppDataSource = new DataSource({
  type: 'mssql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433'),
  username: process.env.DB_USERNAME || 'sa',
  password: process.env.DB_PASSWORD || 'YourPassword123!',
  database: process.env.DB_NAME || 'food_delivery',
  schema: process.env.DB_SCHEMA || 'dbo',

  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/database/migrations/*{.ts,.js}'],

  synchronize: process.env.DB_SYNC === 'true',
  logging: process.env.DB_LOGGING === 'true',

  options: {
    encrypt: process.env.DB_ENCRYPT === 'true', // Set to true for Azure SQL
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true', // Set to true for local dev
    enableAnsiNullDefault: true,
  },

  pool: {
    max: parseInt(process.env.DB_POOL_MAX || '10'),
    min: parseInt(process.env.DB_POOL_MIN || '0'),
    idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000'),
  },
});

// Note: Data source initialization is handled by NestJS TypeORM module
// Uncomment below only if using TypeORM CLI for migrations
/*
AppDataSource.initialize()
  .then(() => {
    console.log('✅ Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('❌ Error during Data Source initialization:', err);
  });
*/
