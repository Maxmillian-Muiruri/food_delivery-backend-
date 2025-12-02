import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs('database', (): TypeOrmModuleOptions => {
  const isAzure = process.env.DB_HOST && process.env.DB_NAME;

  // Use Azure SQL if configured, otherwise fall back to SQLite
  if (isAzure) {
    return {
      type: 'mssql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '1433'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      schema: process.env.DB_SCHEMA || 'dbo',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: ['dist/database/migrations/*{.js}'],
      migrationsTableName: 'migrations',
      synchronize: false,
      logging: process.env.DB_LOGGING === 'true',
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
    } as TypeOrmModuleOptions;
  }

  // SQLite fallback for development
  return {
    type: 'sqlite',
    database: 'database.sqlite',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: ['dist/database/migrations/*{.js}'],
    migrationsTableName: 'migrations',
    synchronize: process.env.DB_SYNC === 'true',
    logging: process.env.DB_LOGGING === 'true',
  } as TypeOrmModuleOptions;
});
