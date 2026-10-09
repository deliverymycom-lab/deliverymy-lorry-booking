import React, { useState, useRef } from 'react';
import { Truck, UserCheck, ShieldCheck, ArrowRight, Sparkles, MapPin, PhoneCall } from 'lucide-react';
import { Language, UserRole } from '../types';
import { LanguageService } from '../services/languageService';
import { DeliveryMyLogo } from '../components/DeliveryMyLogo';

interface SplashScreenProps {
  currentLang: Language;
  onSelectRole: (role: UserRole) => void;
  onAdminLoginClick: () => void;
  onOpenAndroidProject?: () => void;
  onOpenDevSettings?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  currentLang,
  onSelectRole,
  onAdminLoginClick,
  onOpenAndroidProject,
  onOpenDevSettings,
}) => {
  const t = (k: string) => LanguageService.t(k, currentLang);

  // Hidden 15-Click Developer Settings Activation
  const [clickCount, setClickCount] = useState(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleHeadlineClick = () => {
    // Reset timer on each click within 3.5 seconds window
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    const nextCount = clickCount + 1;
    if (nextCount >= 15) {
      setClickCount(0);
      if (onOpenDevSettings) {
        onOpenDevSettings();
      } else {
        onAdminLoginClick();
      }
    } else {
      setClickCount(nextCount);
      // If no further click within 3.5 seconds, reset the counter
      clickTimeoutRef.current = setTimeout(() => {
        setClickCount(0);
      }, 3500);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-4 sm:p-8 max-w-lg mx-auto w-full animate-in fade-in duration-300">
      {/* Top Branding Section */}
      <div className="text-center pt-4 sm:pt-6 space-y-4 flex flex-col items-center">
        {/* Animated App Icon & Logo */}
        <DeliveryMyLogo size="lg" showText={false} animated={true} />

        <div className="space-y-1">
          <h1 
            onClick={handleHeadlineClick}
            className="text-3xl sm:text-4xl font-black text-[#1A1A2E] tracking-tight cursor-pointer select-none active:scale-[0.98] transition-transform"
            title="DeliveryMY"
          >
            Delivery<span className="text-[#FF6B00] ml-0.5 drop-shadow-xs">MY</span>
          </h1>
          <div className="inline-block bg-gradient-to-r from-[#FF6B00] to-[#FF9100] text-white font-black text-[11px] px-3.5 py-1 rounded-full shadow-md shadow-orange-600/20">
            {currentLang === 'en' ? '100% ZERO COMMISSION • FREE LOGISTICS' : currentLang === 'zh' ? '100% 零抽成 • 马来西亚罗里直通网' : '100% BEBAS KOMISEN • PLATFORM PERCUMA'}
          </div>
          <p className="text-xs sm:text-sm font-bold text-[#6C757D] pt-1">
            {t('appSlogan')}
          </p>
        </div>

        {/* Feature Highlights Pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-[#E0E0E0] text-[#1A1A2E] text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>{currentLang === 'en' ? 'No Platform Pricing • KM Only' : currentLang === 'zh' ? '无平台加价 • 仅按公里' : 'Tiada Harga Sistem • Hanya KM'}</span>
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-[#E0E0E0] text-[#1A1A2E] text-xs font-bold shadow-xs">
            <PhoneCall className="w-3.5 h-3.5 text-[#00C853]" />
            <span>{currentLang === 'en' ? 'Direct Deal on WhatsApp' : currentLang === 'zh' ? 'WhatsApp 直接商议' : 'Runding Terus di WhatsApp'}</span>
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-[#E0E0E0] text-[#1A1A2E] text-xs font-bold shadow-xs">
            <MapPin className="w-3.5 h-3.5 text-[#0D47A1]" />
            <span>{currentLang === 'en' ? 'Return Load Savings' : currentLang === 'zh' ? '空车回程特惠' : 'Lori Muatan Balik'}</span>
          </span>
        </div>
      </div>

      {/* Role Selection: 2 Clean Modern Cards */}
      <div className="space-y-3.5 my-6 sm:my-8">
        <div className="text-center text-xs uppercase tracking-wider font-black text-[#6C757D]">
          {currentLang === 'en'
            ? 'Please Choose Your Role:'
            : currentLang === 'zh'
            ? '请选择您的身份:'
            : 'Sila Pilih Peranan Anda:'}
        </div>

        {/* Big Card 1: Customer */}
        <button
          onClick={() => onSelectRole('customer')}
          className="w-full text-left p-5 rounded-[20px] bg-white border-2 border-[#E0E0E0] hover:border-[#0D47A1] hover:shadow-xl hover:shadow-[#0D47A1]/10 active:scale-[0.99] transition-all group relative overflow-hidden shadow-card-soft cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-[16px] bg-blue-50 text-[#0D47A1] border border-blue-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                <UserCheck className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-lg text-[#1A1A2E] group-hover:text-[#0D47A1] transition-colors">
                    {t('customer')}
                  </h3>
                  <span className="text-[11px] bg-blue-50 text-[#0D47A1] font-extrabold px-2.5 py-0.5 rounded-full border border-blue-200">
                    Customer / 客户
                  </span>
                </div>
                <p className="text-xs text-[#6C757D] mt-1 leading-snug font-medium">
                  {currentLang === 'en'
                    ? 'Book 1 Ton to 40 Ton lorries, find nearby drivers & cheap return loads.'
                    : currentLang === 'zh'
                    ? '预订 1吨 至 40吨 各类罗里，快速匹配附近司机与空车回程。'
                    : 'Tempah lori 1 Tan hingga 40 Tan, dapatkan pemandu berdekatan & muatan balik murah.'}
                </p>
              </div>
            </div>
            <div className="w-9 h-9 rounded-[12px] bg-[#F8F9FE] group-hover:bg-[#0D47A1] text-slate-400 group-hover:text-white flex items-center justify-center transition-all shrink-0 ml-2">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </button>

        {/* Big Card 2: Driver */}
        <button
          onClick={() => onSelectRole('driver')}
          className="w-full text-left p-5 rounded-[20px] bg-white border-2 border-[#E0E0E0] hover:border-[#FF6B00] hover:shadow-xl hover:shadow-[#FF6B00]/10 active:scale-[0.99] transition-all group relative overflow-hidden shadow-card-soft cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-[16px] bg-[#FFF3E0] text-[#FF6B00] border border-orange-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                <Truck className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-lg text-[#1A1A2E] group-hover:text-[#FF6B00] transition-colors">
                    {t('driver')}
                  </h3>
                  <span className="text-[11px] bg-[#FFF3E0] text-[#E65100] font-extrabold px-2.5 py-0.5 rounded-full border border-orange-200">
                    Driver / 司机
                  </span>
                </div>
                <p className="text-xs text-[#6C757D] mt-1 leading-snug font-medium">
                  {currentLang === 'en'
                    ? 'Receive direct job requests from customers, post Return Loads & keep 100% earnings.'
                    : currentLang === 'zh'
                    ? '直接接收真实客户订单，发布空车回程信息，免抽成赚取全部运费。'
                    : 'Terima job terus daripada pelanggan, pasang Return Load & simpan 100% bayaran tanpa caj komisen.'}
                </p>
              </div>
            </div>
            <div className="w-9 h-9 rounded-[12px] bg-[#F8F9FE] group-hover:bg-[#FF6B00] text-slate-400 group-hover:text-white flex items-center justify-center transition-all shrink-0 ml-2">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </button>

        {/* Role Cards End */}
      </div>

      {/* Footer Area */}
      <div className="text-center pt-2 pb-6 space-y-2">
        <p className="text-[11px] text-[#6C757D] font-medium">
          DeliveryMY Platform • Trilingual BM / EN / 中文 • Direct Deal Logistics
        </p>
      </div>
    </div>
  );
};
