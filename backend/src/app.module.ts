import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';

// Feature Modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ExpertsModule } from './experts/experts.module';
import { CollegesModule } from './colleges/colleges.module';
import { RequirementsModule } from './requirements/requirements.module';
import { ApplicationModule } from './applications/application.module';
import { NotificationModule } from './notifications/notification.module';
import { MessagesModule } from './messages/messages.module';
import { RatingsModule } from './ratings/ratings.module';
import { RatingRequestsModule } from './rating-requests/rating-requests.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: config.get('THROTTLE_TTL', 60),
        limit: config.get('THROTTLE_LIMIT', 100),
      }),
    }),
    AuthModule,
    UsersModule,
    ExpertsModule,
    CollegesModule,
    RequirementsModule,
    ApplicationModule,
    NotificationModule,
    MessagesModule,
    RatingsModule,
    RatingRequestsModule,
  ],
})
export class AppModule {}
