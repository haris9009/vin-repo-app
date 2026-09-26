import { adminStore } from './adminStore';

export interface SendMailPhpPayload {
  email: string;
  name: string;
  message: string;
  vin?: string;
  subject?: string;
  category?: string;
  phone?: string;
  [key: string]: any;
}

export interface SendMailPhpResponse {
  success: boolean;
  message?: string;
  ticketId?: string;
  error?: string;
}

/**
 * Direct POST request to Hostinger /send-mail.php endpoint.
 * Zero external dependencies, 100% free unlimited email using Hostinger native PHP mail().
 */
export async function sendPhpMail(payload: SendMailPhpPayload): Promise<SendMailPhpResponse> {
  const custName = payload.name?.trim() || 'Verified Customer';
  const custEmail = payload.email?.trim() || '';
  const custVin = payload.vin?.trim().toUpperCase() || 'Not Provided';
  const custMsg = payload.message?.trim() || '';
  const custCategory = payload.category?.trim() || 'General Support';
  const custSubject = payload.subject?.trim() || `Support Inquiry - ${custCategory}`;

  const response = await fetch('/send-mail.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      email: custEmail,
      name: custName,
      message: custMsg,
      vin: custVin,
      subject: custSubject,
      category: custCategory,
      phone: payload.phone?.trim() || 'Not Provided',
    }),
  });

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const rawText = await response.text();
    // If returned HTML, could be 404 or missing file
    if (!response.ok) {
      throw new Error(
        `Server returned status ${response.status}. Please make sure send-mail.php is uploaded to public_html/.`
      );
    }
    // Attempt parse if possible
    try {
      return JSON.parse(rawText);
    } catch {
      throw new Error('Invalid non-JSON response from /send-mail.php');
    }
  }

  const data: SendMailPhpResponse = await response.json();
  return data;
}

export const emailService = {
  sendPhpMail,
  async sendTestPing(targetEmail: string, senderName: string) {
    try {
      const res = await sendPhpMail({
        name: senderName || 'WheelClarify Administrator',
        email: targetEmail,
        subject: '[LIVE TEST] Hostinger PHP Mailer Verification',
        message: `This is a live verification email sent from your Hostinger website via /send-mail.php.\nRecipient: ${targetEmail}\nTime: ${new Date().toISOString()}`,
        category: 'Test Ping',
        vin: 'TEST-VIN-12345678',
      });

      return {
        success: res.success === true,
        mode: 'php' as const,
        details: res.message || 'Delivered directly via Hostinger PHP mail()',
        ticketId: res.ticketId,
        error: res.success ? undefined : res.error,
      };
    } catch (err: any) {
      return {
        success: false,
        mode: 'php' as const,
        details: err.message,
        error: err.message,
      };
    }
  },
};
