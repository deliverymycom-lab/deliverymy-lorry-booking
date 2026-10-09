import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  Truck, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Navigation, 
  X, 
  Clock, 
  FastForward, 
  UserCheck, 
  BellRing,
  Volume2,
  VolumeX,
  Compass
} from 'lucide-react';
import { Language, DriverProfile } from '../types';
import { LanguageService } from '../services/languageService';
import { StorageService } from '../services/storageService';

interface DriverRadarModalProps {
  isOpen: boolean;
  currentLang: Language;
  onComplete: () => void;
  onCancel: () => void;
  lorryInfo?: string;
  routeInfo?: string;
}

interface RadarLogItem {
  id: string;
  radius: number;
  message: string;
  time: string;
  status: 'notified' | 'waiting' | 'timeout' | 'accepted';
}

const RADIUS_STAGES = [
  { km: 3, waitSeconds: 30, estimatedDrivers: 2, label: '3 KM (Zon Terdekat / Immediate Zone)' },
  { km: 5, waitSeconds: 30, estimatedDrivers: 5, label: '5 KM (Zon Bandar / City Zone)' },
  { km: 8, waitSeconds: 30, estimatedDrivers: 9, label: '8 KM (Zon Luar Bandar / Outer Ring)' },
  { km: 12, waitSeconds: 30, estimatedDrivers: 15, label: '12 KM+ (Zon Serantau / Regional Hub)' },
];

export const DriverRadarModal: React.FC<DriverRadarModalProps> = ({
  isOpen,
  currentLang,
  onComplete,
  onCancel,
  lorryInfo = '3 Tan - Canvas / Kotak',
  routeInfo = 'Johor Bahru ➔ Kuala Lumpur',
}) => {
  const [stageIndex, setStageIndex] = useState<number>(0); // 0 -> 3km, 1 -> 5km, 2 -> 8km, 3 -> 12km
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);
  const [logs, setLogs] = useState<RadarLogItem[]>([]);
  const [isDriverAccepted, setIsDriverAccepted] = useState<boolean>(false);
  const [acceptedDriverName, setAcceptedDriverName] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const currentStage = RADIUS_STAGES[stageIndex] || RADIUS_STAGES[0];
  const timerRef = useRef<any>(null);

  const t = (k: string) => LanguageService.t(k, currentLang);
  const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Play gentle web audio beep when notifying or expanding
  const playPing = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5 note
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // Audio not permitted without interaction
    }
  };

  // Reset state when opening
  useEffect(() => {
    if (!isOpen) {
      setStageIndex(0);
      setSecondsRemaining(30);
      setLogs([]);
      setIsDriverAccepted(false);
      setAcceptedDriverName('');
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Initialize 3KM
    setStageIndex(0);
    setSecondsRemaining(30);
    setIsDriverAccepted(false);

    const initialStage = RADIUS_STAGES[0];
    const initialLog: RadarLogItem = {
      id: `log-init-${Date.now()}`,
      radius: initialStage.km,
      message:
        currentLang === 'en'
          ? `📢 Notified ${initialStage.estimatedDrivers} nearby drivers within ${initialStage.km} KM. Waiting 30s for response...`
          : currentLang === 'zh'
          ? `📢 已向 ${initialStage.km} KM 范围内的 ${initialStage.estimatedDrivers} 位司机发出抢单通知。等待30秒抢单...`
          : `📢 Menghantar notifikasi kepada pemandu dalam lingkungan ${initialStage.km} KM. Menunggu respon selama 30 saat...`,
      time: now(),
      status: 'notified',
    };
    setLogs([initialLog]);
    playPing();
  }, [isOpen]);

  // Second-by-second 30s countdown timer
  useEffect(() => {
    if (!isOpen || isDriverAccepted) return;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Timer reached 0: Advance to next radius or complete
          handleStageTimeout();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, stageIndex, isDriverAccepted]);

  // Triggered when 30 seconds finish for a radius stage
  const handleStageTimeout = () => {
    const currentKm = RADIUS_STAGES[stageIndex].km;

    if (stageIndex < RADIUS_STAGES.length - 1) {
      const nextIndex = stageIndex + 1;
      const nextStage = RADIUS_STAGES[nextIndex];

      setLogs((prev) => [
        {
          id: `log-expand-${Date.now()}`,
          radius: nextStage.km,
          message:
            currentLang === 'en'
              ? `⏳ No driver accepted within ${currentKm} KM in 30s. Automatically expanding search to ${nextStage.km} KM! Notifying ${nextStage.estimatedDrivers} drivers...`
              : currentLang === 'zh'
              ? `⏳ ${currentKm} KM 范围内30秒内无司机接单。自动扩大搜索至 ${nextStage.km} KM！通知 ${nextStage.estimatedDrivers} 位司机...`
              : `⏳ Tiada pemandu ambil dalam lingkungan ${currentKm} KM (30 saat). Mengembangkan carian ke ${nextStage.km} KM! Menghantar notifikasi...`,
          time: now(),
          status: 'notified',
        },
        {
          id: `log-to-${Date.now()}`,
          radius: currentKm,
          message:
            currentLang === 'en'
              ? `❌ ${currentKm} KM response window closed (30s elapsed).`
              : currentLang === 'zh'
              ? `❌ ${currentKm} KM 响应时间结束 (已过30秒)。`
              : `❌ Tempoh menunggu 30 saat bagi ${currentKm} KM tamat.`,
          time: now(),
          status: 'timeout',
        },
        ...prev,
      ]);

      setStageIndex(nextIndex);
      setSecondsRemaining(30);
      playPing();
    } else {
      // 12KM completed: Driver found or finalize
      const activeDrivers = StorageService.getDrivers().filter(
        (d) => d.isActive !== false && !d.isBlocked && d.isApproved
      );
      const chosen = activeDrivers.length > 0
        ? `${activeDrivers[0].name} (${activeDrivers[0].lorryNumber})`
        : 'Kumar a/l Selvam (WXY 1234)';
      handleSimulateAccept(chosen);
    }
  };

  // Skip wait / fast-forward button for demo & swift testing
  const handleSkipWait = () => {
    if (stageIndex < RADIUS_STAGES.length - 1) {
      handleStageTimeout();
    } else {
      const activeDrivers = StorageService.getDrivers().filter(
        (d) => d.isActive !== false && !d.isBlocked && d.isApproved
      );
      const chosen = activeDrivers.length > 0
        ? `${activeDrivers[0].name} (${activeDrivers[0].lorryNumber})`
        : 'Kumar a/l Selvam (WXY 1234)';
      handleSimulateAccept(chosen);
    }
  };

  // Driver Accept simulator
  const handleSimulateAccept = (driverName: string = 'Kumar a/l Selvam (WXY 1234)') => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsDriverAccepted(true);
    setAcceptedDriverName(driverName);

    setLogs((prev) => [
      {
        id: `log-accept-${Date.now()}`,
        radius: currentStage.km,
        message:
          currentLang === 'en'
            ? `🎉 Pemandu ${driverName} accepted your booking within ${currentStage.km} KM!`
            : currentLang === 'zh'
            ? `🎉 司机 ${driverName} 在 ${currentStage.km} KM 范围内接单成功！`
            : `🎉 Pemandu ${driverName} telah menerima tempahan anda dalam zon ${currentStage.km} KM!`,
        time: now(),
        status: 'accepted',
      },
      ...prev,
    ]);

    playPing();

    setTimeout(() => {
      onComplete();
    }, 1200);
  };

  if (!isOpen) return null;

  // Percentage of 30 seconds completed
  const progressPercent = ((30 - secondsRemaining) / 30) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-[#E0E0E0] w-full max-w-lg rounded-[24px] overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header with gradient blue #0D47A1 -> #1976D2 */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#0D47A1] via-[#1565C0] to-[#1976D2] text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-[12px] bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-inner">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base tracking-tight text-white">
                  {currentLang === 'en'
                    ? 'Broadcasting to Nearby Drivers'
                    : currentLang === 'zh'
                    ? '雷达扩圈通知附近司机'
                    : 'Pencarian Radar Pemandu Berhampiran'}
                </h3>
              </div>
              <p className="text-[11px] text-blue-100 font-medium">
                {currentLang === 'en'
                  ? 'Step: 3KM ➔ 5KM (30s) ➔ 8KM (30s) ➔ 12KM (30s)'
                  : currentLang === 'zh'
                  ? '分阶段通知：3KM ➔ 5KM(等30秒) ➔ 8KM(等30秒) ➔ 12KM'
                  : 'Fasa: 3KM ➔ 5KM (30s) ➔ 8KM (30s) ➔ 12KM (30s)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-[10px] bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
              title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 rounded-[10px] bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
              title="Batalkan"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Active Radius Stages Visual Stepper */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {RADIUS_STAGES.map((s, idx) => {
              const isCurrent = idx === stageIndex && !isDriverAccepted;
              const isPassed = idx < stageIndex || isDriverAccepted;
              return (
                <div
                  key={s.km}
                  className={`rounded-[14px] p-2 sm:p-2.5 text-center border-2 transition-all ${
                    isCurrent
                      ? 'border-[#FF6B00] bg-[#FFF3E0] text-[#E65100] shadow-sm scale-[1.02]'
                      : isPassed
                      ? 'border-[#00C853] bg-[#E8F5E9] text-[#2E7D32]'
                      : 'border-[#E0E0E0] bg-[#F8F9FE] text-slate-400'
                  }`}
                >
                  <div className="text-[10px] font-black uppercase tracking-wider">
                    {idx === 0 ? 'FASA 1' : idx === 1 ? 'FASA 2' : idx === 2 ? 'FASA 3' : 'FASA 4'}
                  </div>
                  <div className="text-sm font-black mt-0.5 flex items-center justify-center gap-1">
                    <span>{s.km} KM</span>
                    {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-[#00C853]" />}
                  </div>
                  <div className="text-[9px] font-bold opacity-80 mt-0.5">
                    {isCurrent ? `${secondsRemaining}s` : '30s tunggu'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Central Radar Pulse Canvas & 30-Second Countdown Display */}
          <div className="relative bg-radial from-slate-900 via-slate-950 to-slate-950 rounded-[20px] p-6 text-white overflow-hidden flex flex-col items-center justify-center min-h-[220px] shadow-lg border border-slate-800">
            {/* Concentric Radar Rings representing 3KM, 5KM, 8KM, 12KM */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className={`absolute w-24 h-24 rounded-full border ${
                  stageIndex >= 0 ? 'border-[#FF6B00]/60 bg-[#FF6B00]/10' : 'border-slate-800'
                }`}
              />
              <div
                className={`absolute w-40 h-40 rounded-full border ${
                  stageIndex >= 1 ? 'border-[#FF9100]/60 bg-[#FF9100]/10' : 'border-slate-800'
                }`}
              />
              <div
                className={`absolute w-56 h-56 rounded-full border ${
                  stageIndex >= 2 ? 'border-sky-400/50 bg-sky-500/10' : 'border-slate-800'
                }`}
              />
              <div
                className={`absolute w-72 h-72 rounded-full border ${
                  stageIndex >= 3 ? 'border-[#00C853]/60 bg-[#00C853]/10' : 'border-slate-800'
                }`}
              />

              {/* Rotating radar scanner line */}
              <div className="absolute w-72 h-72 rounded-full animate-[spin_3s_linear_infinite] origin-center opacity-40 bg-conic from-[#FF6B00]/70 via-transparent to-transparent" />
            </div>

            {/* Radar Center Centerpiece */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-2">
              {/* Circular Countdown Dial */}
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="5"
                    fill="transparent"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke={stageIndex === 3 ? '#00C853' : '#FF6B00'}
                    strokeWidth="5"
                    strokeDasharray="213.6"
                    strokeDashoffset={213.6 - (213.6 * progressPercent) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black tracking-tight text-white font-mono">
                    {secondsRemaining}s
                  </span>
                  <span className="text-[8px] uppercase tracking-widest text-[#FF9100] font-black">
                    TUNGGU
                  </span>
                </div>
              </div>

              {/* Status Message */}
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6B00]/30 text-[#FFE0B2] border border-[#FF6B00]/40 text-xs font-black backdrop-blur-xs">
                  <BellRing className="w-3.5 h-3.5 animate-bounce" />
                  <span>
                    {currentLang === 'en'
                      ? `Zon ${currentStage.km} KM Active • ${currentStage.estimatedDrivers} Drivers Ringing`
                      : currentLang === 'zh'
                      ? `${currentStage.km} KM 正在响铃通知 ${currentStage.estimatedDrivers} 位司机`
                      : `Zon ${currentStage.km} KM Aktif • ${currentStage.estimatedDrivers} Pemandu Dimaklumkan`}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-medium mt-1.5 max-w-xs">
                  {currentLang === 'en'
                    ? `Notifying drivers within ${currentStage.km} KM. If not taken in ${secondsRemaining}s, will automatically expand to next radius.`
                    : currentLang === 'zh'
                    ? `正在呼叫 ${currentStage.km} KM 范围内的司机。若 ${secondsRemaining} 秒内无人接单，系统将自动扩圈。`
                    : `Menunggu pemandu dalam ${currentStage.km} KM ambil pesanan. Jika tiada dalam ${secondsRemaining}s, radar kembang automatik.`}
                </p>
              </div>
            </div>

            {/* Bottom mini specs */}
            <div className="relative z-10 mt-3 pt-3 border-t border-white/10 w-full flex items-center justify-between text-[11px] text-slate-400">
              <span className="truncate font-bold">📦 {lorryInfo}</span>
              <span className="truncate font-bold">🛣️ {routeInfo}</span>
            </div>
          </div>

          {/* Quick Action Buttons for Testing / Swift Dispatch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleSimulateAccept('Kumar a/l Selvam (WXY 1234 - 3 Tan)')}
              className="px-3.5 py-2.5 rounded-[12px] bg-gradient-to-r from-[#00C853] to-[#00E676] active:scale-95 text-white font-black text-xs flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(0,200,83,0.25)] transition-all cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>
                {currentLang === 'en'
                  ? 'Simulate Driver Accept (Kumar)'
                  : currentLang === 'zh'
                  ? '模拟司机 Kumar 立即接单'
                  : 'Simulasi Pemandu Terima (Kumar)'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleSkipWait}
              className="px-3.5 py-2.5 rounded-[12px] bg-white hover:bg-[#F8F9FE] active:scale-95 text-[#1A1A2E] font-black text-xs flex items-center justify-center gap-1.5 border border-[#E0E0E0] transition-all cursor-pointer shadow-xs"
            >
              <FastForward className="w-4 h-4 text-[#0D47A1]" />
              <span>
                {currentLang === 'en'
                  ? 'Skip 30s ➔ Next Radius'
                  : currentLang === 'zh'
                  ? '跳过等待 ➔ 立即扩圈'
                  : 'Langkau 30s ➔ Zon Seterusnya'}
              </span>
            </button>
          </div>

          {/* Real-Time Radar Activity Logs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  {currentLang === 'en'
                    ? 'Real-Time Dispatch Activity'
                    : currentLang === 'zh'
                    ? '实时调度扩圈记录'
                    : 'Log Aktiviti Carian Radar'}
                </span>
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">Live Sync</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 max-h-40 overflow-y-auto space-y-2 font-mono text-[11px]">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-2 rounded-xl border flex items-start justify-between gap-2 ${
                    log.status === 'accepted'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                      : log.status === 'timeout'
                      ? 'bg-amber-50/60 border-amber-200 text-amber-800'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-1.5">
                    <span className="mt-0.5">
                      {log.status === 'accepted'
                        ? '🎉'
                        : log.status === 'timeout'
                        ? '⏱️'
                        : '📡'}
                    </span>
                    <span>{log.message}</span>
                  </div>
                  <span className="text-[10px] opacity-70 shrink-0 font-sans">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500 font-medium">
            🛡️ {t('directPhoneNegotiate') || 'Hubungan Terus Pemandu & Pelanggan'}
          </span>
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-colors"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};
