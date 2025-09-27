import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { RazorpayService } from './razorpay.service';

@Module({
  providers: [EmailService, SmsService, RazorpayService],
  exports: [EmailService, SmsService, RazorpayService],
})
export class ServicesModule {} 