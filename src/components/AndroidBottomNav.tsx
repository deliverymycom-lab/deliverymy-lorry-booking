import React from 'react';
import { 
  Truck, 
  RotateCcw, 
  Radio, 
  Smartphone, 
  ShieldCheck 
} from 'lucide-react';
import { AndroidBridge } from '../services/androidProjectService';
import { Language } from '../types';

export type AndroidTab = 'book' | 'return-load' | 'driver' | 'android-apk' | 'admin';

interface AndroidBottomNavProps {
  activeTab: AndroidTab;
  onTabChange: (tab: AndroidTab) => void;
  currentLang: Language;
  showApkTab?: boolean;
  showAdminTab?: boolean;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  activeTab,
  onTabChange,
  currentLang,
  showApkTab = false,
  showAdminTab = false,
}) => {
  const handleTabClick = (tab: AndroidTab) => {
    AndroidBridge.vibrate(30);
    onTabChange(tab);
  };

  const labels: Record<AndroidTab, { ms: string; en: string; zh: string }> = {
    book: { ms: 'Tempah', en: 'Book', zh: '预订' },
    'return-load': { ms: 'Return Load', en: 'Return Load', zh: '回程货' },
    driver: { ms: 'Pemandu', en: 'Driver', zh: '司机' },
    'android-apk': { ms: 'APK / Studio', en: 'APK / Studio', zh: '安卓项目' },
    admin: { ms: 'Admin', en: 'Admin', zh: '管理' },
  };

  const getLabel = (tab: AndroidTab) => {
    return labels[tab][currentLang] || labels[tab].ms;
  };

  return (
    <nav className="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around z-30 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {/* 1. Tempah */}
      <button
        onClick={() => handleTabClick('book')}
        className="flex flex-col items-center justify-center flex-1 py-1 group transition-all cursor-pointer relative"
      >
        <div
          className={`px-4 py-1 rounded-full transition-all flex items-center justify-center ${
            activeTab === 'book'
              ? 'bg-[#FF6B00]/15 text-[#FF6B00] shadow-sm'
              : 'text-slate-500 group-hover:text-slate-700'
          }`}
        >
          <Truck className={`w-5 h-5 ${activeTab === 'book' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        </div>
        <span
          className={`text-[10px] font-bold mt-0.5 tracking-tight transition-colors ${
            activeTab === 'book' ? 'text-[#FF6B00]' : 'text-slate-500'
          }`}
        >
          {getLabel('book')}
        </span>
      </button>

      {/* 2. Return Load */}
      <button
        onClick={() => handleTabClick('return-load')}
        className="flex flex-col items-center justify-center flex-1 py-1 group transition-all cursor-pointer relative"
      >
        <span className="absolute top-0 right-3 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full leading-tight shadow-xs animate-pulse">
          -70%
        </span>
        <div
          className={`px-4 py-1 rounded-full transition-all flex items-center justify-center ${
            activeTab === 'return-load'
              ? 'bg-amber-500/15 text-amber-600 shadow-sm'
              : 'text-slate-500 group-hover:text-slate-700'
          }`}
        >
          <RotateCcw className={`w-5 h-5 ${activeTab === 'return-load' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        </div>
        <span
          className={`text-[10px] font-bold mt-0.5 tracking-tight transition-colors ${
            activeTab === 'return-load' ? 'text-amber-600' : 'text-slate-500'
          }`}
        >
          {getLabel('return-load')}
        </span>
      </button>

      {/* 3. Pemandu */}
      <button
        onClick={() => handleTabClick('driver')}
        className="flex flex-col items-center justify-center flex-1 py-1 group transition-all cursor-pointer relative"
      >
        <div
          className={`px-4 py-1 rounded-full transition-all flex items-center justify-center ${
            activeTab === 'driver'
              ? 'bg-emerald-500/15 text-emerald-600 shadow-sm'
              : 'text-slate-500 group-hover:text-slate-700'
          }`}
        >
          <Radio className={`w-5 h-5 ${activeTab === 'driver' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        </div>
        <span
          className={`text-[10px] font-bold mt-0.5 tracking-tight transition-colors ${
            activeTab === 'driver' ? 'text-emerald-600' : 'text-slate-500'
          }`}
        >
          {getLabel('driver')}
        </span>
      </button>

      {/* 4. Android APK / Studio ZIP Hub (Hidden unless unlocked via Developer Settings) */}
      {showApkTab && (
        <button
          onClick={() => handleTabClick('android-apk')}
          className="flex flex-col items-center justify-center flex-1 py-1 group transition-all cursor-pointer relative"
        >
          <span className="absolute top-0 right-2 bg-emerald-500 text-white text-[9px] font-black px-1 py-0.2 rounded-full leading-tight">
            APK
          </span>
          <div
            className={`px-4 py-1 rounded-full transition-all flex items-center justify-center ${
              activeTab === 'android-apk'
                ? 'bg-emerald-600/20 text-emerald-600 shadow-sm'
                : 'text-slate-500 group-hover:text-slate-700'
            }`}
          >
            <Smartphone className={`w-5 h-5 ${activeTab === 'android-apk' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          </div>
          <span
            className={`text-[10px] font-bold mt-0.5 tracking-tight transition-colors ${
              activeTab === 'android-apk' ? 'text-emerald-600 font-black' : 'text-slate-500'
            }`}
          >
            {getLabel('android-apk')}
          </span>
        </button>
      )}

      {/* 5. Admin (Hidden unless unlocked via Developer Settings or active role) */}
      {showAdminTab && (
        <button
          onClick={() => handleTabClick('admin')}
          className="flex flex-col items-center justify-center flex-1 py-1 group transition-all cursor-pointer relative"
        >
          <div
            className={`px-4 py-1 rounded-full transition-all flex items-center justify-center ${
              activeTab === 'admin'
                ? 'bg-blue-500/15 text-[#0D47A1] shadow-sm'
                : 'text-slate-500 group-hover:text-slate-700'
            }`}
          >
            <ShieldCheck className={`w-5 h-5 ${activeTab === 'admin' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          </div>
          <span
            className={`text-[10px] font-bold mt-0.5 tracking-tight transition-colors ${
              activeTab === 'admin' ? 'text-[#0D47A1]' : 'text-slate-500'
            }`}
          >
            {getLabel('admin')}
          </span>
        </button>
      )}
    </nav>
  );
};
