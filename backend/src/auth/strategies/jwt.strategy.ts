import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Extract from Authorization header
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        // Extract from cookies
        (request: Request) => {
          return request?.cookies?.accessToken;
        },
        // Extract from query parameters (for email verification links)
        ExtractJwt.fromUrlQueryParameter('token'),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: any) {
    try {
      // Validate payload structure
      if (!payload.sub || !payload.type || payload.type !== 'access') {
        throw new UnauthorizedException('Invalid token payload');
      }

      const userId = payload.sub;

      // Check if user exists and is active
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
          isActive: true,
          isDeleted: false,
        },
        select: {
          id: true,
          email: true,
          phone: true,
          fullName: true,
          role: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          profileImage: true,
          timezone: true,
          language: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Check if email is verified (required for all authenticated operations)
      if (!user.isEmailVerified) {
        throw new UnauthorizedException('Email not verified');
      }

      // Check if token is still valid in sessions
      const session = await this.prisma.session.findFirst({
        where: {
          userId,
          isActive: true,
          expiresAt: { gt: new Date() },
        },
      });

      if (!session) {
        throw new UnauthorizedException('Session expired or invalid');
      }

      // Add user info to request
      request.user = {
        ...user,
        // Add additional context
        tokenType: payload.type,
        issuedAt: payload.iat,
        expiresAt: payload.exp,
      };

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      // Log unexpected errors
      console.error('JWT validation error:', error);
      throw new UnauthorizedException('Token validation failed');
    }
  }
} 