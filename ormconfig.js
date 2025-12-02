const { DataSource } = require('typeorm');

module.exports = {
  type: 'sqlite',
  database: 'database.sqlite',
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/database/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: true,
  cli: {
    migrationsDir: 'src/database/migrations'
  }
};