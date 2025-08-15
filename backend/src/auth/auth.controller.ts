import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { 
  LoginDto, 
  RegisterDto, 
  RefreshTokenDto, 
  ForgotPasswordDto, 
  ResetPasswordDto,
  VerifyEmailDto,
  VerifyPhoneDto
} from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('verify-password-reset-otp')
  async verifyPasswordResetOtp(@Body() body: { email: string; otp: string }) {
    return this.authService.verifyPasswordResetOtp(body.email, body.otp);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('verify-email')
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('verify-phone')
  async verifyPhone(@Body() verifyPhoneDto: VerifyPhoneDto) {
    return this.authService.verifyPhone(verifyPhoneDto);
  }

  @Post('send-email-otp')
  async sendEmailOtp(@Body() body: { email: string; userName?: string }) {
    return this.authService.sendEmailOtp(body.email, body.userName);
  }

  @Post('send-phone-otp')
  async sendPhoneOtp(@Body() body: { phone: string; userName?: string }) {
    return this.authService.sendPhoneOtp(body.phone, body.userName);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: Request) {
    return this.authService.logout((req.user as any).id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: Request) {
    return req.user;
  }

  @Post('test-email')
  async testEmail(@Body() body: { email: string; userName?: string }) {
    try {
      // Test email service directly
      const result = await this.authService.sendEmailOtp(body.email, body.userName);
      return { success: true, message: 'Test email sent', result };
    } catch (error) {
      return { 
        success: false, 
        message: 'Test email failed', 
        error: error.message,
        stack: error.stack 
      };
    }
  }

  @Post('test-simple-email')
  async testSimpleEmail(@Body() body: { email: string }) {
    return this.authService.testSimpleEmail(body.email);
  }

  @Post('check-availability')
  async checkAvailability(@Body() body: { type: 'email' | 'phone'; value: string }) {
    return this.authService.checkAvailability(body.type, body.value);
  }
} 