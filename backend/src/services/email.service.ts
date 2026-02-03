import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import PDFDocument from 'pdfkit';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    try {
      this.logger.log('Initializing SMTP transporter...');
      this.logger.log(`SMTP Host: ${this.configService.get('SMTP_HOST')}`);
      this.logger.log(`SMTP Port: ${this.configService.get('SMTP_PORT')}`);
      this.logger.log(`SMTP Secure: ${this.configService.get('SMTP_SECURE')}`);
      this.logger.log(`SMTP User: ${this.configService.get('SMTP_USER')}`);
      this.logger.log(`SMTP Pass: ${this.configService.get('SMTP_PASS') ? '***SET***' : 'NOT SET'}`);

      this.transporter = nodemailer.createTransport({
        host: this.configService.get('SMTP_HOST'),
        port: this.configService.get('SMTP_PORT'),
        secure: this.configService.get('SMTP_SECURE') === 'true',
        auth: {
          user: this.configService.get('SMTP_USER'),
          pass: this.configService.get('SMTP_PASS'),
        },
      });

      // Verify connection configuration
      this.logger.log('Verifying SMTP connection...');
      await this.transporter.verify();
      this.logger.log('SMTP connection established successfully');
    } catch (error) {
      this.logger.error('Failed to initialize SMTP transporter:', error);
      this.logger.error('SMTP Error Details:', {
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode
      });
      // Fallback to development mode
      this.transporter = null;
    }
  }

  /**
   * Send OTP Email
   */
  async sendOtpEmail(email: string, otp: string, userName: string): Promise<boolean> {
    try {
      this.logger.log(`Attempting to send OTP email to: ${email}`);
      this.logger.log(`User Name: ${userName}`);
      this.logger.log(`OTP: ${otp}`);
      this.logger.log(`Transporter available: ${this.transporter ? 'YES' : 'NO'}`);
      this.logger.log(`NODE_ENV: ${this.configService.get('NODE_ENV')}`);

      // In development mode or if SMTP fails, just log the OTP
      if (this.configService.get('NODE_ENV') === 'development' || !this.transporter) {
        this.logger.log(`[DEV MODE] OTP for ${email}: ${otp}`);
        this.logger.log(`[DEV MODE] Email would be sent to: ${email}`);
        return true;
      }

      this.logger.log('Preparing email template...');
      const emailTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              line-height: 1.6; 
              color: #2d3748; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 20px;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white; 
              border-radius: 20px; 
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            .header { 
              background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
              color: white; 
              padding: 40px 30px; 
              text-align: center; 
              position: relative;
            }
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
              opacity: 0.3;
            }
            .logo { 
              font-size: 28px; 
              font-weight: 700; 
              margin-bottom: 8px; 
              position: relative;
              z-index: 1;
            }
            .subtitle { 
              font-size: 16px; 
              opacity: 0.9; 
              font-weight: 400;
              position: relative;
              z-index: 1;
            }
            .content { 
              padding: 40px 30px; 
              background: white;
            }
            .greeting { 
              font-size: 24px; 
              font-weight: 600; 
              color: #2d3748; 
              margin-bottom: 20px;
              text-align: center;
            }
            .description { 
              font-size: 16px; 
              color: #4a5568; 
              margin-bottom: 30px; 
              text-align: center;
              line-height: 1.7;
            }
            .otp-container {
              text-align: center;
              margin: 30px 0;
            }
            .otp-box { 
              background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
              color: white; 
              padding: 25px; 
              border-radius: 15px; 
              margin: 20px auto; 
              font-size: 32px; 
              font-weight: 700; 
              letter-spacing: 8px; 
              max-width: 300px;
              box-shadow: 0 10px 30px rgba(79, 70, 229, 0.3);
              position: relative;
              overflow: hidden;
            }
            .otp-box::before {
              content: '';
              position: absolute;
              top: -50%;
              left: -50%;
              width: 200%;
              height: 200%;
              background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
              transform: rotate(45deg);
              animation: shine 3s infinite;
            }
            @keyframes shine {
              0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
              100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
            }
            .otp-text {
              position: relative;
              z-index: 1;
            }
            .important-section {
              background: #f7fafc;
              border-left: 4px solid #4f46e5;
              padding: 20px;
              border-radius: 8px;
              margin: 30px 0;
            }
            .important-title { 
              font-size: 18px; 
              font-weight: 600; 
              color: #2d3748; 
              margin-bottom: 15px;
            }
            .important-list { 
              list-style: none; 
              padding: 0;
            }
            .important-list li { 
              padding: 8px 0; 
              color: #4a5568;
              position: relative;
              padding-left: 25px;
            }
            .important-list li::before {
              content: '✓';
              position: absolute;
              left: 0;
              color: #4f46e5;
              font-weight: bold;
              font-size: 16px;
            }
            .closing { 
              text-align: center; 
              margin: 30px 0 20px 0;
              color: #4a5568;
            }
            .team-name {
              font-weight: 600;
              color: #2d3748;
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              padding: 20px; 
              color: #718096; 
              font-size: 14px;
              background: #f7fafc;
              border-top: 1px solid #e2e8f0;
            }
            .social-links {
              margin: 20px 0;
              text-align: center;
            }
            .social-links a {
              display: inline-block;
              margin: 0 10px;
              color: #4f46e5;
              text-decoration: none;
              font-weight: 500;
            }
            .social-links a:hover {
              text-decoration: underline;
            }
            @media (max-width: 600px) {
              .container { margin: 10px; border-radius: 15px; }
              .header { padding: 30px 20px; }
              .content { padding: 30px 20px; }
              .otp-box { font-size: 28px; letter-spacing: 6px; padding: 20px; }
              .logo { font-size: 24px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🎓 VMS Techhub</div>
              <div class="subtitle">Email Verification</div>
            </div>
            <div class="content">
              <div class="greeting">Hello {{userName}}! 👋</div>
              <div class="description">
                Thank you for joining <strong>VMS Techhub</strong>! To complete your registration and unlock all features, please use the verification code below.
              </div>
              
              <div class="otp-container">
                <div class="otp-box">
                  <div class="otp-text">{{otp}}</div>
                </div>
              </div>
              
              <div class="important-section">
                <div class="important-title">🔐 Important Security Notes:</div>
                <ul class="important-list">
                  <li>This verification code will expire in 10 minutes</li>
                  <li>Never share this code with anyone, including our support team</li>
                  <li>If you didn't request this code, please ignore this email</li>
                  <li>For security, this code can only be used once</li>
                </ul>
              </div>
              
              <div class="closing">
                <p>Ready to start your educational journey?</p>
                <p class="team-name">The VMS Techhub Team</p>
              </div>
            </div>
            <div class="footer">
              <div class="social-links">
                <a href="#">Website</a> • 
                <a href="#">Support</a> • 
                <a href="#">Privacy Policy</a>
              </div>
              <p>This is an automated message, please do not reply to this email.</p>
              <p style="margin-top: 10px; font-size: 12px; color: #a0aec0;">
                © 2025 VMS Techhub. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      this.logger.log('Compiling email template...');
      const template = handlebars.compile(emailTemplate);
      const htmlContent = template({ userName, otp });

      this.logger.log('Preparing mail options...');
      const mailOptions = {
        from: `"VMS Techhub" <${this.configService.get('SMTP_USER')}>`,
        to: email,
        subject: 'Verify Your Email Address - VMS Techhub',
        html: htmlContent,
        text: `Hello ${userName}!\n\nYour verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nBest regards,\nThe VMS Techhub Team`,
      };

      this.logger.log('Mail options prepared:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      });

      this.logger.log('Sending email via SMTP...');
      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`OTP email sent successfully to ${email}. Message ID: ${result.messageId}`);
      this.logger.log('Email result:', result);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${email}:`, error);
      this.logger.error('Email Error Details:', {
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode,
        stack: error.stack
      });
      return false;
    }
  }

  /**
   * Send Welcome Email
   */
  async sendWelcomeEmail(email: string, userName: string): Promise<boolean> {
    try {
      if (this.configService.get('NODE_ENV') === 'development' || !this.transporter) {
        this.logger.log(`[DEV MODE] Welcome email would be sent to: ${email}`);
        return true;
      }

      const emailTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to VMS Techhub</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              line-height: 1.6; 
              color: #2d3748; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 20px;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white; 
              border-radius: 20px; 
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            .header { 
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white; 
              padding: 40px 30px; 
              text-align: center; 
              position: relative;
            }
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
              opacity: 0.3;
            }
            .logo { 
              font-size: 28px; 
              font-weight: 700; 
              margin-bottom: 8px; 
              position: relative;
              z-index: 1;
            }
            .subtitle { 
              font-size: 16px; 
              opacity: 0.9; 
              font-weight: 400;
              position: relative;
              z-index: 1;
            }
            .content { 
              padding: 40px 30px; 
              background: white;
            }
            .greeting { 
              font-size: 24px; 
              font-weight: 600; 
              color: #2d3748; 
              margin-bottom: 20px;
              text-align: center;
            }
            .description { 
              font-size: 16px; 
              color: #4a5568; 
              margin-bottom: 30px; 
              text-align: center;
              line-height: 1.7;
            }
            .features-section {
              background: #f0f9ff;
              border-radius: 15px;
              padding: 25px;
              margin: 30px 0;
              border: 1px solid #e0f2fe;
            }
            .features-title { 
              font-size: 18px; 
              font-weight: 600; 
              color: #0c4a6e; 
              margin-bottom: 20px;
              text-align: center;
            }
            .features-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 20px;
              margin-top: 20px;
            }
            .feature-item {
              text-align: center;
              padding: 15px;
              background: white;
              border-radius: 10px;
              border: 1px solid #e0f2fe;
            }
            .feature-icon {
              font-size: 24px;
              margin-bottom: 10px;
            }
            .feature-text {
              font-size: 14px;
              color: #0c4a6e;
              font-weight: 500;
            }
            .cta-section {
              text-align: center;
              margin: 30px 0;
            }
            .cta-button { 
              display: inline-block; 
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white; 
              padding: 15px 30px; 
              text-decoration: none; 
              border-radius: 25px; 
              margin: 20px 0; 
              font-weight: 600;
              font-size: 16px;
              box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
              transition: all 0.3s ease;
            }
            .cta-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 12px 35px rgba(16, 185, 129, 0.4);
            }
            .closing { 
              text-align: center; 
              margin: 30px 0 20px 0;
              color: #4a5568;
            }
            .team-name {
              font-weight: 600;
              color: #2d3748;
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              padding: 20px; 
              color: #718096; 
              font-size: 14px;
              background: #f7fafc;
              border-top: 1px solid #e2e8f0;
            }
            .social-links {
              margin: 20px 0;
              text-align: center;
            }
            .social-links a {
              display: inline-block;
              margin: 0 10px;
              color: #10b981;
              text-decoration: none;
              font-weight: 500;
            }
            .social-links a:hover {
              text-decoration: underline;
            }
            @media (max-width: 600px) {
              .container { margin: 10px; border-radius: 15px; }
              .header { padding: 30px 20px; }
              .content { padding: 30px 20px; }
              .features-grid { grid-template-columns: 1fr; }
              .logo { font-size: 24px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🎉 VMS Techhub</div>
              <div class="subtitle">Welcome to Your Educational Journey!</div>
            </div>
            <div class="content">
              <div class="greeting">Hello {{userName}}! 🎓</div>
              <div class="description">
                Welcome to <strong>VMS Techhub</strong>! Your account has been successfully verified and you're now ready to connect with experts and colleges worldwide.
              </div>
              
              <div class="features-section">
                <div class="features-title">🚀 What You Can Do Now:</div>
                <div class="features-grid">
                  <div class="feature-item">
                    <div class="feature-icon">👤</div>
                    <div class="feature-text">Complete Your Profile</div>
                  </div>
                  <div class="feature-item">
                    <div class="feature-icon">🔍</div>
                    <div class="feature-text">Browse Available Experts</div>
                  </div>
                  <div class="feature-item">
                    <div class="feature-icon">🏫</div>
                    <div class="feature-text">Connect with Colleges</div>
                  </div>
                  <div class="feature-item">
                    <div class="feature-icon">💡</div>
                    <div class="feature-text">Start Your Journey</div>
                  </div>
                </div>
              </div>
              
              <div class="cta-section">
                <a href="{{frontendUrl}}" class="cta-button">🚀 Get Started Now</a>
              </div>
              
              <div class="closing">
                <p>If you have any questions, our support team is here to help!</p>
                <p class="team-name">The VMS Techhub Team</p>
              </div>
            </div>
            <div class="footer">
              <div class="social-links">
                <a href="#">Website</a> • 
                <a href="#">Support</a> • 
                <a href="#">Privacy Policy</a>
              </div>
              <p>This is an automated message, please do not reply to this email.</p>
              <p style="margin-top: 10px; font-size: 12px; color: #a0aec0;">
                © 2025 VMS Techhub. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      const template = handlebars.compile(emailTemplate);
      const htmlContent = template({
        userName,
        frontendUrl: this.configService.get('CORS_ORIGIN') || 'http://localhost:5173'
      });

      const mailOptions = {
        from: `"VMS Techhub" <${this.configService.get('SMTP_USER')}>`,
        to: email,
        subject: 'Welcome to VMS Techhub! 🎉',
        html: htmlContent,
        text: `Hello ${userName}!\n\nWelcome to VMS Techhub! Your account has been successfully verified.\n\nGet started by visiting our platform and completing your profile.\n\nBest regards,\nThe VMS Techhub Team`,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Welcome email sent successfully to ${email}. Message ID: ${result.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}:`, error);
      return false;
    }
  }

  /**
   * Send Password Reset OTP Email
   */
  async sendPasswordResetOtp(email: string, otp: string, userName: string): Promise<boolean> {
    try {
      this.logger.log(`Attempting to send password reset OTP email to: ${email}`);

      // In development mode or if SMTP fails, just log the OTP
      if (this.configService.get('NODE_ENV') === 'development' || !this.transporter) {
        this.logger.log(`[DEV MODE] Password Reset OTP for ${email}: ${otp}`);
        return true;
      }

      const emailTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Code</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              line-height: 1.6; 
              color: #2d3748; 
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
              padding: 20px;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white; 
              border-radius: 20px; 
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            .header { 
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
              color: white; 
              padding: 40px 30px; 
              text-align: center; 
              position: relative;
            }
            .header::before {
              content: '';
              position: absolute;
              top: 0; left: 0; right: 0; bottom: 0;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
              opacity: 0.3;
            }
            .logo { 
              font-size: 28px; 
              font-weight: 700; 
              margin-bottom: 8px; 
              position: relative; z-index: 1;
            }
            .subtitle { 
              font-size: 16px; 
              opacity: 0.9; 
              font-weight: 400;
              position: relative; z-index: 1;
            }
            .content { padding: 40px 30px; background: white; }
            .greeting { 
              font-size: 24px; 
              font-weight: 600; 
              color: #2d3748; 
              margin-bottom: 20px;
              text-align: center;
            }
            .description { 
              font-size: 16px; 
              color: #4a5568; 
              margin-bottom: 30px; 
              text-align: center;
              line-height: 1.7;
            }
            .otp-container { text-align: center; margin: 30px 0; }
            .otp-box { 
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
              color: white; 
              padding: 25px; 
              border-radius: 15px; 
              margin: 20px auto; 
              font-size: 32px; 
              font-weight: 700; 
              letter-spacing: 8px; 
              max-width: 300px;
              box-shadow: 0 10px 30px rgba(239, 68, 68, 0.3);
              position: relative; overflow: hidden;
            }
            .otp-text { position: relative; z-index: 1; }
            .important-section {
              background: #fef2f2;
              border-left: 4px solid #ef4444;
              padding: 20px;
              border-radius: 8px;
              margin: 30px 0;
            }
            .important-title { 
              font-size: 18px; 
              font-weight: 600; 
              color: #991b1b; 
              margin-bottom: 15px;
            }
            .important-list { list-style: none; padding: 0; }
            .important-list li { 
              padding: 8px 0; 
              color: #7f1d1d;
              position: relative; padding-left: 25px;
            }
            .important-list li::before {
              content: '⚠️';
              position: absolute; left: 0;
              font-size: 14px;
            }
            .closing { 
              text-align: center; 
              margin: 30px 0 20px 0;
              color: #4a5568;
            }
            .team-name { font-weight: 600; color: #2d3748; }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              padding: 20px; 
              color: #718096; 
              font-size: 14px;
              background: #f7fafc;
              border-top: 1px solid #e2e8f0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🔐 VMS Techhub</div>
              <div class="subtitle">Password Reset Code</div>
            </div>
            <div class="content">
              <div class="greeting">Hello {{userName}}! 🔑</div>
              <div class="description">
                We received a request to reset your password for your <strong>VMS Techhub</strong> account. Use the verification code below to proceed with resetting your password.
              </div>
              
              <div class="otp-container">
                <div class="otp-box">
                  <div class="otp-text">{{otp}}</div>
                </div>
              </div>
              
              <div class="important-section">
                <div class="important-title">🔒 Security Information:</div>
                <ul class="important-list">
                  <li>This verification code will expire in 10 minutes</li>
                  <li>Never share this code with anyone</li>
                  <li>If you didn't request this reset, please ignore this email</li>
                  <li>This code can only be used once</li>
                </ul>
              </div>
              
              <div class="closing">
                <p>Need help? Contact our support team.</p>
                <p class="team-name">The VMS Techhub Team</p>
              </div>
            </div>
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
              <p style="margin-top: 10px; font-size: 12px; color: #a0aec0;">
                © 2025 VMS Techhub. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      const template = handlebars.compile(emailTemplate);
      const htmlContent = template({ userName, otp });

      const mailOptions = {
        from: `"VMS Techhub" <${this.configService.get('SMTP_USER')}>`,
        to: email,
        subject: 'Password Reset Code - VMS Techhub',
        html: htmlContent,
        text: `Hello ${userName}!\n\nYour password reset verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nBest regards,\nThe VMS Techhub Team`,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset OTP email sent successfully to ${email}. Message ID: ${result.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send password reset OTP email to ${email}:`, error);
      return false;
    }
  }

  /**
   * Send Password Reset Email
   */
  async sendPasswordResetEmail(email: string, resetToken: string, userName: string): Promise<boolean> {
    try {
      if (this.configService.get('NODE_ENV') === 'development' || !this.transporter) {
        this.logger.log(`[DEV MODE] Password reset email would be sent to: ${email}`);
        return true;
      }

      const resetUrl = `${this.configService.get('CORS_ORIGIN') || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

      const emailTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Request</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #EF4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .cta-button { display: inline-block; background: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hello {{userName}}!</h2>
              <p>We received a request to reset your password for your VMS Techhub account.</p>
              
              <p>Click the button below to reset your password:</p>
              
              <a href="{{resetUrl}}" class="cta-button">Reset Password</a>
              
              <p><strong>Important:</strong></p>
              <ul>
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Your current password will remain unchanged</li>
              </ul>
              
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #4F46E5;">{{resetUrl}}</p>
              
              <p>Best regards,<br>The VMS Techhub Team</p>
            </div>
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const template = handlebars.compile(emailTemplate);
      const htmlContent = template({ userName, resetUrl });

      const mailOptions = {
        from: `"VMS Techhub" <${this.configService.get('SMTP_USER')}>`,
        to: email,
        subject: 'Password Reset Request - VMS Techhub',
        html: htmlContent,
        text: `Hello ${userName}!\n\nWe received a request to reset your password.\n\nClick this link to reset your password: ${resetUrl}\n\nThis link will expire in 1 hour.\n\nBest regards,\nThe VMS Techhub Team`,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent successfully to ${email}. Message ID: ${result.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}:`, error);
      return false;
    }
  }

  /**
   * Send Contact Form Email to Admin
   */
  async sendContactEmail(to: string, mailOptions: any): Promise<boolean> {
    try {
      this.logger.log(`Attempting to send contact email to: ${to}`);

      // In development mode or if SMTP fails, just log the email
      if (this.configService.get('NODE_ENV') === 'development' || !this.transporter) {
        this.logger.log(`[DEV MODE] Contact email would be sent to: ${to}`);
        this.logger.log(`[DEV MODE] Subject: ${mailOptions.subject}`);
        this.logger.log(`[DEV MODE] Content preview: ${mailOptions.text?.substring(0, 100)}...`);
        return true;
      }

      this.logger.log('Sending contact email via SMTP...');
      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Contact email sent successfully to ${to}. Message ID: ${result.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send contact email to ${to}:`, error);
      return false;
    }
  }

  /**
   * Send New Application Email to College Admin
   */
  async sendNewApplicationEmail(
    collegeEmail: string,
    collegeName: string,
    expertName: string,
    expertExpertise: string,
    requirementTitle: string,
    applicationId: string
  ): Promise<boolean> {
    try {
      this.logger.log(`[sendNewApplicationEmail] Called with params:`, {
        collegeEmail,
        collegeName,
        expertName,
        expertExpertise,
        requirementTitle,
        applicationId,
        nodeEnv: this.configService.get('NODE_ENV'),
        hasTransporter: !!this.transporter
      });

      if (this.configService.get('NODE_ENV') === 'development' || !this.transporter) {
        this.logger.log(`[DEV MODE] New application email would be sent to: ${collegeEmail}`);
        return true;
      }

      const frontendUrl = this.configService.get('CORS_ORIGIN') || 'http://localhost:5173';
      const applicationUrl = `${frontendUrl}/dashboard/college?tab=applications&applicationId=${applicationId}`;

      const emailTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Expert Application - VMS Techhub</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
              line-height: 1.6; 
              color: #1a202c; 
              background-color: #f7fafc;
              padding: 0;
              margin: 0;
            }
            .email-wrapper {
              background-color: #f7fafc;
              padding: 40px 20px;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: #ffffff; 
              border-radius: 8px; 
              box-shadow: 0 2px 8px rgba(0,0,0,0.08);
              overflow: hidden;
            }
            .header { 
              background: #1a202c;
              color: #ffffff; 
              padding: 32px 40px; 
              text-align: left;
              border-bottom: 3px solid #4f46e5;
            }
            .logo { 
              font-size: 20px; 
              font-weight: 700; 
              letter-spacing: -0.5px;
              margin-bottom: 4px;
            }
            .subtitle { 
              font-size: 13px; 
              color: #cbd5e0;
              font-weight: 400;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .content { 
              padding: 40px;
              background: #ffffff;
            }
            .greeting { 
              font-size: 20px; 
              font-weight: 600; 
              color: #1a202c; 
              margin-bottom: 16px;
              line-height: 1.4;
            }
            .description { 
              font-size: 15px; 
              color: #4a5568; 
              margin-bottom: 32px; 
              line-height: 1.7;
            }
            .info-card {
              background: #f7fafc;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              padding: 24px;
              margin: 32px 0;
            }
            .info-item {
              margin-bottom: 16px;
              padding-bottom: 16px;
              border-bottom: 1px solid #e2e8f0;
            }
            .info-item:last-child {
              margin-bottom: 0;
              padding-bottom: 0;
              border-bottom: none;
            }
            .info-label {
              font-size: 12px;
              font-weight: 600;
              color: #718096;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 6px;
            }
            .info-value {
              font-size: 16px;
              color: #1a202c;
              font-weight: 500;
            }
            .cta-section {
              text-align: center;
              margin: 32px 0;
            }
            .cta-button { 
              display: inline-block; 
              background: #3b82f6 !important;
              color: #ffffff !important; 
              padding: 14px 32px; 
              text-decoration: none; 
              border-radius: 6px; 
              font-weight: 700;
              font-size: 16px;
              transition: background-color 0.2s;
              box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
              letter-spacing: 0.3px;
            }
            .cta-button:hover {
              background: #2563eb !important;
              color: #ffffff !important;
              box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
            }
            .footer { 
              background: #f7fafc;
              border-top: 1px solid #e2e8f0;
              padding: 24px 40px; 
              text-align: center;
            }
            .footer-text {
              color: #718096; 
              font-size: 13px;
              line-height: 1.6;
            }
            .footer-copyright {
              color: #a0aec0;
              font-size: 12px;
              margin-top: 12px;
            }
            @media (max-width: 600px) {
              .email-wrapper { padding: 20px 10px; }
              .container { border-radius: 4px; }
              .header { padding: 24px 24px; }
              .content { padding: 32px 24px; }
              .footer { padding: 20px 24px; }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="container">
              <div class="header">
                <div class="logo">VMS Techhub</div>
                <div class="subtitle">New Application</div>
              </div>
              <div class="content">
                <div class="greeting">Dear {{collegeName}},</div>
                <div class="description">
                  Great news! A new expert has submitted an application for your requirement.
                </div>
                
                <div class="info-card">
                  <div class="info-item">
                    <div class="info-label">Name</div>
                    <div class="info-value">{{expertName}}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Requirement Title</div>
                    <div class="info-value">{{requirementTitle}}</div>
                  </div>
                </div>
                
                <div class="cta-section">
                  <a href="{{applicationUrl}}" class="cta-button">View Application</a>
                </div>
                
                <div class="description" style="margin-top: 32px; font-size: 14px; color: #718096;">
                  Please log in to your dashboard to view the complete application details and take appropriate action.
                </div>
              </div>
              <div class="footer">
                <div class="footer-text">
                  This is an automated notification from VMS Techhub.
                </div>
                <div class="footer-copyright">
                  © 2025 VMS Techhub. All rights reserved.
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      const template = handlebars.compile(emailTemplate);
      const htmlContent = template({
        collegeName,
        expertName,
        expertExpertise,
        requirementTitle,
        applicationUrl
      });

      const mailOptions = {
        from: `"VMS Techhub" <${this.configService.get('SMTP_USER')}>`,
        to: collegeEmail,
        subject: `New Application from ${expertName} - ${requirementTitle}`,
        html: htmlContent,
        text: `Hello ${collegeName}!\n\nGreat news! A new expert has submitted an application for your requirement: "${requirementTitle}".\n\nView the application: ${applicationUrl}\n\nBest regards,\nThe VMS Techhub Team`,
        headers: {
          'X-Entity-Ref-ID': applicationId,
          'Message-ID': `<application-${applicationId}-${Date.now()}@vms-techhub.com>`,
          'X-Prevent-Threading': '1'
        }
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`New application email sent successfully to ${collegeEmail}. Message ID: ${result.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send new application email to ${collegeEmail}:`, error);
      return false;
    }
  }

  /**
   * Send Application Status Update Email to Expert
   */
  async sendApplicationStatusUpdateEmail(
    expertEmail: string,
    expertName: string,
    requirementTitle: string,
    collegeName: string,
    status: string,
    reviewNotes?: string
  ): Promise<boolean> {
    try {
      if (this.configService.get('NODE_ENV') === 'development' || !this.transporter) {
        this.logger.log(`[DEV MODE] Application status update email would be sent to: ${expertEmail}`);
        return true;
      }

      const frontendUrl = this.configService.get('CORS_ORIGIN') || 'http://localhost:5173';
      const isShortlisted = status === 'SHORTLISTED';
      const statusColor = isShortlisted ? '#10b981' : '#ef4444';
      const statusEmoji = isShortlisted ? '🎉' : '📋';
      const statusText = isShortlisted ? 'Shortlisted' : 'Rejected';

      const emailTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Application Status Update - VMS Techhub</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
              line-height: 1.6; 
              color: #1a202c; 
              background-color: #f7fafc;
              padding: 0;
              margin: 0;
            }
            .email-wrapper {
              background-color: #f7fafc;
              padding: 40px 20px;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: #ffffff; 
              border-radius: 8px; 
              box-shadow: 0 2px 8px rgba(0,0,0,0.08);
              overflow: hidden;
            }
            .header { 
              background: #1a202c;
              color: #ffffff; 
              padding: 32px 40px; 
              text-align: left;
              border-bottom: 3px solid ${statusColor};
            }
            .logo { 
              font-size: 20px; 
              font-weight: 700; 
              letter-spacing: -0.5px;
              margin-bottom: 4px;
            }
            .subtitle { 
              font-size: 13px; 
              color: #cbd5e0;
              font-weight: 400;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .content { 
              padding: 40px;
              background: #ffffff;
            }
            .greeting { 
              font-size: 20px; 
              font-weight: 600; 
              color: #1a202c; 
              margin-bottom: 16px;
              line-height: 1.4;
            }
            .description { 
              font-size: 15px; 
              color: #4a5568; 
              margin-bottom: 32px; 
              line-height: 1.7;
            }
            .status-badge {
              background: ${isShortlisted ? '#f0fdf4' : '#fef2f2'};
              border: 2px solid ${statusColor};
              border-radius: 6px;
              padding: 16px 24px;
              margin: 32px 0;
              text-align: center;
            }
            .status-text {
              font-size: 18px;
              font-weight: 700;
              color: ${statusColor};
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .info-card {
              background: #f7fafc;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              padding: 24px;
              margin: 32px 0;
            }
            .info-item {
              margin-bottom: 16px;
              padding-bottom: 16px;
              border-bottom: 1px solid #e2e8f0;
            }
            .info-item:last-child {
              margin-bottom: 0;
              padding-bottom: 0;
              border-bottom: none;
            }
            .info-label {
              font-size: 12px;
              font-weight: 600;
              color: #718096;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 6px;
            }
            .info-value {
              font-size: 16px;
              color: #1a202c;
              font-weight: 500;
            }
            .notes-card {
              background: #fffbeb;
              border: 1px solid #fde68a;
              border-left: 4px solid #f59e0b;
              border-radius: 6px;
              padding: 20px;
              margin: 32px 0;
            }
            .notes-title {
              font-size: 13px;
              font-weight: 600;
              color: #92400e;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 12px;
            }
            .notes-content {
              font-size: 15px;
              color: #78350f;
              line-height: 1.7;
            }
            .cta-section {
              text-align: center;
              margin: 32px 0;
            }
            .cta-button { 
              display: inline-block; 
              background: ${statusColor};
              color: #ffffff; 
              padding: 14px 32px; 
              text-decoration: none; 
              border-radius: 6px; 
              font-weight: 600;
              font-size: 15px;
              transition: background-color 0.2s;
            }
            .cta-button:hover {
              opacity: 0.9;
            }
            .message-box {
              background: ${isShortlisted ? '#f0fdf4' : '#f7fafc'};
              border-left: 3px solid ${statusColor};
              padding: 20px;
              border-radius: 6px;
              margin: 32px 0;
            }
            .message-text {
              font-size: 14px;
              color: ${isShortlisted ? '#065f46' : '#4a5568'};
              line-height: 1.7;
            }
            .footer { 
              background: #f7fafc;
              border-top: 1px solid #e2e8f0;
              padding: 24px 40px; 
              text-align: center;
            }
            .footer-text {
              color: #718096; 
              font-size: 13px;
              line-height: 1.6;
            }
            .footer-copyright {
              color: #a0aec0;
              font-size: 12px;
              margin-top: 12px;
            }
            @media (max-width: 600px) {
              .email-wrapper { padding: 20px 10px; }
              .container { border-radius: 4px; }
              .header { padding: 24px 24px; }
              .content { padding: 32px 24px; }
              .footer { padding: 20px 24px; }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="container">
              <div class="header">
                <div class="logo">VMS Techhub</div>
                <div class="subtitle">Application Status Update</div>
              </div>
              <div class="content">
                <div class="greeting">Dear {{expertName}},</div>
                <div class="description">
                  We are writing to inform you that the status of your application has been updated by the college.
                </div>
                
                <div class="status-badge">
                  <div class="status-text">${statusText}</div>
                </div>
                
                <div class="info-card">
                  <div class="info-item">
                    <div class="info-label">Requirement Title</div>
                    <div class="info-value">{{requirementTitle}}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Institution</div>
                    <div class="info-value">{{collegeName}}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Application Status</div>
                    <div class="info-value">${statusText}</div>
                  </div>
                </div>
                
                {{#if reviewNotes}}
                <div class="notes-card">
                  <div class="notes-title">Review Notes</div>
                  <div class="notes-content">{{reviewNotes}}</div>
                </div>
                {{/if}}
                
                <div class="cta-section">
                  <a href="{{frontendUrl}}/dashboard/expert?tab=applications" class="cta-button">View My Applications</a>
                </div>
                
                <div class="message-box">
                  <div class="message-text">
                    ${isShortlisted
          ? 'Congratulations! Your application has been shortlisted. The college may contact you directly for the next steps in the selection process.'
          : 'Thank you for your interest in this opportunity. We encourage you to explore other requirements that align with your expertise and continue applying.'}
                  </div>
                </div>
              </div>
              <div class="footer">
                <div class="footer-text">
                  This is an automated notification from VMS Techhub.
                </div>
                <div class="footer-copyright">
                  © 2025 VMS Techhub. All rights reserved.
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      const template = handlebars.compile(emailTemplate);
      const htmlContent = template({
        expertName,
        requirementTitle,
        collegeName,
        reviewNotes: reviewNotes || null,
        frontendUrl
      });

      const mailOptions = {
        from: `"VMS Techhub" <${this.configService.get('SMTP_USER')}>`,
        to: expertEmail,
        subject: `Application ${statusText} - ${requirementTitle}`,
        html: htmlContent,
        text: `Hello ${expertName}!\n\nYour application for "${requirementTitle}" at ${collegeName} has been ${statusText.toLowerCase()}.\n\n${reviewNotes ? `Review Notes: ${reviewNotes}\n\n` : ''}View your applications: ${frontendUrl}/dashboard/expert?tab=applications\n\nBest regards,\nThe VMS Techhub Team`
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Application status update email sent successfully to ${expertEmail}. Message ID: ${result.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send application status update email to ${expertEmail}:`, error);
      return false;
    }
  }
  /**
   * Generate Invoice PDF
   */
  async generateInvoicePdf(user: any, plan: any, subscription: any, payment: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // --- Header Section ---
        doc.rect(0, 0, 595, 80).fill('#2d3748');
        doc.fillColor('#ffffff')
          .fontSize(22)
          .font('Helvetica-Bold')
          .text('VMS Techhub', 50, 30);

        doc.fontSize(8)
          .font('Helvetica')
          .text('GSTIN: 29AALCV2534Q1ZI', 50, 55);

        doc.fontSize(26)
          .font('Helvetica-Bold')
          .fillColor('#718096')
          .text('INVOICE', 350, 28, { align: 'right', width: 200 });

        // --- Bill To & Invoice Details ---
        doc.fillColor('#2d3748')
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('BILL TO:', 50, 110)
          .font('Helvetica')
          .text(user.fullName || 'Customer', 50, 125)
          .fillColor('#4a5568')
          .text(user.email, 50, 140)
          .text(user.phone || '', 50, 155);

        doc.fillColor('#2d3748')
          .font('Helvetica-Bold')
          .text('INVOICE DETAILS:', 350, 110)
          .font('Helvetica')
          .fillColor('#4a5568')
          .text(`Invoice #: ${payment.transactionId || 'INV-' + Date.now()}`, 350, 125)
          .text(`Date: ${new Date(payment.createdAt || Date.now()).toLocaleDateString()}`, 350, 140)
          .moveDown(0.2);

        // Paid Badge
        doc.rect(350, 155, 50, 18).fill('#c6f6d5');
        doc.fillColor('#22543d')
          .font('Helvetica-Bold')
          .fontSize(8)
          .text('PAID', 350, 160, { width: 50, align: 'center' });

        // --- Table ---
        const tableTop = 200;
        doc.rect(50, tableTop, 495, 25).fill('#f7fafc');

        doc.fillColor('#4a5568')
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('DESCRIPTION', 60, tableTop + 8)
          .text('BILLING', 250, tableTop + 8)
          .text('AMOUNT', 450, tableTop + 8, { align: 'right', width: 85 });

        // Content
        const rowTop = tableTop + 40;
        doc.fillColor('#2d3748')
          .font('Helvetica')
          .fontSize(11)
          .text(plan.name, 60, rowTop)
          .fontSize(9)
          .fillColor('#718096')
          .text('Subscription Plan Access', 60, rowTop + 14);

        doc.fillColor('#2d3748')
          .fontSize(10)
          .text(payment.metadata?.billingPeriod || 'MONTHLY', 250, rowTop);

        doc.font('Helvetica-Bold')
          .text(`${payment.currency || 'INR'} ${(payment.amount || 0).toFixed(2)}`, 450, rowTop, { align: 'right', width: 85 });

        // Border below row
        doc.moveTo(50, rowTop + 40)
          .lineTo(545, rowTop + 40)
          .strokeColor('#edf2f7')
          .stroke();

        // --- Totals ---
        const totalTop = rowTop + 60;
        doc.fontSize(12)
          .font('Helvetica-Bold')
          .fillColor('#2d3748')
          .text('TOTAL PAID', 250, totalTop)
          .text(`${payment.currency || 'INR'} ${(payment.amount || 0).toFixed(2)}`, 450, totalTop, { align: 'right', width: 85 });

        // --- Footer ---
        const footerTop = 700;
        doc.rect(0, footerTop, 595, 142).fill('#f7fafc');
        doc.fillColor('#718096')
          .fontSize(9)
          .font('Helvetica')
          .text('Thank you for being a part of VMS Techhub!', 50, footerTop + 20, { align: 'center', width: 495 })
          .text('For support, please contact us at support@vmstechhub.com', 50, footerTop + 35, { align: 'center', width: 495 })
          .font('Helvetica-Oblique')
          .fontSize(8)
          .text('This is a system generated receipt. No signature is required.', 50, footerTop + 60, { align: 'center', width: 495 });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Send Subscription Invoice Email
   */
  async sendSubscriptionInvoice(user: any, plan: any, subscription: any, payment: any): Promise<boolean> {
    try {
      this.logger.log(`Attempting to send subscription invoice email to: ${user.email}`);

      // In development mode or if SMTP fails, just log
      if (this.configService.get('NODE_ENV') === 'development' || !this.transporter) {
        this.logger.log(`[DEV MODE] Invoice email would be sent to: ${user.email}`);
        return true;
      }

      const emailTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background-color: #f4f7f9; margin: 0; padding: 0; }
            .wrapper { width: 100%; background-color: #f4f7f9; padding: 40px 0; }
            .container { width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
            .header { background-color: #2d3748; padding: 40px; }
            .header-table { width: 100%; }
            .logo { color: #ffffff; font-size: 24px; font-weight: bold; }
            .invoice-label { color: #a0aec0; font-size: 28px; text-align: right; text-transform: uppercase; letter-spacing: 2px; }
            .content { padding: 40px; }
            .details-table { width: 100%; margin-bottom: 40px; }
            .label { color: #718096; font-size: 12px; font-weight: bold; text-transform: uppercase; padding-bottom: 8px; }
            .value { color: #2d3748; font-size: 14px; padding-bottom: 4px; }
            .item-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .item-table th { background-color: #f8fafc; color: #4a5568; font-size: 12px; font-weight: bold; text-align: left; padding: 15px; border-bottom: 2px solid #edf2f7; }
            .item-table td { padding: 15px; border-bottom: 1px solid #edf2f7; color: #2d3748; font-size: 14px; }
            .total-row td { font-weight: bold; font-size: 18px; color: #2d3748; padding-top: 20px; border-bottom: none; }
            .footer { background-color: #f8fafc; padding: 30px; text-align: center; color: #718096; font-size: 13px; }
            .badge { background-color: #c6f6d5; color: #22543d; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <table class="header-table" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td class="logo" style="color: #ffffff; font-family: sans-serif; font-size: 24px; font-weight: bold;">VMS Techhub</td>
                    <td class="invoice-label" style="color: #a0aec0; font-family: sans-serif; font-size: 28px; text-align: right; text-transform: uppercase;">Invoice</td>
                  </tr>
                </table>
              </div>
              <div class="content" style="padding: 40px;">
                <table class="details-table" cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                  <tr>
                    <td width="50%" valign="top">
                      <div class="label" style="color: #718096; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px;">Bill To:</div>
                      <div class="value" style="color: #2d3748; font-size: 14px; margin-bottom: 4px;"><strong>{{customerName}}</strong></div>
                      <div class="value" style="color: #2d3748; font-size: 14px; margin-bottom: 4px;">{{customerEmail}}</div>
                      <div class="value" style="color: #2d3748; font-size: 14px;">{{customerPhone}}</div>
                    </td>
                    <td width="50%" valign="top" style="text-align: right;">
                      <div class="label" style="color: #718096; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px;">Invoice Details:</div>
                      <div class="value" style="color: #2d3748; font-size: 14px; margin-bottom: 4px;"><strong>#{{invoiceNumber}}</strong></div>
                      <div class="value" style="color: #2d3748; font-size: 14px; margin-bottom: 4px;">{{invoiceDate}}</div>
                      <div style="margin-top: 8px;"><span class="badge" style="background-color: #c6f6d5; color: #22543d; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold;">PAID</span></div>
                    </td>
                  </tr>
                </table>

                <table class="item-table" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr>
                      <th style="background-color: #f8fafc; color: #4a5568; font-size: 12px; font-weight: bold; text-align: left; padding: 15px; border-bottom: 2px solid #edf2f7;">Description</th>
                      <th style="background-color: #f8fafc; color: #4a5568; font-size: 12px; font-weight: bold; text-align: left; padding: 15px; border-bottom: 2px solid #edf2f7;">Billing</th>
                      <th style="background-color: #f8fafc; color: #4a5568; font-size: 12px; font-weight: bold; text-align: right; padding: 15px; border-bottom: 2px solid #edf2f7;">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="padding: 15px; border-bottom: 1px solid #edf2f7; color: #2d3748; font-size: 14px;">
                        <strong>{{planName}}</strong><br>
                        <span style="color: #718096; font-size: 12px;">Full Access Subscription</span>
                      </td>
                      <td style="padding: 15px; border-bottom: 1px solid #edf2f7; color: #2d3748; font-size: 14px;">{{billingPeriod}}</td>
                      <td style="padding: 15px; border-bottom: 1px solid #edf2f7; color: #2d3748; font-size: 14px; text-align: right;">{{currency}} {{amount}}</td>
                    </tr>
                    <tr class="total-row">
                      <td colspan="2" style="text-align: right; padding: 20px 15px 15px; font-weight: bold; font-size: 18px; color: #2d3748;">Total Paid</td>
                      <td style="text-align: right; padding: 20px 15px 15px; font-weight: bold; font-size: 18px; color: #2d3748;">{{currency}} {{amount}}</td>
                    </tr>
                  </tbody>
                </table>
                
                <div style="text-align: center; color: #718096; font-size: 14px; margin-top: 40px;">
                  <p>Thank you for choosing VMS Techhub!</p>
                  <p>A PDF copy is attached for your records.</p>
                </div>
              </div>
              <div class="footer" style="background-color: #f8fafc; padding: 30px; text-align: center; color: #718096; font-size: 13px;">
                <p>&copy; 2025 VMS Techhub. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      this.logger.log('Compiling invoice template...');
      const template = handlebars.compile(emailTemplate);

      const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: currency || 'INR',
        }).format(amount);
      };

      const htmlContent = template({
        customerName: user.fullName || 'Valued Customer',
        customerEmail: user.email,
        customerPhone: user.phone || 'N/A',
        invoiceNumber: payment.transactionId || `INV-${Date.now()}`,
        invoiceDate: new Date(payment.createdAt).toLocaleDateString(),
        planName: plan.name,
        billingPeriod: payment.metadata?.billingPeriod || 'MONTHLY',
        amount: (payment.amount || 0).toFixed(2),
        currency: payment.currency || 'INR',
      });

      const subject = `Invoice for your ${plan.name} Subscription - VMS Techhub`;
      const adminEmail = this.configService.get('SMTP_USER'); // Use SMTP_USER for admin copy as requested

      this.logger.log('Generating invoice PDF...');
      const pdfBuffer = await this.generateInvoicePdf(user, plan, subscription, payment);

      this.logger.log('Sending invoice to customer...');
      // Verify Transporter again before sending 
      if (this.transporter) {
        // Send to Customer
        await this.transporter.sendMail({
          from: `"VMS Techhub" <${this.configService.get('SMTP_USER')}>`,
          to: user.email,
          subject: subject,
          html: htmlContent,
          attachments: [
            {
              filename: `Invoice-${payment.transactionId || 'INV'}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf'
            }
          ]
        });

        this.logger.log(`Invoice sent to user: ${user.email}`);

        // Send to Admin
        if (adminEmail) {
          this.logger.log(`Sending invoice copy to admin: ${adminEmail}`);
          await this.transporter.sendMail({
            from: `"VMS Techhub System" <${this.configService.get('SMTP_USER')}>`,
            to: adminEmail,
            subject: `[ADMIN COPY] ${subject}`,
            html: `
                <div style="background: #fff3cd; padding: 10px; border: 1px solid #ffeeba; text-align: center; margin-bottom: 20px;">
                <strong>ADMIN COPY</strong> - This is a copy of the invoice sent to the customer.
                </div>
                ${htmlContent}
            `,
            attachments: [
              {
                filename: `Invoice-${payment.transactionId || 'INV'}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
              }
            ]
          });
          this.logger.log(`Invoice copy sent to admin: ${adminEmail}`);
        } else {
          this.logger.warn('Admin email (SMTP_USER) not set, skipping admin copy.');
        }
      } else {
        this.logger.error('Transporter not available, cannot send invoice.');
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(`Failed to send invoice email to ${user.email}:`, error);
      return false;
    }
  }
}

