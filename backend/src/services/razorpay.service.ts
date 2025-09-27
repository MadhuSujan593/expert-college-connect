import { Injectable } from '@nestjs/common';

// Lightweight Razorpay order creation using REST; replace with official SDK if added later
@Injectable()
export class RazorpayService {
  private keyId = process.env.RAZORPAY_KEY_ID || '';
  private keySecret = process.env.RAZORPAY_KEY_SECRET || '';

  private get authHeader() {
    const creds = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    return `Basic ${creds}`;
  }

  async createOrder(amountInPaise: number, currency: string, receipt: string) {
    const body = {
      amount: amountInPaise,
      currency,
      receipt,
      payment_capture: 1,
    } as any;
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': this.authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Razorpay order failed: ${response.status} ${text}`);
    }
    return response.json();
  }
}


