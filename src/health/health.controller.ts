import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private dataSource: DataSource) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  async check() {
    const dbHealth = await this.checkDatabase();

    return {
      status: dbHealth.connected ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      database: dbHealth,
    };
  }

  @Public()
  @Get('db')
  @ApiOperation({ summary: 'Database connection status' })
  async checkDatabase() {
    try {
      const result = await this.dataSource.query('SELECT 1 AS status');

      return {
        connected: true,
        database: this.dataSource.options.database,
        host: (this.dataSource.options as any).host,
        type: this.dataSource.options.type,
        status: result[0].status,
      };
    } catch (error) {
      return {
        connected: false,
        database: this.dataSource.options.database,
        error: error.message,
      };
    }
  }
}
