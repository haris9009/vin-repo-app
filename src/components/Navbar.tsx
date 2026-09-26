import React, { useState } from 'react';
import { VinWheelerLogo } from './VinWheelerLogo';
import { ShieldCheck, ChevronDown, ChevronUp, Check, Menu, X, ArrowRight } from 'lucide-react';

interface NavbarProps {
  onNavigate: (page: string) => void;
  activePage: string;
  onGetStarted: () => void;
  savedReportsCount?: number;
}

const COUNTRIES = [
  { code: 'US', name: 'UNITED STATES', flag: '🇺🇸' },
  { code: 'UK', name: 'UNITED KINGDOM', flag: '🇬🇧' },
  { code: 'CA', name: 'CANADA', flag: '🇨🇦' },
  { code: 'AU', name: 'AUSTRALIA', flag: '🇦🇺' },
];

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  activePage,
  onGetStarted,
  savedReportsCount = 0,
}) => {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="relative w-full z-40 bg-black/40 backdrop-blur-md border-b border-white/5">
      {/* Top micro bar: NETWORK LIVE | OFFICIAL DATA NODE (hidden on mobile) */}
      <div className="w-full px-4 sm:px-8 py-1.5 flex items-center justify-end sm:justify-between text-[11px] font-mono tracking-wider text-slate-300/80 border-b border-white/5">
        <div className="hidden sm:flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            NETWORK LIVE
          </span>
          <span className="text-white/20">|</span>
          <span className="flex items-center gap-1 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-yellow-400" />
            OFFICIAL DATA NODE: {selectedCountry.code}
          </span>
        </div>

        {/* Country selector matching screenshot 2 */}
        <div className="relative">
          <button
            onClick={() => setIsCountryOpen(!isCountryOpen)}
            className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#272a33] hover:bg-[#323642] border border-white/10 text-white transition-all shadow-sm cursor-pointer"
          >
            <span className="text-sm">{selectedCountry.flag}</span>
            <span className="font-black tracking-wider text-[11px] sm:text-xs text-white uppercase">
              {selectedCountry.name}
            </span>
            {isCountryOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-yellow-400 stroke-[3]" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-yellow-400 stroke-[3]" />
            )}
          </button>

          {isCountryOpen && (
            <div className="absolute right-0 mt-2 w-60 sm:w-64 bg-[#14161b] border border-white/10 rounded-2xl shadow-2xl p-3.5 sm:p-4 z-50 animate-fadeIn">
              <div className="text-[10px] font-black tracking-widest text-slate-500 uppercase px-1 pb-2">
                SELECT MARKET
              </div>
              <div className="h-[1px] bg-white/10 mb-2.5" />
              <div className="space-y-1.5">
                {COUNTRIES.map((country) => {
                  const isSelected = selectedCountry.code === country.code;
                  return (
                    <button
                      key={country.code}
                      onClick={() => {
                        setSelectedCountry(country);
                        setIsCountryOpen(false);
                      }}
                      className={`w-full p-2.5 sm:p-3 rounded-xl text-left text-xs font-black tracking-wider uppercase transition-all flex items-center gap-3 cursor-pointer ${
                        isSelected
                          ? 'border border-yellow-500/70 bg-[#1e2017] text-yellow-400 shadow-sm'
                          : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <span className="text-base">{country.flag}</span>
                      <span>{country.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Brand Zone */}
        <VinWheelerLogo onClick={() => onNavigate('home')} />

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-8 text-[13px] font-bold tracking-widest text-slate-200">
          <button
            onClick={() => onNavigate('history')}
            className={`hover:text-yellow-400 transition-colors uppercase ${
              activePage === 'history' ? 'text-yellow-400' : ''
            }`}
          >
            HISTORY
          </button>
          <button
            onClick={() => onNavigate('pricing')}
            className={`hover:text-yellow-400 transition-colors uppercase ${
              activePage === 'pricing' ? 'text-yellow-400' : ''
            }`}
          >
            PRICING
          </button>
          <button
            onClick={() => onNavigate('faq')}
            className={`hover:text-yellow-400 transition-colors uppercase ${
              activePage === 'faq' ? 'text-yellow-400' : ''
            }`}
          >
            FAQ
          </button>
          <button
            onClick={() => onNavigate('support')}
            className={`hover:text-yellow-400 transition-colors uppercase ${
              activePage === 'support' ? 'text-yellow-400' : ''
            }`}
          >
            SUPPORT
          </button>
        </nav>

        {/* Primary Action Button matching image.png: GET STARTED */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={onGetStarted}
            className="px-6 py-2.5 rounded-full bg-white hover:bg-yellow-400 text-black font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-yellow-400/20 active:scale-95"
          >
            GET STARTED
          </button>
        </div>

        {/* Mobile menu hamburger */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            onClick={onGetStarted}
            className="px-3.5 py-1.5 rounded-full bg-white text-black font-bold text-xs uppercase"
          >
            START
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0c121d] border-b border-white/10 px-6 py-4 space-y-3 font-semibold text-sm">
          <button
            onClick={() => {
              onNavigate('history');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-slate-200 hover:text-yellow-400"
          >
            HISTORY
          </button>
          <button
            onClick={() => {
              onNavigate('pricing');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-slate-200 hover:text-yellow-400"
          >
            PRICING
          </button>
          <button
            onClick={() => {
              onNavigate('faq');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-slate-200 hover:text-yellow-400"
          >
            FAQ
          </button>
          <button
            onClick={() => {
              onNavigate('support');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-slate-200 hover:text-yellow-400"
          >
            SUPPORT
          </button>
        </div>
      )}
    </header>
  );
};
