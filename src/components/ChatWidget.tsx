import React, { useState } from 'react';
import { MessageSquare, X, Send, ShieldCheck, CheckCheck } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
}

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Hi there! 👋 Welcome to WheelClarify. Need help finding a vehicle history record or checking your NMVTIS report?',
      time: 'Just now'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  if (isDismissed) return null;

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = "Our reports are sourced directly from the official federal NMVTIS registry, 50-state DMV agencies, and police collision databases. When you select a plan, your full report unlocks instantly with full PDF download rights!";

      const lower = text.toLowerCase();
      if (lower.includes('stripe') || lower.includes('paypal') || lower.includes('payment') || lower.includes('price')) {
        reply = "We support 256-bit encrypted payments via Stripe (Credit/Debit, Apple Pay) and PayPal. Transactions are processed securely with instant digital delivery!";
      } else if (lower.includes('vin') || lower.includes('plate') || lower.includes('lookup')) {
        reply = "You can enter any 17-digit US/Canadian VIN or license plate in the search box. Try the pre-loaded 2000 BMW Z3 (WBACH9343YLG18917) to see an instant live demonstration!";
      } else if (lower.includes('refund') || lower.includes('guarantee')) {
        reply = "All vehicle history orders are covered by our 100% Data Quality Guarantee. If your VIN has zero records, our team provides an immediate credit or refund.";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 700);
  };

  const handleOpenChat = () => {
    setIsOpen(!isOpen);
    setHasUnread(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end select-none">
      {/* Tiny close 'x' icon above the widget matching screenshots */}
      {!isOpen && (
        <button
          onClick={() => setIsDismissed(true)}
          className="text-slate-400 hover:text-white text-xs mb-1 mr-1 p-0.5 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
          title="Dismiss widget"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Floating Chat Button matching the exact screenshot widget */}
      <div className="relative flex items-center">
        {/* "We Are Here!" curved / banner badge from screenshots */}
        {!isOpen && (
          <div
            onClick={handleOpenChat}
            className="absolute -top-6 -left-12 flex items-center gap-1 bg-[#12161f]/95 text-white text-[11px] font-black italic tracking-wide px-2.5 py-1 rounded-full border border-yellow-400/40 shadow-lg cursor-pointer hover:border-yellow-400 transition-all pointer-events-auto transform -rotate-6"
          >
            <span className="text-yellow-400">👋</span>
            <span className="text-yellow-300">We Are Here!</span>
          </div>
        )}

        <button
          onClick={handleOpenChat}
          className="relative w-14 h-14 rounded-full bg-yellow-400 hover:bg-yellow-300 text-black flex items-center justify-center shadow-2xl transition-transform active:scale-95 cursor-pointer border-2 border-black/20 group"
          aria-label="Live Support Chat"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-black stroke-[2.5]" />
          ) : (
            /* Yellow smiley icon matching image.png & user screenshots */
            <div className="relative flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-9 h-9 fill-black"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="10" fill="#facc15" stroke="#000" strokeWidth="1.6" />
                {/* Eyes */}
                <circle cx="9" cy="10" r="1.5" fill="#000" />
                <circle cx="15" cy="10" r="1.5" fill="#000" />
                {/* Big cute smile */}
                <path
                  d="M7.5 13.8C8.8 17 15.2 17 16.5 13.8"
                  fill="none"
                  stroke="#000"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}

          {/* Unread badge with '1' matching user screenshots */}
          {!isOpen && hasUnread && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-md">
              1
            </span>
          )}
        </button>
      </div>

      {/* Expanded Chat Drawer */}
      {isOpen && (
        <div className="mt-2 w-[340px] sm:w-[380px] h-[480px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-slideUp">
          {/* Header */}
          <div className="bg-[#0b1019] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold text-sm">
                WC
              </div>
              <div>
                <div className="font-bold text-sm flex items-center gap-1.5">
                  WheelClarify Support
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Live Agent Node · Typically replies in seconds
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-yellow-400 text-black font-semibold rounded-br-none shadow-sm'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1">{m.time}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-slate-400 p-2">
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}
          </div>

          {/* Quick reply suggestions */}
          <div className="px-3 py-2 bg-slate-100 flex items-center gap-2 overflow-x-auto text-[11px]">
            <button
              onClick={() => handleSend('How do I buy a report?')}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-yellow-400 hover:text-black font-medium shrink-0 transition-colors cursor-pointer"
            >
              How to buy?
            </button>
            <button
              onClick={() => handleSend('Is payment secure with Stripe/PayPal?')}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-yellow-400 hover:text-black font-medium shrink-0 transition-colors cursor-pointer"
            >
              Stripe & PayPal secure?
            </button>
            <button
              onClick={() => handleSend('What if no records are found?')}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-yellow-400 hover:text-black font-medium shrink-0 transition-colors cursor-pointer"
            >
              Refund policy
            </button>
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ask about VIN reports, plans, Stripe..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-yellow-400 text-slate-800"
              />
              <button
                type="submit"
                className="w-8 h-8 rounded-xl bg-yellow-400 text-black flex items-center justify-center shrink-0 hover:bg-yellow-300 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
