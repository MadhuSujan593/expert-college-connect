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
      this.logger.log('Initializing Twilio client...');
      this.logger.log(`Twilio Account SID: ${this.configService.get('TWILIO_ACCOUNT_SID') ? '***SET***' : 'NOT SET'}`);
      this.logger.log(`Twilio Auth Token: ${this.configService.get('TWILIO_AUTH_TOKEN') ? '***SET***' : 'NOT SET'}`);
      this.logger.log(`Twilio Phone Number: ${this.configService.get('TWILIO_PHONE_NUMBER')}`);

      const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
      const authToken = this.configService.get('TWILIO_AUTH_TOKEN');

      if (!accountSid || !authToken) {
        this.logger.warn('Twilio credentials not configured, SMS service will not work');
        this.client = null;
        return;
      }

      this.client = twilio(accountSid, authToken);
      this.logger.log('Twilio client initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Twilio client:', error);
      this.client = null;
    }
  }

  /**
   * Send OTP SMS
   */
  async sendOtpSms(phone: string, otp: string): Promise<boolean> {
    try {
      this.logger.log(`Attempting to send OTP SMS to: ${phone}`);
      this.logger.log(`OTP: ${otp}`);
      this.logger.log(`Twilio client available: ${this.client ? 'YES' : 'NO'}`);
      this.logger.log(`NODE_ENV: ${this.configService.get('NODE_ENV')}`);

      // In development mode or if Twilio fails, just log the OTP
      if (this.configService.get('NODE_ENV') === 'development' || !this.client) {
        this.logger.log(`[DEV MODE] OTP for ${phone}: ${otp}`);
        this.logger.log(`[DEV MODE] SMS would be sent to: ${phone}`);
        return true;
      }

      const message = `Your Expert College Connect verification code is: ${otp}. This code will expire in 10 minutes. Do not share this code with anyone.`;

      this.logger.log('Sending SMS via Twilio...');
      const result = await this.client.messages.create({
        body: message,
        from: this.configService.get('TWILIO_PHONE_NUMBER'),
        to: phone
      });

      this.logger.log(`OTP SMS sent successfully to ${phone}. Message SID: ${result.sid}`);
      this.logger.log('SMS result:', {
        sid: result.sid,
        status: result.status,
        to: result.to,
        from: result.from,
        body: result.body
      });

      return true;
    } catch (error) {
      this.logger.error(`Failed to send OTP SMS to ${phone}:`, error);
      this.logger.error('SMS Error Details:', {
        code: error.code,
        message: error.message,
        status: error.status,
        stack: error.stack
      });
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