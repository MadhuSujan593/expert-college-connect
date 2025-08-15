import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get('DB_PORT', 3306),
  username: configService.get('DB_USERNAME', 'root'),
  password: configService.get('DB_PASSWORD', ''),
  database: configService.get('DB_NAME', 'expert_college_connect'),
  
  // Entity and Migration Configuration
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  migrationsRun: true,
  migrationsTableName: 'migrations',
  
  // Connection Pool Settings
  poolSize: configService.get('DB_POOL_SIZE', 10),
  extra: {
    connectionLimit: configService.get('DB_MAX_CONNECTIONS', 20),
    acquireTimeout: configService.get('DB_ACQUIRE_TIMEOUT', 60000),
    timeout: configService.get('DB_IDLE_TIMEOUT', 10000),
  },
  
  // Synchronization (disable in production)
  synchronize: configService.get('NODE_ENV') === 'development',
  
  // Logging
  logging: configService.get('NODE_ENV') === 'development',
  logger: 'advanced-console',
  
  // MySQL Specific Settings
  charset: 'utf8mb4',
  timezone: '+05:30', // IST timezone
  supportBigNumbers: true,
  bigNumberStrings: true,
  
  // Cache Configuration
  cache: {
    duration: 30000, // 30 seconds
  },
  
  // Query Builder Options
  maxQueryExecutionTime: 10000, // 10 seconds
});

export const getTestDatabaseConfig = (): TypeOrmModuleOptions => ({
  type: 'sqlite',
  database: ':memory:',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
  logging: false,
}); 