import React, { useState } from 'react';
import {
  AlertTriangle,
  Search,
  Car,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Copy,
  Check,
} from 'lucide-react';

interface NotFoundPageProps {
  searchedQuery: string;
  searchType: 'vin' | 'plate';
  state?: string;
  errorMessage?: string;
  onNewSearch: (query: string, type: 'vin' | 'plate', state?: string) => void;
  onViewSampleReport: () => void;
  onBackToHome: () => void;
  onNavigate: (page: string) => void;
  isLoading: boolean;
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  searchedQuery,
  searchType = 'vin',
  state = 'CA',
  errorMessage,
  onNewSearch,
  onViewSampleReport,
  onBackToHome,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'vin' | 'plate'>(searchType || 'vin');
  const [vinInput, setVinInput] = useState('');
  const [plateInput, setPlateInput] = useState('');
  const [selectedState, setSelectedState] = useState(state || 'CA');
  const [copied, setCopied] = useState(false);

  const [localError, setLocalError] = useState<string | null>(null);

  const displayQuery = searchedQuery || (searchType === 'plate' ? 'LICENSE PLATE' : 'SKAHIDKLHASLKHFD');

  const handleCopy = () => {
    if (!searchedQuery) return;
    navigator.clipboard.writeText(searchedQuery);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (activeTab === 'vin') {
      const clean = vinInput.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (!clean) return;
      if (clean.length < 17) {
        setLocalError(`VIN must be exactly 17 characters (you entered ${clean.length}/17). Please enter the full 17 characters.`);
        return;
      }
      onNewSearch(clean, 'vin');
    } else {
      const cleanPlate = plateInput.trim().toUpperCase();
      if (!cleanPlate) return;
      onNewSearch(cleanPlate, 'plate', selectedState);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-140px)] bg-[#121418] flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans select-none animate-fadeIn py-12">
      {/* Background ambient glow matching VinSearchLoading */}
      <div className="absolute w-[600px] h-[600px] bg-yellow-400/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-[680px] flex flex-col items-center">
        {/* Brand Logo matching VinSearchLoading & user screenshot */}
        <div className="flex flex-col items-center mb-5 cursor-pointer" onClick={onBackToHome}>
          {/* Tilted Piston graphic */}
          <div className="flex flex-col items-center -mb-0.5 transform -rotate-6">
            <div className="w-5 h-3.5 bg-yellow-400 rounded-t-xs border border-black/40 flex flex-col justify-evenly py-0.5 px-0.5 shadow-sm">
              <div className="w-full h-[1.5px] bg-black/70 rounded"></div>
              <div className="w-full h-[1.5px] bg-black/70 rounded"></div>
            </div>
            <div className="w-2.5 h-2.5 bg-yellow-400 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
            </div>
            <div className="w-3.5 h-3.5 rounded-full border-2 border-yellow-400 flex items-center justify-center -mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
            </div>
          </div>

          {/* Yellow Angled Banner with WHEEL CLARIFY in black */}
          <div className="bg-yellow-400 text-black px-4 py-1 transform -skew-x-12 shadow-md rounded-xs flex items-center justify-center">
            <span className="font-black italic tracking-wider text-sm sm:text-base uppercase transform skew-x-12 leading-none">
              WHEEL CLARIFY
            </span>
          </div>
        </div>

        {/* Subtitle & Search Headline matching user screenshot */}
        <div className="text-center space-y-1 mb-5 sm:mb-6 px-2 w-full">
          <div className="text-yellow-400 font-extrabold text-[10px] tracking-[0.25em] uppercase">
            FEDERAL DATABASE QUERY
          </div>
          <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight uppercase break-all leading-tight">
            {searchType === 'plate'
              ? `NO RECORD FOUND FOR PLATE #${displayQuery}${state ? ` (${state})` : ''}`
              : `NO RECORD FOUND FOR VIN #${displayQuery}`}
          </h1>
          <p className="text-slate-400 text-xs italic font-medium">
            No matching vehicle records were located in federal vehicle registries.
          </p>
        </div>

        {/* Main Card matching screenshot */}
        <div className="w-full bg-[#202227] border border-white/5 rounded-[22px] sm:rounded-[24px] p-4 sm:p-8 shadow-2xl overflow-hidden">
          {/* Centered Warning / Not Found Badge */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.25)] mb-3.5">
              <AlertTriangle className="w-8 h-8 stroke-[2.2]" />
            </div>

            <span className="inline-block px-3.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 font-black text-[10px] tracking-widest uppercase mb-2">
              0 RECORDS LOCATED
            </span>

            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-md mx-auto leading-relaxed">
              We queried 50+ federal, state, and salvage registries for{' '}
              <span className="font-mono font-bold text-yellow-400">
                {displayQuery}
              </span>
              , but no active title, registration, or specification records were returned.
            </p>

            {searchedQuery && (
              <button
                type="button"
                onClick={handleCopy}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-mono text-[11px] transition-colors cursor-pointer"
              >
                <span>{displayQuery}</span>
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}

            {errorMessage && (
              <p className="mt-2 text-[11px] text-rose-400/90 font-medium">
                {errorMessage}
              </p>
            )}
          </div>

          {/* Search Again Tabs & Input Form right inside the card */}
          <div className="border-t border-white/5 pt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                TRY ANOTHER SEARCH:
              </span>
              <div className="inline-flex items-center p-0.5 rounded-lg bg-black/40 border border-white/5">
                <button
                  type="button"
                  onClick={() => setActiveTab('vin')}
                  className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'vin'
                      ? 'bg-yellow-400 text-black shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  VIN
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('plate')}
                  className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'plate'
                      ? 'bg-yellow-400 text-black shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  PLATE
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="w-full">
              {activeTab === 'vin' ? (
                <div>
                  <div className="flex items-center p-1.5 bg-white rounded-full shadow-md focus-within:ring-2 focus-within:ring-yellow-400">
                    <div className="pl-3 pr-1 text-slate-400">
                      <Search className="w-4 h-4 stroke-[2]" />
                    </div>
                    <input
                      type="text"
                      value={vinInput}
                      onChange={(e) => {
                        setVinInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
                        if (localError) setLocalError(null);
                      }}
                      placeholder="ENTER 17-DIGIT VIN..."
                      maxLength={17}
                      className="w-full bg-transparent px-2 py-1.5 text-slate-900 placeholder:text-slate-400 font-mono font-medium tracking-wider text-xs focus:outline-none uppercase"
                    />
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full mr-1.5 shrink-0 ${
                        vinInput.trim().length === 17
                          ? 'bg-emerald-100 text-emerald-800'
                          : vinInput.trim().length > 0
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {vinInput.trim().length}/17
                    </span>
                    <button
                      type="submit"
                      disabled={isLoading || vinInput.trim().length < 17}
                      title={vinInput.trim().length < 17 ? 'Please enter all 17 characters of VIN' : 'Search again'}
                      className="shrink-0 px-5 py-2 rounded-full bg-yellow-400 hover:bg-yellow-300 text-black font-black text-[11px] uppercase tracking-wider transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      {isLoading ? (
                        <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <RotateCcw className="w-3 h-3" />
                      )}
                      <span>SEARCH AGAIN</span>
                    </button>
                  </div>
                  {localError && (
                    <div className="text-rose-400 text-xs mt-2 text-center font-bold animate-fadeIn">
                      ⚠️ {localError}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 flex items-center p-1.5 bg-white rounded-full shadow-md focus-within:ring-2 focus-within:ring-yellow-400">
                    <div className="pl-3 pr-1 text-slate-400">
                      <Car className="w-4 h-4 stroke-[2]" />
                    </div>
                    <input
                      type="text"
                      value={plateInput}
                      onChange={(e) => setPlateInput(e.target.value.toUpperCase())}
                      placeholder="ENTER LICENSE PLATE..."
                      maxLength={10}
                      className="w-full bg-transparent px-2 py-1.5 text-slate-900 placeholder:text-slate-400 font-mono font-medium tracking-wider text-xs focus:outline-none uppercase"
                    />
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="bg-slate-100 text-slate-900 font-bold text-[11px] rounded-full px-2.5 py-1 border-none focus:outline-none cursor-pointer mr-1"
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
                    disabled={isLoading || !plateInput.trim()}
                    className="px-5 py-2 rounded-full bg-yellow-400 hover:bg-yellow-300 text-black font-black text-[11px] uppercase tracking-wider transition-all shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                  >
                    {isLoading ? (
                      <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <RotateCcw className="w-3 h-3" />
                    )}
                    <span>SEARCH AGAIN</span>
                  </button>
                </div>
              )}
            </form>

            {/* Quick Action Navigation links inside card */}
            <div className="mt-5 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <button
                type="button"
                onClick={onViewSampleReport}
                className="inline-flex items-center gap-1.5 text-yellow-400 hover:text-yellow-300 font-bold transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>View Sample Report (1998 BMW Z3 2.8L)</span>
              </button>

              <button
                type="button"
                onClick={onBackToHome}
                className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Home</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Source Footers matching VinSearchLoading & user screenshot */}
        <div className="mt-6 sm:mt-7 flex items-center justify-center gap-4 sm:gap-14 text-center px-2 flex-wrap sm:flex-nowrap">
          <div className="flex-1 sm:flex-none">
            <div className="text-[9px] font-black text-slate-500 tracking-widest uppercase">
              SOURCE
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold text-slate-300 mt-0.5 whitespace-nowrap">
              NHTSA Database
            </div>
          </div>

          <div className="w-[1px] h-5 bg-white/10 sm:hidden" />

          <div className="flex-1 sm:flex-none">
            <div className="text-[9px] font-black text-slate-500 tracking-widest uppercase">
              SOURCE
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold text-slate-300 mt-0.5 whitespace-nowrap">
              256-bit SSL
            </div>
          </div>

          <div className="w-[1px] h-5 bg-white/10 sm:hidden" />

          <div className="flex-1 sm:flex-none">
            <div className="text-[9px] font-black text-slate-500 tracking-widest uppercase">
              SOURCE
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold text-slate-300 mt-0.5 whitespace-nowrap">
              Federal Records
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
