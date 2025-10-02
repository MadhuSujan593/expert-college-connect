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


     
      // Check if user has any valid session (more lenient check)
      const session = await this.prisma.session.findFirst({
        where: {
          userId,
          isActive: true,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' }, // Get the most recent session
      });

        // If no active session found, check if user has any recent session (within last 5 minutes for testing)
        if (!session) {
          const recentSession = await this.prisma.session.findFirst({
            where: {
              userId,
              isActive: true,
              createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) }, // TESTING: Last 5 minutes
            },
            orderBy: { createdAt: 'desc' },
          });

          if (!recentSession) {
            console.log('❌ JWT Strategy - No valid session found for user:', userId);
            throw new UnauthorizedException('Session expired or invalid');
          }
          
          // Reactivate the recent session if it exists but expired
          await this.prisma.session.update({
            where: { id: recentSession.id },
            data: { 
              isActive: true,
              expiresAt: new Date(Date.now() + 5 * 60 * 1000), // TESTING: Extend to 5 minutes
              updatedAt: new Date()
            }
          });
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
      throw new UnauthorizedException('Token validation failed');
    }
  }
} 