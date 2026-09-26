import React, { useState, useEffect, useRef } from 'react';
import {
  Car,
  Users,
  Shield,
  AlertTriangle,
  FileText,
  Gauge,
  Link2,
  Tag,
  ShieldAlert,
  RotateCcw,
  DollarSign,
} from 'lucide-react';

interface VinSearchLoadingProps {
  vin: string;
  searchType?: 'vin' | 'plate';
  state?: string;
  onComplete: () => void;
}

interface StepItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  threshold: number; // Percentage threshold
}

const STEPS: StepItem[] = [
  { id: 'specs', name: 'SPECS', icon: Car, threshold: 10 },
  { id: 'owners', name: 'OWNERS', icon: Users, threshold: 20 },
  { id: 'salvage', name: 'SALVAGE', icon: Shield, threshold: 30 },
  { id: 'accidents', name: 'ACCIDENTS', icon: AlertTriangle, threshold: 40 },
  { id: 'titles', name: 'TITLES', icon: FileText, threshold: 50 },
  { id: 'mileage', name: 'MILEAGE', icon: Gauge, threshold: 60 },
  { id: 'liens', name: 'LIENS', icon: Link2, threshold: 70 },
  { id: 'sales', name: 'SALES', icon: Tag, threshold: 78 },
  { id: 'theft', name: 'THEFT', icon: ShieldAlert, threshold: 85 },
  { id: 'recalls', name: 'RECALLS', icon: RotateCcw, threshold: 94 },
  { id: 'values', name: 'VALUES', icon: DollarSign, threshold: 100 },
];

export const VinSearchLoading: React.FC<VinSearchLoadingProps> = ({
  vin,
  searchType = 'vin',
  state,
  onComplete,
}) => {
  const [progress, setProgress] = useState(12);
  const activeStepRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Total animation time: ~2.8 seconds
    const intervalMs = 40;
    const increment = 1.4;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 300);
          return 100;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [onComplete]);

  // Determine active category based on current progress
  const activeStepIndex = STEPS.findIndex((s) => progress <= s.threshold);
  const currentStep = activeStepIndex !== -1 ? STEPS[activeStepIndex] : STEPS[STEPS.length - 1];

  // Auto-scroll active item into center view smoothly on mobile screens
  useEffect(() => {
    const container = scrollContainerRef.current;
    const activeEl = activeStepRef.current;
    if (container && activeEl) {
      const containerWidth = container.clientWidth;
      const elementLeft = activeEl.offsetLeft;
      const elementWidth = activeEl.clientWidth;
      const targetScroll = elementLeft - containerWidth / 2 + elementWidth / 2;
      container.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: 'smooth',
      });
    }
  }, [currentStep.id]);

  return (
    <div className="fixed inset-0 z-50 bg-[#121418] flex flex-col items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans select-none animate-fadeIn">
      {/* Background ambient glow */}
      <div className="absolute w-[600px] h-[600px] bg-yellow-400/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-[680px] flex flex-col items-center">
        {/* Brand Logo matching uploaded screenshot */}
        <div className="flex flex-col items-center mb-5">
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

        {/* Subtitle & Search Headline */}
        <div className="text-center space-y-1 mb-5 sm:mb-6 px-2 w-full">
          <div className="text-yellow-400 font-extrabold text-[10px] tracking-[0.25em] uppercase">
            FEDERAL DATABASE QUERY
          </div>
          <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight uppercase break-all leading-tight">
            {searchType === 'plate'
              ? `SEARCHING PLATE #${vin || 'CALIFORNIA'}${state ? ` (${state})` : ''}`
              : `SEARCHING VIN #${vin || 'SKAHIDKLHASLKHFD'}`}
          </h1>
          <p className="text-slate-400 text-xs italic font-medium">
            Please wait while we query federal vehicle registries...
          </p>
        </div>

        {/* Main Loading Card matching screenshot */}
        <div className="w-full bg-[#202227] border border-white/5 rounded-[22px] sm:rounded-[24px] p-4 sm:p-7 shadow-2xl overflow-hidden">
          {/* Progress Bar Track */}
          <div className="w-full">
            <div className="w-full h-2 bg-[#2d3038] rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 rounded-full transition-all duration-75 ease-out shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                style={{ width: `${Math.min(100, Math.max(3, progress))}%` }}
              ></div>
            </div>

            {/* SCANNING & Percentage row */}
            <div className="flex items-center justify-between mt-2.5 text-[11px] font-black">
              <span className="text-slate-400 tracking-widest uppercase">SCANNING...</span>
              <span className="text-yellow-400 font-mono tracking-wider font-bold">
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          {/* 11 Icon Badges with responsive auto-scroll mobile carousel */}
          <div className="relative mt-6 sm:mt-8 w-full">
            {/* Mobile edge subtle gradient shadows to convey overflow smoothly */}
            <div className="sm:hidden pointer-events-none absolute left-0 top-0 bottom-0 w-5 bg-gradient-to-r from-[#202227] to-transparent z-10" />
            <div className="sm:hidden pointer-events-none absolute right-0 top-0 bottom-0 w-5 bg-gradient-to-l from-[#202227] to-transparent z-10" />

            <div
              ref={scrollContainerRef}
              className="w-full flex items-center overflow-x-auto sm:overflow-visible sm:justify-between gap-2 sm:gap-1.5 py-1 px-1 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {STEPS.map((step) => {
                const Icon = step.icon;
                const isActive = step.id === currentStep.id;
                const isCompleted = progress > step.threshold;

                return (
                  <div
                    key={step.id}
                    ref={isActive ? activeStepRef : null}
                    className="shrink-0 w-11 sm:w-auto sm:shrink sm:flex-1 flex flex-col items-center select-none"
                  >
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                        isActive
                          ? 'bg-yellow-400 text-black shadow-[0_0_15px_rgba(250,204,21,0.45)] scale-105'
                          : isCompleted
                          ? 'bg-[#272a31] text-slate-300 border border-white/10'
                          : 'bg-[#272a31]/60 text-slate-500 border border-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4 stroke-[2]" />
                    </div>
                    <span
                      className={`text-[8px] sm:text-[9px] font-black tracking-wider uppercase mt-1.5 transition-colors text-center whitespace-nowrap ${
                        isActive
                          ? 'text-yellow-400 font-extrabold'
                          : isCompleted
                          ? 'text-slate-400'
                          : 'text-slate-600'
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3 Source Footers matching screenshot */}
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
