import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private client: twilio.Twilio | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initializeTwilio();
  }

  private initializeTwilio() {
    try {
      const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
      const authToken = this.configService.get('TWILIO_AUTH_TOKEN');

      if (!accountSid || !authToken) {
        this.logger.warn('Twilio credentials not configured, SMS service will use development mode');
        this.client = null;
        return;
      }

      this.client = twilio(accountSid, authToken);
      this.logger.log('Twilio SMS service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Twilio client:', error);
      this.client = null;
    }
  }

  /**
   * Normalize phone number to E.164 format
   */
  private normalizePhoneNumber(phone: string): string {
    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // If it doesn't start with +, add it
    if (!cleaned.startsWith('+')) {
      cleaned = `+${cleaned}`;
    }
    
    // Remove all non-digit characters after +
    const digits = cleaned.substring(1).replace(/\D/g, '');
    
    return `+${digits}`;
  }

  /**
   * Validate phone number format
   */
  private isValidPhoneNumber(phone: string): boolean {
    const normalized = this.normalizePhoneNumber(phone);
    // Basic validation for E.164 format
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(normalized);
  }

  /**
   * Send OTP SMS
   */
  async sendOtpSms(phone: string, otp: string): Promise<boolean> {
    try {
      // Normalize and validate phone number
      const normalizedPhone = this.normalizePhoneNumber(phone);

      if (!this.isValidPhoneNumber(phone)) {
        this.logger.error(`Invalid phone number format: ${phone}`);
        return false;
      }

      // Check if we're in development mode or no Twilio client
      if (this.configService.get('NODE_ENV') === 'development' || !this.client) {
        this.logger.log(`[DEV MODE] OTP SMS would be sent to ${normalizedPhone}: ${otp}`);
        return true;
      }

      const message = `Your Expert College Connect verification code is: ${otp}

Valid for 10 minutes. Do not share.`;

      if (!this.client) {
        this.logger.error('Twilio client is null - cannot send SMS');
        return false;
      }
      
      const result = await this.client.messages.create({
        body: message,
        from: this.configService.get('TWILIO_PHONE_NUMBER'),
        to: normalizedPhone
      });

      this.logger.log(`SMS sent successfully to ${normalizedPhone}. Message SID: ${result.sid}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send OTP SMS to ${phone}:`, error.message);
      return false;
    }
  }

  /**
   * Send Welcome SMS
   */
  async sendWelcomeSms(phone: string, userName: string): Promise<boolean> {
    try {
      if (this.configService.get('NODE_ENV') === 'development' || !this.client) {
        this.logger.log(`[DEV MODE] Welcome SMS would be sent to: ${phone}`);
        return true;
      }

      const message = `Welcome to Expert College Connect, ${userName}! Your account has been successfully verified. You're now ready to connect with experts and colleges.`;

      const result = await this.client.messages.create({
        body: message,
        from: this.configService.get('TWILIO_PHONE_NUMBER'),
        to: phone
      });

      this.logger.log(`Welcome SMS sent successfully to ${phone}. Message SID: ${result.sid}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send welcome SMS to ${phone}:`, error);
      return false;
    }
  }

  /**
   * Send Password Reset SMS
   */
  async sendPasswordResetSms(phone: string, resetToken: string, userName: string): Promise<boolean> {
    try {
      if (this.configService.get('NODE_ENV') === 'development' || !this.client) {
        this.logger.log(`[DEV MODE] Password reset SMS would be sent to: ${phone}`);
        return true;
      }

      const message = `Hello ${userName}! Your Expert College Connect password reset code is: ${resetToken}. This code will expire in 1 hour. If you didn't request this, please ignore this message.`;

      const result = await this.client.messages.create({
        body: message,
        from: this.configService.get('TWILIO_PHONE_NUMBER'),
        to: phone
      });

      this.logger.log(`Password reset SMS sent successfully to ${phone}. Message SID: ${result.sid}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send password reset SMS to ${phone}:`, error);
      return false;
    }
  }
} 