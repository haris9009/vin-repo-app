import React, { useState, useEffect } from 'react';

interface SiteLoadingScreenProps {
  onComplete: () => void;
}

export const SiteLoadingScreen: React.FC<SiteLoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(12);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Total animation time ~2.2 seconds for realistic snappy feel
    const intervalMs = 25;
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsFadingOut(true);
          setTimeout(onComplete, 350);
          return 100;
        }
        const increment = prev < 50 ? 1.8 : prev < 85 ? 1.2 : 0.9;
        return Math.min(100, prev + increment);
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[999] bg-[#121316] flex flex-col justify-between items-center transition-opacity duration-350 ease-out select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top Edge Yellow Progress Bar */}
      <div className="w-full h-1 bg-transparent absolute top-0 left-0">
        <div
          className="h-full bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.9)] transition-all duration-100 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Top Spacer */}
      <div className="h-10" />

      {/* Center Brand & Loading Visuals */}
      <div className="text-center px-4 w-full max-w-lg mx-auto">
        {/* Main Title: WHEELCLARIFY */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black italic tracking-tighter text-white uppercase drop-shadow-lg">
          WHEELCLARIFY
        </h1>

        {/* Divider Lines with Subtitle */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 my-4 max-w-xs sm:max-w-sm mx-auto">
          <div className="h-[1px] flex-1 bg-white/20" />
          <span className="text-yellow-400 font-black text-xs sm:text-sm tracking-[0.25em] uppercase whitespace-nowrap">
            INTELLIGENCE REDEFINED
          </span>
          <div className="h-[1px] flex-1 bg-white/20" />
        </div>

        {/* Center Progress Bar */}
        <div className="mt-8 w-56 sm:w-64 h-2 bg-[#26272c] rounded-full overflow-hidden mx-auto p-0 relative shadow-inner">
          <div
            className="h-full bg-yellow-400 rounded-full transition-all duration-100 ease-out shadow-[0_0_8px_rgba(250,204,21,0.6)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status Subtext */}
        <div className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] text-slate-500 uppercase mt-8">
          SYNCHRONIZING GLOBAL AUTOMOTIVE DATABASES...
        </div>
      </div>

      {/* Bottom Compliance Badges */}
      <div className="pb-8 w-full px-4 flex items-center justify-center gap-6 sm:gap-12 text-[10px] font-mono tracking-widest text-slate-500/80 uppercase">
        <span>NHTSA SECURED</span>
        <span>NMVTIS VERIFIED</span>
        <span>ISO 27001</span>
      </div>
    </div>
  );
};
