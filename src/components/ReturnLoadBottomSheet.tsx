import React, { useState, useEffect } from 'react';
import { X, Flame, Truck, User, MapPin, Calendar, Clock, Sparkles } from 'lucide-react';
import { DriverProfile } from '../types';
import { LanguageService } from '../services/languageService';

interface ReturnLoadBottomSheetProps {
  isOpen: boolean;
  driver: DriverProfile;
  distanceKm: number;
  fromCity: string;
  toCity: string;
  onBookReturnLoad: () => void;
  onSeeAllDrivers: () => void;
  onClose: () => void;
}

export const ReturnLoadBottomSheet: React.FC<ReturnLoadBottomSheetProps> = ({
  isOpen,
  driver,
  distanceKm,
  fromCity,
  toCity,
  onBookReturnLoad,
  onSeeAllDrivers,
  onClose,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(300); // 5 minutes

  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(300);
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-[#F8F9FE] border-t-2 border-[#FF6B00] w-full max-w-lg rounded-t-[28px] overflow-hidden shadow-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300 relative"
      >
        {/* Handle Bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>

        {/* Header Bar with Close Button */}
        <div className="flex items-center justify-between px-6 pt-1 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#FFF3E0] text-[#FF6B00] border border-[#FF6B00]/40 rounded-xl shadow-xs animate-bounce">
              <Flame className="w-5 h-5 fill-[#FF6B00]" />
            </span>
            <div>
              <h2 className="text-sm font-black text-[#FF6B00] tracking-wide uppercase">
                🔥 RETURN LOAD AVAILABLE!
              </h2>
              <p className="text-[11px] text-slate-600 font-bold">
                TAWARAN MUATAN BALIK! • 回程货运可用!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-slate-500 hover:text-slate-900 border border-[#E0E0E0] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="px-6 py-2 overflow-y-auto space-y-4">
          {/* Subtitle Banner */}
          <div className="text-center bg-[#FFF8F0] border border-[#FF6B00]/30 rounded-[12px] py-2 px-3">
            <div className="flex items-center justify-center gap-2 text-[#FF6B00] font-black text-xs sm:text-sm">
              <Truck className="w-4 h-4" />
              <span>🚛 Lori Kosong Balik! Empty Lorry Returning!</span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium mt-0.5">
              Pemandu ini sedang dalam perjalanan pulang dan mencari muatan tambahan.
            </p>
          </div>

          {/* Orange Gradient Return Load Card (#FFF3E0 -> #FFE0B2 border 2px #FF6B00) */}
          <div className="relative overflow-hidden rounded-[16px] bg-gradient-to-br from-[#FFF3E0] via-[#FFE8CC] to-[#FFE0B2] p-4 text-[#1A1A2E] shadow-[0_6px_20px_rgba(255,107,0,0.20)] border-2 border-[#FF6B00]">
            <div className="relative z-10 space-y-3">
              {/* Driver and Lorry info */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#0D47A1]" />
                    <span className="font-black text-base tracking-tight text-[#1A1A2E]">{driver.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Truck className="w-4 h-4 text-[#0D47A1]" />
                    <span className="font-bold text-xs bg-white/80 px-2 py-0.5 rounded-md text-[#0D47A1] border border-[#0D47A1]/20">
                      {driver.lorryNumber} • {driver.fullLorryType}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 bg-[#E8F5E9] text-[#00C853] border border-[#00C853]/30 font-black text-[11px] rounded-full shadow-xs">
                    🟢 ONLINE
                  </span>
                </div>
              </div>

              {/* Route & Distance */}
              <div className="bg-white/85 backdrop-blur-xs rounded-[12px] p-3 border border-orange-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#00C853]" />
                    <span>Dari: <strong className="text-[#1A1A2E]">{fromCity}</strong></span>
                  </div>
                  <span className="text-[#FF6B00] font-black">➔</span>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#D32F2F]" />
                    <span>Ke: <strong className="text-[#1A1A2E]">{toCity}</strong></span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-orange-200/60 text-xs">
                  <div className="flex items-center gap-1 text-slate-600 font-bold">
                    <Clock className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>Jarak Laluan:</span>
                  </div>
                  <div className="text-base font-black tracking-tight text-[#FF6B00]">
                    📏 {Math.round(distanceKm)} KM
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <div className="flex items-center gap-1 font-bold">
                    <Calendar className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>Tarikh Balik:</span>
                  </div>
                  <span className="font-black text-[#1A1A2E]">Hari Ini</span>
                </div>
              </div>

              {/* Return Load Note */}
              <div className="bg-white/90 rounded-[12px] p-2.5 text-xs text-[#1A1A2E] font-medium flex items-start gap-2 border border-orange-200">
                <Sparkles className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#FF6B00]">Nota Pemandu:</span> {driver.returnLoadNote || 'Lori kosong balik harga boleh runding murah! Empty lorry returning price can negotiate cheap!'}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            {/* Button 1: Orange Gradient Full Width - Book With This Return Load Driver */}
            <button
              onClick={onBookReturnLoad}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-[#FF6B00] to-[#FF9100] hover:from-[#E65100] hover:to-[#FF6B00] active:scale-[0.99] text-white rounded-[16px] font-black text-xs sm:text-sm flex flex-col items-center justify-center shadow-btn-orange transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>Tempah Dengan Pemandu Return Load Ini ({Math.round(distanceKm)} KM)</span>
              </div>
              <span className="text-[11px] font-medium text-orange-100 mt-0.5">
                (Harga boleh runding murah / Price negotiable cheap / 空车优惠)
              </span>
            </button>

            {/* Button 2: White / Light Grey - See All Other Drivers */}
            <button
              onClick={onSeeAllDrivers}
              className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-700 rounded-[16px] font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-[#E0E0E0] cursor-pointer shadow-xs"
            >
              <span>❌</span>
              <span>Lihat Semua Pemandu Lain (See All Other Drivers / 查看其他所有司机)</span>
            </button>
          </div>

          {/* Footer Countdown & Disclaimer */}
          <div className="text-center pb-5 pt-1 border-t border-slate-200 flex items-center justify-center gap-2 text-xs text-[#FF6B00] font-black">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>Tawaran sah <strong>{timeFormatted}</strong> sahaja / Offer valid 5 min only</span>
          </div>
        </div>
      </div>
    </div>
  );
};
