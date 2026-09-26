import React, { useState, useEffect } from 'react';
import { Check, ShieldCheck, Star, Sparkles } from 'lucide-react';
import { ReportPlanId } from '../types';
import { adminStore, EditablePackage } from '../services/adminStore';
import pricingHeroImg from '../assets/images/pricing_hero_car_garage_1790203751610.jpg';

interface PricingPageProps {
  onSelectPlan: (planId: ReportPlanId) => void;
  onNavigate: (page: string) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onSelectPlan }) => {
  const [packages, setPackages] = useState<EditablePackage[]>(() => adminStore.getPackages());

  useEffect(() => {
    const sync = () => setPackages(adminStore.getPackages());
    window.addEventListener('wc_packages_updated', sync);
    return () => window.removeEventListener('wc_packages_updated', sync);
  }, []);

  const activePackages = packages.filter((p) => p.isActive !== false);
  const displayPackages = activePackages.length > 0 ? activePackages : packages;

  return (
    <div className="w-full min-h-screen bg-[#f3f5f8] text-slate-900 font-sans animate-fadeIn">
      {/* =========================================================================
          HERO SECTION (MATCHING USER SCREENSHOT 1)
          Dark automotive workshop background with open-hood silver sedan,
          bold italic typography: "FEDERAL RECORD AUDIT PACKAGES."
          ========================================================================= */}
      <section className="relative w-full overflow-hidden bg-[#0d1017] text-white pt-20 pb-28 sm:pt-28 sm:pb-36 px-4 text-center">
        {/* Background Image with Dark Vignette Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45 mix-blend-luminosity scale-105"
          style={{ backgroundImage: `url(${pricingHeroImg})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/75 to-[#0d1017]"></div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black italic tracking-tighter uppercase text-white leading-none drop-shadow-md">
            FEDERAL RECORD <br className="hidden sm:inline" />
            <span className="text-yellow-400">AUDIT</span> PACKAGES.
          </h1>
          <p className="text-slate-300 font-medium text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Elite vehicle history data sourced directly from federal and insurance databases. No compromises.
          </p>
        </div>
      </section>

      {/* =========================================================================
          PRICING CARDS SECTION (ALL DYNAMIC PACKAGES)
          ========================================================================= */}
      <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 pb-24">
        <div
          className={`grid grid-cols-1 ${
            displayPackages.length === 2
              ? 'md:grid-cols-2 max-w-4xl'
              : displayPackages.length === 4
              ? 'md:grid-cols-2 lg:grid-cols-4'
              : displayPackages.length > 4
              ? 'md:grid-cols-2 lg:grid-cols-3'
              : 'md:grid-cols-3'
          } gap-8 items-stretch mx-auto`}
        >
          {displayPackages.map((pkg) => {
            const isPopular = pkg.isPopular;

            if (isPopular) {
              return (
                <div
                  key={pkg.id}
                  className="bg-[#0b0f17] text-white rounded-[36px] p-8 sm:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.3)] border-2 border-yellow-400 flex flex-col justify-between relative transition-all duration-300 hover:shadow-[0_30px_70px_rgba(250,204,21,0.2)] hover:-translate-y-2 overflow-hidden"
                >
                  {/* Subtle golden corner glow */}
                  <div className="absolute top-0 right-0 w-44 h-44 bg-yellow-400/15 rounded-full blur-3xl pointer-events-none"></div>

                  {/* Top Badge: "MOST POPULAR AUDIT" */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-yellow-400 text-black font-black text-[10px] sm:text-xs tracking-widest uppercase px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-md border border-yellow-300 whitespace-nowrap">
                      <Star className="w-3.5 h-3.5 fill-black" />
                      MOST POPULAR AUDIT
                    </span>
                  </div>

                  <div>
                    <div className="pt-2">
                      <h2 className="text-2xl sm:text-3xl font-black italic tracking-tight text-yellow-400 uppercase">
                        {pkg.name}
                      </h2>
                      <p className="text-slate-300 italic text-xs sm:text-sm mt-1.5 font-medium">
                        "{pkg.tagline}"
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mt-7 flex items-baseline">
                      <span className="text-4xl sm:text-5xl font-black text-white tracking-tight font-sans">
                        ${pkg.price.toFixed(2)}
                      </span>
                      <span className="text-[11px] font-black text-yellow-400/80 tracking-wider uppercase ml-2">
                        / {pkg.credits || 1} HISTORY CREDIT
                      </span>
                    </div>

                    {/* Delivery Window */}
                    <div className="mt-8 pt-4 border-t border-white/10">
                      <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                        DELIVERY WINDOW
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block shadow-[0_0_8px_rgba(250,204,21,0.8)]"></span>
                        <span className="text-sm sm:text-base font-black text-white uppercase tracking-tight">
                          {pkg.deliveryTime}
                        </span>
                      </div>
                    </div>

                    {/* Features List */}
                    <ul className="mt-8 space-y-4">
                      {pkg.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-3">
                          <Check className="w-4 h-4 text-yellow-400 stroke-[3.5] shrink-0" />
                          <span className="text-xs sm:text-sm font-black tracking-wide text-slate-100 uppercase">
                            {feat}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action CTA Button */}
                  <div className="mt-10">
                    <button
                      type="button"
                      onClick={() => onSelectPlan(pkg.id)}
                      className="w-full py-4 rounded-full bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs sm:text-sm uppercase tracking-widest transition-all duration-200 shadow-lg shadow-yellow-400/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>ORDER THIS AUDIT</span>
                    </button>
                  </div>
                </div>
              );
            }

            // Standard / regular cards
            return (
              <div
                key={pkg.id}
                className="bg-white rounded-[36px] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-200/80 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_25px_60px_rgba(0,0,0,0.12)] hover:-translate-y-1"
              >
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black italic tracking-tight text-slate-900 uppercase">
                    {pkg.name}
                  </h2>
                  <p className="text-slate-500 italic text-xs sm:text-sm mt-1.5 font-medium">
                    "{pkg.tagline}"
                  </p>

                  {/* Price */}
                  <div className="mt-7 flex items-baseline">
                    <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-sans">
                      ${pkg.price.toFixed(2)}
                    </span>
                    <span className="text-[11px] font-black text-slate-400 tracking-wider uppercase ml-2">
                      / {pkg.credits || 1} HISTORY CREDIT
                    </span>
                  </div>

                  {/* Delivery Window */}
                  <div className="mt-8 pt-4 border-t border-slate-100">
                    <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      DELIVERY WINDOW
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block shadow-xs"></span>
                      <span className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight">
                        {pkg.deliveryTime}
                      </span>
                    </div>
                  </div>

                  {/* Features List */}
                  <ul className="mt-8 space-y-4">
                    {pkg.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <Check className="w-4 h-4 text-indigo-600 stroke-[3.5] shrink-0" />
                        <span className="text-xs sm:text-sm font-black tracking-wide text-slate-800 uppercase">
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action CTA Button */}
                <div className="mt-10">
                  <button
                    type="button"
                    onClick={() => onSelectPlan(pkg.id)}
                    className="w-full py-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm uppercase tracking-widest transition-all duration-200 shadow-md cursor-pointer active:scale-95"
                  >
                    ORDER THIS AUDIT
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security & Guarantee Strip */}
        <div className="mt-16 p-6 sm:p-8 rounded-[28px] bg-white border border-slate-200/80 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-600">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-yellow-400/15 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-7 h-7 text-yellow-500" />
            </div>
            <div>
              <div className="font-black text-slate-900 text-sm uppercase tracking-tight">
                100% Federal Data Registry Guarantee
              </div>
              <div className="text-slate-500 mt-0.5">
                Every audit queries official 50-state registries, insurance total loss archives, and police records.
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono font-bold text-slate-500 shrink-0">
            <span className="px-3 py-1.5 rounded-full bg-slate-100">256-BIT SSL</span>
            <span className="px-3 py-1.5 rounded-full bg-slate-100">STRIPE ENCRYPTED</span>
            <span className="px-3 py-1.5 rounded-full bg-slate-100">PAYPAL CERTIFIED</span>
          </div>
        </div>
      </section>
    </div>
  );
};
