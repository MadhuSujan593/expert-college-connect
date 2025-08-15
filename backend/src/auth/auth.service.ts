import { Injectable, UnauthorizedException, BadRequestException, ConflictException, InternalServerErrorException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../users/user.service';
import { EmailService } from '../services/email.service';
import { SmsService } from '../services/sms.service';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { 
  LoginDto, 
  RegisterDto, 
  RefreshTokenDto, 
  ForgotPasswordDto, 
  ResetPasswordDto,
  VerifyEmailDto,
  VerifyPhoneDto
} from './dto';
import { 
  LoginResponse, 
  RegisterResponse, 
  TokenResponse,
  VerificationResponse 
} from './interfaces';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
  ) {}

  /**
   * User Registration
   */
  async register(registerDto: RegisterDto): Promise<RegisterResponse> {
    const { 
      email, 
      phone, 
      password, 
      fullName, 
      role,
      // Expert fields
      jobTitle,
      company,
      experience,
      primaryExpertise,
      skills,
      bio,
      availableFor,
      preferredMode,
      hourlyRate,
      // College fields
      institutionName,
      contactPersonName,
      institutionType,
      website,
      address,
      city,
      state,
      country,
      postalCode
    } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { phone: phone || undefined }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('Email already registered');
      }
      if (phone && existingUser.phone === phone) {
        throw new ConflictException('Phone number already registered');
      }
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Check if email and phone were verified before registration
    const emailVerification = await this.prisma.emailVerification.findFirst({
      where: { 
        email, 
        isUsed: true,
        usedAt: { not: null }
      },
      orderBy: { usedAt: 'desc' }
    });

    const phoneVerification = phone ? await this.prisma.phoneVerification.findFirst({
      where: { 
        phone, 
        isUsed: true,
        usedAt: { not: null }
      },
      orderBy: { usedAt: 'desc' }
    }) : null;

    // Create user with profile in a transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          phone,
          password: hashedPassword,
          fullName,
          role,
          isEmailVerified: !!emailVerification, // Set based on verification status
          isPhoneVerified: !!phoneVerification, // Set based on verification status
        },
        select: {
          id: true,
          email: true,
          phone: true,
          fullName: true,
          role: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          createdAt: true,
        }
      });

      // Create Expert Profile if role is EXPERT
      if (role === 'EXPERT') {
        const expertProfile = await prisma.expertProfile.create({
          data: {
            userId: user.id,
            jobTitle: jobTitle || '',
            company: company || '',
            experience: experience || '',
            primaryExpertise: primaryExpertise || '',
            bio: bio || '',
            availableFor: availableFor ? JSON.parse(availableFor) : null,
            preferredMode: preferredMode || '',
            hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
          }
        });

        // Create Expert Skills if skills are provided
        if (skills) {
          const skillsArray = skills.split(',').map(skill => skill.trim());
          for (const skillName of skillsArray) {
            if (skillName) {
              await prisma.expertSkill.create({
                data: {
                  expertProfileId: expertProfile.id,
                  skillName: skillName,
                  skillLevel: 'INTERMEDIATE'
                }
              });
            }
          }
        }
      }

             // Create College Profile if role is COLLEGE_ADMIN
       if (role === 'COLLEGE_ADMIN') {
         // Validate and set institution type
         const validInstitutionType = this.validateInstitutionType(institutionType);
         
         await prisma.collegeProfile.create({
           data: {
             userId: user.id,
             institutionName: institutionName || '',
             contactPersonName: contactPersonName || '',
             institutionType: validInstitutionType,
             website: website || '',
             address: address || '',
             city: city || '',
             state: state || '',
             country: country || '',
             postalCode: postalCode || '',
           }
         });
       }

      return user;
    });

    return {
      user: result,
      message: `User registered successfully.`,
    };
  }

  /**
   * User Login
   */
  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, phone, password } = loginDto;

    // Find user by email or phone
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { phone: phone || undefined }
        ],
        isActive: true,
        isDeleted: false,
      },
      include: {
        expertProfile: true,
        collegeProfile: true,
      }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await this.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Note: Email verification is optional, so we don't block login if email is not verified
    // Users can still login even without verifying their email/phone

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id);
    
    // Create session
    await this.createSession(user.id, tokens.accessToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        expertProfile: user.expertProfile,
        collegeProfile: user.collegeProfile,
      },
      tokens,
      message: 'Login successful',
    };
  }

  /**
   * Refresh Access Token
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<TokenResponse> {
    const { refreshToken } = refreshTokenDto;

    try {
      // Verify refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      // Check if refresh token exists and is not revoked
      const tokenRecord = await this.prisma.refreshToken.findFirst({
        where: {
          token: refreshToken,
          userId: payload.sub,
          isRevoked: false,
          expiresAt: { gt: new Date() },
        },
      });

      if (!tokenRecord) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(payload.sub);

      // Revoke old refresh token
      await this.prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { isRevoked: true }
      });

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Logout User
   */
  async logout(userId: string): Promise<{ message: string }> {
    // Revoke all refresh tokens for user
    await this.prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true }
    });

    // Deactivate all sessions for user
    await this.prisma.session.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false }
    });

    return { message: 'Logout successful' };
  }

  /**
   * Forgot Password
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { email, isActive: true, isDeleted: false }
    });

    if (!user) {
      // Don't reveal if user exists or not
      return { message: 'If an account with that email exists, a password reset link has been sent.' };
    }

    // Generate password reset token
    const resetToken = await this.generatePasswordResetToken(user.id);

    // TODO: Send email with reset token
    console.log('Password reset token:', resetToken);

    return { message: 'If an account with that email exists, a password reset link has been sent.' };
  }

  /**
   * Reset Password
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;

    // Find valid password reset token
    const resetRecord = await this.prisma.passwordReset.findFirst({
      where: {
        token,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!resetRecord) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await this.hashPassword(newPassword);

    // Update user password
    await this.prisma.user.update({
      where: { id: resetRecord.userId },
      data: { password: hashedPassword }
    });

    // Mark reset token as used
    await this.prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: { isUsed: true, usedAt: new Date() }
    });

    // Revoke all refresh tokens for security
    await this.prisma.refreshToken.updateMany({
      where: { userId: resetRecord.userId, isRevoked: false },
      data: { isRevoked: true }
    });

    return { message: 'Password reset successful' };
  }

  /**
   * Verify Email
   */
  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<VerificationResponse> {
    const { email, otp } = verifyEmailDto;

    // First, check if email is already registered by another user
    const existingUser = await this.prisma.user.findUnique({
      where: { email, isActive: true, isDeleted: false }
    });

    // If user exists and email is already verified, throw error
    if (existingUser && existingUser.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // If user exists but email is not verified, allow verification
    // If no user exists, allow verification for pre-registration

    // Look for verification record by email (not just by userId)
    const verificationRecord = await this.prisma.emailVerification.findFirst({
      where: {
        email,
        otp,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verificationRecord) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // If user exists, update their verification status
    if (existingUser) {
      await this.prisma.user.update({
        where: { id: existingUser.id },
        data: { 
          isEmailVerified: true, 
          emailVerifiedAt: new Date() 
        }
      });
    }

    // Mark OTP as used (for both existing users and pre-registration)
    await this.prisma.emailVerification.update({
      where: { id: verificationRecord.id },
      data: { isUsed: true, usedAt: new Date() }
    });

    return { 
      message: existingUser 
        ? 'Email verified successfully' 
        : 'Email verified successfully. You can now create your account.',
      isPreRegistration: !existingUser
    };
  }

  /**
   * Verify Phone
   */
  async verifyPhone(verifyPhoneDto: VerifyPhoneDto): Promise<VerificationResponse> {
    const { phone, otp } = verifyPhoneDto;

    // First, try to find an existing user
    const existingUser = await this.prisma.user.findUnique({
      where: { phone, isActive: true, isDeleted: false }
    });

    // Check if phone is already verified for existing user
    if (existingUser && existingUser.isPhoneVerified) {
      throw new BadRequestException('Phone number already verified');
    }

    // If user exists but phone is not verified, allow verification
    // If no user exists, allow verification for pre-registration

    // Look for verification record by phone (not just by userId)
    const verificationRecord = await this.prisma.phoneVerification.findFirst({
      where: {
        phone,
        otp,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verificationRecord) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // If user exists, update their verification status
    if (existingUser) {
      await this.prisma.user.update({
        where: { id: existingUser.id },
        data: { 
          isPhoneVerified: true, 
          phoneVerifiedAt: new Date() 
        }
      });
    }

    // Mark OTP as used (for both existing users and pre-registration)
    await this.prisma.phoneVerification.update({
      where: { id: verificationRecord.id },
      data: { isUsed: true, usedAt: new Date() }
    });

    return { 
      message: existingUser 
        ? 'Phone number verified successfully' 
        : 'Phone number verified successfully. You can now create your account.',
      isPreRegistration: !existingUser
    };
  }

  /**
   * Generate JWT Tokens
   */
  private async generateTokens(userId: string) {
    const payload = { sub: userId, type: 'access' };
    const refreshPayload = { sub: userId, type: 'refresh' };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    // Store refresh token
    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return { accessToken, refreshToken };
  }

  /**
   * Create User Session
   */
  private async createSession(userId: string, token: string) {
    await this.prisma.session.create({
      data: {
        userId,
        token,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    });
  }

  /**
   * Generate Email Verification Token
   */
  private async generateEmailVerificationToken(userId: string) {
    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    return await this.prisma.emailVerification.create({
      data: {
        userId,
        email: (await this.prisma.user.findUnique({ where: { id: userId } }))?.email || '',
        otp,
        expiresAt,
      },
    });
  }

  /**
   * Generate Email Verification Token for Pre-registration
   */
  async generatePreRegistrationEmailVerification(email: string, userName?: string) {
    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Check if email is already verified for an existing user
    const existingUser = await this.prisma.user.findUnique({
      where: { email, isActive: true, isDeleted: false }
    });

    if (existingUser && existingUser.isEmailVerified) {
      throw new BadRequestException('Email already verified for an existing account');
    }

    // Create or update verification record
    const existingVerification = await this.prisma.emailVerification.findFirst({
      where: { email, isUsed: false }
    });

    if (existingVerification) {
      await this.prisma.emailVerification.update({
        where: { id: existingVerification.id },
        data: { otp, expiresAt }
      });
    } else {
      // For pre-registration, create a temporary userId
      const tempUserId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await this.prisma.emailVerification.create({
        data: {
          userId: tempUserId,
          email,
          otp,
          expiresAt,
        },
      });
    }

    // Send OTP email
    const emailSent = await this.emailService.sendOtpEmail(email, otp, userName || 'User');
    
    if (!emailSent) {
      throw new InternalServerErrorException('Failed to send verification email');
    }

    return { message: 'Verification email sent successfully' };
  }

  /**
   * Generate Phone Verification Token
   */
  private async generatePhoneVerificationToken(userId: string) {
    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    return await this.prisma.phoneVerification.create({
      data: {
        userId,
        phone: (await this.prisma.user.findUnique({ where: { id: userId } }))?.phone || '',
        otp,
        expiresAt,
      },
    });
  }

  /**
   * Generate Phone Verification Token for Pre-registration
   */
  async generatePreRegistrationPhoneVerification(phone: string) {
    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Check if phone is already verified for an existing user
    const existingUser = await this.prisma.user.findUnique({
      where: { phone, isActive: true, isDeleted: false }
    });

    if (existingUser && existingUser.isPhoneVerified) {
      throw new BadRequestException('Phone number already verified for an existing account');
    }

    // Create or update verification record
    const existingVerification = await this.prisma.phoneVerification.findFirst({
      where: { phone, isUsed: false }
    });

    if (existingVerification) {
      await this.prisma.phoneVerification.update({
        where: { id: existingVerification.id },
        data: { otp, expiresAt }
      });
    } else {
      // For pre-registration, create a temporary userId
      const tempUserId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await this.prisma.phoneVerification.create({
        data: {
          userId: tempUserId,
          phone,
          otp,
          expiresAt,
        },
      });
    }

    // Send OTP SMS
    const smsSent = await this.smsService.sendOtpSms(phone, otp);
    
    if (!smsSent) {
      throw new InternalServerErrorException('Failed to send verification SMS');
    }

    return { message: 'Verification SMS sent successfully' };
  }

  /**
   * Generate Password Reset Token
   */
  private async generatePasswordResetToken(userId: string) {
    const token = this.generateSecureToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    return await this.prisma.passwordReset.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  /**
   * Hash Password
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = parseInt(this.configService.get('BCRYPT_ROUNDS', '12'));
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify Password
   */
  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Generate OTP
   */
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generate Secure Token
   */
  private generateSecureToken(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }

  /**
   * Validate user for local strategy
   */
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email, isActive: true, isDeleted: false }
    });

    if (user && await this.verifyPassword(password, user.password)) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  /**
   * Validate Institution Type
   */
  private validateInstitutionType(type: string | undefined): 'UNIVERSITY' | 'COLLEGE' | 'INSTITUTE' | 'SCHOOL' | 'OTHER' {
    const validTypes = ['UNIVERSITY', 'COLLEGE', 'INSTITUTE', 'SCHOOL', 'OTHER'];
    if (type && validTypes.includes(type.toUpperCase())) {
      return type.toUpperCase() as 'UNIVERSITY' | 'COLLEGE' | 'INSTITUTE' | 'SCHOOL' | 'OTHER';
    }
    return 'UNIVERSITY'; // Default fallback
  }

  /**
   * Send Email OTP
   */
  async sendEmailOtp(email: string, userName?: string): Promise<{ message: string; success: boolean }> {
    try {
      // Check if user exists
      const user = await this.prisma.user.findUnique({
        where: { email, isActive: true, isDeleted: false }
      });

      // If user exists and email is already verified, throw error
      if (user && user.isEmailVerified) {
        throw new BadRequestException('Email already verified');
      }

      // If user exists but email is not verified, allow sending OTP for verification
      // If no user exists, allow sending OTP for pre-registration

      // Generate OTP
      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Create or update email verification record
      const existingVerification = await this.prisma.emailVerification.findFirst({
        where: { email, isUsed: false }
      });

      if (existingVerification) {
        await this.prisma.emailVerification.update({
          where: { id: existingVerification.id },
          data: {
            otp,
            expiresAt,
            isUsed: false,
            usedAt: null,
          },
        });
      } else {
        // For pre-registration, create verification record without userId
        const newRecord = await this.prisma.emailVerification.create({
          data: {
            userId: user?.id || null, // null for pre-registration
            email,
            otp,
            expiresAt,
          },
        });
      }

      // Send OTP email
      const emailSent = await this.emailService.sendOtpEmail(email, otp, userName || user?.fullName || 'User');
      
      if (!emailSent) {
        throw new BadRequestException('Failed to send OTP email');
      }

      return {
        message: 'OTP sent to your email address',
        success: true
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to send OTP');
    }
  }

  /**
   * Send Phone OTP
   */
  async sendPhoneOtp(phone: string, userName?: string): Promise<{ message: string; success: boolean }> {
    try {
      // Check if user exists
      const user = await this.prisma.user.findUnique({
        where: { phone, isActive: true, isDeleted: false }
      });

      // If user exists and phone is already verified, throw error
      if (user && user.isPhoneVerified) {
        throw new BadRequestException('Phone number already verified');
      }

      // If user exists but phone is not verified, allow sending OTP for verification
      // If no user exists, allow sending OTP for pre-registration

      // Generate OTP
      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Create or update phone verification record
      const existingPhoneVerification = await this.prisma.phoneVerification.findFirst({
        where: { phone, isUsed: false }
      });

      if (existingPhoneVerification) {
        await this.prisma.phoneVerification.update({
          where: { id: existingPhoneVerification.id },
          data: {
            otp,
            expiresAt,
            isUsed: false,
            usedAt: null,
          },
        });
      } else {
        // For pre-registration, create verification record without userId
        const newRecord = await this.prisma.phoneVerification.create({
          data: {
            userId: user?.id || null, // null for pre-registration
            phone,
            otp,
            expiresAt,
          },
        });
      }

      // Send OTP SMS
      const smsSent = await this.smsService.sendOtpSms(phone, otp);
      
      if (!smsSent) {
        throw new BadRequestException('Failed to send OTP SMS');
      }

      return {
        message: 'OTP sent to your phone number',
        success: true
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to send OTP');
    }
  }

  /**
   * Check Email/Phone Availability
   */
  async checkAvailability(type: 'email' | 'phone', value: string): Promise<{ available: boolean; message: string }> {
    try {
      // Check if user already exists with this email/phone
      let existingUser;
      if (type === 'email') {
        existingUser = await this.prisma.user.findUnique({
          where: { email: value, isActive: true, isDeleted: false }
        });
      } else {
        existingUser = await this.prisma.user.findUnique({
          where: { phone: value, isActive: true, isDeleted: false }
        });
      }

      if (existingUser) {
        return {
          available: false,
          message: `${type === 'email' ? 'Email' : 'Phone number'} is already taken. Please use a different one.`
        };
      }

      return {
        available: true,
        message: `${type === 'email' ? 'Email' : 'Phone number'} is available.`
      };
    } catch (error) {
      throw new BadRequestException(`Failed to check ${type} availability`);
    }
  }

  /**
   * Test Simple Email (for debugging)
   */
  async testSimpleEmail(email: string): Promise<{ message: string; success: boolean }> {
    try {
      // this.logger.log(`Testing simple email to: ${email}`); // Original code had this line commented out
      
      if (!this.emailService) {
        throw new Error('Email service not available');
      }

      // Send a simple test email
      const emailSent = await this.emailService.sendOtpEmail(email, '123456', 'Test User');
      
      if (!emailSent) {
        throw new Error('Failed to send test email');
      }

      return {
        message: 'Simple test email sent successfully',
        success: true
      };
    } catch (error) {
      // this.logger.error('Simple email test failed:', error); // Original code had this line commented out
      throw new BadRequestException(error.message || 'Failed to send test email');
    }
  }
} 