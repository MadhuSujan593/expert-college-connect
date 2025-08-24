import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Security middleware with custom configuration for images
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  }));
  app.use(compression());
  app.use(cors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:5174' // Alternative Vite port
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // Allow extra properties to pass through
      transform: true, // Re-enable transform for JSON requests
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Ensure upload directories exist
  const uploadsDir = join(__dirname, '..', 'uploads');
  const profilePicsDir = join(uploadsDir, 'profile-pics');
  const resumesDir = join(uploadsDir, 'resumes');
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  if (!fs.existsSync(profilePicsDir)) {
    fs.mkdirSync(profilePicsDir, { recursive: true });
  }
  if (!fs.existsSync(resumesDir)) {
    fs.mkdirSync(resumesDir, { recursive: true });
  }



  // Serve static files with proper CORS headers
  app.useStaticAssets(uploadsDir, {
    prefix: '/uploads/',
    setHeaders: (res, path) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    }
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Expert College Connect API')
    .setDescription('API for connecting students, professors, and educational resources')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('courses', 'Course management')
    .addTag('assignments', 'Assignment management')
    .addTag('discussions', 'Discussion forums')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
