import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    await this.testConnection();
  }

  async testConnection(): Promise<void> {
    try {
      if (this.dataSource.isInitialized) {
        this.logger.log('✅ Database connected successfully!');
        this.logger.log(`📊 Database: ${this.dataSource.options.database}`);
        this.logger.log(`🖥️  Host: ${(this.dataSource.options as any).host}`);
        this.logger.log(`🔌 Port: ${(this.dataSource.options as any).port}`);

        // Test query
        const result = await this.dataSource.query(
          'SELECT @@VERSION AS version',
        );
        this.logger.log(
          `📋 SQL Server Version: ${result[0].version.split('\n')[0]}`,
        );
      }
    } catch (error) {
      this.logger.error('❌ Database connection failed:', error.message);
      throw error;
    }
  }

  async healthCheck(): Promise<{ status: string; database: string }> {
    try {
      await this.dataSource.query('SELECT 1');
      return {
        status: 'healthy',
        database: this.dataSource.options.database as string,
      };
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return {
        status: 'unhealthy',
        database: this.dataSource.options.database as string,
      };
    }
  }
}
