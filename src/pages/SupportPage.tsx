import React, { useState } from 'react';
import { Send, CheckCircle2, RotateCcw, Mail, Loader2, ShieldAlert } from 'lucide-react';
import { adminStore } from '../services/adminStore';

interface SupportPageProps {
  onNavigate?: (page: string) => void;
}

export const SupportPage: React.FC<SupportPageProps> = ({ onNavigate }) => {
  const emailSettings = adminStore.getEmailSettings();
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [vinNumber, setVinNumber] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'General Support' | 'Report Delivery Issue' | 'Billing & Refund' | 'VIN Decoding Dispute' | 'Partnership'>('General Support');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submittedTicket, setSubmittedTicket] = useState<{
    id: string;
    subject: string;
    category: string;
    vin?: string;
    sentToEmail: string;
    messageText?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    setSubmissionError(null);

    const custName = customerName.trim() || 'Verified Customer';
    const custEmail = customerEmail.trim();
    const custVin = vinNumber.trim().toUpperCase();
    const subj = subject.trim() || (custVin ? `Inquiry regarding VIN: ${custVin}` : `Inquiry: ${category}`);
    const msg = message.trim();

    try {
      // 1. Send direct POST request to /send-mail.php
      const response = await fetch('/send-mail.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        // 2. Format request body as JSON containing sender's email, name, message, and VIN details
        body: JSON.stringify({
          email: custEmail,
          name: custName,
          message: msg,
          vin: custVin || 'Not Provided',
          subject: subj,
          category: category,
        }),
      });

      let data: any = {};
      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = { success: false, error: text || 'Non-JSON response from server' };
        }
      }

      // 3. Update UI state to handle JSON response from /send-mail.php
      if (response.ok && data.success === true) {
        const ticketId = data.ticketId || `TKT-${Math.floor(100000 + Math.random() * 900000)}`;

        // Record in adminStore for local tracking & auditing
        adminStore.saveTicket({
          customerName: custName,
          email: custEmail,
          category,
          subject: subj,
          message: `${custVin ? `[VIN: ${custVin}]\n` : ''}${msg}`,
          priority: category === 'Billing & Refund' || category === 'Report Delivery Issue' ? 'high' : 'normal',
        });

        adminStore.sendEmail({
          to: emailSettings.adminEmail,
          from: `"${custName}" <${custEmail}>`,
          subject: `[Hostinger PHP Mail #${ticketId}] ${subj}`,
          body: `Ticket: #${ticketId}\nCustomer: ${custName} (${custEmail})\nVIN: ${custVin || 'N/A'}\nCategory: ${category}\n\nMessage:\n${msg}`,
          type: 'support_query_received',
          ticketId,
        });

        // Show success confirmation screen
        setSubmittedTicket({
          id: ticketId,
          subject: subj,
          category: category,
          vin: custVin,
          sentToEmail: custEmail,
          messageText: msg,
        });
      } else {
        // Show error message
        setSubmissionError(
          data.error ||
          data.message ||
          'Failed to dispatch email via /send-mail.php. Please ensure send-mail.php is uploaded to public_html/ on Hostinger.'
        );
      }
    } catch (err: any) {
      console.error('PHP mailer submission error:', err);
      setSubmissionError(
        err.message ||
        'Network error connecting to /send-mail.php. Please verify your internet connection and that send-mail.php exists on Hostinger.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setCustomerName('');
    setCustomerEmail('');
    setVinNumber('');
    setSubject('');
    setCategory('General Support');
    setMessage('');
    setSubmissionError(null);
    setSubmittedTicket(null);
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-[#f4f5f7] flex items-center justify-center py-10 sm:py-16 px-4 sm:px-6">
      <div className="w-full max-w-[700px] bg-white rounded-[36px] sm:rounded-[44px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] p-8 sm:p-14 relative overflow-hidden transition-all duration-300">
        {/* Subtle Warm Highlight in Corner */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-amber-100/30 via-yellow-50/10 to-transparent pointer-events-none rounded-tr-[44px]" />

        {submittedTicket ? (
          <div className="text-center py-8 space-y-6 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                PHP MAILER DELIVERED • {submittedTicket.id}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black italic tracking-tight uppercase text-black">
                MESSAGE DELIVERED SUCCESSFULLY
              </h2>
              <p className="text-slate-500 italic text-sm sm:text-base max-w-md mx-auto">
                "Your inquiry has been sent directly to our administrative team via custom PHP mailer. We typically reply within a few minutes."
              </p>
            </div>

            <div className="bg-[#f3f4f6] rounded-2xl p-5 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between text-slate-500">
                <span>Category:</span>
                <span className="font-bold text-slate-900">{submittedTicket.category}</span>
              </div>
              {submittedTicket.vin && (
                <div className="flex justify-between text-slate-500">
                  <span>VIN Record:</span>
                  <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {submittedTicket.vin}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Subject:</span>
                <span className="font-bold text-slate-900 truncate max-w-[220px]">{submittedTicket.subject}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Status:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Received by Support
                </span>
              </div>
              <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-200">
                <span>Sender Email:</span>
                <span className="font-medium text-slate-800 font-mono text-[11px] truncate max-w-[200px]">
                  {submittedTicket.sentToEmail}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Destination:</span>
                <span className="font-medium text-slate-800 font-mono text-[11px] truncate max-w-[200px]">
                  {emailSettings.adminEmail}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-200">
                <span>Relay Service:</span>
                <span className="font-bold text-emerald-700 text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ✓ Hostinger PHP Mailer (/send-mail.php)
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                SEND ANOTHER MESSAGE
              </button>
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#e5e7eb] hover:bg-[#d1d5db] text-slate-800 font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer"
                >
                  RETURN HOME
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="relative z-10">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-black italic tracking-tight uppercase text-black">
                SEND US A MESSAGE
              </h1>
              <p className="text-slate-500 italic text-sm sm:text-base mt-2.5">
                "Having trouble with a report? Our technical team is here to help."
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
                <Mail className="w-3.5 h-3.5 text-amber-600" />
                <span>Inquiries routed to: <strong className="font-mono text-slate-900">{emailSettings.adminEmail}</strong></span>
              </div>
            </div>

            {/* Horizontal Divider Line */}
            <div className="w-full border-t border-slate-200/80 my-7 sm:my-8" />

            {/* Error Message if /send-mail.php fails */}
            {submissionError && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 text-xs animate-fadeIn">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Message Delivery Failed</p>
                  <p className="text-rose-700">{submissionError}</p>
                  <p className="text-[10px] text-slate-500">
                    Ensure <code className="font-mono bg-white px-1 py-0.5 rounded">send-mail.php</code> is present in your Hostinger <code className="font-mono bg-white px-1 py-0.5 rounded">public_html/</code> directory.
                  </p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Row 0: Name and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label
                    htmlFor="ticket-name"
                    className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2"
                  >
                    YOUR NAME
                  </label>
                  <input
                    id="ticket-name"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="First and last name"
                    className="w-full bg-[#f3f4f6] text-slate-900 placeholder:text-slate-400 text-sm font-medium rounded-2xl px-5 py-4 border border-transparent focus:border-slate-300 focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label
                    htmlFor="ticket-email"
                    className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2"
                  >
                    EMAIL ADDRESS
                  </label>
                  <input
                    id="ticket-email"
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[#f3f4f6] text-slate-900 placeholder:text-slate-400 text-sm font-medium rounded-2xl px-5 py-4 border border-transparent focus:border-slate-300 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Row 1: VIN Details and Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Column 1: VIN Number (Optional / Details) */}
                <div>
                  <label
                    htmlFor="ticket-vin"
                    className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center justify-between"
                  >
                    <span>VIN DETAILS</span>
                    <span className="text-[10px] text-slate-400 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    id="ticket-vin"
                    type="text"
                    maxLength={17}
                    value={vinNumber}
                    onChange={(e) => setVinNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. 1HGCR2F83HA123456"
                    className="w-full bg-[#f3f4f6] text-slate-900 placeholder:text-slate-400 text-sm font-mono uppercase font-bold rounded-2xl px-5 py-4 border border-transparent focus:border-slate-300 focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                {/* Column 2: Category */}
                <div>
                  <label
                    htmlFor="ticket-category"
                    className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2"
                  >
                    CATEGORY
                  </label>
                  <div className="relative">
                    <select
                      id="ticket-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full bg-[#f3f4f6] text-slate-900 font-bold text-sm rounded-2xl px-5 py-4 border border-transparent focus:border-slate-300 focus:bg-white focus:outline-none transition-all appearance-none cursor-pointer pr-10"
                    >
                      <option value="General Support">General Support</option>
                      <option value="Report Delivery Issue">Report Delivery Issue</option>
                      <option value="Billing & Refund">Billing &amp; Refund</option>
                      <option value="VIN Decoding Dispute">VIN Decoding Dispute</option>
                      <option value="Partnership">Partnership</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                      ▼
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Subject */}
              <div>
                <label
                  htmlFor="ticket-subject"
                  className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2"
                >
                  TICKET SUBJECT
                </label>
                <input
                  id="ticket-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Question about my BMW NMVTIS vehicle history report"
                  className="w-full bg-[#f3f4f6] text-slate-900 placeholder:text-slate-400 text-sm font-medium rounded-2xl px-5 py-4 border border-transparent focus:border-slate-300 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              {/* Row 3: Your Message */}
              <div>
                <label
                  htmlFor="ticket-message"
                  className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 pt-1"
                >
                  YOUR MESSAGE
                </label>
                <textarea
                  id="ticket-message"
                  rows={6}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please provide details about your issue, vehicle VIN, or inquiry..."
                  className="w-full bg-[#f3f4f6] text-slate-900 placeholder:text-slate-400 text-sm font-medium rounded-2xl p-5 border border-transparent focus:border-slate-300 focus:bg-white focus:outline-none transition-all resize-y min-h-[150px]"
                />
              </div>

              {/* Hostinger Endpoint Notice */}
              <div className="text-[10px] text-slate-400 flex items-center justify-between px-1">
                <span>Dispatches to: <code className="font-mono text-slate-600 font-bold">/send-mail.php</code></span>
                <span className="font-mono text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  Hostinger PHP Mail Ready
                </span>
              </div>

              {/* Row 4: Submit Support Ticket Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#ffe600] hover:bg-[#fed700] active:bg-[#eec900] text-black font-black uppercase tracking-wider text-xs sm:text-sm py-4.5 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2.5 shadow-sm active:scale-[0.99] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>DISPATCHING VIA PHP MAILER...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 transform -rotate-12" />
                      <span>SUBMIT SUPPORT TICKET</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
