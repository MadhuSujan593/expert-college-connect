import { Injectable } from '@nestjs/common';

type CashfreeMode = 'sandbox' | 'production';

@Injectable()
export class CashfreeService {
  // ⚠️ IMPORTANT: Use PG V2 keys (Client ID / Client Secret) from:
  // https://merchant.cashfree.com/pgapp/dashboard/v2/developers
  // Do NOT use PG V1 keys (App ID / Secret Key) from older dashboard
  // Support both naming conventions and strip quotes if present
  private clientId = (process.env.CASHFREE_CLIENT_ID || process.env.CASHFREE_APP_ID || '').replace(/^["']|["']$/g, '').trim();
  private clientSecret = (process.env.CASHFREE_CLIENT_SECRET || process.env.CASHFREE_SECRET_KEY || '').replace(/^["']|["']$/g, '').trim();
  private mode: CashfreeMode = (process.env.CASHFREE_ENV?.toLowerCase() === 'prod' || process.env.CASHFREE_ENV?.toLowerCase() === 'production')
    ? 'production'
    : 'sandbox';

  constructor() {
    // Log credential status on service initialization (for debugging)
    if (!this.clientId || !this.clientSecret) {
      console.warn('⚠️ Cashfree credentials not fully configured:', {
        hasClientId: !!this.clientId,
        hasClientSecret: !!this.clientSecret,
        mode: this.mode,
        note: 'Ensure you are using PG V2 keys from https://merchant.cashfree.com/pgapp/dashboard/v2/developers',
      });
    } else {
      console.log('✅ Cashfree service initialized:', {
        mode: this.mode,
        clientIdPrefix: this.clientId.substring(0, 15) + '...',
        hasCredentials: true,
        apiVersion: '2025-01-01',
        note: 'Using PG V2 API (ensure keys are from v2 dashboard)',
      });
    }
  }

  private get baseUrl() {
    // Cashfree PG API base URL (includes /pg)
    return this.mode === 'production'
      ? 'https://api.cashfree.com/pg'
      : 'https://sandbox.cashfree.com/pg';
  }

  private get defaultHeaders() {
    return {
      'x-client-id': this.clientId,
      'x-client-secret': this.clientSecret,
      'x-api-version': '2025-01-01', // Latest API version (requires PG V2 keys)
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  getSdkMode(): CashfreeMode {
    return this.mode;
  }

  async createOrder(params: {
    orderId: string;
    amountPaise: number;
    currency: string;
    customer: { id: string; email?: string | null; phone?: string | null; name?: string | null };
    returnUrl?: string;
    notifyUrl?: string;
    notes?: Record<string, any>;
  }) {
    // Validate credentials (x-client-secret is REQUIRED by Cashfree)
    if (!this.clientId || !this.clientSecret) {
      const missing: string[] = [];
      if (!this.clientId) missing.push('CASHFREE_CLIENT_ID or CASHFREE_APP_ID');
      if (!this.clientSecret) missing.push('CASHFREE_CLIENT_SECRET or CASHFREE_SECRET_KEY');
      throw new Error(
        `Cashfree credentials not configured. Missing: ${missing.join(', ')}. ` +
        `Note: Remove quotes from .env values (use CASHFREE_CLIENT_ID=TESTxxx not CASHFREE_CLIENT_ID="TESTxxx")`
      );
    }

    // Build customer details
    const customerDetails: any = {
      customer_id: params.customer.id,
    };
    if (params.customer.email) customerDetails.customer_email = params.customer.email;
    if (params.customer.phone) customerDetails.customer_phone = params.customer.phone;
    if (params.customer.name) customerDetails.customer_name = params.customer.name;

    // Build request body exactly as per Cashfree documentation
    const body: any = {
      order_id: params.orderId,
      order_amount: Math.round(params.amountPaise) / 100, // Convert paise to rupees (major units)
      order_currency: params.currency || 'INR',
      customer_details: customerDetails,
    };

    // Add order_meta if return_url or notify_url provided
    if (params.returnUrl || params.notifyUrl) {
      body.order_meta = {};
      if (params.returnUrl) {
        body.order_meta.return_url = params.returnUrl;
      }
      if (params.notifyUrl) {
        body.order_meta.notify_url = params.notifyUrl;
      }
    }

    // Add notes if provided
    if (params.notes && Object.keys(params.notes).length > 0) {
      body.notes = params.notes;
    }

    const url = `${this.baseUrl}/orders`;
    const headers = this.defaultHeaders;
    
    // Log request details (without exposing secrets)
    console.log('Cashfree API Request Details:', {
      url,
      method: 'POST',
      hasClientId: !!this.clientId && this.clientId.length > 0,
      hasClientSecret: !!this.clientSecret && this.clientSecret.length > 0, // REQUIRED
      clientIdLength: this.clientId.length,
      clientSecretLength: this.clientSecret.length,
      clientIdPrefix: this.clientId.substring(0, 15) + '...',
      headers: {
        'x-client-id': headers['x-client-id'] ? 'SET' : 'MISSING',
        'x-client-secret': headers['x-client-secret'] ? 'SET' : 'MISSING',
        'x-api-version': headers['x-api-version'],
        'Content-Type': headers['Content-Type'],
      },
      body: JSON.stringify(body, null, 2),
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers as any,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        
        console.error('Cashfree API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          url,
        });
        
        throw new Error(`Cashfree order failed: ${response.status} ${JSON.stringify(errorData)}`);
      }
      
      const result = await response.json();
      console.log('Cashfree API Success - Full Response Keys:', Object.keys(result));
      console.log('Cashfree API Success:', {
        order_id: result.order_id,
        payment_session_id: result.payment_session_id ? result.payment_session_id.substring(0, 20) + '...' : 'N/A',
        order_status: result.order_status,
        has_payment_link: !!result.payment_link,
        has_payment_url: !!result.payment_url,
        has_payments: !!result.payments,
        response_keys: Object.keys(result),
      });
      
      return result;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Cashfree order failed')) {
        throw error;
      }
      console.error('Cashfree API Network Error:', error);
      throw new Error(`Cashfree API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getOrder(orderId: string) {
    const headers = { ...this.defaultHeaders };
    delete (headers as any)['Content-Type']; // GET requests don't need Content-Type
    
    const response = await fetch(`${this.baseUrl}/orders/${encodeURIComponent(orderId)}`, {
      method: 'GET',
      headers: headers as any,
    });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Cashfree get order failed: ${response.status} ${text}`);
    }
    return response.json();
  }
}


