import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Flame, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Phone, 
  MessageCircle, 
  Navigation, 
  Gift, 
  ShieldAlert, 
  Power, 
  TrendingUp, 
  User, 
  LogOut, 
  Copy, 
  Check, 
  Sparkles,
  AlertCircle,
  CreditCard,
  History,
  Calendar,
  ChevronRight,
  FileText,
  Search,
  X,
  Radio,
  Bell
} from 'lucide-react';
import { Booking, DriverProfile, Language, FcmBroadcastRecord } from '../types';
import { LanguageService } from '../services/languageService';
import { StorageService } from '../services/storageService';
import { subscribeToDriverFcmBroadcasts } from '../services/fcmBroadcastService';
import { MALAYSIAN_CITIES } from '../services/malaysiaLocations';
import { getAccurateBrowserPosition } from '../services/gpsLocationService';
import { StripeSubscriptionModal } from '../components/StripeSubscriptionModal';
import confetti from 'canvas-confetti';

interface DriverHomeScreenProps {
  driver: DriverProfile;
  currentLang: Language;
  onLogout: () => void;
}

export const DriverHomeScreen: React.FC<DriverHomeScreenProps> = ({
  driver: initialDriver,
  currentLang,
  onLogout,
}) => {
  const t = (k: string) => LanguageService.t(k, currentLang);

  const [driver, setDriver] = useState<DriverProfile>(initialDriver);
  const [activeTab, setActiveTab] = useState<'jobs' | 'myJobs' | 'completed' | 'earnings' | 'profile'>('jobs');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [completedSearchQuery, setCompletedSearchQuery] = useState('');
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);

  // Return Load Form State
  const [isReturnLoadEditing, setIsReturnLoadEditing] = useState(false);
  const [returnLoadFrom, setReturnLoadFrom] = useState(driver.returnLoadFrom || 'Johor Bahru');
  const [returnLoadTo, setReturnLoadTo] = useState(driver.returnLoadTo || 'Kuala Lumpur');
  const [returnLoadDate, setReturnLoadDate] = useState(driver.returnLoadDate || new Date().toISOString().split('T')[0]);
  const [returnLoadNote, setReturnLoadNote] = useState(
    driver.returnLoadNote || 'Lori kosong balik harga boleh runding murah!'
  );

  const [copiedReferral, setCopiedReferral] = useState(false);
  const [incomingFcmBroadcast, setIncomingFcmBroadcast] = useState<FcmBroadcastRecord | null>(null);

  // Synchronize driver and bookings via Firestore & listen for real-time FCM Push Broadcasts
  useEffect(() => {
    const syncData = () => {
      const current = StorageService.getDriverById(driver.uid);
      if (current) setDriver(current);
      setBookings(StorageService.getBookings());
    };

    syncData();
    const unsub = StorageService.subscribe(syncData);

    // Real-time FCM Broadcast Listener for this driver
    const unsubFcm = subscribeToDriverFcmBroadcasts(driver.uid, (bcast) => {
      setIncomingFcmBroadcast(bcast);
      try {
        if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
      } catch {}
    });

    return () => {
      unsub();
      unsubFcm();
    };
  }, [driver.uid]);

  // Handle Online/Offline toggle
  const handleToggleOnline = async (newStatus: boolean) => {
    const updated: DriverProfile = {
      ...driver,
      isOnline: newStatus,
      isAvailable: newStatus,
      lastOnlineAt: new Date().toISOString(),
    };

    if (newStatus) {
      try {
        const pos = await getAccurateBrowserPosition();
        updated.currentLat = pos.coords.latitude;
        updated.currentLng = pos.coords.longitude;
      } catch (err) {
        console.warn('Driver accurate GPS error:', err);
      }
    }
    StorageService.saveDriver(updated);
  };

  // Handle Return Load Save
  const handleSaveReturnLoad = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: DriverProfile = {
      ...driver,
      returnLoad: true,
      returnLoadFrom,
      returnLoadTo,
      returnLoadFromOriginal: returnLoadFrom,
      returnLoadToOriginal: returnLoadTo,
      returnLoadDate,
      returnLoadNote,
      returnLoadEnabledAt: new Date().toISOString(),
    };
    StorageService.saveDriver(updated);
    setIsReturnLoadEditing(false);
  };

  const handleDisableReturnLoad = () => {
    const updated: DriverProfile = {
      ...driver,
      returnLoad: false,
    };
    StorageService.saveDriver(updated);
  };

  // Accept job
  const handleAcceptJob = (bookingId: string) => {
    const res = StorageService.acceptBooking(bookingId, driver);
    if (res.success && res.booking) {
      setActiveTab('myJobs');

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });

      // Launch WhatsApp direct conversation with customer
      const waLink = StorageService.generateWhatsAppLink(
        res.booking.customerPhone,
        `Hi ${res.booking.customerName}! Saya ${driver.name} pemandu lori ${driver.lorryNumber} (${driver.fullLorryType}). Saya telah terima tempahan Dari: ${res.booking.fromCity} Ke: ${res.booking.toCity} 📏 ${res.booking.distanceText}. Barang: ${res.booking.goodsType}. Boleh kita bincang harga?`
      );
      window.open(waLink, '_blank');
    } else {
      alert(res.message);
    }
  };

  // Update booking status: ON THE WAY
  const handleMarkOnTheWay = (booking: Booking) => {
    booking.status = 'ON_THE_WAY';
    booking.onTheWayAt = new Date().toISOString();
    StorageService.updateBooking(booking);

    const waLink = StorageService.generateWhatsAppLink(
      booking.customerPhone,
      `Hi ${booking.customerName}! Saya dalam perjalanan ke lokasi anda (📏 ${booking.distanceText}). Saya akan kongsikan live location di WhatsApp ini sebentar lagi.`
    );
    window.open(waLink, '_blank');
  };

  // Update booking status: COMPLETED
  const handleMarkCompleted = (booking: Booking) => {
    booking.status = 'COMPLETED';
    booking.completedAt = new Date().toISOString();
    StorageService.updateBooking(booking);

    // Make driver available again
    const updatedDriver: DriverProfile = {
      ...driver,
      isAvailable: true,
      completedJobsCount: (driver.completedJobsCount || 0) + 1,
      totalKmCovered: (driver.totalKmCovered || 0) + (booking.distanceKM || 0),
    };
    StorageService.saveDriver(updatedDriver);

    const waLink = StorageService.generateWhatsAppLink(
      booking.customerPhone,
      `Hi ${booking.customerName}! Barang telah selamat dihantar. Terima kasih kerana menggunakan perkhidmatan DeliveryMY!`
    );
    window.open(waLink, '_blank');
  };

  // Copy referral code
  const handleCopyReferral = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(driver.myReferralCode);
      setCopiedReferral(true);
      setTimeout(() => setCopiedReferral(false), 2000);
    }
  };

  // 1. Check: isApproved == false
  if (!driver.isApproved) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 max-w-md mx-auto w-full animate-in fade-in">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900">
            {t('waitingApprovalTitle')}
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {t('waitingApprovalDesc')}
          </p>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-left space-y-1">
            <div className="text-slate-500">Pemandu: <strong className="text-slate-900">{driver.name}</strong></div>
            <div className="text-slate-500">No. Plat: <strong className="text-slate-900 font-mono">{driver.lorryNumber}</strong></div>
            <div className="text-slate-500">Jenis: <strong className="text-slate-900">{driver.fullLorryType}</strong></div>
          </div>

          <div className="space-y-2 pt-2">
            <a
              href="https://wa.me/60123456789?text=Hi%20Admin%20DeliveryMY!%20Sila%20luluskan%20akaun%20pemandu%20saya."
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t('whatsappAdmin')}</span>
            </a>
            <button
              onClick={onLogout}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
            >
              {t('logout')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Check: isBlocked == true
  if (driver.isBlocked) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 max-w-md mx-auto w-full animate-in fade-in">
        <div className="bg-white border border-rose-200 rounded-3xl p-6 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900">
            {t('blockedTitle')}
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {t('blockedDesc')}
          </p>
          <button
            onClick={onLogout}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
          >
            {t('logout')}
          </button>
        </div>
      </div>
    );
  }

  // Active bookings filter
  const activeMyJobs = bookings.filter(
    (b) => b.driverId === driver.uid && b.status !== 'COMPLETED' && b.status !== 'CANCELLED'
  );

  // Completed delivery trips filter (persisted in local storage)
  const completedTrips = bookings
    .filter((b) => b.driverId === driver.uid && b.status === 'COMPLETED')
    .sort((a, b) => {
      const timeA = new Date(b.completedAt || b.createdAt).getTime();
      const timeB = new Date(a.completedAt || a.createdAt).getTime();
      return timeA - timeB;
    });

  const filteredCompletedTrips = completedTrips.filter((trip) => {
    if (!completedSearchQuery.trim()) return true;
    const q = completedSearchQuery.toLowerCase();
    return (
      trip.bookingId.toLowerCase().includes(q) ||
      (trip.fromCity && trip.fromCity.toLowerCase().includes(q)) ||
      (trip.toCity && trip.toCity.toLowerCase().includes(q)) ||
      (trip.customerName && trip.customerName.toLowerCase().includes(q)) ||
      (trip.goodsType && trip.goodsType.toLowerCase().includes(q)) ||
      (trip.fromAddress && trip.fromAddress.toLowerCase().includes(q)) ||
      (trip.toAddress && trip.toAddress.toLowerCase().includes(q))
    );
  });

  // Available job feed filter
  const availableJobFeed = bookings.filter((b) => {
    if (driver.isActive === false) return false; // Safety lock: blocked from receiving job notifications
    if (b.status === 'PENDING_RETURN_LOAD') {
      return b.returnLoadDriverId === driver.uid;
    }
    if (b.status === 'PENDING') {
      if (!driver.isOnline || !driver.isAvailable) return false;
      // Tailgate filter: if customer requested tailgate, only drivers with tailgate can receive it
      if (b.hasTailgate && !driver.hasTailgate) return false;
      return b.lorryTonnage === driver.lorryTonnage;
    }
    return false;
  });

  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full pb-20 animate-in fade-in duration-200">
      {/* Top Driver Header with ONLINE / OFFLINE Big Toggle */}
      <div className="bg-white border-b border-[#F0F0F0] p-4 sm:p-5 space-y-3 shadow-card-soft">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-[12px] bg-[#E3F2FD] text-[#0D47A1] border border-[#0D47A1]/20 flex items-center justify-center font-bold shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-black text-sm sm:text-base text-[#1A1A2E]">{driver.name}</h2>
                <span className="text-[10px] bg-[#F8F9FE] text-[#0D47A1] font-mono px-1.5 py-0.5 rounded border border-[#E0E0E0] font-bold">
                  {driver.lorryNumber}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {driver.fullLorryType} • {driver.city}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              {currentLang === 'en' ? 'Status' : currentLang === 'zh' ? '状态' : 'Langganan'}
            </span>
            <div className="flex items-center gap-1.5 justify-end mt-0.5">
              <span className="text-[11px] font-black text-[#00C853]">
                {driver.isSubscribed
                  ? (currentLang === 'en' ? '🟢 Active' : currentLang === 'zh' ? '🟢 已开通' : '🟢 Aktif')
                  : (currentLang === 'en' ? '🟡 Trial' : currentLang === 'zh' ? '🟡 试用期' : '🟡 Percubaan')}
              </span>
              <button
                type="button"
                onClick={() => setIsStripeModalOpen(true)}
                className="px-2 py-0.5 bg-gradient-to-r from-[#FF6B00] to-[#FF9100] hover:opacity-95 text-white rounded-md text-[10px] font-black flex items-center gap-1 shadow-xs cursor-pointer"
                title="Stripe India Card Payment (30 MYR Pack)"
              >
                <CreditCard className="w-3 h-3" />
                <span>30 MYR</span>
              </button>
            </div>
          </div>
        </div>

        {/* Inactive Safety Notice */}
        {driver.isActive === false && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-[16px] flex items-start gap-2.5 text-rose-800 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-black text-rose-900">
                {currentLang === 'en'
                  ? 'Safety Notice: Account Inactive'
                  : currentLang === 'zh'
                  ? '安全提示：账号已设为停用'
                  : 'Notis Keselamatan: Akaun Tidak Aktif'}
              </p>
              <p className="text-[11px] text-rose-700 mt-0.5 font-medium leading-relaxed">
                {currentLang === 'en'
                  ? 'Your profile has been marked Inactive by administrator. You are temporarily blocked from receiving new job alerts and accepting customer bookings.'
                  : currentLang === 'zh'
                  ? '您的司机账号已被管理员暂停活跃状态。您目前无法接收订单通知或接单。'
                  : 'Profil anda telah dinyahaktifkan oleh pentadbir. Anda disekat daripada menerima pesanan baharu dan mengambil tempahan.'}
              </p>
            </div>
          </div>
        )}

        {/* Real-Time Firebase FCM Broadcast Dispatch Alert */}
        {incomingFcmBroadcast && (
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-3.5 rounded-2xl shadow-lg border border-blue-400 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
              <Radio className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-900 px-1.5 py-0.5 rounded-md">
                  FCM Push Broadcast (&lt; 10KM)
                </span>
                <span className="text-xs font-semibold text-blue-100">{incomingFcmBroadcast.fullLorryType}</span>
              </div>
              <p className="text-xs font-bold mt-1 text-white">{incomingFcmBroadcast.title}</p>
              <p className="text-[11px] text-blue-100 mt-0.5 leading-snug">{incomingFcmBroadcast.body}</p>
            </div>
            <div className="flex flex-col gap-1.5 shrink-0">
              <button
                onClick={() => {
                  setActiveTab('jobs');
                  setIncomingFcmBroadcast(null);
                }}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-xl text-xs font-black transition-transform active:scale-95 cursor-pointer shadow-xs"
              >
                Lihat Job
              </button>
              <button
                onClick={() => setIncomingFcmBroadcast(null)}
                className="text-white/70 hover:text-white p-1 self-end cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Big ONLINE / OFFLINE Switch (Success Green #00C853 -> #00E676 for ONLINE) */}
        <div
          onClick={() => handleToggleOnline(!driver.isOnline)}
          className={`cursor-pointer rounded-[16px] p-3.5 border transition-all flex items-center justify-between shadow-xs ${
            driver.isOnline
              ? 'bg-gradient-to-r from-[#00C853] to-[#00E676] border-[#00C853] text-white shadow-[0_4px_16px_rgba(0,200,83,0.25)]'
              : 'bg-[#F8F9FE] border-[#E0E0E0] text-slate-500'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-3.5 h-3.5 rounded-full ${
                driver.isOnline ? 'bg-white ring-4 ring-white/40' : 'bg-slate-400'
              }`}
            />
            <div>
              <span className={`text-xs sm:text-sm font-black block ${driver.isOnline ? 'text-white' : 'text-[#1A1A2E]'}`}>
                {driver.isOnline ? t('onlineDesc') : t('offlineDesc')}
              </span>
              <span className={`text-[11px] ${driver.isOnline ? 'text-emerald-50' : 'text-slate-500'}`}>
                {driver.isOnline
                  ? (currentLang === 'en' ? 'GPS Active • Ready to receive bookings' : currentLang === 'zh' ? '位置已同步 • 随时可接收货运订单' : 'Lokasi disemat • Sedia menerima permintaan sewa lori')
                  : (currentLang === 'en' ? 'Tap to go ONLINE & start receiving jobs' : currentLang === 'zh' ? '点击切换为上线状态开始接单' : 'Klik untuk mengaktifkan status & mula terima job')}
              </span>
            </div>
          </div>

          <div
            className={`w-12 h-6 rounded-full p-1 transition-colors flex items-center ${
              driver.isOnline ? 'bg-black/20 justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
          </div>
        </div>

        {/* Return Load Card: 🚛 Return Load Muatan Balik (Gradient #FFF3E0 -> #FFE0B2, Border 2px #FF6B00) */}
        <div className="rounded-[16px] bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] border-2 border-[#FF6B00] p-3.5 space-y-3 shadow-[0_4px_16px_rgba(255,107,0,0.15)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#FF6B00] text-white rounded-[10px] shadow-xs">
                <Flame className="w-4 h-4 fill-white text-white" />
              </span>
              <div>
                <h4 className="text-xs font-black text-[#FF6B00]">
                  {t('returnLoad')}
                </h4>
                <p className="text-[10px] text-slate-700">
                  {currentLang === 'en'
                    ? 'Empty truck returning? Post return route for cheap direct bookings.'
                    : currentLang === 'zh'
                    ? '空车返程？发布回程路线，获得即时匹配订单。'
                    : 'Lori kosong balik? Buka tawaran ini agar pelanggan boleh tempah terus.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (driver.returnLoad) {
                  handleDisableReturnLoad();
                } else {
                  setIsReturnLoadEditing(true);
                }
              }}
              className={`px-3 py-1.5 rounded-[12px] text-xs font-black transition-all cursor-pointer ${
                driver.returnLoad
                  ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF9100] text-white shadow-btn-orange'
                  : 'bg-white border border-[#FF6B00] text-[#FF6B00] hover:bg-[#FFF3E0]'
              }`}
            >
              {driver.returnLoad ? '🔥 AKTIF' : '+ AKTIFKAN'}
            </button>
          </div>

          {/* If Return load is active, show the badge card */}
          {driver.returnLoad && !isReturnLoadEditing && (
            <div className="bg-white border border-[#FF6B00]/40 rounded-[12px] p-2.5 text-xs text-[#1A1A2E] flex items-center justify-between shadow-xs">
              <div>
                <span className="font-black text-[#FF6B00] block">
                  🔥 Return Load: {driver.returnLoadFrom} ➔ {driver.returnLoadTo}
                </span>
                <span className="text-[10px] text-slate-600">
                  {driver.fullLorryType} • {driver.returnLoadNote || 'Harga boleh runding murah'}
                </span>
              </div>
              <button
                onClick={() => setIsReturnLoadEditing(true)}
                className="text-[11px] underline text-[#0D47A1] font-bold ml-2 shrink-0 cursor-pointer"
              >
                Ubah
              </button>
            </div>
          )}

          {/* Form to configure Return Load */}
          {isReturnLoadEditing && (
            <form onSubmit={handleSaveReturnLoad} className="space-y-2.5 pt-2 border-t border-[#FF6B00]/20 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-[#1A1A2E] mb-1">Dari Mana (Kosong):</label>
                  <select
                    value={returnLoadFrom}
                    onChange={(e) => setReturnLoadFrom(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-[#E0E0E0] rounded-[10px] text-xs text-[#1A1A2E] font-bold"
                  >
                    {MALAYSIAN_CITIES.map((c) => (
                      <option key={c.city} value={c.city}>{c.city}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#1A1A2E] mb-1">Balik Ke Mana:</label>
                  <select
                    value={returnLoadTo}
                    onChange={(e) => setReturnLoadTo(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-[#E0E0E0] rounded-[10px] text-xs text-[#1A1A2E] font-bold"
                  >
                    {MALAYSIAN_CITIES.map((c) => (
                      <option key={c.city} value={c.city}>{c.city}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#1A1A2E] mb-1">Tarikh Balik:</label>
                <input
                  type="date"
                  value={returnLoadDate}
                  onChange={(e) => setReturnLoadDate(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white border border-[#E0E0E0] rounded-[10px] text-xs text-[#1A1A2E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#1A1A2E] mb-1">Nota Return Load (TIADA HARGA):</label>
                <input
                  type="text"
                  value={returnLoadNote}
                  onChange={(e) => setReturnLoadNote(e.target.value)}
                  placeholder="Lori kosong balik harga boleh runding murah!"
                  className="w-full px-2.5 py-2 bg-white border border-[#E0E0E0] rounded-[10px] text-xs text-[#1A1A2E]"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsReturnLoadEditing(false)}
                  className="flex-1 py-2 bg-white border border-[#E0E0E0] text-slate-700 rounded-[10px] font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-gradient-to-r from-[#FF6B00] to-[#FF9100] text-white rounded-[10px] font-black shadow-btn-orange cursor-pointer"
                >
                  Simpan Return Load
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 sm:p-5 space-y-4">
        {/* JOBS FEED TAB */}
        {activeTab === 'jobs' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>{t('availableJobs')}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {driver.isOnline
                    ? `Menampilkan tempahan sepadan lori ${driver.lorryTonnage}`
                    : 'Anda sedang OFFLINE. Hidupkan toggle di atas untuk mula terima job.'}
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700 border border-slate-200">
                {availableJobFeed.length} Job
              </span>
            </div>

            {/* If driver is offline */}
            {!driver.isOnline && (
              <div className="p-6 text-center bg-white border border-slate-200 rounded-3xl space-y-2 shadow-xs">
                <Power className="w-10 h-10 text-amber-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">Status Anda: OFFLINE</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Sila tekan suis status ONLINE di bahagian atas untuk memaparkan senarai kerja yang tersedia berhampiran anda.
                </p>
                <button
                  onClick={() => handleToggleOnline(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs mt-2 cursor-pointer"
                >
                  Tukar ke ONLINE Sekarang
                </button>
              </div>
            )}

            {/* List of Available Jobs */}
            {driver.isOnline && availableJobFeed.length === 0 && (
              <div className="p-8 text-center bg-white border border-slate-200 rounded-3xl space-y-2 shadow-xs">
                <Truck className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">Tiada Job Baru Pada Masa Ini</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Sistem sedang memantau permintaan baharu dari pelanggan. Job sepadan akan muncul di sini secara automatik!
                </p>
              </div>
            )}

            {driver.isOnline && availableJobFeed.map((booking) => {
              const isExclusiveReturnLoad = booking.status === 'PENDING_RETURN_LOAD';

              return (
                <div
                  key={booking.bookingId}
                  className={`rounded-[16px] p-4 shadow-card-soft hover:shadow-lg transition-all space-y-3 border border-[#F0F0F0] border-t-4 border-t-[#FF6B00] ${
                    isExclusiveReturnLoad
                      ? 'bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2]'
                      : 'bg-white'
                  }`}
                >
                  {/* Exclusive Return Load Card Badge */}
                  {isExclusiveReturnLoad && (
                    <div className="flex items-center justify-between pb-2 border-b border-[#FF6B00]/20">
                      <div className="flex items-center gap-1.5 text-[#FF6B00] font-black text-xs">
                        <Flame className="w-4 h-4 fill-[#FF6B00] animate-bounce text-[#FF6B00]" />
                        <span>🔥 EXCLUSIVE RETURN LOAD (5:00)</span>
                      </div>
                      <span className="text-[11px] font-mono font-black bg-gradient-to-r from-[#FF6B00] to-[#FF9100] text-white px-2.5 py-0.5 rounded-full shadow-xs">
                        Khas Untuk Anda
                      </span>
                    </div>
                  )}

                  {/* Route & Distance: BIG BOLD ORANGE */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 font-bold">
                        <MapPin className="w-3.5 h-3.5 text-[#0D47A1]" />
                        <span>{booking.fromCity} ➔ {booking.toCity}</span>
                      </div>
                      <div className="text-2xl font-black text-[#FF6B00] tracking-tight mt-0.5 flex items-baseline gap-1">
                        <span>📏 {booking.distanceText}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-[#00C853] font-mono block">
                        ⏱️ {booking.estimatedTime}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {booking.dateTime}
                      </span>
                    </div>
                  </div>

                  {/* Specifications */}
                  <div className="bg-[#F8F9FE] p-3 rounded-[12px] border border-[#E0E0E0] text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">Lori:</span>
                      <strong className="text-[#1A1A2E]">🚛 {booking.fullLorryType}</strong>
                    </div>
                    {booking.hasTailgate && (
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-slate-500 font-bold">Peralatan:</span>
                        <span className="text-[11px] font-black text-[#FF6B00] bg-orange-100/70 border border-orange-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          🏗️ Tailgate / Pintu Angkat (+RM20)
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">Barang:</span>
                      <strong className="text-[#1A1A2E]">📦 {booking.goodsType}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">Pelanggan:</span>
                      <span className="text-[#1A1A2E] font-black">👤 {booking.customerName}</span>
                    </div>
                  </div>

                  {/* Accept Button: Gradient Orange #FF6B00 -> #FF9100 */}
                  <button
                    onClick={() => handleAcceptJob(booking.bookingId)}
                    className="w-full h-[50px] rounded-[16px] font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-btn-orange transition-all cursor-pointer bg-gradient-to-r from-[#FF6B00] to-[#FF9100] hover:from-[#E65100] hover:to-[#FF6B00] text-white"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t('acceptJob')} ({booking.distanceText})</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* MY JOBS TAB */}
        {activeTab === 'myJobs' && (
          <div className="space-y-4">
            {/* Top Switcher: Active Jobs vs Completed History */}
            <div className="flex bg-[#F1F5F9] p-1 rounded-[14px]">
              <button
                onClick={() => setActiveTab('myJobs')}
                className="flex-1 py-2 text-xs font-bold rounded-[10px] transition-all flex items-center justify-center gap-1.5 bg-white text-[#0D47A1] shadow-xs cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{t('myJobs')}</span>
                {activeMyJobs.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-[#0D47A1] text-white text-[10px] font-black rounded-full">
                    {activeMyJobs.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className="flex-1 py-2 text-xs font-bold rounded-[10px] transition-all flex items-center justify-center gap-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t('completedTrips')}</span>
                {completedTrips.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-[#00C853] text-white text-[10px] font-black rounded-full">
                    {completedTrips.length}
                  </span>
                )}
              </button>
            </div>

            <h3 className="font-black text-base text-[#1A1A2E] flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#0D47A1]" />
              <span>{t('myJobs')}</span>
            </h3>

            {/* Instruction Card after Accept */}
            <div className="bg-[#E3F2FD] border border-[#0D47A1]/20 rounded-[16px] p-4 text-xs space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2 text-[#0D47A1] font-black text-xs sm:text-sm">
                <Navigation className="w-4 h-4 text-[#0D47A1]" />
                <span>📍 Sila Kongsi Live Location Anda dengan Pelanggan</span>
              </div>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                {t('shareLiveLocationGuide')}
              </p>
            </div>

            {activeMyJobs.length === 0 ? (
              <div className="text-center py-10 bg-white border border-[#F0F0F0] rounded-[16px] p-6 space-y-3 shadow-card-soft">
                <CheckCircle2 className="w-10 h-10 text-[#00C853] mx-auto" />
                <h4 className="text-sm font-bold text-[#1A1A2E]">Tiada Job Aktif</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Anda tiada tugasan yang belum selesai. Buka tab "Job Tersedia" untuk menerima tempahan baharu atau semak sejarah penghantaran selesai.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 pt-2 justify-center">
                  <button
                    onClick={() => setActiveTab('jobs')}
                    className="px-4 py-2 bg-gradient-to-r from-[#FF6B00] to-[#FF9100] text-white rounded-[12px] text-xs font-black shadow-btn-orange cursor-pointer"
                  >
                    {t('availableJobs')}
                  </button>
                  {completedTrips.length > 0 && (
                    <button
                      onClick={() => setActiveTab('completed')}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-[12px] text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <History className="w-3.5 h-3.5 text-[#00C853]" />
                      <span>{t('completedTrips')} ({completedTrips.length})</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {activeMyJobs.map((job) => (
                  <div
                    key={job.bookingId}
                    className="bg-white border border-[#F0F0F0] border-t-4 border-t-[#0D47A1] rounded-[16px] p-4 shadow-card-soft space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-black text-[#0D47A1]">
                        #{job.bookingId}
                      </span>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                        job.status === 'ON_THE_WAY'
                          ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#2E7D32]/30 animate-pulse'
                          : 'bg-[#E3F2FD] text-[#0D47A1] border-[#0D47A1]/30'
                      }`}>
                        {job.status === 'ON_THE_WAY' ? '🚚 DALAM PERJALANAN' : 'DITERIMA'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-black text-[#1A1A2E]">
                        {job.fromCity} ➔ {job.toCity} (<span className="text-[#FF6B00]">📏 {job.distanceText}</span>)
                      </div>
                      <div className="text-xs text-slate-500">
                        Pelanggan: <strong className="text-[#1A1A2E]">{job.customerName}</strong> ({job.customerPhone})
                      </div>
                    </div>

                    {/* Action buttons: WhatsApp Gradient Green, Call Gradient Blue */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <a
                        href={StorageService.generateWhatsAppLink(
                          job.customerPhone,
                          `Hi ${job.customerName}! Saya ${driver.name} pemandu lori ${driver.lorryNumber}. Saya ingin kongsikan live location atau berbincang masa sampai.`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2.5 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:opacity-95 text-white rounded-[12px] text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>

                      <a
                        href={`tel:${job.customerPhone}`}
                        className="py-2.5 bg-gradient-to-r from-[#1976D2] to-[#0D47A1] hover:opacity-95 text-white rounded-[12px] text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-xs"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Panggil</span>
                      </a>
                    </div>

                    {/* Status Triggers: On The Way & Completed */}
                    <div className="pt-2 border-t border-[#F0F0F0] space-y-2">
                      {job.status !== 'ON_THE_WAY' && (
                        <button
                          onClick={() => handleMarkOnTheWay(job)}
                          className="w-full py-2.5 bg-gradient-to-r from-[#0D47A1] to-[#1976D2] text-white rounded-[12px] text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Status: Dalam Perjalanan (On The Way)</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleMarkCompleted(job)}
                        className="w-full py-2.5 bg-gradient-to-r from-[#00C853] to-[#00E676] text-white rounded-[12px] text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_4px_12px_rgba(0,200,83,0.25)]"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Tandakan Selesai Dihantar (Delivered)</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* COMPLETED TRIPS SECTION (Persisted in Local Storage) */}
        {activeTab === 'completed' && (
          <div className="space-y-4">
            {/* Top Switcher: Active Jobs vs Completed History */}
            <div className="flex bg-[#F1F5F9] p-1 rounded-[14px]">
              <button
                onClick={() => setActiveTab('myJobs')}
                className="flex-1 py-2 text-xs font-bold rounded-[10px] transition-all flex items-center justify-center gap-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{t('myJobs')}</span>
                {activeMyJobs.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-[#0D47A1] text-white text-[10px] font-black rounded-full">
                    {activeMyJobs.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className="flex-1 py-2 text-xs font-bold rounded-[10px] transition-all flex items-center justify-center gap-1.5 bg-white text-[#00C853] shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t('completedTrips')}</span>
                {completedTrips.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-[#00C853] text-white text-[10px] font-black rounded-full">
                    {completedTrips.length}
                  </span>
                )}
              </button>
            </div>

            {/* Header Title & Info */}
            <div>
              <h3 className="font-black text-base text-[#1A1A2E] flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5 text-[#00C853]" />
                <span>{t('completedTrips')}</span>
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {t('tripHistory')} • Disimpan secara kekal dalam storan peranti (Local Storage)
              </p>
            </div>

            {/* Metrics Overview Cards */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-white border border-[#E0E0E0] p-3 rounded-[14px] text-center shadow-card-soft">
                <span className="text-[10px] text-slate-500 font-bold block">{t('totalCompletedTrips')}</span>
                <span className="text-lg font-black text-[#1A1A2E]">{completedTrips.length}</span>
              </div>
              <div className="bg-white border border-[#E0E0E0] p-3 rounded-[14px] text-center shadow-card-soft">
                <span className="text-[10px] text-slate-500 font-bold block">{t('totalDeliveredKm')}</span>
                <span className="text-lg font-black text-[#0D47A1]">
                  {Math.round(completedTrips.reduce((acc, t) => acc + (t.distanceKM || 0), 0))} KM
                </span>
              </div>
              <div className="bg-white border border-[#E0E0E0] p-3 rounded-[14px] text-center shadow-card-soft">
                <span className="text-[10px] text-slate-500 font-bold block">Status Pemandu</span>
                <span className="text-lg font-black text-[#00C853]">5.0 ★</span>
              </div>
            </div>

            {/* Search Input for History */}
            {completedTrips.length > 0 && (
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={completedSearchQuery}
                  onChange={(e) => setCompletedSearchQuery(e.target.value)}
                  placeholder={t('searchTrips')}
                  className="w-full pl-9 pr-8 py-2 bg-white border border-[#E0E0E0] rounded-[12px] text-xs text-[#1A1A2E] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00C853]/20 focus:border-[#00C853]"
                />
                {completedSearchQuery && (
                  <button
                    onClick={() => setCompletedSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Trip Cards or Empty State */}
            {completedTrips.length === 0 ? (
              <div className="text-center py-12 bg-white border border-[#F0F0F0] rounded-[16px] p-6 space-y-3 shadow-card-soft">
                <div className="w-14 h-14 bg-emerald-50 text-[#00C853] rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-black text-[#1A1A2E]">{t('noCompletedTrips')}</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  {t('noCompletedTripsDesc')}
                </p>
                <button
                  onClick={() => setActiveTab('jobs')}
                  className="mt-2 px-4 py-2 bg-gradient-to-r from-[#FF6B00] to-[#FF9100] text-white rounded-[12px] text-xs font-black shadow-btn-orange cursor-pointer"
                >
                  {t('availableJobs')}
                </button>
              </div>
            ) : filteredCompletedTrips.length === 0 ? (
              <div className="text-center py-8 bg-white border border-[#F0F0F0] rounded-[16px] p-6 space-y-2 shadow-card-soft">
                <p className="text-xs text-slate-600">
                  Tiada rekod penghantaran sepadan dengan carian: <strong className="text-[#1A1A2E]">"{completedSearchQuery}"</strong>
                </p>
                <button
                  onClick={() => setCompletedSearchQuery('')}
                  className="text-xs text-[#0D47A1] font-bold hover:underline cursor-pointer"
                >
                  Set Semula Carian
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCompletedTrips.map((trip) => {
                  const completedDateStr = trip.completedAt 
                    ? new Date(trip.completedAt).toLocaleDateString('ms-MY', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : new Date(trip.createdAt).toLocaleDateString('ms-MY', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      });

                  return (
                    <div
                      key={trip.bookingId}
                      className="bg-white border border-[#E0E0E0] border-l-4 border-l-[#00C853] rounded-[16px] p-4 shadow-card-soft space-y-3 transition-all hover:shadow-md"
                    >
                      {/* Top Header of Trip */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                            #{trip.bookingId}
                          </span>
                          {trip.isReturnLoadOffer && (
                            <span className="text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                              🔄 Return Load
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>SELESAI DIHANTAR</span>
                        </span>
                      </div>

                      {/* Route Info */}
                      <div className="bg-[#F8F9FE] p-3 rounded-[12px] border border-[#E8EAF6] space-y-2">
                        <div className="flex items-start gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#00C853] mt-1 shrink-0" />
                          <div className="text-xs">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Lokasi Ambil:</span>
                            <span className="font-bold text-[#1A1A2E]">{trip.fromAddress}</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#D50000] mt-1 shrink-0" />
                          <div className="text-xs">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Lokasi Hantar:</span>
                            <span className="font-bold text-[#1A1A2E]">{trip.toAddress}</span>
                          </div>
                        </div>
                      </div>

                      {/* Distance, Goods & Completed Date */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Navigation className="w-3.5 h-3.5 text-[#FF6B00]" />
                          <span>Jarak: <strong className="text-[#1A1A2E]">{trip.distanceText || `${trip.distanceKM} KM`}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Truck className="w-3.5 h-3.5 text-[#0D47A1]" />
                          <span>Barang: <strong className="text-[#1A1A2E]">{trip.goodsType}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600 col-span-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{t('deliveredAt')}: <strong className="text-slate-800">{completedDateStr}</strong></span>
                        </div>
                      </div>

                      {/* Customer Contact & Quick Reconnect */}
                      <div className="pt-2 border-t border-[#F0F0F0] flex items-center justify-between gap-2">
                        <div className="text-xs text-slate-600 truncate">
                          Pelanggan: <strong className="text-[#1A1A2E]">{trip.customerName}</strong>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <a
                            href={StorageService.generateWhatsAppLink(
                              trip.customerPhone,
                              `Hi ${trip.customerName}! Terima kasih kerana menggunakan khidmat lori saya (${driver.lorryNumber}) tempahan #${trip.bookingId}. Hubungi saya jika memerlukan perkhidmatan lori lagi!`
                            )}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1.5 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-[10px] text-[11px] font-black flex items-center gap-1 transition-all shadow-xs"
                            title={t('contactCustomerAgain')}
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>
                          <a
                            href={`tel:${trip.customerPhone}`}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-[10px] text-xs font-bold transition-all"
                            title="Panggil Pelanggan"
                          >
                            <Phone className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* EARNINGS TAB */}
        {activeTab === 'earnings' && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>{t('earnings')}</span>
            </h3>

            {/* Big Stat Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setActiveTab('completed')}
                className="bg-white border border-slate-200 hover:border-emerald-300 p-4 rounded-2xl text-center space-y-1 shadow-xs cursor-pointer transition-all group"
              >
                <span className="text-xs text-slate-500 font-medium group-hover:text-emerald-700 flex items-center justify-center gap-1">
                  Total Job Selesai
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
                </span>
                <div className="text-2xl font-black text-slate-900 group-hover:text-emerald-600">
                  {driver.completedJobsCount || completedTrips.length || 0}
                </div>
                <span className="text-[10px] text-emerald-600 font-bold block">Lihat Sejarah Trip →</span>
              </div>

              <div
                onClick={() => setActiveTab('completed')}
                className="bg-white border border-slate-200 hover:border-emerald-300 p-4 rounded-2xl text-center space-y-1 shadow-xs cursor-pointer transition-all group"
              >
                <span className="text-xs text-slate-500 font-medium group-hover:text-emerald-700 flex items-center justify-center gap-1">
                  Jumlah KM Ditempuh
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
                </span>
                <div className="text-2xl font-black text-emerald-700">
                  {Math.round(driver.totalKmCovered || 0)} KM
                </div>
                <span className="text-[10px] text-slate-400 font-medium block">Rekod Lengkap</span>
              </div>
            </div>

            {/* Zero Commission Model Clarification */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs space-y-2 text-slate-600 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Model Terus (Direct Deal) 100% Milik Anda</span>
              </div>
              <p className="leading-relaxed text-[11px] text-slate-500">
                DeliveryMY tidak memotong sebarang komisen daripada bayaran pelanggan. Segala bayaran tunai atau pemindahan bank dibayar terus oleh pelanggan ke akaun anda.
              </p>
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-600" />
              <span>{t('profile')}</span>
            </h3>

            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-3.5 pb-3 border-b border-slate-100">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-xl">
                  {driver.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{driver.name}</h4>
                  <p className="text-xs text-slate-500 font-mono">{driver.lorryNumber} • {driver.fullLorryType}</p>
                  <p className="text-xs text-slate-500">{driver.phone} • {driver.city}</p>
                  {driver.hasTailgate && (
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-black text-[#FF6B00] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                      🏗️ Dilengkapi Tailgate / Hydraulic Lift (Pintu Angkat)
                    </span>
                  )}
                </div>
              </div>

              {/* Stripe Subscription Plan Card */}
              <div className="bg-gradient-to-br from-[#0D47A1] to-[#1976D2] p-4 rounded-2xl text-white space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-white/15 rounded-xl">
                      <CreditCard className="w-5 h-5 text-white" />
                    </span>
                    <div>
                      <h4 className="font-black text-sm">Pakej Langganan Pemandu (30 MYR)</h4>
                      <p className="text-[11px] text-blue-100">
                        {driver.isSubscribed
                          ? `Aktif sehingga: ${driver.subscriptionExpiry ? new Date(driver.subscriptionExpiry).toLocaleDateString() : '30 Hari'}`
                          : 'Akses tanpa had terus ke nombor WhatsApp pelanggan'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xl font-black text-[#FFB300] shrink-0">
                    30 MYR
                  </span>
                </div>

                <div className="text-[11px] bg-black/20 p-2.5 rounded-xl border border-white/10 flex items-center justify-between">
                  <span>Gerbang Bayaran: <strong>Stripe India</strong></span>
                  <span>Penyelesaian: <strong>Bank IOB</strong></span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsStripeModalOpen(true)}
                  className="w-full py-2.5 bg-gradient-to-r from-[#FF6B00] to-[#FF9100] hover:from-[#E65100] hover:to-[#FF6B00] text-white font-black text-xs rounded-xl shadow-btn-orange transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {driver.isSubscribed
                      ? 'Lanjut 30 Hari Lagi (Stripe Card Checkout)'
                      : 'Langgan Sekarang 30 MYR (Stripe India / IOB)'}
                  </span>
                </button>
              </div>

              {/* Referral Code Share Card */}
              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-900 flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5 text-amber-600" />
                    <span>Kod Referral Anda</span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Jemput 3 pemandu = 30 Hari Percuma!
                  </span>
                </div>

                <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200">
                  <span className="text-xl font-black font-mono text-slate-900 tracking-wider">
                    {driver.myReferralCode}
                  </span>
                  <button
                    onClick={handleCopyReferral}
                    className="px-3 py-1 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {copiedReferral ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedReferral ? 'Disalin' : 'Salin'}</span>
                  </button>
                </div>

                <div className="text-xs text-slate-500 pt-1 flex justify-between">
                  <span>Pemandu Berjaya Disyorkan:</span>
                  <strong className="text-slate-900">{driver.referralCount || 0} / 3</strong>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onLogout}
                  className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Keluar</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Driver Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-white/95 backdrop-blur-md border-t border-[#F0F0F0] px-3 sm:px-6 py-2 flex justify-around items-center z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex flex-col items-center gap-1 py-1 transition-colors relative cursor-pointer ${
            activeTab === 'jobs' ? 'text-[#FF6B00] font-black' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Truck className="w-5 h-5" />
          <span className="text-[10px]">{t('availableJobs')}</span>
          {availableJobFeed.length > 0 && driver.isOnline && (
            <span className="absolute -top-1 right-2 w-4 h-4 bg-gradient-to-r from-[#FF6B00] to-[#FF9100] text-white rounded-full text-[9px] font-black flex items-center justify-center animate-pulse shadow-xs">
              {availableJobFeed.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('myJobs')}
          className={`flex flex-col items-center gap-1 py-1 transition-colors relative cursor-pointer ${
            activeTab === 'myJobs' ? 'text-[#0D47A1] font-black' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Navigation className="w-5 h-5" />
          <span className="text-[10px]">{t('myJobs')}</span>
          {activeMyJobs.length > 0 && (
            <span className="absolute -top-1 right-2 w-4 h-4 bg-[#0D47A1] text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-xs">
              {activeMyJobs.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`flex flex-col items-center gap-1 py-1 transition-colors relative cursor-pointer ${
            activeTab === 'completed' ? 'text-[#00C853] font-black' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-[10px]">{t('completedTrips')}</span>
          {completedTrips.length > 0 && (
            <span className="absolute -top-1 right-1 px-1 min-w-[16px] h-4 bg-[#00C853] text-white rounded-full text-[9px] font-black flex items-center justify-center shadow-xs">
              {completedTrips.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('earnings')}
          className={`flex flex-col items-center gap-1 py-1 transition-colors cursor-pointer ${
            activeTab === 'earnings' ? 'text-[#FF6B00] font-black' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[10px]">{t('earnings')}</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 py-1 transition-colors cursor-pointer ${
            activeTab === 'profile' ? 'text-[#FF6B00] font-black' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">{t('profile')}</span>
        </button>
      </nav>

      {/* Stripe India Elements Card Payment Modal */}
      <StripeSubscriptionModal
        isOpen={isStripeModalOpen}
        onClose={() => setIsStripeModalOpen(false)}
        driver={driver}
        currentLang={currentLang}
        onSuccess={(updated) => {
          setDriver(updated);
        }}
      />
    </div>
  );
};
