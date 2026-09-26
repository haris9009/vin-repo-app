import React from 'react';

interface VinWheelerLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const VinWheelerLogo: React.FC<VinWheelerLogoProps> = ({
  className = '',
  size = 'md',
  onClick,
}) => {
  const scale = size === 'sm' ? 'scale-75' : size === 'lg' ? 'scale-110' : 'scale-100';

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`inline-flex items-center gap-2 select-none group cursor-pointer ${scale} ${className}`}
    >
      {/* Authentic Piston & Banner Icon matching image.png */}
      <div className="relative flex items-center">
        {/* Piston Graphic */}
        <div className="relative flex flex-col items-center">
          {/* Piston crown */}
          <div className="w-5 h-4 bg-yellow-400 rounded-t-sm flex flex-col justify-evenly py-0.5 px-0.5 border border-black/40 shadow-sm">
            <div className="w-full h-0.5 bg-black/60 rounded"></div>
            <div className="w-full h-0.5 bg-black/60 rounded"></div>
          </div>
          {/* Wrist pin / connecting rod */}
          <div className="w-2.5 h-3 bg-gradient-to-b from-yellow-400 to-yellow-500 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
          </div>
          {/* Crank journal ring */}
          <div className="w-4 h-4 rounded-full border-2 border-yellow-400 flex items-center justify-center -mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
          </div>
        </div>

        {/* Text Logo: WHEEL CLARIFY */}
        <div className="ml-1.5 flex flex-col">
          <div className="flex items-center tracking-tighter">
            <span className="font-extrabold text-xl md:text-2xl text-yellow-400 font-sans italic drop-shadow-[0_2px_10px_rgba(250,204,21,0.25)]">
              WHEEL
            </span>
            <span className="ml-1 font-extrabold text-xl md:text-2xl text-yellow-400 font-sans tracking-wider drop-shadow-[0_2px_10px_rgba(250,204,21,0.25)]">
              CLARIFY
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const WheelClarifyLogo = VinWheelerLogo;
