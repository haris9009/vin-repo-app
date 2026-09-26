import React, { useState } from 'react';
import { Search, Car, ArrowRight, ShieldCheck, Database, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import heroCarImage from '../assets/images/hero_yellow_suv_garage_1790116036343.jpg';

interface HeroSectionProps {
  onSearch: (query: string, type: 'vin' | 'plate', state?: string) => void;
  isLoading: boolean;
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearch, isLoading }) => {
  const [searchMode, setSearchMode] = useState<'vin' | 'plate'>('vin');
  const [vinInput, setVinInput] = useState('');
  const [plateInput, setPlateInput] = useState('');
  const [selectedState, setSelectedState] = useState('CA');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (searchMode === 'vin') {
      const clean = vinInput.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (!clean) {
        setErrorMsg('Please enter a 17-character VIN number');
        return;
      }
      if (clean.length < 17) {
        setErrorMsg(`VIN must be exactly 17 characters (currently ${clean.length}/17). Enter all 17 characters to search.`);
        return;
      }
      if (clean.length > 17) {
        setErrorMsg(`VIN must be exactly 17 characters (provided ${clean.length}).`);
        return;
      }
      onSearch(clean, 'vin');
    } else {
      const cleanPlate = plateInput.trim().toUpperCase();
      if (!cleanPlate) {
        setErrorMsg('Please enter a license plate number');
        return;
      }
      onSearch(cleanPlate, 'plate', selectedState);
    }
  };

  return (
    <section className="relative min-h-[640px] lg:min-h-[740px] w-full flex items-center overflow-hidden bg-[#070b11]">
      {/* Background Hero Image with measured scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroCarImage}
          alt="Luxury Yellow SUV in Garage"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center lg:object-right opacity-90 scale-[1.02]"
        />
        {/* Measured dark gradient scrim for maximum text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 lg:via-black/70 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#070b11] via-transparent to-black/40"></div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-16 lg:py-24 w-full">
        <div className="max-w-2xl">
          {/* Main Headline matching Image 1 */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-[1.08] font-sans">
            FULL VEHICLE INSTANT{' '}
            <span className="text-yellow-400 drop-shadow-[0_0_25px_rgba(250,204,21,0.35)]">
              TRANSPARENCY.
            </span>{' '}
            NO COMPROMISE.
          </h1>

          {/* Subtitle matching Image 1 */}
          <p className="mt-5 text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-xl">
            Buy with confidence. Sell with credibility. Instantly unlock any vehicle's history via federal data registries.
          </p>

          {/* Search Tabs Capsule matching user screenshot */}
          <div className="mt-8 inline-flex items-center p-1.5 rounded-[18px] bg-[#2a2d33]/90 border border-white/15 shadow-xl backdrop-blur-md">
            <button
              type="button"
              onClick={() => {
                setSearchMode('vin');
                setErrorMsg('');
              }}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                searchMode === 'vin'
                  ? 'bg-yellow-400 text-black shadow-sm'
                  : 'text-white hover:text-yellow-400 bg-transparent font-bold'
              }`}
            >
              VIN SEARCH
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchMode('plate');
                setErrorMsg('');
              }}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                searchMode === 'plate'
                  ? 'bg-yellow-400 text-black shadow-sm'
                  : 'text-white hover:text-yellow-400 bg-transparent font-bold'
              }`}
            >
              PLATE SEARCH
            </button>
          </div>

          {/* Search Form with exact corner radius matching screenshot */}
          <form onSubmit={handleSubmit} className="mt-4">
            {searchMode === 'vin' ? (
              <div className="relative flex items-center p-2 bg-white rounded-[28px] sm:rounded-[32px] shadow-[0_15px_40px_rgba(0,0,0,0.5)] max-w-2xl border-2 border-transparent focus-within:border-yellow-400 transition-all">
                <div className="pl-3 sm:pl-4 pr-1 text-slate-400">
                  <Search className="w-5 h-5 stroke-[1.8]" />
                </div>
                <input
                  type="text"
                  value={vinInput}
                  onChange={(e) => {
                    setVinInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="ENTER 17-DIGIT VIN..."
                  maxLength={17}
                  className="w-full bg-transparent px-3 sm:px-4 py-2 text-slate-900 placeholder:text-slate-400 font-mono font-medium tracking-widest text-base focus:outline-none uppercase"
                />
                {/* Character Counter Badge */}
                <div className="shrink-0 px-2">
                  <span
                    className={`font-mono text-[11px] font-black px-2.5 py-1 rounded-full border transition-all ${
                      vinInput.trim().length === 17
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs'
                        : vinInput.trim().length > 0
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-slate-100 text-slate-400 border-slate-200'
                    }`}
                  >
                    {vinInput.trim().length}/17
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={isLoading || vinInput.trim().length < 17}
                  title={vinInput.trim().length < 17 ? 'Please enter the full 17-digit VIN to search' : 'Get vehicle history report'}
                  className="shrink-0 px-6 sm:px-8 py-3 rounded-[20px] bg-[#e4e7ed] hover:bg-yellow-400 disabled:bg-slate-200 text-[#737c8e] hover:text-black disabled:text-slate-400 font-black text-xs sm:text-[13px] tracking-wider uppercase transition-all duration-200 shadow-xs disabled:shadow-none disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : null}
                  <span>GET REPORT</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 max-w-2xl">
                <div className="flex-1 flex items-center p-2 bg-white rounded-[28px] sm:rounded-[32px] shadow-[0_15px_40px_rgba(0,0,0,0.5)] border-2 border-transparent focus-within:border-yellow-400">
                  <div className="pl-3 sm:pl-4 pr-1 text-slate-400">
                    <Car className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <input
                    type="text"
                    value={plateInput}
                    onChange={(e) => {
                      setPlateInput(e.target.value.toUpperCase());
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="ENTER LICENSE PLATE..."
                    maxLength={10}
                    className="w-full bg-transparent px-3 sm:px-4 py-2 text-slate-900 placeholder:text-slate-400 font-mono font-medium tracking-widest text-base focus:outline-none uppercase"
                  />
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm rounded-full px-3 py-2 border-none focus:outline-none cursor-pointer mr-2"
                  >
                    {US_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-7 sm:px-9 py-3 rounded-[20px] bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs sm:text-[13px] tracking-wider uppercase transition-colors shadow-lg shadow-yellow-400/20 shrink-0 cursor-pointer"
                >
                  {isLoading ? 'LOOKING UP...' : 'SEARCH PLATE'}
                </button>
              </div>
            )}

            {errorMsg && (
              <p className="mt-2 text-xs font-semibold text-rose-400 flex items-center gap-1.5 pl-4">
                <AlertCircle className="w-3.5 h-3.5" />
                {errorMsg}
              </p>
            )}
          </form>

          {/* Trust points bar */}
          <div className="mt-10 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-slate-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-yellow-400 shrink-0" />
              <div className="text-[11px]">
                <div className="font-bold text-white uppercase">NMVTIS Approved</div>
                <div className="text-slate-400">Official Federal Node</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-yellow-400 shrink-0" />
              <div className="text-[11px]">
                <div className="font-bold text-white uppercase">50-State Title</div>
                <div className="text-slate-400">DMV Real-Time Sync</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
              <div className="text-[11px]">
                <div className="font-bold text-white uppercase">Salvage & Lien</div>
                <div className="text-slate-400">NICB Stolen Registry</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
              <div className="text-[11px]">
                <div className="font-bold text-white uppercase">Stripe & PayPal</div>
                <div className="text-slate-400">Instant Encrypted Pay</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
