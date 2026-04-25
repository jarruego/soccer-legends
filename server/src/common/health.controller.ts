import {
  Controller,
  Get,
  Inject,
  ServiceUnavailableException,
} from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DATABASE_PROVIDER, type Database } from '@/database/database.module';

@Controller('health')
export class HealthController {
  constructor(
    @Inject(DATABASE_PROVIDER)
    private readonly database: Database,
  ) {}

  @Get()
  async health() {
    try {
      await this.database.execute(sql`select 1`);

      return {
        status: 'ok',
        database: 'ok',
        timestamp: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        database: 'down',
        timestamp: new Date().toISOString(),
      });
    }
  }
}
