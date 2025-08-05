import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { getDatabaseConfig } from './config/database.config';

// Entities
// import { User } from './users/entities/user.entity';
// import { ExpertProfile } from './experts/entities/expert-profile.entity';
// import { CollegeProfile } from './colleges/entities/college-profile.entity';
// import { Rating } from './ratings/entities/rating.entity';
// import { Requirement } from './requirements/entities/requirement.entity';
// import { Service } from './services/entities/service.entity';
// import { Payment } from './payments/entities/payment.entity';

// Feature Modules (commented out until implemented)
// import { AuthModule } from './auth/auth.module';
// import { UsersModule } from './users/users.module';
// import { ExpertsModule } from './experts/experts.module';
// import { CollegesModule } from './colleges/colleges.module';
// import { RatingsModule } from './ratings/ratings.module';
// import { RequirementsModule } from './requirements/requirements.module';
// import { ServicesModule } from './services/services.module';
// import { PaymentsModule } from './payments/payments.module';
// import { SearchModule } from './search/search.module';
// import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: config.get('THROTTLE_TTL', 60),
        limit: config.get('THROTTLE_LIMIT', 100),
      }),
    }),
    // AuthModule,
    // UsersModule,
    // ExpertsModule,
    // CollegesModule,
    // RatingsModule,
    // RequirementsModule,
    // ServicesModule,
    // PaymentsModule,
    // SearchModule,
    // AdminModule,
  ],
})
export class AppModule {}
