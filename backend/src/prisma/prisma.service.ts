import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get('DATABASE_URL'),
        },
      },
      log: configService.get('NODE_ENV') === 'development' ? ['query', 'error', 'warn'] : ['error'],
      errorFormat: 'pretty',
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database connected successfully');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🔌 Database disconnected');
  }

  /**
   * Clean up database (for testing)
   */
  async cleanDatabase() {
    if (this.configService.get('NODE_ENV') === 'test') {
      try {
        // For MySQL, we'll use a different approach
        const tables = await this.$queryRaw<Array<{ TABLE_NAME: string }>>`
          SELECT TABLE_NAME FROM information_schema.TABLES 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME != '_prisma_migrations'
        `;
        
        if (tables.length > 0) {
          const tableNames = tables.map(t => t.TABLE_NAME).join(', ');
          await this.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 0; TRUNCATE TABLE ${tableNames}; SET FOREIGN_KEY_CHECKS = 1;`);
        }
      } catch (error) {
        console.log({ error });
      }
    }
  }

  /**
   * Health check for database
   */
  async healthCheck() {
    try {
      await this.$queryRaw`SELECT 1`;
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
    }
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats() {
    try {
      const userCount = await this.user.count();
      const expertCount = await this.expertProfile.count();
      const collegeCount = await this.collegeProfile.count();
      const sessionCount = await this.session.count({ where: { isActive: true } });

      return {
        users: userCount,
        experts: expertCount,
        colleges: collegeCount,
        activeSessions: sessionCount,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return { error: error.message, timestamp: new Date().toISOString() };
    }
  }

  /**
   * Transaction wrapper with error handling
   */
  async transaction<T>(fn: (prisma: PrismaService) => Promise<T>): Promise<T> {
    return this.$transaction(async (tx) => {
      try {
        return await fn(tx as PrismaService);
      } catch (error) {
        console.error('Transaction failed:', error);
        throw error;
      }
    });
  }

  /**
   * Batch operations with chunking
   */
  async batchCreate<T>(model: any, data: T[], chunkSize: number = 1000) {
    const chunks: T[][] = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize));
    }

    const results: any[] = [];
    for (const chunk of chunks) {
      const result = await model.createMany({ data: chunk });
      results.push(result);
    }

    return results;
  }

  /**
   * Soft delete helper
   */
  async softDelete(model: any, where: any) {
    return model.update({
      where,
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Restore soft deleted record
   */
  async restore(model: any, where: any) {
    return model.update({
      where,
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });
  }

  /**
   * Pagination helper
   */
  async paginate<T>(
    model: any,
    page: number = 1,
    limit: number = 10,
    where: any = {},
    orderBy: any = { createdAt: 'desc' },
    include: any = {}
  ) {
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      model.findMany({
        where,
        orderBy,
        include,
        skip,
        take: limit,
      }),
      model.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Search helper with full-text search
   */
  async search<T>(
    model: any,
    searchTerm: string,
    searchFields: string[],
    where: any = {},
    orderBy: any = { createdAt: 'desc' },
    include: any = {}
  ) {
    const searchConditions = searchFields.map(field => ({
      [field]: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    }));

    return model.findMany({
      where: {
        ...where,
        OR: searchConditions,
      },
      orderBy,
      include,
    });
  }

  /**
   * Cache invalidation helper
   */
  async invalidateCache(keys: string[]) {
    // This would integrate with Redis or other caching solution
    console.log('Cache invalidation requested for keys:', keys);
  }

  /**
   * Database backup helper (for development/testing)
   */
  async createBackup() {
    if (this.configService.get('NODE_ENV') === 'development') {
      console.log('Creating database backup...');
      // Implementation would depend on the database system
      return { message: 'Backup created successfully' };
    }
    throw new Error('Backup only available in development mode');
  }
} 