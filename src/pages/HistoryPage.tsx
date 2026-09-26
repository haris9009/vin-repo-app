import React from 'react';
import heroSedanImg from '../assets/images/pricing_hero_car_garage_1790203751610.jpg';
import yellowSuvImg from '../assets/images/hero_yellow_suv_garage_1790116036343.jpg';

interface HistoryPageProps {
  historyList?: string[];
  onSelectVin?: (vin: string) => void;
  onClearHistory?: () => void;
  onNavigate: (page: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onNavigate }) => {
  return (
    <div className="w-full min-h-screen bg-black text-white font-sans animate-fadeIn">
      {/* =========================================================================
          SECTION 1: HERO SECTION (SCREENSHOT 4)
          Dark automotive workshop background with silver sedan,
          bold italic typography: "TRANSPARENCY IN MOTION."
          ========================================================================= */}
      <section className="relative w-full overflow-hidden bg-[#0d1017] text-white pt-24 pb-32 sm:pt-32 sm:pb-40 px-4 text-center">
        {/* Background Image with Dark Vignette Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45 mix-blend-luminosity scale-105"
          style={{ backgroundImage: `url(${heroSedanImg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black italic tracking-tight uppercase text-white leading-none drop-shadow-md">
            TRANSPARENCY IN <br />
            <span className="text-yellow-400">MOTION.</span>
          </h1>

          <p className="text-slate-300 italic font-medium text-base sm:text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed">
            Born in the USA out of the need for reliable, accessible, and fast vehicle data for every car buyer. We're redefining how people buy used cars.
          </p>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: MISSION & YELLOW CAR (SCREENSHOT 3)
          "PROTECTING EVERY INVESTMENT." with yellow quote block and yellow SUV image
          ========================================================================= */}
      <section className="relative w-full bg-black py-20 sm:py-28 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column: Heading, Quote, Description */}
            <div className="space-y-8">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tight uppercase text-white leading-none">
                PROTECTING EVERY <br />
                <span className="text-yellow-400">INVESTMENT.</span>
              </h2>

              {/* Yellow Bordered Quote Block */}
              <div className="border-l-4 border-yellow-400 pl-6 py-1">
                <p className="text-slate-200 italic font-medium text-base sm:text-lg md:text-xl leading-relaxed">
                  "At WheelClarify, we believe that every used car purchase should be backed by truth. The American secondary market is complex, and hidden issues can lead to dangerous situations and financial loss."
                </p>
              </div>

              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Our mission is to level the playing field. By aggregating data from a vast network of government agencies, insurance records, and salvage logs across all 50 states, we provide the clarity needed to make confident decisions.
              </p>
            </div>

            {/* Right Column: Yellow SUV with Open Hood in Workshop */}
            <div className="relative">
              <div className="rounded-[32px] sm:rounded-[40px] overflow-hidden border border-white/10 shadow-2xl bg-[#141a24]">
                <img
                  src={yellowSuvImg}
                  alt="Protecting Every Investment - Inspection Workshop"
                  className="w-full h-auto object-cover block"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: 4 PILLARS GRID (SCREENSHOT 2)
          Clean white background with 4 columns: INTEL, ETHICS, PACE, UX
          ========================================================================= */}
      <section className="relative w-full bg-white text-slate-900 py-24 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 items-start">
            {/* Column 1: INTEL */}
            <div className="space-y-4">
              <span className="inline-block px-3.5 py-1 rounded-md bg-black text-yellow-400 text-[11px] font-black uppercase tracking-widest shadow-md">
                INTEL
              </span>
              <h3 className="text-2xl sm:text-3xl font-black italic tracking-tight text-slate-950 uppercase leading-tight">
                DEEP USA <br />
                INSIGHTS
              </h3>
              <p className="text-slate-600 italic text-sm leading-relaxed font-medium">
                We search deeper than the surface. Our data spans decades of vehicle logs across the entire continent including NMVTIS federal files.
              </p>
            </div>

            {/* Column 2: ETHICS */}
            <div className="space-y-4">
              <span className="inline-block px-3.5 py-1 rounded-md bg-black text-yellow-400 text-[11px] font-black uppercase tracking-widest shadow-md">
                ETHICS
              </span>
              <h3 className="text-2xl sm:text-3xl font-black italic tracking-tight text-slate-950 uppercase leading-tight">
                ABSOLUTE <br />
                INTEGRITY
              </h3>
              <p className="text-slate-600 italic text-sm leading-relaxed font-medium">
                We never filter data to favor sellers. You get the raw facts exactly as they appear in official government records.
              </p>
            </div>

            {/* Column 3: PACE */}
            <div className="space-y-4">
              <span className="inline-block px-3.5 py-1 rounded-md bg-black text-yellow-400 text-[11px] font-black uppercase tracking-widest shadow-md">
                PACE
              </span>
              <h3 className="text-2xl sm:text-3xl font-black italic tracking-tight text-slate-950 uppercase leading-tight">
                LIGHTNING SPEED
              </h3>
              <p className="text-slate-600 italic text-sm leading-relaxed font-medium">
                In a competitive market, time is money. Our reports are processed and delivered in seconds.
              </p>
            </div>

            {/* Column 4: UX */}
            <div className="space-y-4">
              <span className="inline-block px-3.5 py-1 rounded-md bg-black text-yellow-400 text-[11px] font-black uppercase tracking-widest shadow-md">
                UX
              </span>
              <h3 className="text-2xl sm:text-3xl font-black italic tracking-tight text-slate-950 uppercase leading-tight">
                USER FIRST
              </h3>
              <p className="text-slate-600 italic text-sm leading-relaxed font-medium">
                Every feature we build is designed to make your buying journey safer and more enjoyable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: CALL TO ACTION BANNER (SCREENSHOT 1)
          "READY TO DECODE?" inside a dark rounded card on white canvas
          ========================================================================= */}
      <section className="relative w-full bg-white pb-24 sm:pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto bg-[#171813] text-white rounded-[36px] sm:rounded-[48px] py-16 sm:py-20 px-6 sm:px-12 md:px-16 text-center shadow-2xl">
          <div className="max-w-3xl mx-auto space-y-5">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tight uppercase text-white leading-tight">
              READY TO DECODE?
            </h2>

            <p className="text-slate-300 italic text-base sm:text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
              Join over 100,000 monthly users who trust WheelClarify for their car buying journey. Your first 3 decodes are on us.
            </p>

            {/* Action Buttons */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onNavigate('home')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 shadow-[0_10px_25px_rgba(250,204,21,0.35)] active:scale-95 cursor-pointer"
              >
                START INSTANT SEARCH
              </button>
              <button
                onClick={() => onNavigate('pricing')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#2a2b24] hover:bg-[#34362d] text-slate-200 border border-white/10 font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer"
              >
                VIEW PRICING
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
