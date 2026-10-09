import React, { useState, useRef } from 'react';
import { Truck, Mail, Lock, Phone, ArrowLeft, CheckCircle2, Sparkles, User, Tag, MapPin, Gift, Navigation, Loader2, Compass } from 'lucide-react';
import { Coordinates, DriverProfile, Language } from '../types';
import { TONNAGE_OPTIONS, BODY_TYPE_OPTIONS, OPERATING_CITIES } from '../services/malaysiaLocations';
import { LanguageService } from '../services/languageService';
import { StorageService } from '../services/storageService';
import { getCurrentGpsLocation } from '../services/gpsLocationService';
import { MapPickerModal } from '../components/MapPickerModal';

interface DriverAuthScreenProps {
  currentLang: Language;
  onSuccess: (driver: DriverProfile) => void;
  onBack: () => void;
}

export const DriverAuthScreen: React.FC<DriverAuthScreenProps> = ({
  currentLang,
  onSuccess,
  onBack,
}) => {
  const t = (k: string) => LanguageService.t(k, currentLang);

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [lorryNumber, setLorryNumber] = useState('');
  const [tonnage, setTonnage] = useState('3 Tan');
  const [bodyType, setBodyType] = useState('Closed Box 📦 / Kotak Tertutup / 封闭式');
  const [hasTailgate, setHasTailgate] = useState(false);
  const [city, setCity] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLocatingCity, setIsLocatingCity] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [gpsCityAlert, setGpsCityAlert] = useState<string | null>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);

  const driverBaseCities = [
    { name: 'Kuala Lumpur', state: 'Wilayah Persekutuan', areas: 'KL City, Cheras, Kepong, Sentul, Bukit Bintang, Wangsa Maju' },
    { name: 'Selangor', state: 'Selangor', areas: 'Shah Alam, Klang, Rawang, Subang Jaya, PJ, Puchong, Kajang' },
    { name: 'Johor Bahru', state: 'Johor', areas: 'JB, Kempas, Pasir Gudang, Skudai, Senai, Tebrau' },
    { name: 'Penang', state: 'Pulau Pinang', areas: 'Butterworth, George Town, Bayan Lepas, Bukit Mertajam, Perai' },
    { name: 'Ipoh', state: 'Perak', areas: 'Menglembu, Bercham, Simpang Pulai, Taiping, Teluk Intan' },
    { name: 'Kuantan', state: 'Pahang', areas: 'Gebeng Port, Semambu, Indera Mahkota, Temerloh' },
    { name: 'Melaka', state: 'Melaka', areas: 'Ayer Keroh, Batu Berendam, Cheng, Krubong' },
    { name: 'Seremban', state: 'Negeri Sembilan', areas: 'Nilai, Senawang, Bandar Enstek, Port Dickson' },
    { name: 'Batu Pahat', state: 'Johor', areas: 'Muar, Yong Peng, Kluang, Parit Raja' },
    { name: 'Alor Setar', state: 'Kedah', areas: 'Sungai Petani, Kulim, Jitra, Gurun' },
    { name: 'Kota Bharu', state: 'Kelantan', areas: 'Pengkalan Chepa, Pasir Mas, Kubang Kerian' },
    { name: 'Kuala Terengganu', state: 'Terengganu', areas: 'Kemaman, Kerteh, Dungun, Paka' },
    { name: 'Kuching', state: 'Sarawak', areas: 'Bintulu, Miri, Sibu, Samarahan' },
    { name: 'Kota Kinabalu', state: 'Sabah', areas: 'Sandakan, Tawau, Penampang, Inanam' },
  ];

  const handleGpsDetectCity = async () => {
    setIsLocatingCity(true);
    setGpsCityAlert(null);

    try {
      const res = await getCurrentGpsLocation(1);
      const loc = res.coords;
      const cityName = loc.city ? (loc.address ? `${loc.city} (${loc.address.split(',')[0]})` : loc.city) : loc.address;
      setCity(cityName);
      setGpsCityAlert(`✓ GPS Dikesan (±${res.accuracyMeters || 20}m): ${loc.address}`);
    } catch (err: any) {
      console.warn('Driver GPS detect error:', err);
      let errorMsg = '⚠️ GPS lemah atau kebenaran lokasi disekat. Sila taip pangkalan bandar atau pilih di Peta.';
      if (err?.code === 1) {
        errorMsg = '⚠️ Kebenaran lokasi disekat. Sila benarkan akses lokasi dalam pelayar anda atau klik "Peta".';
      }
      setGpsCityAlert(errorMsg);
      setTimeout(() => {
        cityInputRef.current?.focus();
      }, 150);
    } finally {
      setIsLocatingCity(false);
      setTimeout(() => setGpsCityAlert(null), 9000);
    }
  };

  const handleMapConfirm = (loc: Coordinates) => {
    const cityName = loc.city ? (loc.address ? `${loc.city} (${loc.address.split(',')[0]})` : loc.city) : loc.address;
    setCity(cityName);
    setGpsCityAlert(`✓ Dipilih di peta: ${cityName}`);
    setIsMapModalOpen(false);
    setTimeout(() => setGpsCityAlert(null), 5000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const drivers = StorageService.getDrivers();
    const found = drivers.find(
      (d) => d.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (found) {
      StorageService.setSession('driver', found);
      onSuccess(found);
    } else {
      setErrorMsg(
        currentLang === 'en'
          ? 'Driver with this email not found. Please register a new account.'
          : currentLang === 'zh'
          ? '未找到该电子邮箱的司机账号，请先注册。'
          : 'Pemandu dengan e-mel ini tidak dijumpai. Sila daftar akaun baru.'
      );
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !email || !phone || !lorryNumber || !password || !city) {
      setErrorMsg(
        currentLang === 'en'
          ? 'Please complete all fields marked with * (including Base City)'
          : currentLang === 'zh'
          ? '请完整填写带 * 的必填项（包括常驻城市）'
          : 'Sila lengkapkan semua ruangan bertanda * (termasuk Pangkalan Bandar)'
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(
        currentLang === 'en'
          ? 'Passwords do not match.'
          : currentLang === 'zh'
          ? '两次输入的密码不一致。'
          : 'Kata laluan tidak sepadan.'
      );
      return;
    }

    const drivers = StorageService.getDrivers();
    if (drivers.some((d) => d.email.toLowerCase() === email.trim().toLowerCase())) {
      setErrorMsg(
        currentLang === 'en'
          ? 'This email is already registered. Please login.'
          : currentLang === 'zh'
          ? '此电子邮箱已被注册，请直接登录。'
          : 'E-mel ini telah didaftarkan. Sila log masuk.'
      );
      return;
    }

    const newDriver = StorageService.registerDriver({
      name,
      email,
      phone,
      lorryNumber,
      lorryTonnage: tonnage,
      lorryBodyType: bodyType,
      hasTailgate,
      city,
      referredBy: referralCode.trim() || undefined,
      password,
    });

    StorageService.setSession('driver', newDriver);
    onSuccess(newDriver);
  };

  const quickDemoDriverLogin = (driverId: string) => {
    const driver = StorageService.getDriverById(driverId);
    if (driver) {
      StorageService.setSession('driver', driver);
      onSuccess(driver);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center p-4 sm:p-6 max-w-lg mx-auto w-full animate-in fade-in duration-200">
      <button
        onClick={onBack}
        className="self-start flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 mb-4 transition-colors font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{currentLang === 'en' ? 'Back to Role Selection' : currentLang === 'zh' ? '返回选择身份' : 'Kembali ke Pilihan Peranan'}</span>
      </button>

      <div className="bg-white border border-[#E0E0E0] rounded-[24px] p-5 sm:p-6 shadow-card-soft space-y-5">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-13 h-13 rounded-[16px] bg-[#FFF3E0] text-[#FF6B00] border border-orange-200 flex items-center justify-center mx-auto mb-2 shadow-xs">
            <Truck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-[#1A1A2E]">
            {isRegister
              ? (currentLang === 'en' ? 'Driver Registration' : currentLang === 'zh' ? '罗里司机注册' : 'Pendaftaran Pemandu Lori')
              : (currentLang === 'en' ? 'Driver Login' : currentLang === 'zh' ? '司机登录' : 'Log Masuk Pemandu')}
          </h2>
          <p className="text-xs text-[#6C757D]">
            {isRegister
              ? (currentLang === 'en' ? 'Register your lorry, zero commission on earnings' : currentLang === 'zh' ? '登记您的罗里，无抽成赚取全部运费' : 'Daftar lori anda, jana pendapatan tanpa caj komisen')
              : (currentLang === 'en' ? 'Sign in to accept jobs & activate Return Load' : currentLang === 'zh' ? '登录以接单及启用空车回程' : 'Log masuk untuk semak job dan aktifkan Return Load')}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-[#F8F9FE] p-1 rounded-[14px] border border-[#E0E0E0]">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-black rounded-[10px] transition-all cursor-pointer ${
              !isRegister ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF9100] text-white shadow-btn-orange' : 'text-[#6C757D] hover:text-[#1A1A2E]'
            }`}
          >
            {t('login')}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-black rounded-[10px] transition-all cursor-pointer ${
              isRegister ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF9100] text-white shadow-btn-orange' : 'text-[#6C757D] hover:text-[#1A1A2E]'
            }`}
          >
            {t('register')}
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-3.5">
          {isRegister ? (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {currentLang === 'en' ? 'Full Name' : currentLang === 'zh' ? '真实姓名' : 'Nama Penuh'} *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Kumar / Ali / Tan"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('email')} *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="driver@gmail.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('phone')} (WhatsApp) *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0123456789"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {currentLang === 'en' ? 'Lorry Plate Number' : currentLang === 'zh' ? '车牌号码' : 'No. Plat Lori'} *
                  </label>
                  <div className="relative">
                    <Tag className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={lorryNumber}
                      onChange={(e) => setLorryNumber(e.target.value.toUpperCase())}
                      placeholder="WXY 1234"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 font-mono uppercase font-bold"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                    <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{currentLang === 'en' ? 'Base City (Operating Hub)' : currentLang === 'zh' ? '常驻城市 / 基地' : 'Pangkalan Bandar / Depoh'} *</span>
                    </label>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handleGpsDetectCity}
                        disabled={isLocatingCity}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs border ${
                          isLocatingCity
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-400 animate-pulse'
                            : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-700'
                        }`}
                        title="Kesan Pangkalan mengikut lokasi GPS peranti"
                      >
                        {isLocatingCity ? (
                          <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin shrink-0" />
                        ) : (
                          <Navigation className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        )}
                        <span>{isLocatingCity ? 'Detecting location...' : 'GPS'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsMapModalOpen(true)}
                        className="px-2 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-700 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                        title="Pilih pangkalan di peta"
                      >
                        <Compass className="w-3 h-3 text-blue-600" />
                        <span>Peta</span>
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute left-3 top-3 pointer-events-none flex items-center gap-1">
                      <MapPin className={`w-4 h-4 transition-colors ${city ? 'text-emerald-600' : 'text-slate-400'}`} />
                      {/* Pulsing green dot indicator once populated */}
                      {city && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                      )}
                    </div>
                    <input
                      ref={cityInputRef}
                      type="text"
                      list="malaysia-cities-list"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      placeholder={
                        currentLang === 'en'
                          ? 'Tap GPS or type base city/area...'
                          : currentLang === 'zh'
                          ? '点击GPS或输入常驻城市/区域...'
                          : 'Tekan GPS atau taip bandar/kawasan pangkalan...'
                      }
                      className={`w-full pl-12 pr-9 py-2.5 rounded-2xl text-xs font-bold tracking-tight transition-all shadow-xs border-2 ${
                        city
                          ? 'bg-emerald-50/30 border-emerald-500 text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20'
                          : 'bg-slate-50 border-dashed border-slate-300 text-slate-900 placeholder:text-slate-400 hover:border-emerald-400 hover:bg-white focus:bg-white focus:border-emerald-500'
                      }`}
                    />
                    {city && (
                      <button
                        type="button"
                        onClick={() => setCity('')}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 text-xs font-bold leading-none cursor-pointer"
                        title="Kosongkan"
                      >
                        ✕
                      </button>
                    )}
                    <datalist id="malaysia-cities-list">
                      {driverBaseCities.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name} • {c.areas}
                        </option>
                      ))}
                    </datalist>
                  </div>

                  {gpsCityAlert && (
                    <div className="mt-1.5 p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] font-bold text-emerald-800 flex items-center gap-1.5 animate-in fade-in duration-150">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{gpsCityAlert}</span>
                    </div>
                  )}

                  {/* Informative Guidance on How to Choose */}
                  <div className="mt-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 leading-relaxed">
                    <span className="font-bold text-emerald-700">💡 Cara Memilih: </span>
                    {currentLang === 'en'
                      ? 'Choose the city where your lorry is based or usually departs from. Jobs nearby and high-paying return loads will be prioritized for your account.'
                      : currentLang === 'zh'
                      ? '请选择您的货车常驻停靠或主要发车的城市。系统将优先为您推送附近的直运和高收益回程单。'
                      : 'Pilih bandar pangkalan tempat lori anda beroperasi atau berlepas. Tempahan muatan berdekatan dan muatan balik (return load) akan diutamakan kepada anda.'}
                  </div>
                </div>
              </div>

              {/* Tonnage & Body Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('tonnage')} *
                  </label>
                  <select
                    value={tonnage}
                    onChange={(e) => setTonnage(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-2xl text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-bold"
                  >
                    {TONNAGE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('bodyType')} *
                  </label>
                  <select
                    value={bodyType}
                    onChange={(e) => setBodyType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-2xl text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    {BODY_TYPE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Driver Tailgate Equipment Checkbox / Toggle */}
              <div
                onClick={() => setHasTailgate(!hasTailgate)}
                className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  hasTailgate
                    ? 'bg-emerald-50/50 border-emerald-500 shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xl">🏗️</span>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900">
                        Tailgate / Hydraulic Lift (Pintu Angkat)
                      </span>
                      <span className="text-[10px] text-slate-500">ஹைட்ராலிக் லிப்ட்</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Tandakan jika lori anda dilengkapi pintu angkat hidraulik di bahagian belakang.
                    </p>
                  </div>
                </div>

                <div
                  className={`w-11 h-6 rounded-full p-1 transition-colors flex items-center shrink-0 ${
                    hasTailgate ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
                </div>
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('password')} *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {currentLang === 'en' ? 'Confirm Password' : currentLang === 'zh' ? '确认密码' : 'Sahkan Kata Laluan'} *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* Referral Code (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {currentLang === 'en' ? 'Referral Code (Optional)' : currentLang === 'zh' ? '推荐码（选填）' : 'Kod Rujukan / Referral (Pilihan)'}
                </label>
                <div className="relative">
                  <Gift className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="MYLORRY-XXXX"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 font-mono uppercase"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('email')} *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kumar@lorrymy.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {t('password')} *
                  </label>
                  <button
                    type="button"
                    onClick={() => setSuccessMsg('Pautan set semula kata laluan telah dihantar ke e-mel anda.')}
                    className="text-[11px] text-emerald-600 hover:underline"
                  >
                    {currentLang === 'en' ? 'Forgot password?' : currentLang === 'zh' ? '忘记密码？' : 'Lupa kata laluan?'}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-[#FF6B00] to-[#FF9100] hover:from-[#E65100] hover:to-[#FF6B00] active:scale-[0.99] text-white rounded-[14px] text-xs font-black shadow-btn-orange transition-all mt-2 cursor-pointer"
          >
            {isRegister
              ? (currentLang === 'en' ? 'Register Driver Now' : currentLang === 'zh' ? '立即注册司机' : 'Daftar Pemandu Sekarang')
              : (currentLang === 'en' ? 'Driver Login' : currentLang === 'zh' ? '司机登录' : 'Log Masuk Pemandu')}
          </button>
        </form>

        {/* Demo Fast Driver Switcher */}
        <div className="pt-3 border-t border-[#E0E0E0] space-y-2">
          <div className="text-[11px] text-[#6C757D] text-center font-bold flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>{currentLang === 'en' ? 'Quick 1-Click Demo Driver Accounts:' : currentLang === 'zh' ? '一键切换测试司机账号:' : 'Pilih Akaun Pemandu Ujian (Satu Klik):'}</span>
          </div>

          <button
            type="button"
            onClick={() => quickDemoDriverLogin('drv-kumar-01')}
            className="w-full py-2.5 px-3 bg-[#FFF3E0] hover:bg-[#FFE0B2] text-[#1A1A2E] border border-orange-200 rounded-[14px] text-xs flex items-center justify-between transition-colors text-left cursor-pointer"
          >
            <div>
              <span className="font-black text-[#E65100]">🔥 Kumar (WXY 1234)</span>
              <span className="text-[10px] text-amber-700 block">3 Tan Closed Box • Return Load JB➔KL Active!</span>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
              ONLINE
            </span>
          </button>

          <button
            type="button"
            onClick={() => quickDemoDriverLogin('drv-ali-02')}
            className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-2xl text-xs flex items-center justify-between transition-colors text-left cursor-pointer"
          >
            <div>
              <span className="font-bold text-slate-900">Ali (BKL 8821)</span>
              <span className="text-[10px] text-slate-500 block">5 Tan Open Lorry • KL / Selangor</span>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
              ONLINE
            </span>
          </button>

          <button
            type="button"
            onClick={() => quickDemoDriverLogin('drv-hock-03')}
            className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-2xl text-xs flex items-center justify-between transition-colors text-left cursor-pointer"
          >
            <div>
              <span className="font-bold text-slate-900">Ah Hock (PKN 3399)</span>
              <span className="text-[10px] text-slate-500 block">1 Tan Pickup 🛻 • Penang</span>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
              ONLINE
            </span>
          </button>
        </div>
      </div>

      {/* Map Picker Modal for Driver Base Location */}
      <MapPickerModal
        isOpen={isMapModalOpen}
        title={currentLang === 'en' ? 'Select Driver Operating Base / Depot' : currentLang === 'zh' ? '选择司机常驻基地 / 车场' : 'Pilih Pangkalan / Depoh Lori Anda'}
        onConfirm={handleMapConfirm}
        onClose={() => setIsMapModalOpen(false)}
      />
    </div>
  );
};
