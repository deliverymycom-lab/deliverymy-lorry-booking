import React, { useState, useEffect } from 'react';
import { Wifi, Signal, BatteryCharging, BatteryMedium } from 'lucide-react';

interface AndroidStatusBarProps {
  darkText?: boolean;
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({ darkText = false }) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      // Format 12-hour or 24-hour style common in Malaysia
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const textColorClass = darkText ? 'text-slate-800' : 'text-white';

  return (
    <div className={`w-full px-5 pt-2 pb-1.5 flex items-center justify-between text-[11px] font-bold select-none shrink-0 z-30 transition-colors ${textColorClass}`}>
      {/* Left: Clock */}
      <div className="flex items-center gap-1.5 font-mono tracking-tight text-xs font-semibold">
        <span>{currentTime || '09:41'}</span>
      </div>

      {/* Center: Punch Hole Camera cutout simulation on mobile frame */}
      <div className="w-3.5 h-3.5 rounded-full bg-slate-900/90 border border-slate-700/50 shadow-inner flex items-center justify-center">
        <div className="w-1 h-1 rounded-full bg-slate-700/80" />
      </div>

      {/* Right: Icons (5G, WiFi, Battery) */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-extrabold tracking-tighter">5G</span>
        <Signal className="w-3.5 h-3.5 stroke-[2.5]" />
        <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />
        <div className="flex items-center gap-0.5">
          <BatteryMedium className="w-4 h-4 stroke-[2]" />
        </div>
      </div>
    </div>
  );
};
