/**
 * Payment Gateway Connection Verification Service
 * Optimized for Hostinger Static Web Hosting
 *
 * Supports direct client-side validation against official Stripe and PayPal APIs,
 * with seamless fallback to /check-payment.php. Handles non-JSON HTML responses gracefully.
 */

export interface PaymentConnectionResult {
  connected: boolean;
  message: string;
  details?: string;
  source?: 'direct' | 'php-fallback';
}

/**
 * Safely parse JSON or detect HTML error pages (preventing "Unexpected token '<'" crashes)
 */
async function safeParseResponse(res: Response): Promise<{ isJson: boolean; isHtml: boolean; data: any; rawText: string }> {
  const contentType = res.headers.get('content-type') || '';
  const rawText = await res.text();
  const trimmed = rawText.trim();
  const isHtml = contentType.includes('text/html') || trimmed.startsWith('<') || trimmed.startsWith('<!DOCTYPE') || trimmed.includes('<html');

  if (isHtml) {
    return { isJson: false, isHtml: true, data: null, rawText };
  }

  try {
    const data = JSON.parse(trimmed);
    return { isJson: true, isHtml: false, data, rawText };
  } catch {
    return { isJson: false, isHtml: false, data: null, rawText };
  }
}

/**
 * Fallback to /check-payment.php endpoint on Hostinger
 */
async function verifyViaPhpEndpoint(payload: {
  gateway: 'stripe' | 'paypal';
  secretKey?: string;
  publishableKey?: string;
  clientId?: string;
  clientSecret?: string;
  sandbox?: boolean;
}): Promise<PaymentConnectionResult> {
  try {
    const res = await fetch('/check-payment.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const parsed = await safeParseResponse(res);

    if (parsed.isHtml) {
      return {
        connected: false,
        message: 'Hostinger Server Notice: /check-payment.php returned HTML instead of JSON. Ensure check-payment.php is uploaded to public_html/ on your Hostinger host.',
        source: 'php-fallback',
      };
    }

    if (!parsed.isJson) {
      return {
        connected: false,
        message: `Invalid response from /check-payment.php (HTTP ${res.status}): ${parsed.rawText.slice(0, 120)}`,
        source: 'php-fallback',
      };
    }

    const data = parsed.data;
    if (data.success || data.connected) {
      return {
        connected: true,
        message: data.message || 'Connected: Gateway verified via Hostinger check-payment.php (200 OK)!',
        source: 'php-fallback',
      };
    } else {
      return {
        connected: false,
        message: data.error || data.message || 'Payment credential verification failed on server.',
        source: 'php-fallback',
      };
    }
  } catch (err: any) {
    return {
      connected: false,
      message: `Unable to reach /check-payment.php: ${err.message || 'Network unreachable'}.`,
      source: 'php-fallback',
    };
  }
}

/**
 * Verify Stripe Credentials
 * 1. Direct GET request to https://api.stripe.com/v1/balance
 * 2. Fallback to /check-payment.php
 */
export async function verifyStripeCredentials(params: {
  secretKey: string;
  publishableKey?: string;
  testMode?: boolean;
}): Promise<PaymentConnectionResult> {
  const sk = params.secretKey?.trim();
  const pk = params.publishableKey?.trim();

  if (!sk) {
    return {
      connected: false,
      message: 'Stripe Secret Key is missing. Please enter your Stripe Secret Key before testing.',
    };
  }

  // Basic format check
  if (!sk.startsWith('sk_test_') && !sk.startsWith('sk_live_') && !sk.startsWith('rk_test_') && !sk.startsWith('rk_live_')) {
    return {
      connected: false,
      message: `Invalid key prefix. Stripe Secret Keys must start with sk_test_ or sk_live_ (provided: "${sk.slice(0, 8)}...").`,
    };
  }

  // 1. Attempt direct client-side request to official Stripe API
  try {
    const directRes = await fetch('https://api.stripe.com/v1/balance', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sk}`,
      },
    });

    const parsed = await safeParseResponse(directRes);

    if (directRes.ok && directRes.status === 200 && parsed.isJson) {
      const data = parsed.data;
      const livemode = Boolean(data?.livemode);
      const modeStr = livemode ? 'Live Production' : 'Sandbox (Test)';
      const currencies = data?.available
        ?.map((a: any) => a.currency?.toUpperCase())
        .filter(Boolean)
        .join(', ') || 'USD';

      return {
        connected: true,
        message: `Connected: Stripe API credentials verified directly (200 OK)! Mode: ${modeStr}. Supported settlement currencies: ${currencies}.`,
        source: 'direct',
      };
    }

    // If Stripe explicitly returned an error (e.g., 401 Unauthorized or 400 Bad Request)
    if (parsed.isJson && parsed.data?.error) {
      const errorMsg = parsed.data.error.message || 'Authentication with Stripe failed.';
      return {
        connected: false,
        message: `Disconnected: Stripe API rejected credentials (HTTP ${directRes.status}): ${errorMsg}`,
        source: 'direct',
      };
    }
  } catch (directErr: any) {
    console.info('Direct Stripe API request failed (likely browser CORS policy). Falling back to /check-payment.php:', directErr);
  }

  // 2. Fallback to /check-payment.php
  return await verifyViaPhpEndpoint({
    gateway: 'stripe',
    secretKey: sk,
    publishableKey: pk,
    sandbox: Boolean(params.testMode),
  });
}

/**
 * Verify PayPal Credentials
 * 1. Direct POST request to https://api-m.sandbox.paypal.com/v1/oauth2/token
 * 2. Fallback to /check-payment.php
 */
export async function verifyPaypalCredentials(params: {
  clientId: string;
  secretKey: string;
  sandboxMode?: boolean;
}): Promise<PaymentConnectionResult> {
  const cid = params.clientId?.trim();
  const secret = params.secretKey?.trim();
  const isSandbox = Boolean(params.sandboxMode);

  if (!cid || !secret) {
    return {
      connected: false,
      message: 'PayPal Client ID and Secret Key are both required. Please enter both credentials from PayPal Developer portal.',
    };
  }

  // 1. Attempt direct client-side request to official PayPal OAuth2 Token endpoint
  try {
    const baseUrl = isSandbox
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com';

    const authHeader = `Basic ${btoa(`${cid}:${secret}`)}`;

    const directRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const parsed = await safeParseResponse(directRes);

    if (directRes.ok && parsed.isJson && parsed.data?.access_token) {
      const data = parsed.data;
      const appId = data.app_id || 'Active App';
      const modeStr = isSandbox ? 'Sandbox Mode' : 'Live Production Mode';

      return {
        connected: true,
        message: `Connected: PayPal OAuth2 verified directly! Active access token generated. Mode: ${modeStr} (App ID: ${appId}).`,
        source: 'direct',
      };
    }

    // If PayPal explicitly returned an error response
    if (parsed.isJson) {
      const errorDesc = parsed.data?.error_description || parsed.data?.error || `HTTP ${directRes.status}`;
      return {
        connected: false,
        message: `Disconnected: PayPal API rejected credentials (HTTP ${directRes.status}): ${errorDesc}`,
        source: 'direct',
      };
    }
  } catch (directErr: any) {
    console.info('Direct PayPal OAuth request failed (likely browser CORS policy). Falling back to /check-payment.php:', directErr);
  }

  // 2. Fallback to /check-payment.php
  return await verifyViaPhpEndpoint({
    gateway: 'paypal',
    clientId: cid,
    clientSecret: secret,
    sandbox: isSandbox,
  });
}
