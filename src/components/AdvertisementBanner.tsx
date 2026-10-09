import React, { useState } from 'react';
import { Megaphone, ExternalLink, X, Sparkles, Tag, ChevronRight } from 'lucide-react';
import { AdItemConfig } from '../types';

interface AdvertisementBannerProps {
  ad?: AdItemConfig;
  position: 'top' | 'bottom';
  className?: string;
}

export const AdvertisementBanner: React.FC<AdvertisementBannerProps> = ({
  ad,
  position,
  className = '',
}) => {
  const [dismissed, setDismissed] = useState<boolean>(false);

  if (!ad || !ad.enabled || !ad.text || dismissed) {
    return null;
  }

  // Theme styling
  const theme = ad.bgTheme || (position === 'top' ? 'amber' : 'blue');

  const themeClasses = {
    amber: {
      bg: 'bg-gradient-to-r from-[#FF6B00] via-[#FF8500] to-[#FF9100]',
      text: 'text-white',
      badge: 'bg-white/25 text-white border-white/40',
      btn: 'bg-white text-[#E65100] hover:bg-orange-50 shadow-md',
    },
    emerald: {
      bg: 'bg-gradient-to-r from-[#00C853] via-[#00D95A] to-[#00E676]',
      text: 'text-white',
      badge: 'bg-white/25 text-white border-white/40',
      btn: 'bg-white text-emerald-900 hover:bg-emerald-50 shadow-md',
    },
    blue: {
      bg: 'bg-gradient-to-r from-[#0D47A1] via-[#1565C0] to-[#1976D2]',
      text: 'text-white',
      badge: 'bg-white/25 text-white border-white/40',
      btn: 'bg-white text-[#0D47A1] hover:bg-blue-50 shadow-md',
    },
    purple: {
      bg: 'bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700',
      text: 'text-white',
      badge: 'bg-white/25 text-white border-white/40',
      btn: 'bg-white text-purple-900 hover:bg-purple-50 shadow-md',
    },
    slate: {
      bg: 'bg-gradient-to-r from-[#1A1A2E] via-slate-900 to-[#1A1A2E]',
      text: 'text-white',
      badge: 'bg-white/15 text-slate-200 border-white/25',
      btn: 'bg-[#FF6B00] text-white hover:bg-[#E65100] shadow-md',
    },
  }[theme];

  return (
    <aside
      aria-label="Advertisement Banner"
      className={`w-full ${themeClasses.bg} ${themeClasses.text} px-4 py-3 sm:px-6 sm:py-3.5 min-h-[54px] sm:min-h-[58px] shadow-sm transition-all animate-in fade-in duration-300 flex items-center ${
        position === 'top' ? 'border-b border-white/15' : 'border-t border-white/15'
      } ${className}`}
    >
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3 text-xs sm:text-sm">
        {/* Left: Icon & Badge */}
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-inner">
            <Megaphone className="w-4 h-4 text-white animate-bounce" />
          </span>

          {ad.badge && (
            <span
              className={`text-[10px] sm:text-xs font-black tracking-wider uppercase px-2.5 py-1 rounded-full border shrink-0 ${themeClasses.badge}`}
            >
              {ad.badge}
            </span>
          )}

          {/* Ad Text & optional subtext */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2.5 truncate">
            <span className="font-black tracking-tight truncate text-xs sm:text-sm drop-shadow-xs">
              {ad.text}
            </span>
            {ad.subtext && (
              <span className="hidden md:inline text-xs opacity-90 truncate font-semibold">
                • {ad.subtext}
              </span>
            )}
          </div>
        </div>

        {/* Right: Action Button & Dismiss */}
        <div className="flex items-center gap-2 shrink-0">
          {ad.linkUrl && (
            <a
              href={ad.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-xs font-black flex items-center gap-1.5 shadow-sm transition-all transform active:scale-95 ${themeClasses.btn}`}
            >
              <span>Info / Hubungi</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-xl hover:bg-white/20 text-white/90 hover:text-white transition-colors cursor-pointer"
            title="Tutup Iklan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
