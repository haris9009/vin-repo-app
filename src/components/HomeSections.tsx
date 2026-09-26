import React, { useState } from 'react';
import { Star, Plus, X } from 'lucide-react';
import mascotImage from '../assets/images/obd_scanner_mascot_isolated_1790201131431.jpg';

interface HomeSectionsProps {
  onGetStarted: () => void;
  onViewPricing: () => void;
}

export const HomeSections: React.FC<HomeSectionsProps> = ({ onGetStarted, onViewPricing }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'WHAT IS WHEELCLARIFY?',
      a: '"WheelClarify is a Global Vehicle Data Provider. We specialize in providing comprehensive history reports for vehicles registered in the United States, United Kingdom and Canada to help you make informed decisions."',
    },
    {
      q: 'HOW DO I BUY A REPORT?',
      a: '"Simply enter any 17-digit VIN or US license plate in our search tool. Preview the identified vehicle summary, select your preferred plan (Standard or Silver), and complete payment via Stripe or PayPal for instant unsealing."',
    },
    {
      q: 'WHAT INFORMATION IS INCLUDED IN A REPORT?',
      a: '"Our full reports include official 50-state NMVTIS title brands, salvage and junk declarations, insurance total-loss records, police collision archives, odometer rollback detection, active lien searches, and open NHTSA safety recalls."',
    },
    {
      q: 'HOW ACCURATE IS THE NMVTIS DATA?',
      a: '"NMVTIS is established under federal statute and updated regularly by state DMVs, insurance carriers, and salvage auto auctions nationwide. It represents the highest legal standard of vehicle title history in the United States."',
    },
    {
      q: 'CAN I SEARCH BY LICENSE PLATE?',
      a: '"Yes! Select the PLATE SEARCH tab on the home page, enter the vehicle\'s state and plate characters, and our system will map the plate to its official 17-digit VIN before retrieving the registry record."',
    },
  ];

  return (
    <div className="w-full">
      {/* =========================================================================
          SECTION 1: 4-COLUMN FEATURE PILLS (SCREENSHOT 1: INTEL, ETHICS, PACE, UX)
          White background
          ========================================================================= */}
      <section className="w-full bg-white text-slate-900 py-16 sm:py-20 px-4 sm:px-8 border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {/* INTEL */}
            <div className="space-y-3">
              <span className="inline-block px-3 py-1 bg-black text-yellow-400 font-extrabold text-[11px] tracking-widest uppercase rounded shadow-sm">
                INTEL
              </span>
              <h2 className="text-xl sm:text-2xl font-black italic uppercase tracking-tight text-black">
                DEEP USA INSIGHTS
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm italic leading-relaxed">
                We search deeper than the surface. Our data spans decades of vehicle logs across the entire continent including NMVTIS federal files.
              </p>
            </div>

            {/* ETHICS */}
            <div className="space-y-3">
              <span className="inline-block px-3 py-1 bg-black text-yellow-400 font-extrabold text-[11px] tracking-widest uppercase rounded shadow-sm">
                ETHICS
              </span>
              <h2 className="text-xl sm:text-2xl font-black italic uppercase tracking-tight text-black">
                ABSOLUTE INTEGRITY
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm italic leading-relaxed">
                We never filter data to favor sellers. You get the raw facts exactly as they appear in official government records.
              </p>
            </div>

            {/* PACE */}
            <div className="space-y-3">
              <span className="inline-block px-3 py-1 bg-black text-yellow-400 font-extrabold text-[11px] tracking-widest uppercase rounded shadow-sm">
                PACE
              </span>
              <h2 className="text-xl sm:text-2xl font-black italic uppercase tracking-tight text-black">
                LIGHTNING SPEED
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm italic leading-relaxed">
                In a competitive market, time is money. Our reports are processed and delivered in seconds.
              </p>
            </div>

            {/* UX */}
            <div className="space-y-3">
              <span className="inline-block px-3 py-1 bg-black text-yellow-400 font-extrabold text-[11px] tracking-widest uppercase rounded shadow-sm">
                UX
              </span>
              <h2 className="text-xl sm:text-2xl font-black italic uppercase tracking-tight text-black">
                USER FIRST
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm italic leading-relaxed">
                Every feature we build is designed to make your buying journey safer and more enjoyable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: OFFICIAL USA DATA. ABSOLUTE PROOF. + MASCOT + 01-06 GRID
          (SCREENSHOT 2 & 3 / IMAGE 2)
          Pure white background, no card/box around robot mascot
          ========================================================================= */}
      <section className="w-full bg-white text-slate-900 py-16 sm:py-24 px-4 sm:px-8 border-b border-slate-100">
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Header Row with Mascot directly on white background */}
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left max-w-2xl mx-auto md:mx-0">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black italic uppercase tracking-tight leading-[1.05] text-black">
                OFFICIAL USA DATA.
                <br />
                <span className="text-yellow-400 drop-shadow-[0_0_25px_rgba(250,204,21,0.45)]">
                  ABSOLUTE PROOF.
                </span>
              </h2>
              <p className="mt-4 text-slate-500 text-sm sm:text-base italic leading-relaxed max-w-xl font-medium">
                "We aggregate billions of data points to ensure your vehicle purchase is a sound investment."
              </p>
            </div>

            {/* Cute 3D OBD Scanner Mascot Character seamlessly placed on white background without card */}
            <div className="shrink-0 flex justify-center md:justify-end">
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
                <img
                  src={mascotImage}
                  alt="Official Vehicle Diagnostic Scanner Character"
                  className="w-full h-full object-contain mix-blend-multiply transition-transform hover:scale-105 duration-300 pointer-events-none select-none"
                />
              </div>
            </div>
          </div>

          {/* 6-Item Numbered Grid: 01 to 06 matching Screenshot 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 sm:gap-12 pt-4">
            {/* 01 */}
            <div className="space-y-2">
              <div className="text-4xl sm:text-5xl font-black italic text-slate-200 tracking-tighter">
                01
              </div>
              <h3 className="text-lg sm:text-xl font-black italic uppercase text-black tracking-tight">
                OFFICIAL NMVTIS DATA
              </h3>
              <div className="w-12 h-1 bg-yellow-400 rounded-full"></div>
              <p className="text-slate-600 text-xs sm:text-sm italic leading-relaxed pt-1">
                Direct access to the National Motor Vehicle Title Information System for title brands and salvage alerts.
              </p>
            </div>

            {/* 02 */}
            <div className="space-y-2">
              <div className="text-4xl sm:text-5xl font-black italic text-slate-200 tracking-tighter">
                02
              </div>
              <h3 className="text-lg sm:text-xl font-black italic uppercase text-black tracking-tight">
                ACCIDENT & CONFLICT
              </h3>
              <div className="w-12 h-1 bg-yellow-400 rounded-full"></div>
              <p className="text-slate-600 text-xs sm:text-sm italic leading-relaxed pt-1">
                Detect undisclosed damage from major insurance carriers and police reports across all 50 states.
              </p>
            </div>

            {/* 03 */}
            <div className="space-y-2">
              <div className="text-4xl sm:text-5xl font-black italic text-slate-200 tracking-tighter">
                03
              </div>
              <h3 className="text-lg sm:text-xl font-black italic uppercase text-black tracking-tight">
                ODOMETER VERIFICATION
              </h3>
              <div className="w-12 h-1 bg-yellow-400 rounded-full"></div>
              <p className="text-slate-600 text-xs sm:text-sm italic leading-relaxed pt-1">
                Cross-reference service records to detect digital rollback or mechanical inconsistencies.
              </p>
            </div>

            {/* 04 */}
            <div className="space-y-2">
              <div className="text-4xl sm:text-5xl font-black italic text-slate-200 tracking-tighter">
                04
              </div>
              <h3 className="text-lg sm:text-xl font-black italic uppercase text-black tracking-tight">
                THEFT RECORD CHECK
              </h3>
              <div className="w-12 h-1 bg-yellow-400 rounded-full"></div>
              <p className="text-slate-600 text-xs sm:text-sm italic leading-relaxed pt-1">
                Real-time verification against the FBI's National Crime Information Center for stolen status.
              </p>
            </div>

            {/* 05 */}
            <div className="space-y-2">
              <div className="text-4xl sm:text-5xl font-black italic text-slate-200 tracking-tighter">
                05
              </div>
              <h3 className="text-lg sm:text-xl font-black italic uppercase text-black tracking-tight">
                TITLE & LIEN SEARCH
              </h3>
              <div className="w-12 h-1 bg-yellow-400 rounded-full"></div>
              <p className="text-slate-600 text-xs sm:text-sm italic leading-relaxed pt-1">
                Verify current ownership status and check for active financial liens that could block a sale.
              </p>
            </div>

            {/* 06 - Highlighted in yellow in Screenshot 3 */}
            <div className="space-y-2">
              <div className="text-4xl sm:text-5xl font-black italic text-yellow-400 tracking-tighter">
                06
              </div>
              <h3 className="text-lg sm:text-xl font-black italic uppercase text-black tracking-tight">
                RECALL DATABASE
              </h3>
              <div className="w-12 h-1 bg-yellow-400 rounded-full"></div>
              <p className="text-slate-600 text-xs sm:text-sm italic leading-relaxed pt-1">
                Identify open safety recalls from manufacturers that haven't been addressed by previous owners.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: TESTIMONIALS (IMAGE 1 EXACT MATCH)
          Dark Charcoal #23252a background with deep dark #121316 rounded cards
          ========================================================================= */}
      <section className="w-full bg-[#23252a] text-white py-20 sm:py-28 px-4 sm:px-8 border-b border-black/20">
        <div className="max-w-7xl mx-auto space-y-14">
          {/* Top Bar: Headline on left, Rating on right */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black italic uppercase tracking-tight leading-[1.05] text-white">
                TRANSPARENT USA DATA.
                <br />
                <span className="text-yellow-400">BETTER DECISIONS.</span>
              </h2>
              <p className="mt-4 text-slate-200 text-sm sm:text-base font-normal italic max-w-xl leading-relaxed">
                Join over 150,000 Americans who use WheelClarify to protect their families and their wallets.
              </p>
            </div>

            {/* Rating */}
            <div className="flex flex-col items-start md:items-end gap-1 shrink-0">
              <div className="flex items-center gap-1 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-xs font-black tracking-wider text-white uppercase mt-1">
                4.9/5 AVERAGE RATING
              </span>
            </div>
          </div>

          {/* 3 Testimonial Cards matching Image 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Card 1: David Chen */}
            <div className="bg-[#121316] rounded-[34px] p-8 sm:p-10 flex flex-col justify-between min-h-[380px] shadow-2xl transition-transform hover:-translate-y-1 duration-200">
              <div className="space-y-6">
                <div className="flex items-center gap-1.5 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-white font-bold italic text-base sm:text-lg leading-relaxed">
                  "Saved me from buying a car that had been in a major flood. The report was clear and showed the salvage title that the seller tried to hide."
                </p>
              </div>
              <div className="pt-8">
                <div className="font-black italic uppercase text-base text-white tracking-wide">
                  DAVID CHEN
                </div>
                <div className="text-xs font-bold uppercase text-slate-400 tracking-wider mt-1">
                  CALIFORNIA VERIFIED BUYER
                </div>
              </div>
            </div>

            {/* Card 2: Sarah Miller */}
            <div className="bg-[#121316] rounded-[34px] p-8 sm:p-10 flex flex-col justify-between min-h-[380px] shadow-2xl transition-transform hover:-translate-y-1 duration-200">
              <div className="space-y-6">
                <div className="flex items-center gap-1.5 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-white font-bold italic text-base sm:text-lg leading-relaxed">
                  "I use WheelClarify for every car I consider. The interface is clean and the reports are much easier to understand than the ones from the big guys."
                </p>
              </div>
              <div className="pt-8">
                <div className="font-black italic uppercase text-base text-white tracking-wide">
                  SARAH MILLER
                </div>
                <div className="text-xs font-bold uppercase text-slate-400 tracking-wider mt-1">
                  TEXAS PRIVATE SELLER
                </div>
              </div>
            </div>

            {/* Card 3: Marc Thompson */}
            <div className="bg-[#121316] rounded-[34px] p-8 sm:p-10 flex flex-col justify-between min-h-[380px] shadow-2xl transition-transform hover:-translate-y-1 duration-200">
              <div className="space-y-6">
                <div className="flex items-center gap-1.5 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-white font-bold italic text-base sm:text-lg leading-relaxed">
                  "Efficiency is key for my business. The VIN decode gives me the specs I need instantly, and the premium reports are highly reliable."
                </p>
              </div>
              <div className="pt-8">
                <div className="font-black italic uppercase text-base text-white tracking-wide">
                  MARC THOMPSON
                </div>
                <div className="text-xs font-bold uppercase text-slate-400 tracking-wider mt-1">
                  FLORIDA DEALERSHIP OWNER
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: FAQ (SCREENSHOT 5)
          White Background - FREQUENTLY ASKED INTELLIGENCE.
          ========================================================================= */}
      <section className="w-full bg-white text-slate-900 py-16 sm:py-24 px-4 sm:px-8 border-b border-slate-100">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-3xl sm:text-5xl font-black italic uppercase tracking-tight text-black">
              FREQUENTLY ASKED
              <br />
              <span className="text-yellow-400">INTELLIGENCE.</span>
            </h2>
            <p className="text-slate-500 text-sm sm:text-base italic">
              "Everything you need to know about the WheelClarify platform in the USA."
            </p>
          </div>

          <div className="border-t border-slate-200/80 pt-6 space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl transition-all duration-200 ${
                    isOpen
                      ? 'bg-slate-100/90 border-l-4 border-l-yellow-400 p-6 shadow-sm'
                      : 'bg-white p-5 border-b border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span
                      className={`font-black italic uppercase tracking-tight text-sm sm:text-base ${
                        isOpen ? 'text-black' : 'text-black hover:text-yellow-600'
                      }`}
                    >
                      {faq.q}
                    </span>
                    <span className="text-slate-400 hover:text-black">
                      {isOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="mt-4 pt-3 border-t border-slate-200/60 text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: BOTTOM CTA BANNER (SCREENSHOT 6)
          Dark Background - PROTECT YOUR FAMILY. VERIFY THE VEHICLE.
          ========================================================================= */}
      <section className="w-full bg-[#111317] text-white py-20 sm:py-28 px-4 sm:px-8 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <h2 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tight leading-none text-white">
            PROTECT YOUR FAMILY.
            <br />
            <span className="text-yellow-400">VERIFY THE VEHICLE.</span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base italic max-w-xl mx-auto leading-relaxed">
            "Join over 150,000 Americans who prioritize safety and transparency in every transaction."
          </p>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-[0_0_25px_rgba(250,204,21,0.35)] cursor-pointer active:scale-95"
            >
              GET STARTED INSTANTLY
            </button>

            <button
              onClick={onViewPricing}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-transparent hover:bg-yellow-400/10 text-yellow-400 border border-yellow-400/60 hover:border-yellow-400 font-extrabold text-xs sm:text-sm tracking-wider uppercase transition-all cursor-pointer"
            >
              VIEW OFFICIAL PRICING
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
