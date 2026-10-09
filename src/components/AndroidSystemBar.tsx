import React, { useState } from 'react';
import { ChevronLeft, Circle, Square } from 'lucide-react';
import { AndroidBridge } from '../services/androidProjectService';

interface AndroidSystemBarProps {
  onBack?: () => void;
  onHome?: () => void;
}

export const AndroidSystemBar: React.FC<AndroidSystemBarProps> = ({ onBack, onHome }) => {
  const [navMode, setNavMode] = useState<'gesture' | 'buttons'>('gesture');

  const handleBack = () => {
    AndroidBridge.vibrate(30);
    if (onBack) onBack();
    else window.history.back();
  };

  const handleHome = () => {
    AndroidBridge.vibrate(30);
    if (onHome) onHome();
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/60 py-1.5 px-6 flex items-center justify-center shrink-0 select-none z-30 transition-colors">
      {navMode === 'gesture' ? (
        <div 
          onClick={() => setNavMode('buttons')}
          title="Tekan untuk tukar mod butang navigasi Android"
          className="w-32 h-1 bg-slate-400/80 dark:bg-slate-600 rounded-full cursor-pointer hover:bg-slate-600 transition-colors py-0.5" 
        />
      ) : (
        <div className="w-full flex items-center justify-between max-w-xs px-8 text-slate-500">
          <button 
            onClick={handleBack} 
            className="p-1 hover:text-slate-800 active:scale-90 transition-transform cursor-pointer"
            title="Kembali"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          
          <button 
            onClick={handleHome} 
            className="p-1 hover:text-slate-800 active:scale-90 transition-transform cursor-pointer"
            title="Laman Utama"
          >
            <Circle className="w-4 h-4 stroke-[2.5]" />
          </button>

          <button 
            onClick={() => {
              AndroidBridge.vibrate(30);
              setNavMode('gesture');
            }} 
            className="p-1 hover:text-slate-800 active:scale-90 transition-transform cursor-pointer"
            title="Tukar ke mod gerak isyarat"
          >
            <Square className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      )}
    </div>
  );
};
