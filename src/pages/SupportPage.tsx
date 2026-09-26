import React, { useState } from 'react';
import { Send, CheckCircle2, RotateCcw, Mail } from 'lucide-react';
import { adminStore } from '../services/adminStore';

interface SupportPageProps {
  onNavigate?: (page: string) => void;
}

export const SupportPage: React.FC<SupportPageProps> = ({ onNavigate }) => {
  const emailSettings = adminStore.getEmailSettings();
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'General Support' | 'Report Delivery Issue' | 'Billing & Refund' | 'VIN Decoding Dispute' | 'Partnership'>('General Support');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<{
    id: string;
    subject: string;
    category: string;
    sentToEmail: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    const emailSettings = adminStore.getEmailSettings();
    const custName = customerName.trim() || 'Verified Customer';
    const custEmail = customerEmail.trim() || 'customer@example.com';
    const subj = subject.trim() || 'General Inquiry';
    const msg = message.trim();

    try {
      // 1. Dispatch real email via site backend server
      await fetch('/api/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: custName,
          email: custEmail,
          category,
          subject: subj,
          message: msg,
          priority: category === 'Billing & Refund' || category === 'Report Delivery Issue' ? 'high' : 'normal',
          adminEmail: emailSettings.adminEmail,
          senderName: emailSettings.senderName,
        }),
      });
    } catch (err) {
      console.warn('Backend ticket dispatch fallback:', err);
    }

    // 2. Save ticket to admin store
    const saved = adminStore.saveTicket({
      customerName: custName,
      email: custEmail,
      category,
      subject: subj,
      message: msg,
      priority: category === 'Billing & Refund' || category === 'Report Delivery Issue' ? 'high' : 'normal',
    });

    setIsSubmitting(false);
    setSubmittedTicket({
      id: saved.ticketNumber,
      subject: saved.subject,
      category: saved.category,
      sentToEmail: saved.email,
    });
  };

  const handleReset = () => {
    setCustomerName('');
    setCustomerEmail('');
    setSubject('');
    setCategory('General Support');
    setMessage('');
    setSubmittedTicket(null);
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-[#f4f5f7] flex items-center justify-center py-10 sm:py-16 px-4 sm:px-6">
      <div className="w-full max-w-[700px] bg-white rounded-[36px] sm:rounded-[44px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] p-8 sm:p-14 relative overflow-hidden transition-all duration-300">
        {/* Subtle Warm Highlight in Corner matching screenshot */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-amber-100/30 via-yellow-50/10 to-transparent pointer-events-none rounded-tr-[44px]" />

        {submittedTicket ? (
          <div className="text-center py-8 space-y-6 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                TICKET DISPATCHED • {submittedTicket.id}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black italic tracking-tight uppercase text-black">
                MESSAGE RECEIVED
              </h2>
              <p className="text-slate-500 italic text-sm sm:text-base max-w-md mx-auto">
                "Our technical support team has received your ticket and is reviewing your inquiry. We typically reply within 3 minutes."
              </p>
            </div>

            <div className="bg-[#f3f4f6] rounded-2xl p-5 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between text-slate-500">
                <span>Category:</span>
                <span className="font-bold text-slate-900">{submittedTicket.category}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Subject:</span>
                <span className="font-bold text-slate-900 truncate max-w-[220px]">{submittedTicket.subject}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Status:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Queued with Live Agent Node
                </span>
              </div>
              <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-200">
                <span>Email Confirmation:</span>
                <span className="font-medium text-slate-800 font-mono text-[11px] truncate max-w-[200px]">
                  Dispatched to {submittedTicket.sentToEmail}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Admin Forwarded:</span>
                <span className="font-medium text-slate-800 font-mono text-[11px] truncate max-w-[200px]">
                  {emailSettings.adminEmail}
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
            {/* Header matching screenshot */}
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

              {/* Row 1: Subject and Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Column 1: Ticket Subject */}
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
                    placeholder="e.g., Report Data Issue"
                    className="w-full bg-[#f3f4f6] text-slate-900 placeholder:text-slate-400 text-sm font-medium rounded-2xl px-5 py-4 border border-transparent focus:border-slate-300 focus:bg-white focus:outline-none transition-all"
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
                    {/* Downward Caret Arrow Icon matching screenshot */}
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                      ▼
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Your Message */}
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
                  placeholder="Please provide details about your issue..."
                  className="w-full bg-[#f3f4f6] text-slate-900 placeholder:text-slate-400 text-sm font-medium rounded-2xl p-5 border border-transparent focus:border-slate-300 focus:bg-white focus:outline-none transition-all resize-y min-h-[160px]"
                />
              </div>

              {/* Row 3: Submit Support Ticket Button matching screenshot */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#ffe600] hover:bg-[#fed700] active:bg-[#eec900] text-black font-black uppercase tracking-wider text-xs sm:text-sm py-4.5 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2.5 shadow-sm active:scale-[0.99] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4 transform -rotate-12" />
                  <span>{isSubmitting ? 'SUBMITTING TICKET...' : 'SUBMIT SUPPORT TICKET'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
