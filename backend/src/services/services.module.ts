import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { RazorpayService } from './razorpay.service';
import { CashfreeService } from './cashfree.service';

@Module({
  providers: [EmailService, SmsService, RazorpayService, CashfreeService],
  exports: [EmailService, SmsService, RazorpayService, CashfreeService],
})
export class ServicesModule {} 