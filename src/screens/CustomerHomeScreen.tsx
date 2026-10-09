import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  Calendar, 
  Clock, 
  Package, 
  FileText, 
  Navigation, 
  Flame, 
  CheckCircle2, 
  Phone, 
  MessageCircle, 
  User, 
  ChevronRight, 
  AlertCircle,
  Sparkles,
  Info,
  RotateCcw,
  Check,
  Search,
  ArrowRight,
  LogOut,
  Loader2,
  X,
  Megaphone,
  ExternalLink,
  Radio
} from 'lucide-react';
import { Booking, Coordinates, DriverProfile, Language } from '../types';
import { TONNAGE_OPTIONS, BODY_TYPE_OPTIONS, MALAYSIAN_CITIES } from '../services/malaysiaLocations';
import { calculateRealTransitDistance, formatEstimatedTime } from '../services/distanceUtils';
import { LanguageService } from '../services/languageService';
import { StorageService } from '../services/storageService';
import { 
  getCurrentGpsLocation, 
  geocodeAddressQuery, 
  getAddressAutocompleteSuggestions 
} from '../services/gpsLocationService';
import { MapPickerModal } from '../components/MapPickerModal';
import { ReturnLoadBottomSheet } from '../components/ReturnLoadBottomSheet';
import { DriverRadarModal } from '../components/DriverRadarModal';
import { LorryBodySelector } from '../components/LorryBodySelector';
import confetti from 'canvas-confetti';

interface CustomerHomeScreenProps {
  currentLang: Language;
  onBackToRoleSelect?: () => void;
  onLogout?: () => void;
}

export const CustomerHomeScreen: React.FC<CustomerHomeScreenProps> = ({
  currentLang,
  onBackToRoleSelect,
  onLogout,
}) => {
  const t = (k: string) => LanguageService.t(k, currentLang);

  // Navigation view: 'form' (Single scroll booking form) | 'myBookings' | 'success'
  const [currentView, setCurrentView] = useState<'form' | 'myBookings' | 'success'>('form');

  // Load saved guest details from localStorage (defaults to empty so input box stays clean for fresh user input)
  const savedName = localStorage.getItem('deliverymy_saved_name') || '';
  const savedPhone = localStorage.getItem('deliverymy_saved_phone') || '';

  // Form State: Start with clean empty boxes for customer to enter their exact location or tap GPS/Map
  const [pickupLocation, setPickupLocation] = useState<Coordinates>({
    lat: 0,
    lng: 0,
    city: '',
    address: '',
  });
  const [dropoffLocation, setDropoffLocation] = useState<Coordinates>({
    lat: 0,
    lng: 0,
    city: '',
    address: '',
  });

  const [mapPickerTarget, setMapPickerTarget] = useState<'pickup' | 'dropoff' | null>(null);
  const [tonnage, setTonnage] = useState('3 Tan');
  const [bodyType, setBodyType] = useState('Canvas / Kanvas 🎪 / 帆布篷布');
  const [hasTailgate, setHasTailgate] = useState(false);
  const [goodsType, setGoodsType] = useState('Perabot & Kotak Pindahan');
  const [dateTime, setDateTime] = useState('Hari Ini, 2:00 PM');
  const [note, setNote] = useState('');

  // Card 6: Customer Details (Default to empty string so user can input their own name and phone cleanly)
  const [name, setName] = useState(savedName || '');
  const [phone, setPhone] = useState(savedPhone || '');

  // Auto-calculated distance & time
  const [distanceKm, setDistanceKm] = useState<number>(330);
  const [estimatedTime, setEstimatedTime] = useState<string>('6 jam 36 min');

  // UI Flow States
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLocatingPickup, setIsLocatingPickup] = useState<boolean>(false);
  const [isLocatingDropoff, setIsLocatingDropoff] = useState<boolean>(false);
  const [isGeocodingPickup, setIsGeocodingPickup] = useState<boolean>(false);
  const [isGeocodingDropoff, setIsGeocodingDropoff] = useState<boolean>(false);
  const [pickupSuggestions, setPickupSuggestions] = useState<Array<{ title: string; subtitle: string; lat: number; lng: number; city: string; address: string }>>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<Array<{ title: string; subtitle: string; lat: number; lng: number; city: string; address: string }>>([]);
  const [gpsNotification, setGpsNotification] = useState<{
    text: string;
    type: 'success' | 'info' | 'warning' | 'error';
    target?: 'pickup' | 'dropoff';
    isOutsideMalaysia?: boolean;
    detectedCity?: string;
  } | null>(null);
  const [isRadarModalOpen, setIsRadarModalOpen] = useState<boolean>(false);
  const [matchedReturnLoadDriver, setMatchedReturnLoadDriver] = useState<DriverProfile | null>(null);
  const [isReturnLoadSheetOpen, setIsReturnLoadSheetOpen] = useState(false);
  const [createdSuccessBooking, setCreatedSuccessBooking] = useState<Booking | null>(null);

  // My Bookings
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<Booking | null>(null);
  const [searchPhone, setSearchPhone] = useState<string>(savedPhone);

  // Real-time distance update using Highway matrix and real road transit calculation
  useEffect(() => {
    if (pickupLocation.address && dropoffLocation.address && (pickupLocation.lat !== 0 || pickupLocation.city) && (dropoffLocation.lat !== 0 || dropoffLocation.city)) {
      const dist = calculateRealTransitDistance(
        pickupLocation.lat,
        pickupLocation.lng,
        dropoffLocation.lat,
        dropoffLocation.lng,
        pickupLocation.city,
        dropoffLocation.city
      );
      setDistanceKm(dist);
      setEstimatedTime(formatEstimatedTime(dist, currentLang));
    } else {
      setDistanceKm(0);
      setEstimatedTime('');
    }
  }, [pickupLocation, dropoffLocation, currentLang]);

  // Sync bookings filtered by customer phone
  useEffect(() => {
    const syncBookings = () => {
      const all = StorageService.getBookings();
      const targetPhone = (phone || savedPhone).replace(/\D/g, '');
      if (!targetPhone) {
        setBookings(all.slice(0, 5));
        return;
      }
      const my = all.filter((b) => {
        const clean = (b.customerPhone || '').replace(/\D/g, '');
        return clean === targetPhone || clean.includes(targetPhone) || targetPhone.includes(clean);
      });
      setBookings(my);
    };

    syncBookings();
    const unsub = StorageService.subscribe(syncBookings);
    return () => unsub();
  }, [phone, savedPhone]);

  // Robust GPS location detection with true high accuracy
  const handleGpsDetect = async (target: 'pickup' | 'dropoff') => {
    const setIsLocating = target === 'pickup' ? setIsLocatingPickup : setIsLocatingDropoff;
    setIsLocating(true);
    setGpsNotification(null);

    try {
      const res = await getCurrentGpsLocation(target === 'pickup' ? 0 : 1);

      if (target === 'pickup') {
        setPickupLocation(res.coords);
      } else {
        setDropoffLocation(res.coords);
      }

      setGpsNotification({
        text: currentLang === 'en'
          ? `✓ GPS detected: ${res.coords.address}`
          : currentLang === 'zh'
          ? `✓ GPS已定位: ${res.coords.address}`
          : `✓ Lokasi GPS dikesan: ${res.coords.address}`,
        type: 'success',
        target,
        isOutsideMalaysia: res.isOutsideMalaysia,
        detectedCity: res.coords.city,
      });
    } catch (err: any) {
      const isPermissionDenied = err?.code === 1;
      const text = isPermissionDenied
        ? (currentLang === 'en'
            ? '⚠️ Location permission denied in browser. Please allow location access or choose on Map.'
            : currentLang === 'zh'
            ? '⚠️ 浏览器定位权限被拒绝。请在浏览器设置中允许定位权限，或直接在地图上选点。'
            : '⚠️ Akses lokasi pelayar disekat. Sila benarkan kebenaran lokasi atau klik "Pilih di Peta".')
        : (currentLang === 'en'
            ? '⚠️ GPS Signal weak or unable to lock satellite. Please click "Choose on Map" or type address.'
            : currentLang === 'zh'
            ? '⚠️ GPS信号较弱或无法锁定卫星。请点击“在地图上选择”或输入详细地址。'
            : '⚠️ Isyarat GPS lemah atau satelit belum dikunci. Sila klik "Pilih di Peta" atau taip alamat.');

      setGpsNotification({
        text,
        type: 'warning',
        target,
      });
    } finally {
      setIsLocating(false);
      setTimeout(() => {
        setGpsNotification((prev) => (prev?.type === 'success' ? null : prev));
      }, 10000);
    }
  };

  // Geocode address when user types and presses Enter or clicks Search icon
  const handleGeocodeAddress = async (query: string, target: 'pickup' | 'dropoff') => {
    if (!query || !query.trim()) return;
    const setIsGeocoding = target === 'pickup' ? setIsGeocodingPickup : setIsGeocodingDropoff;
    setIsGeocoding(true);
    if (target === 'pickup') setPickupSuggestions([]);
    else setDropoffSuggestions([]);

    try {
      const res = await geocodeAddressQuery(query);
      if (res) {
        if (target === 'pickup') {
          setPickupLocation(res);
        } else {
          setDropoffLocation(res);
        }
        setGpsNotification({
          text: currentLang === 'en'
            ? `✓ Address found on map: ${res.city} (${res.address})`
            : currentLang === 'zh'
            ? `✓ 已在地图定位: ${res.city} (${res.address})`
            : `✓ Lokasi berjaya ditemui di peta: ${res.city} (${res.address})`,
          type: 'success',
        });
      } else {
        setGpsNotification({
          text: currentLang === 'en'
            ? `Address saved. Click 'Choose on Map' to pinpoint exact location.`
            : currentLang === 'zh'
            ? `地址已保存。可点击“在地图上选择”进行精确定位。`
            : `Alamat disimpan. Anda boleh klik 'Pilih di Peta' untuk semat pin lokasi tepat.`,
          type: 'info',
        });
      }
    } finally {
      setIsGeocoding(false);
      setTimeout(() => setGpsNotification((prev) => (prev?.type === 'success' ? null : prev)), 5000);
    }
  };

  // Handle typing in address input with live autocomplete suggestions
  const handleAddressChange = async (val: string, target: 'pickup' | 'dropoff') => {
    if (target === 'pickup') {
      setPickupLocation((prev) => ({
        ...prev,
        address: val,
        city: val.includes(',') ? val.split(',')[1]?.trim() || prev.city : prev.city,
      }));
      if (val.trim().length >= 2) {
        const list = await getAddressAutocompleteSuggestions(val);
        setPickupSuggestions(list);
      } else {
        setPickupSuggestions([]);
      }
    } else {
      setDropoffLocation((prev) => ({
        ...prev,
        address: val,
        city: val.includes(',') ? val.split(',')[1]?.trim() || prev.city : prev.city,
      }));
      if (val.trim().length >= 2) {
        const list = await getAddressAutocompleteSuggestions(val);
        setDropoffSuggestions(list);
      } else {
        setDropoffSuggestions([]);
      }
    }
  };

  const handleSelectSuggestion = (
    item: { title: string; subtitle: string; lat: number; lng: number; city: string; address: string },
    target: 'pickup' | 'dropoff'
  ) => {
    const loc: Coordinates = {
      lat: item.lat,
      lng: item.lng,
      city: item.city,
      address: item.address,
    };
    if (target === 'pickup') {
      setPickupLocation(loc);
      setPickupSuggestions([]);
    } else {
      setDropoffLocation(loc);
      setDropoffSuggestions([]);
    }
    setGpsNotification({
      text: currentLang === 'en'
        ? `✓ Location set: ${item.title}, ${item.city}`
        : currentLang === 'zh'
        ? `✓ 已设定地点: ${item.title}, ${item.city}`
        : `✓ Lokasi dipilih: ${item.title}, ${item.city}`,
      type: 'success',
    });
    setTimeout(() => setGpsNotification((prev) => (prev?.type === 'success' ? null : prev)), 5000);
  };

  // Check matching Return Load driver
  const checkForMatchingReturnLoad = (): DriverProfile | null => {
    const drivers = StorageService.getDrivers();
    const fromCityNorm = (pickupLocation.city || '').toLowerCase();
    const toCityNorm = (dropoffLocation.city || '').toLowerCase();

    return drivers.find((d) => {
      if (!d.returnLoad || !d.isApproved || d.isBlocked || !d.isOnline || !d.isAvailable || d.isActive === false) {
        return false;
      }

      const retFrom = (d.returnLoadFrom || '').toLowerCase();
      const retTo = (d.returnLoadTo || '').toLowerCase();
      const matchesRoute =
        (retFrom.includes(fromCityNorm) || fromCityNorm.includes(retFrom)) &&
        (retTo.includes(toCityNorm) || toCityNorm.includes(retTo));

      if (!matchesRoute) return false;

      // If customer requested a tailgate, driver lorry must be tailgate equipped
      if (hasTailgate && !d.hasTailgate) return false;

      // Match tonnage or compatible
      return d.lorryTonnage === tonnage;
    }) || null;
  };

  // Build pre-filled WhatsApp booking template message for fast negotiation
  const getPreFilledWhatsAppMessage = () => {
    const from = pickupLocation.address || pickupLocation.city || (currentLang === 'en' ? 'Pickup Location' : currentLang === 'zh' ? '起运地点' : 'Lokasi Ambil');
    const to = dropoffLocation.address || dropoffLocation.city || (currentLang === 'en' ? 'Dropoff Destination' : currentLang === 'zh' ? '送货目的地' : 'Lokasi Hantar');
    const kmText = distanceKm > 0 ? `${Math.round(distanceKm)} KM` : 'Laluan Lebuhraya';
    const lorry = `${tonnage} - ${bodyType.split('/')[0].trim()}${hasTailgate ? ' [Tailgate/Pintu Angkat]' : ''}`;
    const cargo = goodsType || (currentLang === 'en' ? 'General Cargo' : currentLang === 'zh' ? '普通货物' : 'Muatan Am');
    const time = dateTime || (currentLang === 'en' ? 'Today / Asap' : currentLang === 'zh' ? '尽快 / 今天' : 'Hari Ini / Segera');
    const custName = name.trim() || 'Pelanggan DeliveryMY';

    if (currentLang === 'en') {
      return (
        `🚛 *DeliveryMY Lorry Booking Inquiry*\n\n` +
        `👤 *Customer:* ${custName}\n` +
        `📍 *From (Pickup):* ${from}\n` +
        `🏁 *To (Dropoff):* ${to}\n` +
        `📏 *Estimated Distance:* ${kmText} (${estimatedTime || 'Fast Route'})\n` +
        `🚚 *Lorry Required:* ${lorry}\n` +
        `📦 *Cargo / Goods:* ${cargo}\n` +
        `📅 *Time / Date:* ${time}\n` +
        (note.trim() ? `📝 *Notes:* ${note.trim()}\n` : '') +
        `\n💬 *Hi! I would like to check availability and negotiate the best direct price for this delivery. Thanks!*`
      );
    } else if (currentLang === 'zh') {
      return (
        `🚛 *DeliveryMY 罗里运输询价订单*\n\n` +
        `👤 *客户姓名:* ${custName}\n` +
        `📍 *起运地 (装货):* ${from}\n` +
        `🏁 *目的地 (卸货):* ${to}\n` +
        `📏 *干道公路里程:* ${kmText} (${estimatedTime || '快捷干线'})\n` +
        `🚚 *所需罗里车型:* ${lorry}\n` +
        `📦 *货物种类:* ${cargo}\n` +
        `📅 *装运时间:* ${time}\n` +
        (note.trim() ? `📝 *备注要求:* ${note.trim()}\n` : '') +
        `\n💬 *您好！我想确认罗里档期并直接商谈运输报价，谢谢！*`
      );
    } else {
      return (
        `🚛 *DeliveryMY - Pertanyaan Tempahan Lori*\n\n` +
        `👤 *Pelanggan:* ${custName}\n` +
        `📍 *Dari (Ambil):* ${from}\n` +
        `🏁 *Ke (Hantar):* ${to}\n` +
        `📏 *Jarak Lebuhraya:* ${kmText} (${estimatedTime || 'Laluan Terus'})\n` +
        `🚚 *Jenis Lori:* ${lorry}\n` +
        `📦 *Jenis Muatan:* ${cargo}\n` +
        `📅 *Masa / Tarikh:* ${time}\n` +
        (note.trim() ? `📝 *Nota Tambahan:* ${note.trim()}\n` : '') +
        `\n💬 *Salam! Saya ingin semak kekosongan lori dan bincang harga terus tanpa komisen. Terima kasih!*`
      );
    }
  };

  // Quick Action: Open Direct WhatsApp with pre-filled template
  const handleDirectWhatsApp = () => {
    // If route missing, notify user to pick locations for better quote
    if (!pickupLocation.address && !dropoffLocation.address) {
      setErrorMessage(
        currentLang === 'en'
          ? 'Please enter Pickup or Dropoff address first so WhatsApp template has your route details!'
          : currentLang === 'zh'
          ? '请先输入装货地或送货目的地，以便 WhatsApp 模板包含您的完整路线！'
          : 'Sila masukkan lokasi Dari Mana atau Ke Mana agar mesej WhatsApp lengkap!'
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setErrorMessage('');
    // Save customer contact info for convenience
    if (name.trim()) localStorage.setItem('deliverymy_saved_name', name.trim());
    if (phone.trim()) localStorage.setItem('deliverymy_saved_phone', phone.trim());

    // 1. Check for matching active return load driver or nearby driver
    const matchingDriver = checkForMatchingReturnLoad();
    const allDrivers = StorageService.getDrivers();
    const activeDriver =
      matchingDriver ||
      allDrivers.find(
        (d) =>
          d.isApproved &&
          !d.isBlocked &&
          (d.city.toLowerCase().includes((pickupLocation.city || '').toLowerCase()) ||
            d.lorryTonnage === tonnage)
      ) ||
      allDrivers.find((d) => d.isApproved && !d.isBlocked) ||
      null;

    const targetPhone = activeDriver?.phone || StorageService.getConfig().paymentConfig.supportWhatsApp || '60123456789';
    const message = getPreFilledWhatsAppMessage();
    const waUrl = StorageService.generateWhatsAppLink(targetPhone, message);

    // Open WhatsApp in new tab/app
    window.open(waUrl, '_blank');
  };

  // BOOK NOW Trigger: Validate & Launch Driver Radar Modal
  const handleBookNowSubmit = () => {
    setErrorMessage('');

    // Step 1: Validate all * fields
    if (!pickupLocation.address || !dropoffLocation.address) {
      setErrorMessage(currentLang === 'en' ? 'Please select pickup and dropoff addresses.' : currentLang === 'zh' ? '请选择装货与卸货地点。' : 'Sila pilih lokasi Dari Mana dan Ke Mana.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!tonnage || !bodyType) {
      setErrorMessage(currentLang === 'en' ? 'Please select lorry tonnage and body type.' : currentLang === 'zh' ? '请选择罗里吨位和车身类型。' : 'Sila pilih Tonnage dan Jenis Badan lori.');
      return;
    }

    if (!name.trim()) {
      setErrorMessage(currentLang === 'en' ? 'Please enter your name for driver contact.' : currentLang === 'zh' ? '请输入您的姓名以便司机联系。' : 'Sila masukkan Nama anda agar pemandu boleh hubungi.');
      return;
    }

    if (!phone.trim() || phone.trim().length < 8) {
      setErrorMessage(currentLang === 'en' ? 'Please enter a valid WhatsApp phone number.' : currentLang === 'zh' ? '请输入有效的 WhatsApp 电话号码。' : 'Sila masukkan Nombor Telefon WhatsApp yang sah.');
      return;
    }

    // Step 2: Save Name & Phone to localStorage for next auto fill
    localStorage.setItem('deliverymy_saved_name', name.trim());
    localStorage.setItem('deliverymy_saved_phone', phone.trim());

    // Step 3: Open the expanding Radar Search Modal (3km -> 5km -> 8km -> 12km+)
    setIsRadarModalOpen(true);
  };

  // Called when radar search completes (or customer clicks skip)
  const handleRadarComplete = () => {
    setIsRadarModalOpen(false);

    // Check Return Load drivers matching route
    const matchingReturnDriver = checkForMatchingReturnLoad();

    if (matchingReturnDriver) {
      // Show Return Load Bottom Sheet Offer
      setMatchedReturnLoadDriver(matchingReturnDriver);
      setIsReturnLoadSheetOpen(true);
    } else {
      // Direct create booking & proceed to Success Screen
      finalizeBookingCreation(false, null);
    }
  };

  // Finalize booking doc creation
  const finalizeBookingCreation = (isReturnLoadOffer: boolean, returnLoadDriverId: string | null) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const newBooking = StorageService.createBooking({
      customerId: `guest-${cleanPhone || Date.now()}`,
      customerName: name.trim(),
      customerPhone: phone.trim(),
      fromAddress: pickupLocation.address,
      toAddress: dropoffLocation.address,
      fromCity: pickupLocation.city,
      toCity: dropoffLocation.city,
      fromLat: pickupLocation.lat,
      fromLng: pickupLocation.lng,
      toLat: dropoffLocation.lat,
      toLng: dropoffLocation.lng,
      distanceKM: distanceKm,
      distanceText: `${Math.round(distanceKm)} KM`,
      estimatedTime,
      lorryTonnage: tonnage,
      lorryBodyType: bodyType,
      fullLorryType: `${tonnage} - ${bodyType.split('/')[0].trim()}${hasTailgate ? ' [Tailgate]' : ''}`,
      hasTailgate,
      goodsType: goodsType || (currentLang === 'en' ? 'General Cargo' : currentLang === 'zh' ? '普通货物' : 'Muatan Am'),
      dateTime: dateTime || (currentLang === 'en' ? 'Today' : currentLang === 'zh' ? '今天' : 'Hari Ini'),
      note: note.trim() || undefined,
      status: isReturnLoadOffer ? 'PENDING_RETURN_LOAD' : 'PENDING',
      isReturnLoadOffer,
      returnLoadDriverId: returnLoadDriverId || undefined,
      price: null, // STRICT RULE: NO PRICE ANYWHERE
      returnLoadExpiry: isReturnLoadOffer
        ? new Date(Date.now() + 5 * 60 * 1000).toISOString()
        : undefined,
    });

    setCreatedSuccessBooking(newBooking);
    setCurrentView('success');

    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  // Sticky Bottom Button Text
  const getStickyButtonText = () => {
    const kmText = `${Math.round(distanceKm)} KM`;
    if (currentLang === 'en') {
      return `📦 BOOK NOW (${kmText})`;
    } else if (currentLang === 'zh') {
      return `📦 立即预订 (${kmText})`;
    }
    return `📦 TEMPAH SEKARANG (${kmText})`;
  };

  return (
    <div className="flex-1 flex flex-col w-full min-h-0 relative overflow-x-hidden">
      {/* Top Customer Navigation Bar */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-3 sm:px-4 py-2.5 sm:py-3 sticky top-0 z-30 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          {(onLogout || onBackToRoleSelect) && (
            <button
              onClick={onLogout || onBackToRoleSelect}
              className="px-2 py-1 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors border border-slate-200/80 cursor-pointer"
              title={currentLang === 'en' ? 'Log Out / Switch Role' : currentLang === 'zh' ? '登出 / 切换角色' : 'Log Keluar / Tukar Peranan'}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">
                {currentLang === 'en' ? 'Exit' : currentLang === 'zh' ? '退出' : 'Keluar'}
              </span>
            </button>
          )}
          <div>
            <h1 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>{t('bookLorry')}</span>
              <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold border border-blue-200">
                1-Step Form
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              {t('commissionFreeNotice')}
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentView('form')}
            className={`px-3.5 py-1.5 rounded-[12px] text-xs font-black transition-all ${
              currentView === 'form'
                ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF9100] text-white shadow-btn-orange'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-[#F0F0F0]'
            }`}
          >
            {t('bookLorry')}
          </button>

          <button
            onClick={() => setCurrentView('myBookings')}
            className={`px-3.5 py-1.5 rounded-[12px] text-xs font-black transition-all flex items-center gap-1.5 ${
              currentView === 'myBookings'
                ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF9100] text-white shadow-btn-orange'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-[#F0F0F0]'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>{t('myBookings')}</span>
            {bookings.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-white text-[#FF6B00] text-[9px] font-black flex items-center justify-center shadow-xs">
                {bookings.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Red Error Toast Banner if fields missing */}
      {errorMessage && (
        <div className="mx-4 mt-3 p-3.5 bg-rose-50 border border-rose-200 rounded-[16px] text-xs text-[#D32F2F] font-bold flex items-center justify-between shadow-sm animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#D32F2F] shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage('')}
            className="text-[#D32F2F] hover:text-rose-900 text-xs font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* VIEW 1: SINGLE SCROLL BOOKING FORM (CARDS 1 - 6) */}
      {currentView === 'form' && (
        <div className="flex-1 p-3 sm:p-5 space-y-4 pb-6 w-full">
          {/* GPS Feedback & Notification Banner */}
          {gpsNotification && (
            <div
              className={`p-3.5 rounded-[14px] text-xs font-bold shadow-xs transition-all animate-in fade-in slide-in-from-top-1 ${
                gpsNotification.type === 'success'
                  ? 'bg-emerald-50 text-emerald-950 border border-emerald-300'
                  : gpsNotification.type === 'warning'
                  ? 'bg-amber-50 text-amber-950 border border-amber-300'
                  : gpsNotification.type === 'error'
                  ? 'bg-rose-50 text-rose-950 border border-rose-300'
                  : 'bg-blue-50 text-blue-950 border border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {gpsNotification.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : gpsNotification.type === 'error' ? (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  <span className="truncate">{gpsNotification.text}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setGpsNotification(null)}
                  className="p-1 hover:bg-black/5 rounded-lg text-xs font-bold leading-none cursor-pointer text-slate-500 hover:text-slate-900"
                  title="Tutup"
                >
                  ✕
                </button>
              </div>

              {/* Action buttons if location needs correction or user's current location is different */}
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-emerald-200/60 flex-wrap text-[11px]">
                <span className="text-slate-600 font-medium">Bukan lokasi sebenar anda?</span>
                <button
                  type="button"
                  onClick={() => setMapPickerTarget(gpsNotification.target || 'pickup')}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-100/60 text-emerald-800 border border-emerald-300 rounded-lg font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                >
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  <span>🗺️ Betulkan di Peta / Taip Alamat</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleGpsDetect(gpsNotification.target || 'pickup')}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-100/60 text-emerald-800 border border-emerald-300 rounded-lg font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                  title="Paksa imbasan satelit GPS baru (zero-cache)"
                >
                  <Navigation className="w-3 h-3 text-emerald-600" />
                  <span>🔄 Imbas Semula Satelit</span>
                </button>

                {gpsNotification.isOutsideMalaysia && (
                  <button
                    type="button"
                    onClick={() => {
                      const kl = MALAYSIAN_CITIES[1];
                      if (gpsNotification.target === 'pickup') {
                        setPickupLocation({
                          lat: kl.lat,
                          lng: kl.lng,
                          city: kl.city,
                          address: `Bukit Bintang, ${kl.city}, ${kl.state}`,
                        });
                      } else {
                        setDropoffLocation({
                          lat: kl.lat,
                          lng: kl.lng,
                          city: kl.city,
                          address: `Bukit Bintang, ${kl.city}, ${kl.state}`,
                        });
                      }
                      setGpsNotification({
                        text: `✓ Lokasi ditukar ke Hab Malaysia: ${kl.city}`,
                        type: 'success',
                      });
                    }}
                    className="px-2.5 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-black shadow-2xs hover:opacity-95 transition-all cursor-pointer ml-auto"
                  >
                    🇲🇾 Tetapkan ke Hab Malaysia (KL)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Card 1: From Where (Pickup)* */}
          <div className="bg-white border border-[#F0F0F0] rounded-[16px] p-4 sm:p-5 shadow-card-soft space-y-2.5">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-black text-[#1A1A2E] flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#00C853] ring-4 ring-[#00C853]/20" />
                <span>{t('pickupCardTitle')}</span>
              </label>
              <span className="text-[10px] text-[#00C853] bg-[#E8F5E9] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider border border-[#00C853]/30">
                {currentLang === 'en' ? 'Pickup Point' : currentLang === 'zh' ? '起运地' : 'Lokasi Ambil'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 relative">
              <div className="flex-1 relative flex items-center">
                {/* Visual Indicator: Pulsing green dot once address is populated */}
                {pickupLocation.address && (
                  <div className="absolute left-3.5 z-10 pointer-events-none flex items-center">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  </div>
                )}
                <input
                  type="text"
                  required
                  value={pickupLocation.address}
                  onChange={(e) => handleAddressChange(e.target.value, 'pickup')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleGeocodeAddress(pickupLocation.address, 'pickup');
                    }
                  }}
                  placeholder={currentLang === 'en' ? 'Enter pickup address / city & press Enter...' : currentLang === 'zh' ? '输入装货地址 / 城市按回车...' : 'Alamat pickup (Taip & tekan Enter)...'}
                  className={`w-full bg-[#F8F9FE] border border-[#E0E0E0] focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 focus:bg-white rounded-[12px] ${
                    pickupLocation.address ? 'pl-8' : 'pl-3.5'
                  } py-3 text-xs text-[#1A1A2E] font-semibold placeholder-slate-400 focus:outline-none pr-16 transition-all`}
                />
                
                <div className="absolute right-2 flex items-center gap-1">
                  {pickupLocation.address && (
                    <button
                      type="button"
                      onClick={() => {
                        setPickupLocation({ lat: 0, lng: 0, city: '', address: '' });
                        setPickupSuggestions([]);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Padam / Clear"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleGeocodeAddress(pickupLocation.address, 'pickup')}
                    disabled={isGeocodingPickup}
                    className="p-1.5 text-slate-500 hover:text-[#FF6B00] hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                    title="Cari & Letak Pin di Peta (Tekan Enter)"
                  >
                    {isGeocodingPickup ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF6B00]" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                  </button>
                  {pickupLocation.address && (
                    <button
                      type="button"
                      onClick={() => setMapPickerTarget('pickup')}
                      className="p-1.5 text-slate-500 hover:text-[#FF6B00] hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                      title={t('change')}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Autocomplete Suggestions Dropdown */}
                {pickupSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-2xl z-40 max-h-48 overflow-y-auto divide-y divide-slate-100">
                    {pickupSuggestions.map((item, idx) => (
                      <button
                        key={`pickup-sug-${idx}`}
                        type="button"
                        onClick={() => handleSelectSuggestion(item, 'pickup')}
                        className="w-full text-left p-2.5 hover:bg-orange-50 transition-colors flex items-start gap-2 cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5 text-[#FF6B00] shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-800 truncate">{item.title}</div>
                          <div className="text-[10px] text-slate-500 truncate">{item.subtitle}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setMapPickerTarget('pickup')}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-gradient-to-r from-[#FF6B00] to-[#FF9100] hover:from-[#E65100] hover:to-[#FF6B00] text-white rounded-[12px] text-xs font-black flex items-center justify-center gap-1.5 shadow-btn-orange transition-all active:scale-[0.98] cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-white" />
                  <span>{t('chooseOnMap')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleGpsDetect('pickup')}
                  disabled={isLocatingPickup}
                  className="px-3.5 py-2.5 bg-[#F8F9FE] hover:bg-slate-100 text-slate-700 border border-[#E0E0E0] rounded-[12px] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-wait"
                  title={t('currentLocation')}
                >
                  {isLocatingPickup ? (
                    <Loader2 className="w-4 h-4 text-[#00C853] animate-spin" />
                  ) : (
                    <Navigation className="w-4 h-4 text-[#00C853]" />
                  )}
                  <span>
                    {isLocatingPickup ? 'Detecting location...' : 'GPS'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: To Where (Dropoff)* */}
          <div className="bg-white border border-[#F0F0F0] rounded-[16px] p-4 sm:p-5 shadow-card-soft space-y-2.5">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-black text-[#1A1A2E] flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#D32F2F] ring-4 ring-[#D32F2F]/20" />
                <span>{t('dropoffCardTitle')}</span>
              </label>
              <span className="text-[10px] text-[#D32F2F] bg-rose-50 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider border border-[#D32F2F]/30">
                {currentLang === 'en' ? 'Dropoff Point' : currentLang === 'zh' ? '目的地' : 'Lokasi Hantar'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 relative">
              <div className="flex-1 relative flex items-center">
                {/* Visual Indicator: Pulsing green dot once address is populated */}
                {dropoffLocation.address && (
                  <div className="absolute left-3.5 z-10 pointer-events-none flex items-center">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  </div>
                )}
                <input
                  type="text"
                  required
                  value={dropoffLocation.address}
                  onChange={(e) => handleAddressChange(e.target.value, 'dropoff')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleGeocodeAddress(dropoffLocation.address, 'dropoff');
                    }
                  }}
                  placeholder={currentLang === 'en' ? 'Enter dropoff destination & press Enter...' : currentLang === 'zh' ? '输入目的地详细地址按回车...' : 'Alamat destinasi (Taip & tekan Enter)...'}
                  className={`w-full bg-[#F8F9FE] border border-[#E0E0E0] focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 focus:bg-white rounded-[12px] ${
                    dropoffLocation.address ? 'pl-8' : 'pl-3.5'
                  } py-3 text-xs text-[#1A1A2E] font-semibold placeholder-slate-400 focus:outline-none pr-16 transition-all`}
                />
                
                <div className="absolute right-2 flex items-center gap-1">
                  {dropoffLocation.address && (
                    <button
                      type="button"
                      onClick={() => {
                        setDropoffLocation({ lat: 0, lng: 0, city: '', address: '' });
                        setDropoffSuggestions([]);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Padam / Clear"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleGeocodeAddress(dropoffLocation.address, 'dropoff')}
                    disabled={isGeocodingDropoff}
                    className="p-1.5 text-slate-500 hover:text-[#0D47A1] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Cari & Letak Pin di Peta (Tekan Enter)"
                  >
                    {isGeocodingDropoff ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0D47A1]" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                  </button>
                  {dropoffLocation.address && (
                    <button
                      type="button"
                      onClick={() => setMapPickerTarget('dropoff')}
                      className="p-1.5 text-slate-500 hover:text-[#0D47A1] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title={t('change')}
                    >
                      <MapPin className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Dropoff Autocomplete Suggestions Dropdown */}
                {dropoffSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-2xl z-40 max-h-48 overflow-y-auto divide-y divide-slate-100">
                    {dropoffSuggestions.map((item, idx) => (
                      <button
                        key={`dropoff-sug-${idx}`}
                        type="button"
                        onClick={() => handleSelectSuggestion(item, 'dropoff')}
                        className="w-full text-left p-2.5 hover:bg-blue-50 transition-colors flex items-start gap-2 cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5 text-[#0D47A1] shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-800 truncate">{item.title}</div>
                          <div className="text-[10px] text-slate-500 truncate">{item.subtitle}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setMapPickerTarget('dropoff')}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-gradient-to-r from-[#0D47A1] to-[#1976D2] hover:from-[#0D47A1] hover:to-[#1565C0] text-white rounded-[12px] text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-[0.98] cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-white" />
                  <span>{t('chooseOnMap')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleGpsDetect('dropoff')}
                  disabled={isLocatingDropoff}
                  className="px-3.5 py-2.5 bg-[#F8F9FE] hover:bg-slate-100 text-slate-700 border border-[#E0E0E0] rounded-[12px] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-wait"
                  title={t('currentLocation')}
                >
                  {isLocatingDropoff ? (
                    <Loader2 className="w-4 h-4 text-[#D32F2F] animate-spin" />
                  ) : (
                    <Navigation className="w-4 h-4 text-[#D32F2F]" />
                  )}
                  <span>
                    {isLocatingDropoff ? 'Detecting location...' : 'GPS'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: KM Auto Calculation (Light Orange #FFF8F0, Border orange 1px, Text Big Bold 32px #FF6B00) */}
          {pickupLocation.address && dropoffLocation.address && distanceKm > 0 ? (
            <div className="bg-[#FFF8F0] border border-[#FF6B00] rounded-[16px] p-4 sm:p-5 shadow-card-soft space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-black text-[#1A1A2E]">
                  <span className="text-[#00C853]">📍 {pickupLocation.city || pickupLocation.address.split(',')[0]}</span>
                  <span className="text-[#FF6B00] mx-1">➔</span>
                  <span className="text-[#D32F2F]">{dropoffLocation.city || dropoffLocation.address.split(',')[0]}</span>
                </div>
                <span className="text-[10px] bg-gradient-to-r from-[#FF6B00] to-[#FF9100] text-white font-black px-2.5 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
                  {currentLang === 'en' ? 'HIGHWAY KM (FREE)' : currentLang === 'zh' ? '实际干道里程' : 'LEBUHRAYA KM'}
                </span>
              </div>

              <div className="pt-2 border-t border-[#FF6B00]/20 flex items-center justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-[#FF6B00] font-black flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>{t('actualRoadDistance')}:</span>
                  </div>
                  <div className="text-[32px] font-black text-[#FF6B00] tracking-tight leading-none mt-1 flex items-baseline gap-1.5">
                    <span>📏 {Math.round(distanceKm)}</span>
                    <span className="text-lg font-black text-[#FF6B00]">KM</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold flex items-center justify-end gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>{t('estimatedTransitTime')}:</span>
                  </div>
                  <div className="text-base font-black text-[#1A1A2E] font-mono mt-0.5">
                    ⏱️ {estimatedTime}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-black block">
                    ✓ {currentLang === 'en' ? 'Direct Deal • 0 Commission' : currentLang === 'zh' ? '直接协商 • 零抽佣' : 'Urusan Terus • 0 Komisen'}
                  </span>
                </div>
              </div>

              {/* Quick WhatsApp Negotiation Action Banner */}
              <div className="pt-2 border-t border-[#FF6B00]/15 flex flex-col sm:flex-row items-center justify-between gap-2 bg-white/70 p-2.5 rounded-[12px] border border-[#FF6B00]/20">
                <div className="flex items-center gap-2 text-left min-w-0">
                  <div className="w-7 h-7 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <MessageCircle className="w-4 h-4 fill-white" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-black text-[#1A1A2E] block truncate">
                      {currentLang === 'en' ? 'Want to negotiate right now?' : currentLang === 'zh' ? '想要即刻洽谈运费？' : 'Nak bincang harga terus sekarang?'}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {currentLang === 'en' ? 'Template pre-fills route & lorry specs into WhatsApp' : currentLang === 'zh' ? '模板已自动填入路线与车型详情' : 'Format tempahan siap terisi mengikut jenis lori'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDirectWhatsApp}
                  className="w-full sm:w-auto px-3.5 py-1.5 bg-[#25D366] hover:bg-[#1ebd5a] active:scale-[0.98] text-white rounded-[10px] text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-white" />
                  <span>{currentLang === 'en' ? 'Direct WhatsApp' : currentLang === 'zh' ? '直接 WhatsApp' : 'WhatsApp Terus'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-[16px] p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
                <Navigation className="w-4 h-4 text-[#FF6B00]" />
                <span>
                  {currentLang === 'en'
                    ? 'Enter or tap GPS / Map for both Pickup & Dropoff to calculate road distance (KM).'
                    : currentLang === 'zh'
                    ? '请输入或通过 GPS/地图选定起运地和目的地以自动计算里程（KM）。'
                    : 'Pilih lokasi Ambil dan Hantar (GPS / Peta) untuk kira jarak lebuhraya sebenar (KM).'}
                </span>
              </div>
            </div>
          )}

          {/* Card 4: Lorry Details* */}
          <div className="bg-white border border-[#F0F0F0] rounded-[16px] p-4 sm:p-5 shadow-card-soft space-y-3.5">
            <h3 className="text-xs font-black text-[#1A1A2E] uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#0D47A1]" />
              <span>{t('lorryCapacityCard')}</span>
            </h3>

            {/* Row 1: Tonnage & Goods */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#1A1A2E] mb-1 flex items-center gap-1">
                  <span className="text-[#FF6B00] font-black">⚖️</span>
                  <span>{t('tonnage')} *</span>
                </label>
                <select
                  value={tonnage}
                  onChange={(e) => setTonnage(e.target.value)}
                  className="w-full px-3.5 py-3 bg-[#F8F9FE] border border-[#E0E0E0] focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 focus:bg-white rounded-[12px] text-xs text-[#1A1A2E] focus:outline-none font-bold transition-all shadow-xs"
                >
                  {TONNAGE_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1A2E] mb-1 flex items-center gap-1">
                  <span className="text-[#0D47A1] font-black">📦</span>
                  <span>{t('goodsType')} *</span>
                </label>
                <div className="relative">
                  <Package className="w-4 h-4 absolute left-3 top-3.5 text-[#0D47A1]" />
                  <input
                    type="text"
                    required
                    value={goodsType}
                    onChange={(e) => setGoodsType(e.target.value)}
                    placeholder={t('goodsPlaceholder')}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#F8F9FE] border border-[#E0E0E0] focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 focus:bg-white rounded-[12px] text-xs text-[#1A1A2E] placeholder-slate-400 focus:outline-none font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Visual Lorry Body Type Selector with Canvas & Closed Box illustrations */}
            <div className="pt-1">
              <LorryBodySelector
                currentLang={currentLang}
                selectedBodyType={bodyType}
                onSelectBodyType={setBodyType}
                options={BODY_TYPE_OPTIONS}
              />
            </div>

            {/* Row 3: Extra Requirements / Add-ons (Tailgate / Hydraulic Lift) */}
            <div className="pt-2 border-t border-[#F0F0F0]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>
                    {currentLang === 'en'
                      ? 'Extra Requirements / Add-ons'
                      : currentLang === 'zh'
                      ? '附加配置要求 / 选配服务'
                      : 'Keperluan Tambahan / Pilihan'}
                  </span>
                </span>
                <span className="text-[10px] text-[#0D47A1] font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  {currentLang === 'en' ? 'Heavy Items' : currentLang === 'zh' ? '重型货物' : 'Barang Berat'}
                </span>
              </div>

              {/* Dynamic Tailgate / Hydraulic Lift Toggle Card */}
              <div
                onClick={() => setHasTailgate(!hasTailgate)}
                className={`p-3.5 rounded-[14px] border-2 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs ${
                  hasTailgate
                    ? 'bg-gradient-to-r from-[#FFF3E0] to-[#FFE0B2]/60 border-[#FF6B00] shadow-sm'
                    : 'bg-[#F8F9FE] border-[#E0E0E0] hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 text-base font-black transition-colors ${
                      hasTailgate
                        ? 'bg-[#FF6B00] text-white shadow-xs'
                        : 'bg-white border border-[#E0E0E0] text-slate-500'
                    }`}
                  >
                    🏗️
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-[#1A1A2E]">
                        Tailgate / Hydraulic Lift
                      </span>
                      <span className="text-[10px] font-bold text-slate-600 bg-white/80 px-1.5 py-0.5 rounded border border-slate-200">
                        Pintu Angkat ஹைட்ராலிக் லிப்ட்
                      </span>
                      {hasTailgate && (
                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          +RM20 (Anggaran / Est.)
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                      {currentLang === 'en'
                        ? 'Hydraulic lift platform at rear to load heavy machinery, pallets, or furniture effortlessly without forklift.'
                        : currentLang === 'zh'
                        ? '车尾液压升降机板，无需叉车即可轻松上下装卸重型机械、托盘卡板或大型家具。'
                        : 'Platform angkat hidraulik di bahagian belakang untuk muat barang berat, palet atau perabot tanpa forklift.'}
                    </p>
                    {hasTailgate && (
                      <p className="text-[10px] text-[#FF6B00] font-black mt-1 flex items-center gap-1">
                        <span>✓</span>
                        <span>
                          {currentLang === 'en'
                            ? 'Matched exclusively with tailgate-equipped lorries'
                            : currentLang === 'zh'
                            ? '仅向配备液压尾板的合格罗里司机派发此订单'
                            : 'Pesanan dihantar khas kepada pemandu lori dengan pintu angkat hidraulik'}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {/* iOS Style Custom Toggle Switch */}
                <div className="shrink-0 flex flex-col items-center gap-1">
                  <div
                    className={`w-12 h-6 rounded-full p-1 transition-colors flex items-center ${
                      hasTailgate ? 'bg-[#FF6B00] justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
                  </div>
                  <span className={`text-[10px] font-black ${hasTailgate ? 'text-[#FF6B00]' : 'text-slate-400'}`}>
                    {hasTailgate ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 5: Date Time Picker* + Note optional */}
          <div className="bg-white border border-[#F0F0F0] rounded-[16px] p-4 sm:p-5 shadow-card-soft space-y-3">
            <h3 className="text-xs font-black text-[#1A1A2E] uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#FF6B00]" />
              <span>{t('scheduleCard')}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-[#1A1A2E] mb-1">
                  {t('dateTimeLabel')}
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-3.5 text-[#FF6B00]" />
                  <input
                    type="text"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    placeholder={t('datePlaceholder')}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#F8F9FE] border border-[#E0E0E0] focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 focus:bg-white rounded-[12px] text-xs text-[#1A1A2E] placeholder-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1A2E] mb-1">
                  {t('notesLabel')}
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={t('notePlaceholder')}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#F8F9FE] border border-[#E0E0E0] focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 focus:bg-white rounded-[12px] text-xs text-[#1A1A2E] placeholder-slate-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 6: Your Details For Driver Contact* */}
          <div className="bg-white border-2 border-[#FF6B00]/40 rounded-[16px] p-4 sm:p-5 shadow-card-soft space-y-3">
            <div>
              <h3 className="text-xs font-black text-[#1A1A2E] flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#0D47A1]" />
                <span>{t('customerDetailsCard')}</span>
              </h3>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {currentLang === 'en'
                  ? 'Drivers will contact you via WhatsApp / phone to negotiate rates.'
                  : currentLang === 'zh'
                  ? '司机将通过 WhatsApp 或电话直接联系您商定运费。'
                  : 'Pemandu akan hubungi anda melalui WhatsApp / telefon untuk runding harga.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#1A1A2E]">
                    {t('yourName')} *
                  </label>
                  {name && (
                    <button
                      type="button"
                      onClick={() => {
                        setName('');
                        localStorage.removeItem('deliverymy_saved_name');
                      }}
                      className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {currentLang === 'en' ? 'Clear' : currentLang === 'zh' ? '清空' : 'Padam'}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3.5 text-[#0D47A1]" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={currentLang === 'en' ? 'E.g.: John Tan / Ahmad' : currentLang === 'zh' ? '例如：陈先生 / 亚末' : 'Cth: Tan Wei Ming / Ahmad'}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#F8F9FE] border border-[#E0E0E0] focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 focus:bg-white rounded-[12px] text-xs text-[#1A1A2E] placeholder-slate-400 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#1A1A2E]">
                    {t('yourPhone')} *
                  </label>
                  {phone && (
                    <button
                      type="button"
                      onClick={() => {
                        setPhone('');
                        localStorage.removeItem('deliverymy_saved_phone');
                      }}
                      className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {currentLang === 'en' ? 'Clear' : currentLang === 'zh' ? '清空' : 'Padam'}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3.5 text-[#25D366]" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0123456789"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#F8F9FE] border border-[#E0E0E0] focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 focus:bg-white rounded-[12px] text-xs text-[#1A1A2E] placeholder-slate-400 focus:outline-none font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                {currentLang === 'en'
                  ? 'Auto-saved for future bookings. No tedious password registration required!'
                  : currentLang === 'zh'
                  ? '已自动保存以便下次使用，无需繁琐账号密码！'
                  : 'Disimpan secara automatik untuk tempahan seterusnya. Tiada pendaftaran rumit!'}
              </span>
            </div>
          </div>

          {/* Zero Price Direct Deal Note */}
          <div className="p-3.5 bg-white border border-[#F0F0F0] rounded-[16px] text-[11px] text-slate-600 flex items-start gap-2 shadow-xs">
            <Info className="w-4 h-4 text-[#0D47A1] shrink-0 mt-0.5" />
            <span>{t('noPriceNote')}</span>
          </div>

          {/* Sponsored Advertisement Card / Banner Box */}
          <div className="relative bg-gradient-to-br from-white via-slate-50/70 to-orange-50/30 border border-slate-200 rounded-[20px] p-4 sm:p-5 shadow-xs transition-all hover:border-slate-300">
            {/* Orange Tag at Top Left */}
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FF6B00] text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                <Megaphone className="w-3 h-3" />
                <span>SPONSORED AD</span>
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                DeliveryMY Partner
              </span>
            </div>

            {/* Bold Headline Placeholder */}
            <div className="space-y-1.5 mb-4">
              <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                Advertise your logistics business here! Contact admin for monthly rates.
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed font-medium">
                {currentLang === 'en'
                  ? 'Reach thousands of shippers, factories, lorry owners, and everyday customers across Malaysia directly.'
                  : currentLang === 'zh'
                  ? '直接触达全马数以万计的货主、工厂、罗里司机与高意向运输客户。'
                  : 'Capai ribuan pelanggan, kilang, dan pemilik lori di seluruh Malaysia secara terus.'}
              </p>
            </div>

            {/* Clickable 'Book Ad Space' Outline Button */}
            <div className="pt-1">
              <a
                href="https://wa.me"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 border-2 border-[#FF6B00] hover:bg-[#FF6B00] hover:text-white text-[#FF6B00] active:scale-[0.99] font-black text-xs sm:text-sm rounded-[14px] transition-all cursor-pointer shadow-xs group"
                title="Book Ad Space via WhatsApp"
              >
                <MessageCircle className="w-4 h-4 fill-current group-hover:fill-white transition-colors" />
                <span>Book Ad Space</span>
                <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-80" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* FINAL BIG BUTTON - STICKY BOTTOM (While in form view) */}
      {/* Includes Primary BOOK NOW Button and Direct WhatsApp Quick Action Button */}
      {currentView === 'form' && (
        <div className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 p-2.5 sm:p-4 shadow-[0_-4px_25px_rgba(0,0,0,0.12)] w-full transition-all">
          <div className="flex items-center gap-2 max-w-full">
            {/* Direct WhatsApp Quick-Action Button */}
            <button
              type="button"
              onClick={handleDirectWhatsApp}
              className="h-[52px] sm:h-[58px] px-3 sm:px-4 bg-[#25D366] hover:bg-[#1ebd5a] active:scale-[0.98] text-white rounded-[14px] sm:rounded-[16px] shadow-[0_4px_14px_rgba(37,211,102,0.35)] flex flex-col items-center justify-center shrink-0 transition-all cursor-pointer group"
              title={currentLang === 'en' ? 'Direct WhatsApp Quick Negotiation' : currentLang === 'zh' ? '直接 WhatsApp 快速询价' : 'Bincang Terus di WhatsApp'}
            >
              <div className="flex items-center gap-1 sm:gap-1.5 font-black text-xs sm:text-sm leading-tight">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                <span className="hidden xs:inline sm:inline">WhatsApp</span>
              </div>
              <span className="text-[8.5px] sm:text-[9px] font-bold text-emerald-100 uppercase tracking-wider leading-none mt-0.5">
                {currentLang === 'en' ? 'Direct Deal' : currentLang === 'zh' ? '直接报价' : 'Terus Runding'}
              </span>
            </button>

            {/* Main Book Now Button */}
            <button
              onClick={handleBookNowSubmit}
              className="flex-1 h-[52px] sm:h-[58px] text-[14px] sm:text-[17px] font-black tracking-wide bg-gradient-to-r from-[#FF6B00] to-[#FF9100] hover:from-[#E65100] hover:to-[#FF6B00] active:scale-[0.99] text-white rounded-[14px] sm:rounded-[16px] shadow-[0_6px_20px_rgba(255,107,0,0.30)] flex items-center justify-between px-3 sm:px-5 transition-all cursor-pointer min-w-0"
            >
              <div className="flex items-center gap-1.5 sm:gap-2 truncate">
                <span className="text-lg sm:text-2xl shrink-0">📦</span>
                <span className="truncate">
                  {currentLang === 'en' ? 'BOOK NOW' : currentLang === 'zh' ? '立即预订' : 'TEMPAH SEKARANG'}
                </span>
              </div>
              <span className="bg-white text-[#FF6B00] font-black text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-xs shrink-0 tracking-wider ml-1">
                {distanceKm > 0 ? `${Math.round(distanceKm)} KM` : (currentLang === 'en' ? 'Select Route' : currentLang === 'zh' ? '选择路线' : 'Pilih Laluan')}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: SUCCESS SCREEN */}
      {currentView === 'success' && createdSuccessBooking && (
        <div className="flex-1 p-4 sm:p-6 space-y-5 animate-in fade-in duration-300 max-w-lg mx-auto w-full">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900">
                {t('bookingSuccessTitle')}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                {t('bookingSuccessDesc')}
              </p>
            </div>

            {/* Booking Summary Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2 text-left">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">No. Tempahan / Order:</span>
                <span className="font-mono font-bold text-blue-600">
                  #{createdSuccessBooking.bookingId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Laluan / Route:</span>
                <strong className="text-slate-900">
                  {createdSuccessBooking.fromCity} ➔ {createdSuccessBooking.toCity}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Jarak / Masa:</span>
                <strong className="text-emerald-700">
                  📏 {createdSuccessBooking.distanceText} • ⏱️ {createdSuccessBooking.estimatedTime}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Lori:</span>
                <span className="font-bold text-slate-900">
                  🚛 {createdSuccessBooking.fullLorryType}
                </span>
              </div>
              {createdSuccessBooking.hasTailgate && (
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500 font-medium">Peralatan:</span>
                  <span className="font-bold text-[#FF6B00] bg-orange-100 px-2 py-0.5 rounded-full text-[11px] flex items-center gap-1">
                    🏗️ Tailgate / Hydraulic Lift (+RM20)
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Pelanggan:</span>
                <span className="text-slate-700">
                  👤 {createdSuccessBooking.customerName} ({createdSuccessBooking.customerPhone})
                </span>
              </div>
              {createdSuccessBooking.isReturnLoadOffer && (
                <div className="mt-1 pt-1.5 border-t border-slate-200 flex items-center justify-between text-amber-800">
                  <span className="flex items-center gap-1 font-bold">
                    <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>Return Load Offer:</span>
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-mono font-bold">
                    {t('offerValid5Min')}
                  </span>
                </div>
              )}
            </div>

            {/* Real-Time Firebase FCM Broadcast Status */}
            <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex items-start gap-2.5 text-left shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-black text-blue-950">
                    {currentLang === 'en' ? 'Firebase FCM Real-Time Broadcast' : currentLang === 'zh' ? 'Firebase FCM 实时推送广播' : 'Siaran Langsung Firebase FCM'}
                  </span>
                  <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Radius &lt; 10 KM
                  </span>
                </div>
                <p className="text-[11px] text-blue-800 leading-tight">
                  {currentLang === 'en'
                    ? `Live broadcast push notification dispatched to active drivers matching vehicle (${createdSuccessBooking.fullLorryType}) within 10km radius of ${createdSuccessBooking.fromCity}.`
                    : currentLang === 'zh'
                    ? `已向 ${createdSuccessBooking.fromCity} 10公里半径内符合车型 (${createdSuccessBooking.fullLorryType}) 的所有活跃司机发送实时推送。`
                    : `Notifikasi tolak langsung dihantar serentak ke pemandu aktif kenderaan sepadan (${createdSuccessBooking.fullLorryType}) dalam radius 10km dari ${createdSuccessBooking.fromCity}.`}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              {/* WhatsApp Driver / Support button with pre-filled booking details */}
              <a
                href={StorageService.generateWhatsAppLink(
                  createdSuccessBooking.driverPhone || StorageService.getConfig().paymentConfig.supportWhatsApp || '60123456789',
                  `Hi! Saya ${createdSuccessBooking.customerName}, telah buat tempahan #${createdSuccessBooking.bookingId} (${createdSuccessBooking.fromCity} ➔ ${createdSuccessBooking.toCity}, 📏 ${createdSuccessBooking.distanceText}, Lori: ${createdSuccessBooking.fullLorryType}). Boleh bincang harga terus sekarang?`
                )}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 bg-[#25D366] hover:bg-[#1ebd5a] active:scale-[0.99] text-white rounded-2xl font-black text-xs shadow-md shadow-[#25D366]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>
                  {currentLang === 'en'
                    ? 'Direct WhatsApp (Fast Negotiation)'
                    : currentLang === 'zh'
                    ? '直接 WhatsApp 即时商谈'
                    : 'WhatsApp Terus (Bincang Segera)'}
                </span>
              </a>

              <button
                onClick={() => setCurrentView('myBookings')}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Package className="w-4 h-4" />
                <span>{t('viewMyBookings')}</span>
              </button>

              <button
                onClick={() => {
                  setCurrentView('form');
                  setCreatedSuccessBooking(null);
                }}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t('bookAnother')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: MY BOOKINGS TAB (Guest by Phone) */}
      {currentView === 'myBookings' && (
        <div className="flex-1 p-4 sm:p-5 space-y-4 max-w-2xl mx-auto w-full">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                {t('myBookings')}
              </h2>
              <p className="text-xs text-slate-500">
                {currentLang === 'en'
                  ? 'Bookings tied directly to your phone number • No password needed'
                  : currentLang === 'zh'
                  ? '订单直接与您的手机号码关联 • 无需输入密码'
                  : 'Tempahan dipautkan dengan nombor telefon anda • Tiada kata laluan'}
              </p>
            </div>

            <button
              onClick={() => setCurrentView('form')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
            >
              <span>+ {t('bookAnother')}</span>
            </button>
          </div>

          {/* Quick Phone Search */}
          <div className="bg-white border border-slate-200 p-2.5 rounded-2xl flex items-center gap-2 text-xs shadow-xs">
            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="tel"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              placeholder={currentLang === 'en' ? 'Enter phone number to search bookings...' : currentLang === 'zh' ? '输入手机号码查找订单...' : 'Masukkan no. telefon untuk cari tempahan...'}
              className="flex-1 bg-transparent text-slate-900 font-mono focus:outline-none"
            />
            <button
              onClick={() => {
                setPhone(searchPhone);
                localStorage.setItem('deliverymy_saved_phone', searchPhone);
              }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shrink-0 text-xs"
            >
              {currentLang === 'en' ? 'Search' : currentLang === 'zh' ? '搜索' : 'Cari'}
            </button>
          </div>

          {/* Bookings List */}
          {bookings.length === 0 ? (
            <div className="text-center py-12 bg-white border border-[#F0F0F0] rounded-[16px] p-6 space-y-3 shadow-card-soft">
              <Truck className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="font-bold text-[#1A1A2E] text-base">
                {t('noBookingsFound')}
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {currentLang === 'en'
                  ? 'No booking records for this phone number. Click below to book a lorry now.'
                  : currentLang === 'zh'
                  ? '此手机号码暂无运输记录。点击下方即可立即预订。'
                  : 'Tiada rekod tempahan untuk nombor telefon ini. Klik butang di bawah untuk membuat tempahan sekarang.'}
              </p>
              <button
                onClick={() => setCurrentView('form')}
                className="px-5 py-2.5 bg-gradient-to-r from-[#FF6B00] to-[#FF9100] hover:from-[#E65100] hover:to-[#FF6B00] text-white rounded-[16px] text-xs font-black shadow-btn-orange cursor-pointer"
              >
                {t('findDriver')}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => {
                const topBorderClass =
                  booking.status === 'COMPLETED'
                    ? 'border-t-4 border-t-[#00C853]'
                    : booking.status === 'ON_THE_WAY'
                    ? 'border-t-4 border-t-[#2E7D32]'
                    : booking.status === 'ACCEPTED'
                    ? 'border-t-4 border-t-[#0D47A1]'
                    : 'border-t-4 border-t-[#FF6B00]';

                return (
                  <div
                    key={booking.bookingId}
                    onClick={() => setSelectedBookingDetail(booking)}
                    className={`bg-white border border-[#F0F0F0] ${topBorderClass} rounded-[16px] p-4 shadow-card-soft hover:shadow-lg transition-all cursor-pointer space-y-2.5`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-black text-[#0D47A1]">
                            #{booking.bookingId}
                          </span>
                          {booking.isReturnLoadOffer && (
                            <span className="text-[10px] bg-gradient-to-r from-[#FF6B00] to-[#FF9100] text-white font-black px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                              <Flame className="w-3 h-3 text-white fill-white" />
                              <span>RETURN LOAD</span>
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-black text-[#1A1A2E] mt-0.5">
                          {booking.fromCity} ➔ {booking.toCity}
                        </h4>
                      </div>

                      {/* Status Badges:
                          PENDING: Background #FFF3E0 Text #FF6B00 border orange
                          ACCEPTED: Background #E3F2FD Text #0D47A1 border blue
                          ON_THE_WAY: Background #E8F5E9 Text #2E7D32 border green + pulse animation
                          COMPLETED: Background #E8F5E9 Text #00C853
                      */}
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                          booking.status === 'ACCEPTED'
                            ? 'bg-[#E3F2FD] text-[#0D47A1] border-[#0D47A1]/30'
                            : booking.status === 'ON_THE_WAY'
                            ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#2E7D32]/30 animate-pulse'
                            : booking.status === 'COMPLETED'
                            ? 'bg-[#E8F5E9] text-[#00C853] border-[#00C853]/30'
                            : 'bg-[#FFF3E0] text-[#FF6B00] border-[#FF6B00]/40'
                        }`}
                      >
                        {booking.status === 'ACCEPTED'
                          ? (currentLang === 'en' ? 'Driver Accepted' : currentLang === 'zh' ? '司机已接单' : 'Diterima Pemandu')
                          : booking.status === 'ON_THE_WAY'
                          ? (currentLang === 'en' ? 'On The Way 🚚' : currentLang === 'zh' ? '运输在途中 🚚' : 'Dalam Perjalanan 🚚')
                          : booking.status === 'COMPLETED'
                          ? (currentLang === 'en' ? 'Completed ✅' : currentLang === 'zh' ? '已完成送达 ✅' : 'Selesai Dihantar ✅')
                          : (currentLang === 'en' ? 'Waiting Driver' : currentLang === 'zh' ? '等待司机响应' : 'Menunggu Pemandu')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-[#F0F0F0]">
                      <span className="font-bold text-[#1A1A2E]">📏 {booking.distanceText}</span>
                      <span>🚛 {booking.fullLorryType}</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>

                    {booking.driverName && (
                      <div className="bg-[#F8F9FE] p-2.5 rounded-[12px] border border-[#E0E0E0] flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-[#1A1A2E] block">{booking.driverName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {booking.lorryNumber}
                          </span>
                        </div>
                        <div className="flex gap-1.5">
                          <a
                            href={StorageService.generateWhatsAppLink(
                              booking.driverPhone || '',
                              `Hi ${booking.driverName}! Saya ${booking.customerName} tempahan #${booking.bookingId} (${booking.fromCity} ke ${booking.toCity} 📏 ${booking.distanceText}). Boleh kita bincang harga?`
                            )}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:opacity-95 text-white rounded-[10px] transition-all shadow-xs"
                            title={t('chatWhatsApp')}
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={`tel:${booking.driverPhone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 bg-gradient-to-r from-[#1976D2] to-[#0D47A1] hover:opacity-95 text-white rounded-[10px] transition-all shadow-xs"
                            title={t('callDriver')}
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Map Picker Modal */}
      <MapPickerModal
        isOpen={mapPickerTarget !== null}
        title={
          mapPickerTarget === 'pickup'
            ? (currentLang === 'en' ? 'Select Pickup Point' : currentLang === 'zh' ? '选择装货地点' : 'Pilih Lokasi Pengambilan (Pickup)')
            : (currentLang === 'en' ? 'Select Dropoff Destination' : currentLang === 'zh' ? '选择卸货目的地' : 'Pilih Lokasi Penghantaran (Dropoff)')
        }
        initialLocation={mapPickerTarget === 'pickup' ? pickupLocation : dropoffLocation}
        onConfirm={(loc) => {
          if (mapPickerTarget === 'pickup') {
            setPickupLocation(loc);
            setGpsNotification({
              text: currentLang === 'en'
                ? `✓ Pickup address confirmed from map: ${loc.address}`
                : currentLang === 'zh'
                ? `✓ 已从地图确认装货地址: ${loc.address}`
                : `✓ Alamat Pickup disahkan dari peta: ${loc.address}`,
              type: 'success',
            });
          } else {
            setDropoffLocation(loc);
            setGpsNotification({
              text: currentLang === 'en'
                ? `✓ Dropoff destination confirmed from map: ${loc.address}`
                : currentLang === 'zh'
                ? `✓ 已从地图确认目的地: ${loc.address}`
                : `✓ Alamat Dropoff disahkan dari peta: ${loc.address}`,
              type: 'success',
            });
          }
          setMapPickerTarget(null);
        }}
        onClose={() => setMapPickerTarget(null)}
      />

      {/* Driver Radar Expanding Radius Search Modal (3km -> 5km -> 8km -> 12km+) */}
      <DriverRadarModal
        isOpen={isRadarModalOpen}
        currentLang={currentLang}
        lorryInfo={`${tonnage} - ${bodyType.split('/')[0].trim()}${hasTailgate ? ' [🏗️ Tailgate Lift]' : ''}`}
        routeInfo={`${pickupLocation.city} ➔ ${dropoffLocation.city} (${Math.round(distanceKm)} KM)`}
        onComplete={handleRadarComplete}
        onCancel={() => setIsRadarModalOpen(false)}
      />

      {/* Return Load Bottom Sheet */}
      {matchedReturnLoadDriver && (
        <ReturnLoadBottomSheet
          isOpen={isReturnLoadSheetOpen}
          driver={matchedReturnLoadDriver}
          distanceKm={distanceKm}
          fromCity={pickupLocation.city}
          toCity={dropoffLocation.city}
          onBookReturnLoad={() => {
            setIsReturnLoadSheetOpen(false);
            finalizeBookingCreation(true, matchedReturnLoadDriver.uid);
          }}
          onSeeAllDrivers={() => {
            setIsReturnLoadSheetOpen(false);
            finalizeBookingCreation(false, null);
          }}
          onClose={() => setIsReturnLoadSheetOpen(false)}
        />
      )}

      {/* Booking Detail Modal */}
      {selectedBookingDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono text-blue-600 font-bold">
                  #{selectedBookingDetail.bookingId}
                </span>
                <h3 className="text-base font-black text-slate-900">
                  {currentLang === 'en' ? 'Lorry Booking Details' : currentLang === 'zh' ? '罗里订单详情' : 'Butiran Tempahan Lori'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBookingDetail(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Laluan:</span>
                <strong className="text-slate-900">{selectedBookingDetail.fromCity} ➔ {selectedBookingDetail.toCity}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jarak / Masa:</span>
                <strong className="text-emerald-700">📏 {selectedBookingDetail.distanceText} • ⏱️ {selectedBookingDetail.estimatedTime}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Lori:</span>
                <span className="font-bold text-slate-900">{selectedBookingDetail.fullLorryType}</span>
              </div>
              {selectedBookingDetail.hasTailgate && (
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">Peralatan Khas:</span>
                  <span className="font-bold text-[#FF6B00] bg-orange-100 px-2 py-0.5 rounded-full text-[11px] flex items-center gap-1">
                    🏗️ Tailgate / Hydraulic Lift (+RM20)
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Barang:</span>
                <span className="text-slate-700">{selectedBookingDetail.goodsType}</span>
              </div>
            </div>

            {selectedBookingDetail.driverName ? (
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    🚛
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">{selectedBookingDetail.driverName}</span>
                    <span className="text-xs text-slate-500 font-mono">{selectedBookingDetail.lorryNumber}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={StorageService.generateWhatsAppLink(
                      selectedBookingDetail.driverPhone || '',
                      `Hi ${selectedBookingDetail.driverName}! Saya ${selectedBookingDetail.customerName} tempahan #${selectedBookingDetail.bookingId}. Boleh kita bincang harga?`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{t('chatWhatsApp')}</span>
                  </a>
                  <a
                    href={`tel:${selectedBookingDetail.driverPhone}`}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{t('callDriver')}</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                {currentLang === 'en'
                  ? 'Nearby drivers are being notified along the route. Drivers will message you on WhatsApp to discuss and negotiate pricing.'
                  : currentLang === 'zh'
                  ? '附近的司机已收到您的订单通知，稍后将通过 WhatsApp 或电话联系您商谈运费。'
                  : 'Pemandu berdekatan sedang dimaklumkan. Pemandu akan menghubungi anda melalui WhatsApp atau telefon untuk berbincang harga.'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
