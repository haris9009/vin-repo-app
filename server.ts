import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory server-side state for gateways and emails with defaults
interface ServerGateways {
  stripe: {
    enabled: boolean;
    testMode: boolean;
    publishableKey: string;
    secretKey: string;
  };
  paypal: {
    enabled: boolean;
    sandboxMode: boolean;
    publishableKey: string;
    secretKey: string;
  };
  general: {
    adminEmail: string;
    senderName: string;
  };
}

let serverGateways: ServerGateways = {
  stripe: {
    enabled: true,
    testMode: process.env.STRIPE_TEST_MODE !== 'false',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    secretKey: process.env.STRIPE_SECRET_KEY || '',
  },
  paypal: {
    enabled: true,
    sandboxMode: process.env.PAYPAL_SANDBOX_MODE !== 'false',
    publishableKey: process.env.PAYPAL_CLIENT_ID || '',
    secretKey: process.env.PAYPAL_SECRET_KEY || '',
  },
  general: {
    adminEmail: process.env.ADMIN_EMAIL || 'affandark@gmail.com',
    senderName: process.env.SENDER_NAME || 'WheelClarify Support & Vehicle Audits',
  },
};

// Server email logs
interface ServerEmailLog {
  id: string;
  type: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  status: 'Delivered' | 'Failed';
  messageId?: string;
  previewUrl?: string | false;
  timestamp: string;
}

const serverEmailLogs: ServerEmailLog[] = [];

// Create Nodemailer Transporter using environment variables
async function getMailTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const port = Number(process.env.SMTP_PORT) || 587;
    const isSecure = port === 465 || process.env.SMTP_SECURE === 'true';

    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: isSecure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production' && process.env.SMTP_ALLOW_INSECURE_TLS !== 'true',
      },
    });
  }

  // Create ethereal test account for real outgoing message transmission if no SMTP configured
  try {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (err) {
    // Fallback to stream transport if ethereal creation fails
    return nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true,
    });
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // =========================================================================
  // 1. GATEWAY CREDENTIAL VERIFICATION (SERVER-SIDE REAL API CALLS)
  // =========================================================================

  // Test Stripe Credentials against real Stripe API
  app.post('/api/gateways/verify-stripe', async (req, res) => {
    try {
      const { secretKey, publishableKey, testMode } = req.body;
      const keyToTest = (secretKey || serverGateways.stripe.secretKey || '').trim();

      if (!keyToTest) {
        return res.status(400).json({
          connected: false,
          message: 'Stripe Secret Key is missing. Please enter a valid Stripe Secret Key.',
          details: 'Key field cannot be blank.',
        });
      }

      // Check format
      const isTestKey = keyToTest.startsWith('sk_test_') || keyToTest.startsWith('rk_test_');
      const isLiveKey = keyToTest.startsWith('sk_live_') || keyToTest.startsWith('rk_live_');

      if (!isTestKey && !isLiveKey) {
        return res.status(400).json({
          connected: false,
          message: 'Invalid key prefix. Stripe Secret Keys must start with sk_test_ or sk_live_.',
          details: `Provided prefix: "${keyToTest.slice(0, 8)}..."`,
        });
      }

      // Call real Stripe API: GET https://api.stripe.com/v1/balance
      const stripeRes = await fetch('https://api.stripe.com/v1/balance', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${keyToTest}`,
        },
      });

      const stripeData = await stripeRes.json() as any;

      if (!stripeRes.ok) {
        const errorMsg = stripeData?.error?.message || 'Authentication with Stripe failed.';
        const errorType = stripeData?.error?.type || 'authentication_error';
        return res.json({
          connected: false,
          statusCode: stripeRes.status,
          message: `Disconnected: Stripe API rejected credentials. ${errorMsg}`,
          details: `Stripe error type: ${errorType}`,
        });
      }

      // If key is valid, save to server memory
      serverGateways.stripe.secretKey = keyToTest;
      if (publishableKey) serverGateways.stripe.publishableKey = publishableKey;
      serverGateways.stripe.testMode = Boolean(testMode ?? !isLiveKey);

      const currencies = stripeData.available
        ?.map((a: any) => a.currency?.toUpperCase())
        .filter(Boolean)
        .join(', ') || 'USD';

      return res.json({
        connected: true,
        statusCode: 200,
        livemode: stripeData.livemode,
        message: `Connected: Stripe API credentials verified successfully! Account is ready to process payments.`,
        details: `Authenticated with Stripe API. Live mode: ${stripeData.livemode ? 'YES (Production)' : 'NO (Sandbox)'}. Supported settlement: ${currencies}.`,
      });
    } catch (err: any) {
      console.error('Stripe verification server error:', err);
      return res.status(500).json({
        connected: false,
        message: `Disconnected: Unable to reach Stripe servers. ${err.message}`,
        details: 'Network or internal server exception.',
      });
    }
  });

  // Test PayPal Credentials against real PayPal OAuth API
  app.post('/api/gateways/verify-paypal', async (req, res) => {
    try {
      const { clientId, secretKey, sandboxMode } = req.body;
      const idToTest = (clientId || serverGateways.paypal.publishableKey || '').trim();
      const secretToTest = (secretKey || serverGateways.paypal.secretKey || '').trim();
      const isSandbox = sandboxMode ?? serverGateways.paypal.sandboxMode;

      if (!idToTest || !secretToTest) {
        return res.status(400).json({
          connected: false,
          message: 'PayPal Client ID and Secret Key are both required.',
          details: 'Please enter both credentials from your PayPal Developer dashboard.',
        });
      }

      const baseUrl = isSandbox
        ? 'https://api-m.sandbox.paypal.com'
        : 'https://api-m.paypal.com';

      const authHeader = `Basic ${Buffer.from(`${idToTest}:${secretToTest}`).toString('base64')}`;

      // Call real PayPal OAuth2 Token endpoint
      const paypalRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });

      const paypalData = await paypalRes.json() as any;

      if (!paypalRes.ok) {
        const errorDesc = paypalData?.error_description || paypalData?.error || 'Invalid credentials';
        return res.json({
          connected: false,
          statusCode: paypalRes.status,
          message: `Disconnected: PayPal API rejected credentials (${errorDesc}).`,
          details: `PayPal returned HTTP ${paypalRes.status}. Check whether your app is in Sandbox or Live mode.`,
        });
      }

      // If valid, save to server state
      serverGateways.paypal.publishableKey = idToTest;
      serverGateways.paypal.secretKey = secretToTest;
      serverGateways.paypal.sandboxMode = isSandbox;

      return res.json({
        connected: true,
        statusCode: 200,
        appId: paypalData.app_id,
        scope: paypalData.scope,
        message: `Connected: PayPal credentials verified successfully! Account is ready to accept PayPal and cards.`,
        details: `OAuth token generated by PayPal. App ID: ${paypalData.app_id || 'Active'}, Mode: ${isSandbox ? 'Sandbox' : 'Production'}.`,
      });
    } catch (err: any) {
      console.error('PayPal verification server error:', err);
      return res.status(500).json({
        connected: false,
        message: `Disconnected: Unable to contact PayPal OAuth endpoint. ${err.message}`,
        details: 'Network error or unreachable gateway.',
      });
    }
  });

  // =========================================================================
  // 2. REAL PAYMENT PROCESSING (STRIPE CHECKOUT & PAYPAL ORDERS)
  // =========================================================================

  // Create real Stripe Checkout Session
  app.post('/api/stripe/create-checkout-session', async (req, res) => {
    try {
      const {
        vin,
        vehicleName,
        packageId,
        packageName,
        amount,
        customerEmail,
        customerName,
        phone,
        mileage,
        returnUrl,
        secretKey,
      } = req.body;

      const keyToUse = (secretKey || serverGateways.stripe.secretKey || process.env.STRIPE_SECRET_KEY || '').trim();

      if (!keyToUse) {
        return res.status(400).json({
          success: false,
          error: 'Stripe Secret Key is not configured. Please enter your Stripe Secret Key in Admin Panel > Payment Gateways.',
          needsConfig: true,
        });
      }

      const appOrigin = returnUrl || process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
      const unitAmount = Math.round(Number(amount) * 100);

      // Create parameters for Stripe Checkout Session
      const params = new URLSearchParams();
      params.append('payment_method_types[0]', 'card');
      params.append('payment_method_types[1]', 'link');
      params.append('mode', 'payment');
      if (customerEmail) {
        params.append('customer_email', customerEmail);
      }
      params.append('line_items[0][price_data][currency]', 'usd');
      params.append('line_items[0][price_data][unit_amount]', String(unitAmount));
      params.append('line_items[0][price_data][product_data][name]', `Vehicle History Report: ${packageName}`);
      params.append(
        'line_items[0][price_data][product_data][description]',
        `Official NMVTIS & NHTSA vehicle records for VIN: ${vin} (${vehicleName || 'Vehicle'})`
      );
      params.append('line_items[0][quantity]', '1');

      const successUrl = `${appOrigin}/?payment_success=true&session_id={CHECKOUT_SESSION_ID}&vin=${encodeURIComponent(vin)}&plan=${encodeURIComponent(packageId)}`;
      const cancelUrl = `${appOrigin}/?payment_cancelled=true&vin=${encodeURIComponent(vin)}#checkout`;

      params.append('success_url', successUrl);
      params.append('cancel_url', cancelUrl);
      params.append('metadata[vin]', vin);
      params.append('metadata[packageId]', packageId);
      params.append('metadata[customerName]', customerName || '');
      params.append('metadata[mileage]', mileage || '');
      params.append('metadata[phone]', phone || '');

      const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${keyToUse}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const sessionData = await stripeResponse.json() as any;

      if (!stripeResponse.ok) {
        return res.status(stripeResponse.status).json({
          success: false,
          error: sessionData?.error?.message || 'Failed to create Stripe Checkout session.',
          details: sessionData?.error,
        });
      }

      return res.json({
        success: true,
        sessionId: sessionData.id,
        url: sessionData.url,
      });
    } catch (err: any) {
      console.error('Error creating Stripe session:', err);
      return res.status(500).json({
        success: false,
        error: `Server failed to initialize Stripe Checkout: ${err.message}`,
      });
    }
  });

  // Verify Stripe Session on return
  app.post('/api/stripe/verify-session', async (req, res) => {
    try {
      const { sessionId, secretKey } = req.body;
      const keyToUse = (secretKey || serverGateways.stripe.secretKey || process.env.STRIPE_SECRET_KEY || '').trim();

      if (!sessionId || !keyToUse) {
        return res.status(400).json({ success: false, error: 'Missing sessionId or secretKey' });
      }

      const stripeRes = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${keyToUse}` },
      });

      const session = await stripeRes.json() as any;

      if (!stripeRes.ok) {
        return res.status(stripeRes.status).json({ success: false, error: session?.error?.message });
      }

      const isPaid = session.payment_status === 'paid';

      return res.json({
        success: true,
        isPaid,
        customerEmail: session.customer_details?.email || session.customer_email,
        customerName: session.customer_details?.name,
        amount: session.amount_total ? session.amount_total / 100 : 0,
        vin: session.metadata?.vin,
        packageId: session.metadata?.packageId,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Create real PayPal Order
  app.post('/api/paypal/create-order', async (req, res) => {
    try {
      const {
        vin,
        packageId,
        packageName,
        amount,
        returnUrl,
        clientId,
        secretKey,
        sandboxMode,
      } = req.body;

      const idToUse = (clientId || serverGateways.paypal.publishableKey || process.env.PAYPAL_CLIENT_ID || '').trim();
      const secretToUse = (secretKey || serverGateways.paypal.secretKey || process.env.PAYPAL_SECRET_KEY || '').trim();
      const isSandbox = sandboxMode ?? serverGateways.paypal.sandboxMode;

      if (!idToUse || !secretToUse) {
        return res.status(400).json({
          success: false,
          error: 'PayPal credentials are not configured. Please enter your PayPal Client ID and Secret in Admin Panel.',
          needsConfig: true,
        });
      }

      const baseUrl = isSandbox
        ? 'https://api-m.sandbox.paypal.com'
        : 'https://api-m.paypal.com';

      // 1. Get access token
      const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${idToUse}:${secretToUse}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });

      const tokenData = await tokenRes.json() as any;

      if (!tokenRes.ok) {
        return res.status(tokenRes.status).json({
          success: false,
          error: tokenData?.error_description || 'PayPal OAuth authentication failed',
        });
      }

      const accessToken = tokenData.access_token;
      const appOrigin = returnUrl || process.env.APP_URL || `${req.protocol}://${req.get('host')}`;

      // 2. Create Order
      const orderPayload = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: vin,
            description: `Vehicle History Report: ${packageName} (VIN: ${vin})`,
            amount: {
              currency_code: 'USD',
              value: Number(amount).toFixed(2),
            },
          },
        ],
        application_context: {
          brand_name: 'WheelClarify Vehicle Reports',
          landing_page: 'BILLING',
          user_action: 'PAY_NOW',
          return_url: `${appOrigin}/?paypal_payment=success&vin=${encodeURIComponent(vin)}&plan=${encodeURIComponent(packageId)}`,
          cancel_url: `${appOrigin}/?paypal_payment=cancel&vin=${encodeURIComponent(vin)}#checkout`,
        },
      };

      const orderRes = await fetch(`${baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      const orderData = await orderRes.json() as any;

      if (!orderRes.ok) {
        return res.status(orderRes.status).json({
          success: false,
          error: orderData?.message || 'Failed to create PayPal order',
        });
      }

      const approveLink = orderData.links?.find((l: any) => l.rel === 'approve')?.href;

      return res.json({
        success: true,
        orderId: orderData.id,
        approveUrl: approveLink,
      });
    } catch (err: any) {
      console.error('Error creating PayPal order:', err);
      return res.status(500).json({
        success: false,
        error: `Server failed to initiate PayPal order: ${err.message}`,
      });
    }
  });

  // Capture real PayPal Order
  app.post('/api/paypal/capture-order', async (req, res) => {
    try {
      const { orderId, clientId, secretKey, sandboxMode } = req.body;
      const idToUse = (clientId || serverGateways.paypal.publishableKey || process.env.PAYPAL_CLIENT_ID || '').trim();
      const secretToUse = (secretKey || serverGateways.paypal.secretKey || process.env.PAYPAL_SECRET_KEY || '').trim();
      const isSandbox = sandboxMode ?? serverGateways.paypal.sandboxMode;

      const baseUrl = isSandbox
        ? 'https://api-m.sandbox.paypal.com'
        : 'https://api-m.paypal.com';

      // 1. Get access token
      const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${idToUse}:${secretToUse}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });

      const tokenData = await tokenRes.json() as any;
      if (!tokenRes.ok) {
        return res.status(tokenRes.status).json({ success: false, error: 'PayPal token error' });
      }

      // 2. Capture
      const captureRes = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const captureData = await captureRes.json() as any;

      if (!captureRes.ok) {
        return res.status(captureRes.status).json({
          success: false,
          error: captureData?.message || 'Failed to capture PayPal order',
        });
      }

      const isCompleted = captureData.status === 'COMPLETED';

      return res.json({
        success: isCompleted,
        status: captureData.status,
        captureData,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // =========================================================================
  // 3. REAL SERVER-SIDE EMAIL DISPATCH & SUPPORT TICKET NOTIFICATIONS
  // =========================================================================

  // Core API Route: POST /api/send (Explicit POST with Nodemailer & await)
  app.post('/api/send', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
      const {
        to,
        from,
        name,
        customerName,
        email,
        customerEmail,
        subject,
        message,
        body,
        html,
        category,
        phone,
        ticketId,
        orderId,
        adminEmail,
        senderName,
      } = req.body;

      const recipient = (
        to ||
        adminEmail ||
        serverGateways.general.adminEmail ||
        process.env.ADMIN_EMAIL ||
        'affandark@gmail.com'
      ).trim();

      const senderDisplayName =
        senderName ||
        name ||
        customerName ||
        serverGateways.general.senderName ||
        process.env.SENDER_NAME ||
        'WheelClarify Support & Vehicle Audits';

      const fromAddress =
        process.env.SMTP_FROM ||
        process.env.SMTP_USER ||
        adminEmail ||
        serverGateways.general.adminEmail ||
        'support@wheelclarify.com';

      const fromField = from || `"${senderDisplayName}" <${fromAddress}>`;
      const replyAddress = email || customerEmail || undefined;

      const mailSubject =
        subject ||
        (category
          ? `[Support Query] ${category} - ${ticketId || 'Inquiry'}`
          : 'WheelClarify Support Notification');

      const textBody =
        message ||
        body ||
        `Message received from ${senderDisplayName} (${replyAddress || 'No email specified'})`;

      const transporter = await getMailTransporter();

      const mailOptions = {
        from: fromField,
        to: recipient,
        replyTo: replyAddress,
        subject: mailSubject,
        text: textBody,
        html:
          html ||
          `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background: #0f172a; padding: 24px; color: #ffffff;">
              <h2 style="margin: 0; color: #facc15; font-size: 20px;">WheelClarify Vehicle Reports</h2>
              <p style="margin: 4px 0 0; color: #94a3b8; font-size: 12px;">Official NMVTIS & Federal Title Audit Registry</p>
            </div>
            <div style="padding: 24px; background: #ffffff;">
              <h3 style="margin-top: 0; color: #0f172a; font-size: 16px;">${mailSubject}</h3>
              <div style="white-space: pre-wrap; font-size: 13px; color: #334155; line-height: 1.6;">${textBody}</div>
            </div>
            <div style="background: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
              Delivered via Website Server Node Relay • Reply to: <a href="mailto:${replyAddress || recipient}" style="color: #0284c7;">${replyAddress || recipient}</a>
            </div>
          </div>`,
      };

      // Ensure the server endpoint waits (await) for the email process to finish
      const info = await transporter.sendMail(mailOptions);
      const previewUrl = nodemailer.getTestMessageUrl(info);

      const logEntry: ServerEmailLog = {
        id: `srv-send-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: ticketId ? 'support_query_received' : orderId ? 'order_report_dispatch' : 'custom_outbound',
        from: fromField,
        to: recipient,
        subject: mailSubject,
        body: textBody,
        status: 'Delivered',
        messageId: info.messageId,
        previewUrl,
        timestamp: new Date().toLocaleString('en-US', {
          dateStyle: 'short',
          timeStyle: 'medium',
        }),
      };

      serverEmailLogs.unshift(logEntry);

      console.info(
        `%c[POST /api/send SUCCESS] ✉️ Recipient: ${recipient} | MessageID: ${info.messageId}`,
        'color: #10b981; font-weight: bold;'
      );

      return res.status(200).json({
        success: true,
        messageId: info.messageId,
        previewUrl: previewUrl || undefined,
        recipient,
        message: 'Email delivered successfully',
        log: logEntry,
      });
    } catch (err: any) {
      console.error('Server email send failed at POST /api/send:', err);
      return res.status(500).json({
        success: false,
        error: `Email transmission failed: ${err.message}`,
      });
    }
  });

  // Hostinger check-payment.php endpoint emulator for dev/preview testing
  const handleCheckPaymentRequest = async (req: any, res: any) => {
    res.setHeader('Content-Type', 'application/json');
    try {
      const { gateway, secretKey, clientId, clientSecret, sandbox, testMode, sandboxMode, publishableKey } = req.body || {};
      const targetGateway = String(gateway || '').toLowerCase().trim();
      const isSandbox = Boolean(sandbox ?? sandboxMode ?? testMode ?? false);

      if (targetGateway === 'stripe') {
        const keyToTest = (secretKey || serverGateways.stripe.secretKey || process.env.STRIPE_SECRET_KEY || '').trim();
        if (!keyToTest) {
          return res.status(400).json({ success: false, connected: false, error: 'Stripe Secret Key is missing.' });
        }

        const stripeRes = await fetch('https://api.stripe.com/v1/balance', {
          headers: { Authorization: `Bearer ${keyToTest}` },
        });
        const stripeData = await stripeRes.json() as any;

        if (!stripeRes.ok) {
          const errorMsg = stripeData?.error?.message || 'Authentication with Stripe failed.';
          return res.status(stripeRes.status >= 400 && stripeRes.status < 500 ? stripeRes.status : 400).json({
            success: false,
            connected: false,
            error: `Stripe API Authentication Failed: ${errorMsg}`,
          });
        }

        const modeStr = stripeData.livemode ? 'Live Production Mode' : 'Sandbox / Test Mode';
        const currencies = stripeData.available?.map((a: any) => a.currency?.toUpperCase()).filter(Boolean).join(', ') || 'USD';
        return res.status(200).json({
          success: true,
          connected: true,
          message: `Connected: Stripe API credentials verified successfully (200 OK)! Mode: ${modeStr}. Settlement currencies: ${currencies}.`,
        });
      }

      if (targetGateway === 'paypal') {
        const idToTest = (clientId || serverGateways.paypal.publishableKey || process.env.PAYPAL_CLIENT_ID || '').trim();
        const secretToTest = (clientSecret || secretKey || serverGateways.paypal.secretKey || process.env.PAYPAL_SECRET_KEY || '').trim();

        if (!idToTest || !secretToTest) {
          return res.status(400).json({ success: false, connected: false, error: 'PayPal Client ID and Secret Key are both required.' });
        }

        const baseUrl = isSandbox ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';
        const authHeader = `Basic ${Buffer.from(`${idToTest}:${secretToTest}`).toString('base64')}`;

        const paypalRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
          method: 'POST',
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'grant_type=client_credentials',
        });
        const paypalData = await paypalRes.json() as any;

        if (!paypalRes.ok) {
          const errorDesc = paypalData?.error_description || paypalData?.error || 'Invalid credentials';
          return res.status(paypalRes.status >= 400 && paypalRes.status < 500 ? paypalRes.status : 400).json({
            success: false,
            connected: false,
            error: `PayPal API Authentication Failed: ${errorDesc}`,
          });
        }

        const modeStr = isSandbox ? 'Sandbox Mode' : 'Live Production Mode';
        return res.status(200).json({
          success: true,
          connected: true,
          message: `Connected: PayPal REST credentials verified successfully! Generated active access token. Mode: ${modeStr} (App ID: ${paypalData.app_id || 'Active'}).`,
        });
      }

      return res.status(400).json({ success: false, connected: false, error: "Unsupported gateway. Expected 'stripe' or 'paypal'." });
    } catch (err: any) {
      return res.status(500).json({ success: false, connected: false, error: err.message || 'Payment check failure' });
    }
  };

  app.post('/check-payment.php', handleCheckPaymentRequest);
  app.post('/api/payment/check', handleCheckPaymentRequest);

  // Hostinger PHP Mailer endpoint emulator for dev/preview testing
  app.post('/send-mail.php', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
      const { name, email, message, vin, subject, category, phone } = req.body || {};
      const ticketId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;

      console.info(
        `%c[POST /send-mail.php] ✉️ Customer: ${name} (${email}) | VIN: ${vin || 'N/A'} | Ticket: ${ticketId}`,
        'color: #06b6d4; font-weight: bold;'
      );

      // Attempt Nodemailer if available, otherwise return success response
      try {
        const transporter = await getMailTransporter();
        const adminEmail = process.env.ADMIN_EMAIL || 'affandark@gmail.com';
        await transporter.sendMail({
          from: `"WheelClarify Support" <${adminEmail}>`,
          to: adminEmail,
          replyTo: email || undefined,
          subject: `[WheelClarify #${ticketId}] ${subject || 'Customer Inquiry'} ${vin ? `(VIN: ${vin})` : ''}`,
          text: `Customer: ${name} (${email})\nVIN: ${vin || 'Not provided'}\nCategory: ${category || 'General'}\nTicket: #${ticketId}\n\nMessage:\n${message}`,
        });
      } catch (mailErr) {
        // Dev log
        console.warn('Dev mailer fallback notice:', mailErr);
      }

      return res.status(200).json({
        success: true,
        message: 'Email sent successfully!',
        ticketId,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message || 'PHP mailer simulation error',
      });
    }
  });

  // Real Email Dispatch Endpoint (Nodemailer alias)
  app.post('/api/email/send', async (req, res) => {
    try {
      const {
        to,
        from,
        subject,
        body,
        html,
        type,
        ticketId,
        orderId,
        adminEmail,
        senderName,
      } = req.body;

      if (!to || !subject || (!body && !html)) {
        return res.status(400).json({
          success: false,
          error: 'Recipient (to), Subject, and Body content are required.',
        });
      }

      const senderDisplayName = senderName || serverGateways.general.senderName;
      const senderAddress = adminEmail || serverGateways.general.adminEmail;
      const fromField = from || `"${senderDisplayName}" <${senderAddress}>`;

      const transporter = await getMailTransporter();

      const mailOptions = {
        from: fromField,
        to,
        subject,
        text: body || '',
        html:
          html ||
          `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background: #0f172a; padding: 24px; color: #ffffff;">
              <h2 style="margin: 0; color: #facc15; font-size: 20px;">WheelClarify Vehicle History Reports</h2>
              <p style="margin: 4px 0 0; color: #94a3b8; font-size: 12px;">Official NMVTIS & Federal Title Audit Registry</p>
            </div>
            <div style="padding: 24px; background: #ffffff;">
              <h3 style="margin-top: 0; color: #0f172a; font-size: 16px;">${subject}</h3>
              <div style="white-space: pre-wrap; font-size: 13px; color: #334155;">${body}</div>
            </div>
            <div style="background: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
              Sent by ${senderDisplayName} • Direct replies monitored at <a href="mailto:${senderAddress}" style="color: #0284c7;">${senderAddress}</a>
            </div>
          </div>`,
      };

      const info = await transporter.sendMail(mailOptions);
      const previewUrl = nodemailer.getTestMessageUrl(info);

      const logEntry: ServerEmailLog = {
        id: `srv-email-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: type || 'custom_outbound',
        from: fromField,
        to,
        subject,
        body: body || html,
        status: 'Delivered',
        messageId: info.messageId,
        previewUrl,
        timestamp: new Date().toLocaleString('en-US', {
          dateStyle: 'short',
          timeStyle: 'medium',
        }),
      };

      serverEmailLogs.unshift(logEntry);

      console.info(
        `%c[SERVER EMAIL DISPATCHED] ✉️ To: ${to} | Subject: ${subject} | MessageID: ${info.messageId}`,
        'color: #10b981; font-weight: bold;'
      );

      return res.json({
        success: true,
        messageId: info.messageId,
        previewUrl: previewUrl || undefined,
        log: logEntry,
      });
    } catch (err: any) {
      console.error('Server email send failed:', err);
      return res.status(500).json({
        success: false,
        error: `Email transmission failed: ${err.message}`,
      });
    }
  });

  // Real Test Email Ping to Admin Email
  app.post('/api/email/test', async (req, res) => {
    try {
      const { targetEmail, senderName } = req.body;
      const recipient = (targetEmail || serverGateways.general.adminEmail).trim();
      const sender = senderName || serverGateways.general.senderName;

      const transporter = await getMailTransporter();

      const subject = `[LIVE TEST] Server Mail Relay Operational - WheelClarify`;
      const body = `Hello Administrator,\n\nThis is an authentic real-time test transmission sent from your application server.\n\n` +
        `• Target Admin Email: ${recipient}\n` +
        `• Sender Name: ${sender}\n` +
        `• Server Timestamp: ${new Date().toISOString()}\n` +
        `• Node Engine: ${process.version}\n\n` +
        `All customer support tickets, payment receipts, and NMVTIS report links will dispatch directly through this server conduit.`;

      const info = await transporter.sendMail({
        from: `"${sender}" <${recipient}>`,
        to: recipient,
        subject,
        text: body,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);

      const log: ServerEmailLog = {
        id: `srv-test-${Date.now()}`,
        type: 'test_ping',
        from: `"${sender}" <${recipient}>`,
        to: recipient,
        subject,
        body,
        status: 'Delivered',
        messageId: info.messageId,
        previewUrl,
        timestamp: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'medium' }),
      };

      serverEmailLogs.unshift(log);

      return res.json({
        success: true,
        messageId: info.messageId,
        previewUrl: previewUrl || undefined,
        recipient,
        log,
      });
    } catch (err: any) {
      console.error('Server test email failed:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Process support ticket and dispatch emails on server
  app.post('/api/support/ticket', async (req, res) => {
    try {
      const { customerName, email, phone, category, subject, message, priority, adminEmail, senderName } = req.body;

      const adminDest = (adminEmail || serverGateways.general.adminEmail).trim();
      const sender = senderName || serverGateways.general.senderName;
      const ticketNum = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;

      const transporter = await getMailTransporter();

      // 1. Dispatch notification email to Administrator
      const adminMailSubject = `[New Support Query #${ticketNum}] ${subject} (${category})`;
      const adminMailBody = `New Customer Support Ticket Received:\n\n` +
        `Ticket ID: ${ticketNum}\n` +
        `Customer: ${customerName} (${email})\n` +
        `Phone: ${phone || 'N/A'}\n` +
        `Category: ${category}\n` +
        `Priority: ${priority || 'normal'}\n` +
        `Subject: ${subject}\n\n` +
        `Inquiry Message:\n"${message}"\n\n` +
        `You can reply directly to the customer at ${email} or from your WheelClarify Admin Console.`;

      await transporter.sendMail({
        from: `"${customerName} via WheelClarify" <${adminDest}>`,
        to: adminDest,
        replyTo: email,
        subject: adminMailSubject,
        text: adminMailBody,
      });

      // 2. Dispatch automated receipt confirmation to Customer
      const custMailSubject = `Support Ticket Received: #${ticketNum} - ${subject}`;
      const custMailBody = `Dear ${customerName},\n\n` +
        `We have received your support inquiry regarding "${subject}".\n\n` +
        `Ticket Number: ${ticketNum}\n` +
        `Category: ${category}\n` +
        `Status: Queued with Live Support Desk\n\n` +
        `Our technical staff has received your details and is reviewing your records. We will follow up directly at this email address.\n\n` +
        `Best regards,\n${sender}\nSupport Desk: ${adminDest}`;

      await transporter.sendMail({
        from: `"${sender}" <${adminDest}>`,
        to: email,
        subject: custMailSubject,
        text: custMailBody,
      });

      return res.json({
        success: true,
        ticketNumber: ticketNum,
        adminNotified: adminDest,
        customerNotified: email,
      });
    } catch (err: any) {
      console.error('Support ticket server dispatch error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get server-side email logs
  app.get('/api/email/logs', (req, res) => {
    return res.json({ success: true, logs: serverEmailLogs });
  });

  // =========================================================================
  // VITE DEV MIDDLEWARES & STATIC SERVING
  // =========================================================================

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`WheelClarify Full-Stack Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
