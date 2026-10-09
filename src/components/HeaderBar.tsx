import React, { useState, useRef } from 'react';
import { Smartphone, Monitor, LogOut } from 'lucide-react';
import { Language, UserRole } from '../types';
import { LanguageService } from '../services/languageService';
import { DeliveryMyLogo } from './DeliveryMyLogo';

interface HeaderBarProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  currentRole: UserRole | null;
  onRoleSwitch: (role: UserRole) => void;
  onLogout: () => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  onAdminLoginClick?: () => void;
  onOpenAndroidStudioModal?: () => void;
  onOpenDevSettings: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentLang,
  onLanguageChange,
  currentRole,
  onRoleSwitch,
  onLogout,
  isMobileFrame,
  onToggleMobileFrame,
  onAdminLoginClick,
  onOpenAndroidStudioModal,
  onOpenDevSettings,
}) => {
  // Hidden 15-Click Developer Settings Activation on Header 'DeliveryMY'
  const [clickCount, setClickCount] = useState(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleBrandClick = () => {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    const nextCount = clickCount + 1;
    if (nextCount >= 15) {
      setClickCount(0);
      onOpenDevSettings();
    } else {
      setClickCount(nextCount);
      // Reset after 3.5 seconds of inactivity
      clickTimerRef.current = setTimeout(() => {
        setClickCount(0);
      }, 3500);
    }
  };

  return (
    <header className="bg-gradient-to-r from-[#0D47A1] via-[#1565C0] to-[#1976D2] text-white sticky top-0 z-40 px-2 sm:px-4 md:px-6 py-1.5 sm:py-2 shadow-[0_4px_20px_rgba(13,71,161,0.25)] border-b border-blue-400/20 w-full">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1 sm:gap-3">
        {/* Animated Lorry Logo & Brand with 15-click Easter Egg */}
        <div 
          className="cursor-pointer shrink-0 select-none active:scale-95 transition-transform" 
          onClick={handleBrandClick}
          title="DeliveryMY"
        >
          <DeliveryMyLogo size="md" showText={true} animated={true} onDark={true} />
        </div>

        {/* Right Tools: Role Switcher, Frame Toggle, Language Toggle, Log Out */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0 flex-nowrap">
          {/* Quick Role switcher if logged in as admin */}
          {currentRole === 'admin' && (
            <div className="hidden lg:flex items-center bg-black/20 p-0.5 rounded-xl border border-white/20 text-xs backdrop-blur-xs">
              <span className="text-[10px] uppercase font-black text-blue-200 px-2">
                {currentLang === 'en' ? 'Role:' : currentLang === 'zh' ? '角色:' : 'Peranan:'}
              </span>
              <button
                onClick={() => onRoleSwitch('customer')}
                className="px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer text-blue-100 hover:text-white"
              >
                👤 {LanguageService.t('customer', currentLang)}
              </button>
              <button
                onClick={() => onRoleSwitch('driver')}
                className="px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer text-blue-100 hover:text-white"
              >
                🚛 {LanguageService.t('driver', currentLang)}
              </button>
              <button
                onClick={() => onRoleSwitch('admin')}
                className="px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer bg-amber-500 text-slate-950 shadow-xs font-black"
              >
                🛡️ {LanguageService.t('admin', currentLang)}
              </button>
            </div>
          )}

          {/* Frame Toggle (Smartphone / Desktop Layout button) */}
          <button
            onClick={onToggleMobileFrame}
            title={isMobileFrame ? (currentLang === 'en' ? 'Desktop View' : currentLang === 'zh' ? '电脑网页视图' : 'Paparan Komputer') : (currentLang === 'en' ? 'Mobile View' : currentLang === 'zh' ? '手机视图' : 'Paparan Telefon')}
            className="p-1 sm:p-2 bg-white/15 hover:bg-white/25 border border-white/25 rounded-xl text-white transition-colors backdrop-blur-xs shrink-0 cursor-pointer"
            aria-label="Toggle Layout Mode"
          >
            {isMobileFrame ? (
              <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            ) : (
              <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            )}
          </button>

          {/* Trilingual Language Selector: 🇲🇾 BM | 🇬🇧 EN | 🇨🇳 中文 */}
          <div className="flex items-center bg-black/25 p-0.5 sm:p-1 rounded-xl border border-white/25 text-[10px] sm:text-xs backdrop-blur-xs shrink-0">
            <button
              onClick={() => onLanguageChange('ms')}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg font-black transition-all cursor-pointer ${
                currentLang === 'ms'
                  ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF9100] text-white shadow-xs'
                  : 'bg-white/90 text-slate-700 hover:bg-white'
              }`}
            >
              <span className="sm:hidden">BM</span>
              <span className="hidden sm:inline">🇲🇾 BM</span>
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg font-black transition-all ml-0.5 sm:ml-1 cursor-pointer ${
                currentLang === 'en'
                  ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF9100] text-white shadow-xs'
                  : 'bg-white/90 text-slate-700 hover:bg-white'
              }`}
            >
              <span className="sm:hidden">EN</span>
              <span className="hidden sm:inline">🇬🇧 EN</span>
            </button>
            <button
              onClick={() => onLanguageChange('zh')}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg font-black transition-all ml-0.5 sm:ml-1 cursor-pointer ${
                currentLang === 'zh'
                  ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF9100] text-white shadow-xs'
                  : 'bg-white/90 text-slate-700 hover:bg-white'
              }`}
            >
              <span className="sm:hidden">中文</span>
              <span className="hidden sm:inline">🇨🇳 中文</span>
            </button>
          </div>

          {/* Clear 'Log Out' / Keluar Button - Always Visible on All Devices & Viewports */}
          <button
            onClick={onLogout}
            title={currentLang === 'en' ? 'Log Out' : currentLang === 'zh' ? '登出退出' : 'Log Keluar'}
            className="px-2 py-1 sm:px-2.5 sm:py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 active:scale-95 border border-white/40 text-white rounded-xl transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer shrink-0"
            aria-label="Log Out"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider">
              {currentLang === 'en' ? 'Log Out' : currentLang === 'zh' ? '退出' : 'Keluar'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
