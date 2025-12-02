import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const isAzure = process.env.DB_HOST && process.env.DB_NAME;

const dataSourceOptions = isAzure
  ? {
      type: 'mssql' as const,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '1433'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      schema: process.env.DB_SCHEMA || 'dbo',
      entities: ['src/**/*.entity{.ts,.js}'],
      migrations: ['src/database/migrations/*{.ts,.js}'],
      migrationsTableName: 'migrations',
      synchronize: true,
      logging: true,
      extra: {
        trustServerCertificate: process.env.DB_TRUST_CERT !== 'true',
        encrypt: process.env.DB_ENCRYPT === 'true',
        connectionTimeout: 30000,
        requestTimeout: 30000,
      },
      pool: {
        max: parseInt(process.env.DB_POOL_MAX || '10'),
        min: parseInt(process.env.DB_POOL_MIN || '0'),
        idleTimeoutMillis: parseInt(
          process.env.DB_POOL_IDLE_TIMEOUT || '30000',
        ),
      },
    }
  : {
      type: 'sqlite' as const,
      database: 'database.sqlite',
      entities: ['src/**/*.entity{.ts,.js}'],
      migrations: ['src/database/migrations/*{.ts,.js}'],
      migrationsTableName: 'migrations',
      synchronize: false,
      logging: true,
    };

export default new DataSource(dataSourceOptions as any);
