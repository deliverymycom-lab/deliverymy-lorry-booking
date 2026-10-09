import React from 'react';

interface DeliveryMyLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  animated?: boolean;
  onDark?: boolean;
  className?: string;
}

export const DeliveryMyLogo: React.FC<DeliveryMyLogoProps> = ({
  size = 'md',
  showText = true,
  animated = true,
  onDark = false,
  className = '',
}) => {
  const iconSize = size === 'sm' ? 'w-7 h-7 sm:w-8 sm:h-8' : size === 'lg' ? 'w-12 h-12 sm:w-14 sm:h-14' : 'w-8 h-8 sm:w-10 sm:h-10';
  const textSize = size === 'sm' ? 'text-sm sm:text-base' : size === 'lg' ? 'text-xl sm:text-3xl' : 'text-base sm:text-xl';

  return (
    <div className={`flex items-center gap-1.5 sm:gap-2.5 select-none ${className}`}>
      {/* Animated Lorry Vehicle Badge */}
      <div
        className={`relative ${iconSize} rounded-2xl bg-gradient-to-tr from-[#FF6B00] via-[#FF8500] to-[#FF9100] p-1.5 flex items-center justify-center shadow-lg shadow-orange-600/30 overflow-hidden shrink-0 group border border-orange-300/50`}
      >
        {/* Animated Speed Streaks / Road dashes */}
        <div className="absolute inset-0 bg-radial from-white/20 to-transparent pointer-events-none" />

        {/* Lorry Graphic with driving animation */}
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`w-full h-full drop-shadow-md ${animated ? 'animate-lorry-drive' : ''}`}
        >
          {/* Headlight beam */}
          <path
            d="M52 38L64 34L64 44L52 40Z"
            fill="url(#headlightGrad)"
            opacity="0.6"
            className={animated ? 'animate-pulse' : ''}
          />

          {/* Lorry Cargo Container (Blue / Cyan modern finish) */}
          <rect
            x="4"
            y="18"
            width="32"
            height="22"
            rx="2.5"
            fill="#FFFFFF"
            stroke="#0D47A1"
            strokeWidth="1.5"
          />
          {/* Container Stripes / Details */}
          <line x1="12" y1="19" x2="12" y2="39" stroke="#E2E8F0" strokeWidth="1.5" />
          <line x1="20" y1="19" x2="20" y2="39" stroke="#E2E8F0" strokeWidth="1.5" />
          <line x1="28" y1="19" x2="28" y2="39" stroke="#E2E8F0" strokeWidth="1.5" />
          <rect x="6" y="24" width="8" height="3" rx="1" fill="#FF6B00" />
          <rect x="6" y="29" width="12" height="2" rx="0.5" fill="#0D47A1" />

          {/* Lorry Cab (Front cabin) */}
          <path
            d="M37 24H47C48.5 24 50 25.5 51 28L54 34V40H37V24Z"
            fill="#FF6B00"
            stroke="#E65100"
            strokeWidth="1.2"
          />
          {/* Windshield Glass */}
          <path
            d="M45 26H40V33H51L48.5 28C47.8 26.8 46.5 26 45 26Z"
            fill="#0284C7"
            opacity="0.85"
          />
          {/* Headlight lamp */}
          <circle cx="53" cy="38" r="2" fill="#FEF08A" />

          {/* Chassis Under-rail */}
          <rect x="6" y="39.5" width="46" height="3" rx="1" fill="#1E293B" />

          {/* Rear Wheel & Rim with active spin */}
          <g className={animated ? 'animate-[spin_2s_linear_infinite] origin-[15px_45px]' : ''}>
            <circle cx="15" cy="45" r="5.5" fill="#0F172A" stroke="#E2E8F0" strokeWidth="1" />
            <circle cx="15" cy="45" r="2.5" fill="#94A3B8" />
            <line x1="15" y1="41" x2="15" y2="49" stroke="#FFFFFF" strokeWidth="0.8" />
            <line x1="11" y1="45" x2="19" y2="45" stroke="#FFFFFF" strokeWidth="0.8" />
          </g>

          {/* Front Wheel & Rim with active spin */}
          <g className={animated ? 'animate-[spin_2s_linear_infinite] origin-[45px_45px]' : ''}>
            <circle cx="45" cy="45" r="5.5" fill="#0F172A" stroke="#E2E8F0" strokeWidth="1" />
            <circle cx="45" cy="45" r="2.5" fill="#94A3B8" />
            <line x1="45" y1="41" x2="45" y2="49" stroke="#FFFFFF" strokeWidth="0.8" />
            <line x1="41" y1="45" x2="49" y2="45" stroke="#FFFFFF" strokeWidth="0.8" />
          </g>

          {/* Road dashes running backwards */}
          <line
            x1="2"
            y1="52"
            x2="62"
            y2="52"
            stroke="#CBD5E1"
            strokeWidth="1.8"
            strokeDasharray="4 3"
            className={animated ? 'animate-[pulse_1.5s_infinite]' : ''}
          />

          <defs>
            <linearGradient id="headlightGrad" x1="52" y1="39" x2="64" y2="39" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FDE047" stopOpacity="0.9" />
              <stop offset="1" stopColor="#FDE047" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black ${textSize} tracking-tight flex items-center ${
                onDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Delivery
              <span className="text-[#FF6B00] ml-0.5 drop-shadow-xs">
                MY
              </span>
            </span>
          </div>
          <span
            className={`text-[9px] sm:text-[10px] font-bold tracking-tight hidden sm:block ${
              onDark ? 'text-blue-100/90' : 'text-slate-500'
            }`}
          >
            🇲🇾 Malaysia Lorry Network
          </span>
        </div>
      )}
    </div>
  );
};
