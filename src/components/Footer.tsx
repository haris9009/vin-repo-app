import React from 'react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#111317] text-white pt-16 pb-12 border-t border-[#1f2229]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-16">
          {/* Brand Info (Cols 1-4) */}
          <div className="lg:col-span-4 space-y-6">
            <div>
              <button
                onClick={() => onNavigate('home')}
                className="text-2xl sm:text-3xl font-black italic tracking-wider text-white text-left inline-block hover:opacity-90 transition-opacity"
              >
                WHEELCLARIFY
              </button>
              {/* Yellow Underline Bar */}
              <div className="w-14 h-1 bg-yellow-400 mt-1"></div>
            </div>

            <p className="text-slate-400 italic text-sm leading-relaxed max-w-sm">
              The industry standard for rapid vehicle data verification. Aggregating records from 40k+ US sources to power your decisions.
            </p>

            {/* Social Icons (Rounded Squares) */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="#twitter"
                aria-label="X (formerly Twitter)"
                className="w-10 h-10 rounded-xl bg-[#1b1e24] border border-[#2b303b] flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              <a
                href="#facebook"
                aria-label="Facebook"
                className="w-10 h-10 rounded-xl bg-[#1b1e24] border border-[#2b303b] flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.82 0-1.611.177-2.115.656-.503.479-.691 1.257-.691 2.37v.954h4.196l-.582 3.667h-3.614v7.98H9.101z" />
                </svg>
              </a>

              <a
                href="#instagram"
                aria-label="Instagram"
                className="w-10 h-10 rounded-xl bg-[#1b1e24] border border-[#2b303b] flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>

          {/* PLATFORM Column (Cols 5-6) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              PLATFORM
            </h4>
            <ul className="space-y-3 font-bold text-xs tracking-wider">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="hover:text-yellow-400 transition-colors uppercase text-left"
                >
                  LOOKUP
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('pricing')}
                  className="hover:text-yellow-400 transition-colors uppercase text-left"
                >
                  PRICING
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('journal')}
                  className="hover:text-yellow-400 transition-colors uppercase text-left"
                >
                  VIN JOURNAL
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('history')}
                  className="hover:text-yellow-400 transition-colors uppercase text-left"
                >
                  VEHICLE HISTORY
                </button>
              </li>
            </ul>
          </div>

          {/* SUPPORT Column (Cols 7-8) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              SUPPORT
            </h4>
            <ul className="space-y-3 font-bold text-xs tracking-wider">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('faq')}
                  className="hover:text-yellow-400 transition-colors uppercase text-left"
                >
                  COMMON Q&amp;A
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('faq')}
                  className="hover:text-yellow-400 transition-colors uppercase text-left"
                >
                  T.O.S
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('faq')}
                  className="hover:text-yellow-400 transition-colors uppercase text-left"
                >
                  PRIVACY
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('faq')}
                  className="hover:text-yellow-400 transition-colors uppercase text-left"
                >
                  COOKIES
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('support')}
                  className="hover:text-yellow-400 transition-colors uppercase text-left"
                >
                  SUPPORT
                </button>
              </li>
            </ul>
          </div>

          {/* CONTACT Column (Cols 9-12) */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              CONTACT
            </h4>
            <div className="space-y-3 font-bold text-xs tracking-wider text-slate-200">
              <div className="text-white">ARTEVIAN LLC</div>
              <div>+1 904-809-0395</div>
              <div>
                <a
                  href="mailto:INFO@WHEELCLARIFY.COM"
                  className="hover:text-yellow-400 transition-colors"
                >
                  INFO@WHEELCLARIFY.COM
                </a>
              </div>
              <div className="leading-relaxed">
                1942 BROADWAY STE 314C BOULDER, CO 80302
              </div>
            </div>

            {/* Payment Method Badges Matching Image */}
            <div className="pt-3 flex items-center gap-2.5">
              {/* PayPal */}
              <div className="h-8 px-3 rounded bg-white flex items-center justify-center shadow-xs">
                <span className="font-extrabold italic text-[#003087] text-xs tracking-tight">
                  Pay<span className="text-[#0079C1]">Pal</span>
                </span>
              </div>

              {/* Mastercard */}
              <div className="h-8 px-3 rounded bg-white flex items-center justify-center shadow-xs">
                <div className="flex flex-col items-center">
                  <div className="flex items-center -space-x-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#EB001B] inline-block opacity-90"></span>
                    <span className="w-3.5 h-3.5 rounded-full bg-[#F79E1B] inline-block opacity-90"></span>
                  </div>
                  <span className="text-[7px] font-bold text-slate-800 tracking-tighter leading-none mt-0.5">
                    mastercard
                  </span>
                </div>
              </div>

              {/* VISA */}
              <div className="h-8 px-3.5 rounded bg-white flex items-center justify-center shadow-xs">
                <span className="font-black italic text-[#1A1F71] text-xs tracking-wider">
                  VISA
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider Line */}
        <div className="w-full border-t border-[#1f2229]"></div>

        {/* Bottom Bar matching exact layout */}
        <div className="pt-8 flex flex-col md:flex-row md:items-center justify-between gap-6 text-[10px] sm:text-[11px] font-bold tracking-widest text-[#7a8190]">
          {/* Left Text (2 lines italic) */}
          <div className="space-y-1 italic max-w-3xl leading-relaxed">
            <p>
              &copy; 2026 WHEELCLARIFY. DATA SUPPLIED BY AUTHORIZED GOVERNMENT AGENCIES &amp; INDUSTRY PARTNERS.
            </p>
            <p>
              WHEELCLARIFY IS A PRIVATE DATA AGGREGATOR AND IS NOT DIRECTLY AFFILIATED WITH ANY GOVERNMENT AGENCY.
            </p>
          </div>

          {/* Right Badges */}
          <div className="flex items-center gap-8 shrink-0">
            <span className="tracking-[0.25em]">MADE IN USA</span>
            <span className="tracking-[0.25em]">V.4.1.2</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
