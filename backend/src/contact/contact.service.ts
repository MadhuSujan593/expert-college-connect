import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from '../services/email.service';
import { SubmitContactFormDto } from './dto/submit-contact-form.dto';
import * as handlebars from 'handlebars';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(private readonly emailService: EmailService) {}

  async submitContactForm(contactData: SubmitContactFormDto): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log(`Received contact form submission from: ${contactData.email}`);
      
      // Send email to admin
      const emailSent = await this.sendContactEmailToAdmin(contactData);
      
      if (emailSent) {
        this.logger.log(`Contact form email sent successfully for: ${contactData.email}`);
        return {
          success: true,
          message: 'Your message has been sent successfully! We\'ll get back to you soon.'
        };
      } else {
        this.logger.error(`Failed to send contact form email for: ${contactData.email}`);
        return {
          success: false,
          message: 'Failed to send your message. Please try again later.'
        };
      }
    } catch (error) {
      this.logger.error(`Error processing contact form submission:`, error);
      return {
        success: false,
        message: 'An error occurred while processing your request. Please try again.'
      };
    }
  }

  private async sendContactEmailToAdmin(contactData: SubmitContactFormDto): Promise<boolean> {
    try {
      // Get admin email from environment or use a default
      const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
      
      if (!adminEmail) {
        this.logger.error('No admin email configured');
        return false;
      }

      const emailTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Form Submission</title>
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
            .info-section {
              background: #f8fafc;
              border-radius: 15px;
              padding: 25px;
              margin: 20px 0;
              border: 1px solid #e2e8f0;
            }
            .info-item {
              margin-bottom: 15px;
              padding-bottom: 15px;
              border-bottom: 1px solid #e2e8f0;
            }
            .info-item:last-child {
              margin-bottom: 0;
              padding-bottom: 0;
              border-bottom: none;
            }
            .info-label {
              font-weight: 600;
              color: #4f46e5;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 5px;
            }
            .info-value {
              color: #2d3748;
              font-size: 16px;
            }
            .message-section {
              background: #f0f9ff;
              border-left: 4px solid #0ea5e9;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .message-label {
              font-weight: 600;
              color: #0c4a6e;
              margin-bottom: 10px;
            }
            .message-content {
              color: #0c4a6e;
              line-height: 1.7;
              white-space: pre-wrap;
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
            .timestamp {
              color: #a0aec0;
              font-size: 12px;
              margin-top: 10px;
            }
            @media (max-width: 600px) {
              .container { margin: 10px; border-radius: 15px; }
              .header { padding: 30px 20px; }
              .content { padding: 30px 20px; }
              .logo { font-size: 24px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">📧 Expert College Connect</div>
              <div class="subtitle">New Contact Form Submission</div>
            </div>
            <div class="content">
              <div class="info-section">
                <div class="info-item">
                  <div class="info-label">Name</div>
                  <div class="info-value">{{name}}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Email</div>
                  <div class="info-value">{{email}}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Subject</div>
                  <div class="info-value">{{subject}}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Inquiry Type</div>
                  <div class="info-value">{{type}}</div>
                </div>
              </div>
              
              <div class="message-section">
                <div class="message-label">Message:</div>
                <div class="message-content">{{message}}</div>
              </div>
            </div>
            <div class="footer">
              <p>This is an automated notification from the Expert College Connect contact form.</p>
              <div class="timestamp">Received on {{timestamp}}</div>
            </div>
          </div>
        </body>
        </html>
      `;

      const template = handlebars.compile(emailTemplate);
      const htmlContent = template({
        name: contactData.name,
        email: contactData.email,
        subject: contactData.subject,
        type: contactData.type,
        message: contactData.message,
        timestamp: new Date().toLocaleString()
      });

      const mailOptions = {
        from: `"Expert College Connect Contact Form" <${process.env.SMTP_USER}>`,
        to: adminEmail,
        subject: `New Contact Form Submission: ${contactData.subject}`,
        html: htmlContent,
        text: `New Contact Form Submission\n\nName: ${contactData.name}\nEmail: ${contactData.email}\nSubject: ${contactData.subject}\nType: ${contactData.type}\n\nMessage:\n${contactData.message}\n\nReceived on: ${new Date().toLocaleString()}`,
      };

      // Use the existing email service to send the email
      return await this.emailService.sendContactEmail(adminEmail, mailOptions);
    } catch (error) {
      this.logger.error('Error sending contact email to admin:', error);
      return false;
    }
  }
}
