import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Truck, 
  Package, 
  Settings, 
  TrendingUp, 
  Search, 
  Check, 
  X, 
  Flame, 
  Phone, 
  MessageCircle, 
  Lock, 
  Unlock,
  Power, 
  RefreshCw, 
  CreditCard,
  Sparkles,
  Megaphone,
  UserPlus,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Sliders,
  CheckCircle2,
  XCircle,
  DoorOpen,
  Code
} from 'lucide-react';
import { AppConfig, Booking, CustomerProfile, DriverProfile, Language, AdItemConfig } from '../types';
import { StorageService } from '../services/storageService';
import { LanguageService } from '../services/languageService';
import { AdvertisementBanner } from '../components/AdvertisementBanner';
import { MALAYSIAN_CITIES, TONNAGE_OPTIONS, BODY_TYPE_OPTIONS } from '../services/malaysiaLocations';

interface AdminPanelScreenProps {
  currentLang?: Language;
  onLogout: () => void;
  onOpenFlutterCode?: () => void;
  onOpenAndroidProject?: () => void;
}

export const AdminPanelScreen: React.FC<AdminPanelScreenProps> = ({ currentLang = 'en', onLogout, onOpenFlutterCode, onOpenAndroidProject }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'drivers' | 'bookings' | 'control'>('dashboard');

  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [config, setConfig] = useState<AppConfig>(StorageService.getConfig());

  // Driver filters
  const [driverSearch, setDriverSearch] = useState('');
  const [driverFilter, setDriverFilter] = useState('ALL');
  const [selectedDriverDetail, setSelectedDriverDetail] = useState<DriverProfile | null>(null);

  // Direct Add Driver Modal State
  const [isAddDriverModalOpen, setIsAddDriverModalOpen] = useState(false);
  const [newDriverForm, setNewDriverForm] = useState({
    name: '',
    phone: '',
    email: '',
    lorryNumber: '',
    lorryTonnage: '3 Tan',
    lorryBodyType: 'Closed Box 📦 / Kotak Tertutup / 封闭式',
    city: 'Kuala Lumpur',
    area: '',
    isApproved: true,
    isActive: true,
  });

  // Booking filters
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('ALL');
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<Booking | null>(null);

  // Status feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load and subscribe to updates
  useEffect(() => {
    const sync = () => {
      setDrivers(StorageService.getDrivers());
      setCustomers(StorageService.getCustomers());
      setBookings(StorageService.getBookings());
      setConfig(StorageService.getConfig());
    };

    sync();
    const unsub = StorageService.subscribe(sync);
    return () => unsub();
  }, []);

  // Filter drivers
  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(driverSearch.toLowerCase()) ||
      d.phone.includes(driverSearch) ||
      d.lorryNumber.toLowerCase().includes(driverSearch.toLowerCase()) ||
      d.email.toLowerCase().includes(driverSearch.toLowerCase()) ||
      d.city.toLowerCase().includes(driverSearch.toLowerCase());

    if (!matchesSearch) return false;

    if (driverFilter === 'ACTIVE') return d.isApproved && !d.isBlocked && d.isSubscribed && d.isActive !== false;
    if (driverFilter === 'INACTIVE') return d.isActive === false;
    if (driverFilter === 'EXPIRED') return !d.isSubscribed;
    if (driverFilter === 'PENDING_APPROVAL') return !d.isApproved;
    if (driverFilter === 'ONLINE') return d.isOnline;
    if (driverFilter === 'OFFLINE') return !d.isOnline;
    if (driverFilter === 'RETURN_LOAD') return d.returnLoad;
    return true;
  });

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.customerName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.fromCity.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.toCity.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.bookingId.toLowerCase().includes(bookingSearch.toLowerCase());

    if (!matchesSearch) return false;
    if (bookingStatusFilter !== 'ALL' && b.status !== bookingStatusFilter) return false;
    return true;
  });

  // KPI calculations
  const totalDrivers = drivers.length;
  const activeSubscribedDrivers = drivers.filter((d) => d.isSubscribed && d.isApproved).length;
  const pendingApprovalDrivers = drivers.filter((d) => !d.isApproved).length;
  const inactiveSafetyDrivers = drivers.filter((d) => d.isActive === false).length;
  const totalCustomers = customers.length;
  const totalBookings = bookings.length;
  const totalKmToday = bookings.reduce((acc, b) => acc + (b.distanceKM || 0), 0);
  const returnLoadActiveDrivers = drivers.filter((d) => d.returnLoad).length;
  const estimatedMonthlyRevenue = activeSubscribedDrivers * config.subscription.price;

  // Driver Safety Toggle (Active <-> Inactive)
  const handleToggleDriverSafety = (driver: DriverProfile, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const currentStatus = driver.isActive !== false;
    const newStatus = !currentStatus;
    const updated: DriverProfile = {
      ...driver,
      isActive: newStatus,
    };
    StorageService.saveDriver(updated);
    if (selectedDriverDetail?.uid === driver.uid) {
      setSelectedDriverDetail(updated);
    }
    showToast(
      newStatus
        ? `Driver ${driver.name} is now ACTIVE. Job notifications and booking acceptance enabled.`
        : `Driver ${driver.name} is set to INACTIVE. Blocked from receiving job notifications or accepting bookings.`
    );
  };

  // Approval Mode Switcher ('auto' <-> 'manual')
  const handleSetApprovalMode = (mode: 'auto' | 'manual') => {
    const updatedConfig: AppConfig = {
      ...config,
      approvalMode: mode,
    };
    setConfig(updatedConfig);
    StorageService.saveConfig(updatedConfig);
    showToast(
      mode === 'auto'
        ? 'Approval Mode switched to AUTO APPROVAL. New drivers will be automatically verified upon registration.'
        : 'Approval Mode switched to MANUAL APPROVAL. New drivers will require administrator review.'
    );
  };

  // Direct Driver Registration by Admin
  const handleDirectAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriverForm.name.trim() || !newDriverForm.phone.trim() || !newDriverForm.lorryNumber.trim()) {
      alert('Please fill in Driver Name, Phone Number, and Lorry Plate Number.');
      return;
    }

    const registered = StorageService.registerDriver({
      name: newDriverForm.name.trim(),
      phone: newDriverForm.phone.trim(),
      email: newDriverForm.email.trim() || `${newDriverForm.name.toLowerCase().replace(/\s+/g, '')}@lorrymy.com`,
      lorryNumber: newDriverForm.lorryNumber.toUpperCase().trim(),
      lorryTonnage: newDriverForm.lorryTonnage,
      lorryBodyType: newDriverForm.lorryBodyType,
      city: newDriverForm.city,
      area: newDriverForm.area.trim(),
      isApproved: newDriverForm.isApproved,
      isActive: newDriverForm.isActive,
      isSubscribed: true,
      subscriptionExpiry: new Date(Date.now() + 30 * 86400000).toISOString(),
    });

    setIsAddDriverModalOpen(false);
    setNewDriverForm({
      name: '',
      phone: '',
      email: '',
      lorryNumber: '',
      lorryTonnage: '3 Tan',
      lorryBodyType: 'Closed Box 📦 / Kotak Tertutup / 封闭式',
      city: 'Kuala Lumpur',
      area: '',
      isApproved: true,
      isActive: true,
    });
    showToast(`Driver ${registered.name} (${registered.lorryNumber}) registered successfully by Admin!`);
  };

  // Actions for drivers
  const handleApproveDriver = (d: DriverProfile, approve: boolean) => {
    d.isApproved = approve;
    if (approve) d.isSubscribed = true;
    StorageService.saveDriver(d);
    setSelectedDriverDetail({ ...d });
    showToast(approve ? `Driver ${d.name} approved successfully.` : `Approval revoked for driver ${d.name}.`);
  };

  const handleActivate30Days = (d: DriverProfile) => {
    d.isSubscribed = true;
    const base = d.subscriptionExpiry ? new Date(d.subscriptionExpiry).getTime() : Date.now();
    d.subscriptionExpiry = new Date(Math.max(Date.now(), base) + 30 * 86400000).toISOString();
    StorageService.saveDriver(d);
    setSelectedDriverDetail({ ...d });
    showToast(`Granted 30 free subscription days to ${d.name}.`);
  };

  const handleBlockDriver = (d: DriverProfile, block: boolean) => {
    d.isBlocked = block;
    StorageService.saveDriver(d);
    setSelectedDriverDetail({ ...d });
    showToast(block ? `Driver ${d.name} suspended.` : `Driver ${d.name} unsuspended.`);
  };

  const handleResetPassword = (d: DriverProfile) => {
    d.password = '123456';
    StorageService.saveDriver(d);
    alert(`Driver password for ${d.name} has been reset to: 123456`);
  };

  const handleForceOffReturnLoad = (d: DriverProfile) => {
    d.returnLoad = false;
    StorageService.saveDriver(d);
    setSelectedDriverDetail({ ...d });
    showToast(`Return load post deactivated for ${d.name}.`);
  };

  // Actions for configs
  const handleSaveConfig = () => {
    StorageService.saveConfig(config);
    showToast('System configuration and advertisement banners saved successfully!');
  };

  const topAd: AdItemConfig = config.advertisement?.topAd || {
    enabled: true,
    text: '🔥 Direct Lorry Hire 1 Ton - 10 Ton Across Peninsular Malaysia! Direct WhatsApp Driver.',
    subtext: '100% Zero platform commission • Direct deal logistics',
    linkUrl: '',
    badge: 'PROMO',
    bgTheme: 'amber',
  };

  const bottomAd: AdItemConfig = config.advertisement?.bottomAd || {
    enabled: true,
    text: '📢 Find Empty Return Loads & Save Up to 50% on Lorry Freight!',
    subtext: 'Book instantly through the smart radar matching network',
    linkUrl: '',
    badge: 'RETURN LOAD',
    bgTheme: 'blue',
  };

  const updateTopAd = (partial: Partial<AdItemConfig>) => {
    setConfig({
      ...config,
      advertisement: {
        topAd: { ...topAd, ...partial },
        bottomAd: bottomAd,
      },
    });
  };

  const updateBottomAd = (partial: Partial<AdItemConfig>) => {
    setConfig({
      ...config,
      advertisement: {
        topAd: topAd,
        bottomAd: { ...bottomAd, ...partial },
      },
    });
  };

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full pb-20 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 bg-[#1A1A2E] text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Admin Header Bar */}
      <div className="bg-white border-b border-slate-200 p-4 sm:p-5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-black shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-black text-slate-900">
                DeliveryMY Admin Control Center
              </h2>
              <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-mono font-bold border border-amber-200">
                SUPERADMIN
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Driver Management, Live Bookings, Safety Controls & Subscriptions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenAndroidProject && (
            <button
              type="button"
              onClick={onOpenAndroidProject}
              title="Download Standalone Android Studio Project (ZIP) / Build APK"
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-black cursor-pointer transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Android Studio ZIP</span>
            </button>
          )}

          {onOpenFlutterCode && (
            <button
              type="button"
              onClick={onOpenFlutterCode}
              title="Inspect Flutter Source Code (Dart & pubspec.yaml)"
              className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Code className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden sm:inline">Flutter Code</span>
            </button>
          )}

          <button
            onClick={onLogout}
            title="Sign Out of Admin Console"
            className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-black cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <DoorOpen className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-slate-50 p-2 border-b border-slate-200 flex gap-1.5 overflow-x-auto text-xs font-bold no-scrollbar">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF9100] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Dashboard Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('drivers')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'drivers'
              ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF9100] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Drivers ({drivers.length})</span>
          {pendingApprovalDrivers > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'bookings'
              ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF9100] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Bookings ({bookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('control')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'control'
              ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF9100] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>System Settings</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 p-4 sm:p-6 space-y-4">
        {/* ========================================================================= */}
        {/* 1. DASHBOARD OVERVIEW */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg text-slate-900">
                Platform Operations & Metrics Summary
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                Live Data Synchronized
              </span>
            </div>

            {/* KPI Metric Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
                <span className="text-xs text-slate-500 block font-semibold">Total Drivers</span>
                <span className="text-2xl font-black text-slate-900">{totalDrivers}</span>
                <span className="text-[10px] text-emerald-600 font-bold block mt-1">
                  {activeSubscribedDrivers} Active Subscriptions
                </span>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
                <span className="text-xs text-slate-500 block font-semibold">Pending Approval</span>
                <span className="text-2xl font-black text-amber-600">{pendingApprovalDrivers}</span>
                <span className="text-[10px] text-slate-400 block mt-1 font-medium">Requires Admin Verification</span>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
                <span className="text-xs text-slate-500 block font-semibold">Total Customers</span>
                <span className="text-2xl font-black text-slate-900">{totalCustomers}</span>
                <span className="text-[10px] text-blue-600 font-bold block mt-1">Registered Shippers</span>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
                <span className="text-xs text-slate-500 block font-semibold">Active Return Loads</span>
                <span className="text-2xl font-black text-orange-600">{returnLoadActiveDrivers}</span>
                <span className="text-[10px] text-orange-600 font-bold block mt-1">Empty Lorries Available</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-1 shadow-xs">
                <span className="text-xs text-slate-500 font-bold">Total Highway KM Traversed:</span>
                <div className="text-3xl font-black text-blue-600 font-mono">
                  {Math.round(totalKmToday).toLocaleString()} KM
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  All customer freight trips tracked transparently based on actual expressway distances.
                </p>
              </div>

              <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl space-y-1 shadow-xs">
                <span className="text-xs text-amber-900 font-bold">
                  Estimated Monthly Driver Revenue:
                </span>
                <div className="text-3xl font-black text-slate-900 font-mono">
                  RM {estimatedMonthlyRevenue.toLocaleString()} <span className="text-xs font-normal text-slate-500">/ month</span>
                </div>
                <p className="text-[11px] text-amber-800 font-medium">
                  Formula: {activeSubscribedDrivers} Active Drivers × RM {config.subscription.price} (Monthly Platform Fee)
                </p>
              </div>
            </div>

            {/* Quick Safety Summary Alert */}
            {inactiveSafetyDrivers > 0 && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between text-xs text-rose-800">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <div>
                    <span className="font-black text-rose-900">
                      {inactiveSafetyDrivers} Driver(s) currently marked INACTIVE:
                    </span>
                    <p className="text-rose-700 text-[11px] mt-0.5">
                      These drivers are temporarily blocked from job notifications and customer orders.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('drivers');
                    setDriverFilter('INACTIVE');
                  }}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer shrink-0"
                >
                  View Inactive
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. DRIVERS MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'drivers' && (
          <div className="space-y-4">
            {/* Top Controls: Approval Mode Switcher & + Add Driver Button */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Registration Approval Mode:
                  </span>
                  <span
                    className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                      config.approvalMode === 'auto'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    {config.approvalMode === 'auto' ? '⚡ Auto Approval Active' : '🛡️ Manual Approval Active'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  {config.approvalMode === 'auto'
                    ? 'New driver sign-ups are instantly approved upon completion.'
                    : 'New driver sign-ups require manual verification before they can go online.'}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap shrink-0">
                {/* Mode Switcher Buttons */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => handleSetApprovalMode('auto')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      config.approvalMode === 'auto'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ⚡ Auto Approval
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetApprovalMode('manual')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      config.approvalMode !== 'auto'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🛡️ Manual Approval
                  </button>
                </div>

                {/* + Add Driver Direct Registration Button */}
                <button
                  type="button"
                  onClick={() => setIsAddDriverModalOpen(true)}
                  className="px-3.5 py-2 bg-gradient-to-r from-[#FF6B00] to-[#FF9100] hover:from-[#E65100] hover:to-[#FF6B00] text-white rounded-xl text-xs font-black shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Add Driver</span>
                </button>
              </div>
            </div>

            {/* Search & Filter Chips */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={driverSearch}
                  onChange={(e) => setDriverSearch(e.target.value)}
                  placeholder="Search driver name, lorry plate, phone, city, email..."
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#FF6B00] shadow-xs font-medium"
                />
              </div>

              {/* Filter Chips */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                {[
                  { id: 'ALL', label: `All Drivers (${drivers.length})` },
                  { id: 'PENDING_APPROVAL', label: `Pending Approval (${pendingApprovalDrivers})` },
                  { id: 'ACTIVE', label: `Active Subscriptions (${activeSubscribedDrivers})` },
                  { id: 'INACTIVE', label: `Safety Inactive (${inactiveSafetyDrivers})` },
                  { id: 'EXPIRED', label: 'Expired Subscriptions' },
                  { id: 'ONLINE', label: 'Online Now' },
                  { id: 'RETURN_LOAD', label: `Return Load Active (${returnLoadActiveDrivers})` },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setDriverFilter(f.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                      driverFilter === f.id
                        ? 'bg-[#0D47A1] text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Drivers List with Admin Driver Safety Toggle Switch */}
            <div className="space-y-2.5">
              {filteredDrivers.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-xs">
                  No drivers found matching your filter criteria.
                </div>
              ) : (
                filteredDrivers.map((driver) => {
                  const isDriverActive = driver.isActive !== false;

                  return (
                    <div
                      key={driver.uid}
                      onClick={() => setSelectedDriverDetail(driver)}
                      className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Driver Info */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-sm text-slate-900">{driver.name}</span>
                            <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800 border border-slate-200">
                              {driver.lorryNumber}
                            </span>
                            {driver.returnLoad && (
                              <span className="text-[10px] bg-orange-50 text-orange-700 font-bold px-1.5 py-0.5 rounded border border-orange-200 flex items-center gap-0.5">
                                <Flame className="w-3 h-3 fill-orange-500 text-orange-500" />
                                <span>Return Load</span>
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 font-medium">
                            {driver.phone} • {driver.city} • <span className="font-semibold text-slate-700">{driver.fullLorryType}</span>
                          </div>
                        </div>

                        {/* Safety Toggle Switch & Status Badges */}
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-between sm:justify-end">
                          {/* Driver Safety Status ON/OFF Toggle Switch */}
                          <div 
                            className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="text-[10px] uppercase font-bold text-slate-500">
                              Safety:
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleToggleDriverSafety(driver, e)}
                              title={isDriverActive ? 'Click to deactivate & block driver' : 'Click to activate driver'}
                              className={`px-2 py-0.5 rounded-lg text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer ${
                                isDriverActive
                                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs'
                                  : 'bg-rose-500 hover:bg-rose-600 text-white shadow-xs'
                              }`}
                            >
                              {isDriverActive ? (
                                <>
                                  <ToggleRight className="w-4 h-4" />
                                  <span>ACTIVE</span>
                                </>
                              ) : (
                                <>
                                  <ToggleLeft className="w-4 h-4" />
                                  <span>INACTIVE</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Approval Status Badge */}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              driver.isApproved
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {driver.isApproved ? 'Approved' : 'Pending Review'}
                          </span>

                          {/* Online Status Badge */}
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded ${
                              driver.isOnline
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {driver.isOnline ? 'ONLINE' : 'OFFLINE'}
                          </span>
                        </div>
                      </div>

                      {/* Return Load Route info if active */}
                      {driver.returnLoad && (
                        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-2 text-xs text-amber-900 font-medium">
                          Return Load Route: <strong className="font-bold">{driver.returnLoadFrom} ➔ {driver.returnLoadTo}</strong>
                        </div>
                      )}

                      {/* Inactive Safety Warning Callout */}
                      {!isDriverActive && (
                        <div className="bg-rose-50 border border-rose-200 rounded-xl px-2.5 py-1 text-[11px] text-rose-700 flex items-center gap-1.5 font-medium">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>Blocked from receiving job alerts or accepting customer bookings.</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. BOOKINGS MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  placeholder="Search booking ID, customer name, route, goods..."
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0D47A1] shadow-xs font-medium"
                />
              </div>

              <select
                value={bookingStatusFilter}
                onChange={(e) => setBookingStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 shadow-xs font-bold"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Driver</option>
                <option value="PENDING_RETURN_LOAD">Return Load Offer</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="ON_THE_WAY">On The Way</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="space-y-2.5">
              {filteredBookings.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-xs font-medium">
                  No bookings match your current filter.
                </div>
              ) : (
                filteredBookings.map((b) => (
                  <div
                    key={b.bookingId}
                    onClick={() => setSelectedBookingDetail(b)}
                    className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-blue-600">
                        #{b.bookingId}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        📏 {b.distanceText}
                      </span>
                    </div>

                    <div className="font-extrabold text-sm text-slate-900">
                      {b.fromCity} ➔ {b.toCity}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 font-medium">
                      <span>Customer: <strong className="text-slate-800">{b.customerName}</strong></span>
                      <span>
                        Status:{' '}
                        <span className="font-bold text-emerald-700">
                          {b.status}
                        </span>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. SYSTEM SETTINGS & CONTROL */}
        {/* ========================================================================= */}
        {activeTab === 'control' && (
          <div className="space-y-5">
            <h3 className="font-black text-lg text-slate-900">System Configuration & Settings</h3>

            {/* Approval Mode Switcher inside Control tab */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-[#FF6B00]" />
                    <span>Driver Registration Approval Mode</span>
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Choose whether newly signed-up drivers require administrator manual review or receive instant auto-approval.
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => handleSetApprovalMode('auto')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      config.approvalMode === 'auto'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ⚡ Auto Approval
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetApprovalMode('manual')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      config.approvalMode !== 'auto'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🛡️ Manual Approval
                  </button>
                </div>
              </div>
            </div>

            {/* Subscription Settings */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-xs">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-amber-600" />
                <span>Driver Subscription Pricing</span>
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monthly Fee (RM / Month):
                  </label>
                  <input
                    type="number"
                    value={config.subscription.price}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        subscription: { ...config.subscription, price: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Validity Duration (Days):
                  </label>
                  <input
                    type="number"
                    value={config.subscription.days}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        subscription: { ...config.subscription, days: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Referral Control */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Driver Referral Program</span>
                </h4>
                <button
                  type="button"
                  onClick={() =>
                    setConfig({
                      ...config,
                      referral: {
                        ...config.referral,
                        isReferralActive: !config.referral.isReferralActive,
                      },
                    })
                  }
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    config.referral.isReferralActive
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {config.referral.isReferralActive ? 'ACTIVE' : 'INACTIVE'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Required Referrals (Drivers):
                  </label>
                  <input
                    type="number"
                    value={config.referral.requiredCount}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        referral: { ...config.referral, requiredCount: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Free Days Rewarded:
                  </label>
                  <input
                    type="number"
                    value={config.referral.freeDays}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        referral: { ...config.referral, freeDays: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Bank Payment Info */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-xs">
              <h4 className="font-bold text-sm text-slate-900">Corporate Bank Account Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Bank Name:</label>
                  <input
                    type="text"
                    value={config.paymentConfig.bankName}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        paymentConfig: { ...config.paymentConfig, bankName: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Account Number:</label>
                  <input
                    type="text"
                    value={config.paymentConfig.accountNumber}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        paymentConfig: { ...config.paymentConfig, accountNumber: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* ADVERTISEMENT BOX MANAGER (Top & Bottom Banners) */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-5 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                    <Megaphone className="w-4 h-4 text-amber-600" />
                    <span>Advertisement Manager (Top & Bottom Banners)</span>
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Configure promotional announcements displayed at the top and bottom of the app.
                  </p>
                </div>
              </div>

              {/* SECTION A: TOP ADVERTISEMENT BOX */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      📢 Top Advertisement Banner
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateTopAd({ enabled: !topAd.enabled })}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      topAd.enabled
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {topAd.enabled ? 'ACTIVE (DISPLAYED)' : 'DISABLED'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Badge / Tag:</label>
                    <input
                      type="text"
                      placeholder="e.g.: PROMO, 50% OFF, SPECIAL"
                      value={topAd.badge || ''}
                      onChange={(e) => updateTopAd({ badge: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Color Theme:</label>
                    <select
                      value={topAd.bgTheme || 'amber'}
                      onChange={(e) => updateTopAd({ bgTheme: e.target.value as any })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                    >
                      <option value="amber">Amber / Warm Orange</option>
                      <option value="emerald">Emerald / Fresh Green</option>
                      <option value="blue">Blue / Corporate Royal</option>
                      <option value="purple">Purple / Modern Violet</option>
                      <option value="slate">Slate / Elegant Dark</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">
                      Headline Text: *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 🔥 Direct Lorry Hire Promo JB to KL starting from RM380!"
                      value={topAd.text}
                      onChange={(e) => updateTopAd({ text: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Subtext:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g.: Fully insured & licensed operators"
                      value={topAd.subtext || ''}
                      onChange={(e) => updateTopAd({ subtext: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Web / WhatsApp Link URL:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. https://wa.me/60123456789"
                      value={topAd.linkUrl || ''}
                      onChange={(e) => updateTopAd({ linkUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                    />
                  </div>
                </div>

                {/* Live Preview */}
                <div className="pt-2">
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">
                    Live Top Banner Preview:
                  </div>
                  <div className="rounded-xl overflow-hidden border border-slate-200">
                    <AdvertisementBanner ad={topAd} position="top" />
                  </div>
                </div>
              </div>

              {/* SECTION B: BOTTOM ADVERTISEMENT BOX */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      📢 Bottom Advertisement Banner
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateBottomAd({ enabled: !bottomAd.enabled })}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      bottomAd.enabled
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {bottomAd.enabled ? 'ACTIVE (DISPLAYED)' : 'DISABLED'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Badge / Tag:</label>
                    <input
                      type="text"
                      placeholder="e.g.: FREE ADS, LOGISTICS, INFO"
                      value={bottomAd.badge || ''}
                      onChange={(e) => updateBottomAd({ badge: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Color Theme:</label>
                    <select
                      value={bottomAd.bgTheme || 'blue'}
                      onChange={(e) => updateBottomAd({ bgTheme: e.target.value as any })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                    >
                      <option value="blue">Blue / Corporate Royal</option>
                      <option value="emerald">Emerald / Fresh Green</option>
                      <option value="amber">Amber / Warm Orange</option>
                      <option value="purple">Purple / Modern Violet</option>
                      <option value="slate">Slate / Elegant Dark</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">
                      Headline Text: *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 🚛 Empty Return Loads available! Register your lorry to receive bookings."
                      value={bottomAd.text}
                      onChange={(e) => updateBottomAd({ text: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Subtext:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g.: 100% platform commission free"
                      value={bottomAd.subtext || ''}
                      onChange={(e) => updateBottomAd({ subtext: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Web / WhatsApp Link URL:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. https://wa.me/60123456789"
                      value={bottomAd.linkUrl || ''}
                      onChange={(e) => updateBottomAd({ linkUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                    />
                  </div>
                </div>

                {/* Live Preview */}
                <div className="pt-2">
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">
                    Live Bottom Banner Preview:
                  </div>
                  <div className="rounded-xl overflow-hidden border border-slate-200">
                    <AdvertisementBanner ad={bottomAd} position="bottom" />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveConfig}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              <span>Save System Settings & Advertisements</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. DIRECT ADD DRIVER MODAL (+ Add Driver Button) */}
      {/* ========================================================================= */}
      {isAddDriverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Direct Driver Registration</h3>
                  <p className="text-xs text-slate-500 font-medium">Add and onboard a new driver profile instantly</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddDriverModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDirectAddDriver} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-800 font-black mb-1">
                  Driver Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh a/l Mohan / Ahmad Faizal"
                  value={newDriverForm.name}
                  onChange={(e) => setNewDriverForm({ ...newDriverForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:bg-white focus:border-[#FF6B00]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 font-black mb-1">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0123456789"
                    value={newDriverForm.phone}
                    onChange={(e) => setNewDriverForm({ ...newDriverForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-semibold text-slate-900 focus:bg-white focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-black mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. driver@deliverymy.com"
                    value={newDriverForm.email}
                    onChange={(e) => setNewDriverForm({ ...newDriverForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:bg-white focus:border-[#FF6B00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 font-black mb-1">
                    Lorry Plate Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WXY 1234 / BKL 8821"
                    value={newDriverForm.lorryNumber}
                    onChange={(e) => setNewDriverForm({ ...newDriverForm, lorryNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-black mb-1">
                    Lorry Tonnage Capacity *
                  </label>
                  <select
                    value={newDriverForm.lorryTonnage}
                    onChange={(e) => setNewDriverForm({ ...newDriverForm, lorryTonnage: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:border-[#FF6B00]"
                  >
                    {TONNAGE_OPTIONS.map((ton) => (
                      <option key={ton} value={ton}>{ton}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-800 font-black mb-1">
                  Lorry Body Type (Includes Towing, Crane, Tipper, Tanker, Container) *
                </label>
                <select
                  value={newDriverForm.lorryBodyType}
                  onChange={(e) => setNewDriverForm({ ...newDriverForm, lorryBodyType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:border-[#FF6B00]"
                >
                  {BODY_TYPE_OPTIONS.map((bt) => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 font-black mb-1">
                    Base Operating City *
                  </label>
                  <select
                    value={newDriverForm.city}
                    onChange={(e) => setNewDriverForm({ ...newDriverForm, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:border-[#FF6B00]"
                  >
                    {MALAYSIAN_CITIES.map((c) => (
                      <option key={c.city} value={c.city}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-800 font-black mb-1">
                    Area / District Hub
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kempas / Shah Alam / Bayan Lepas"
                    value={newDriverForm.area}
                    onChange={(e) => setNewDriverForm({ ...newDriverForm, area: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:bg-white focus:border-[#FF6B00]"
                  />
                </div>
              </div>

              {/* Status checkboxes */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={newDriverForm.isApproved}
                    onChange={(e) => setNewDriverForm({ ...newDriverForm, isApproved: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Mark Account as Immediately Approved</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={newDriverForm.isActive}
                    onChange={(e) => setNewDriverForm({ ...newDriverForm, isActive: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Driver Safety Status: ACTIVE (Receives job notifications)</span>
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddDriverModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#FF6B00] to-[#FF9100] hover:from-[#E65100] hover:to-[#FF6B00] text-white font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register Driver</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. DRIVER DETAIL & ACTION MODAL */}
      {/* ========================================================================= */}
      {selectedDriverDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-700">
                  {selectedDriverDetail.lorryNumber}
                </span>
                <h3 className="text-base font-extrabold text-slate-900">{selectedDriverDetail.name}</h3>
              </div>
              <button
                onClick={() => setSelectedDriverDetail(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Safety Status Switch in Modal */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="font-black text-slate-900 block">Driver Safety Status</span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {selectedDriverDetail.isActive !== false
                    ? 'Active: Allowed to receive job notifications & take bookings'
                    : 'Inactive: Blocked from receiving orders'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleToggleDriverSafety(selectedDriverDetail)}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedDriverDetail.isActive !== false
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : 'bg-rose-500 hover:bg-rose-600 text-white'
                }`}
              >
                {selectedDriverDetail.isActive !== false ? (
                  <>
                    <ToggleRight className="w-4 h-4" />
                    <span>ACTIVE</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-4 h-4" />
                    <span>INACTIVE</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Phone / WhatsApp:</span>
                <strong className="text-slate-900 font-mono">{selectedDriverDetail.phone}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Email:</span>
                <span className="text-slate-800 font-medium">{selectedDriverDetail.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Lorry Type:</span>
                <strong className="text-slate-900">{selectedDriverDetail.fullLorryType}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Operating City Hub:</span>
                <span className="text-slate-800 font-medium">{selectedDriverDetail.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Referral Code:</span>
                <strong className="text-emerald-700 font-mono">{selectedDriverDetail.myReferralCode}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Subscription Expiry:</span>
                <span className="text-slate-800 font-medium">
                  {selectedDriverDetail.subscriptionExpiry
                    ? new Date(selectedDriverDetail.subscriptionExpiry).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
            </div>

            {/* Direct Contact Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={StorageService.generateWhatsAppLink(
                  selectedDriverDetail.phone,
                  `Hi ${selectedDriverDetail.name}! This is DeliveryMY Admin reaching out regarding your account.`
                )}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Driver</span>
              </a>

              <a
                href={`tel:${selectedDriverDetail.phone}`}
                className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Phone</span>
              </a>
            </div>

            {/* Admin Management Action Buttons */}
            <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                {!selectedDriverDetail.isApproved ? (
                  <button
                    onClick={() => handleApproveDriver(selectedDriverDetail, true)}
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve Account</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleApproveDriver(selectedDriverDetail, false)}
                    className="py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Revoke Approval</span>
                  </button>
                )}

                <button
                  onClick={() => handleActivate30Days(selectedDriverDetail)}
                  className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>+30 Free Days</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleBlockDriver(selectedDriverDetail, !selectedDriverDetail.isBlocked)}
                  className={`py-2.5 rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer ${
                    selectedDriverDetail.isBlocked
                      ? 'bg-slate-700 text-white hover:bg-slate-600'
                      : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>{selectedDriverDetail.isBlocked ? 'Unsuspend' : 'Suspend Account'}</span>
                </button>

                <button
                  onClick={() => handleResetPassword(selectedDriverDetail)}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset Pwd (123456)</span>
                </button>
              </div>

              {selectedDriverDetail.returnLoad && (
                <button
                  onClick={() => handleForceOffReturnLoad(selectedDriverDetail)}
                  className="w-full py-2 bg-orange-50 border border-orange-200 text-orange-800 rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>Deactivate Return Load for this Driver</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. BOOKING DETAIL MODAL FOR ADMIN */}
      {/* ========================================================================= */}
      {selectedBookingDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600">
                  #{selectedBookingDetail.bookingId}
                </span>
                <h3 className="text-base font-extrabold text-slate-900">Customer Booking Details</h3>
              </div>
              <button
                onClick={() => setSelectedBookingDetail(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Route:</span>
                <strong className="text-slate-900">{selectedBookingDetail.fromCity} ➔ {selectedBookingDetail.toCity}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Calculated Highway Distance:</span>
                <strong className="text-blue-600 font-bold">{selectedBookingDetail.distanceText}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Required Vehicle:</span>
                <span className="text-slate-800 font-medium">{selectedBookingDetail.fullLorryType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Customer:</span>
                <span className="text-slate-800 font-medium">{selectedBookingDetail.customerName} ({selectedBookingDetail.customerPhone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Assigned Driver:</span>
                <span className="text-slate-800 font-medium">{selectedBookingDetail.driverName || 'Unassigned / Pending'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Status:</span>
                <span className="font-bold text-emerald-700">{selectedBookingDetail.status}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href={`tel:${selectedBookingDetail.customerPhone}`}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Customer</span>
              </a>
              {selectedBookingDetail.driverPhone && (
                <a
                  href={`tel:${selectedBookingDetail.driverPhone}`}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Driver</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
