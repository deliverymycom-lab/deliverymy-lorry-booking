import { AppConfig, Booking, CustomerProfile, DriverProfile, UserRole } from '../types';
import { MALAYSIAN_CITIES, TONNAGE_OPTIONS, BODY_TYPE_OPTIONS } from './malaysiaLocations';
import { db, OperationType, handleFirestoreError, testFirestoreConnection } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import {
  queryMatchingActiveDrivers,
  sendFcmBroadcastToDrivers,
  BroadcastNotificationResult,
} from './fcmBroadcastService';

const DEFAULT_APP_CONFIG: AppConfig = {
  subscription: {
    price: 25,
    days: 30,
  },
  referral: {
    isReferralActive: true,
    requiredCount: 3,
    freeDays: 30,
  },
  returnLoad: {
    isEnabled: true,
  },
  approvalMode: 'manual',
  lorryConfig: {
    tonnages: TONNAGE_OPTIONS,
    bodyTypes: BODY_TYPE_OPTIONS,
  },
  advertisement: {
    topAd: {
      enabled: true,
      text: '🔥 PROMOSI LORI BALIK (RETURN LOAD): Jimat Sehingga 50%!',
      subtext: 'Lori kosong dari JB, KL, Penang & Kuantan sedia ambil kargo anda.',
      badge: 'JIMAT 50%',
      linkUrl: 'https://wa.me/60123456789?text=Hi%20Admin%20DeliveryMY,%20saya%20berminat%20tempah%20lori%20promosi',
      bgTheme: 'amber',
    },
    bottomAd: {
      enabled: true,
      text: '📢 PASANG IKLAN PERCUMA: Ingin Iklankan Servis Lori & Logistik Anda?',
      subtext: 'Hubungi pengurusan DeliveryMY untuk penempatan iklan khas.',
      badge: 'IKLAN RASMI',
      linkUrl: 'https://wa.me/60123456789?text=Hi%20Admin%20DeliveryMY,%20saya%20nak%20iklan%20servis%20lori',
      bgTheme: 'blue',
    },
  },
  whatsapp: {
    bookingConfirm: {
      ms: 'Hi {customerName}! Saya {driverName} pemandu lori {lorryNumber} ({fullLorryType}). Saya telah terima tempahan anda Dari: {fromCity} Ke: {toCity} 📏 {distanceText}. Barang: {goodsType}. Boleh kita bincang harga?',
      en: 'Hi {customerName}! I am {driverName} lorry driver {lorryNumber} ({fullLorryType}). I have accepted your booking From: {fromCity} To: {toCity} 📏 {distanceText}. Goods: {goodsType}. Can we discuss the price?',
      zh: '您好 {customerName}！我是罗里司机 {driverName}，车牌 {lorryNumber} ({fullLorryType})。已接下您从 {fromCity} 到 {toCity} 📏 {distanceText} 的运输需求。货物：{goodsType}。我们可以商议价格吗？',
    },
    onTheWay: {
      ms: 'Hi {customerName}! Saya dalam perjalanan ke lokasi anda (📏 {distanceText}). Saya akan kongsikan live location di WhatsApp ini sebentar lagi.',
      en: 'Hi {customerName}! I am on the way to your location (📏 {distanceText}). I will share my live location in this WhatsApp shortly.',
      zh: '您好 {customerName}！我正在前往装货地点 (📏 {distanceText})。稍后我将在此WhatsApp中分享实时位置。',
    },
    completed: {
      ms: 'Hi {customerName}! Barang telah selamat dihantar. Terima kasih kerana menggunakan perkhidmatan DeliveryMY!',
      en: 'Hi {customerName}! Goods have been safely delivered. Thank you for using DeliveryMY!',
      zh: '您好 {customerName}！货物已安全送达目的地。感谢您使用 DeliveryMY！',
    },
    returnLoad: {
      ms: 'Hi! Lori saya kosong balik dari {fromCity} ke {toCity} (📏 {distanceText}). Harga boleh runding murah!',
      en: 'Hi! My lorry is returning empty from {fromCity} to {toCity} (📏 {distanceText}). Price is negotiable cheap!',
      zh: '您好！我的罗里正从 {fromCity} 空车回程至 {toCity} (📏 {distanceText})。价格优惠可谈！',
    },
  },
  paymentConfig: {
    bankName: 'Maybank Islamic Berhad',
    accountNumber: '5641 2890 1234',
    accountHolder: 'DELIVERYMY LOGISTICS TECH SDN BHD',
    supportWhatsApp: '60123456789',
  },
};

// Realistic Malaysian seed drivers
export const SEED_DRIVERS: DriverProfile[] = [
  {
    uid: 'drv-kumar-01',
    name: 'Kumar a/l Selvam',
    email: 'kumar@lorrymy.com',
    phone: '0167891234',
    lorryNumber: 'WXY 1234',
    lorryTonnage: '3 Tan',
    lorryBodyType: 'Closed Box 📦 / Kotak Tertutup / 封闭式',
    fullLorryType: '3 Tan - Closed Box',
    hasTailgate: true,
    city: 'Johor Bahru',
    area: 'Kempas / Larkin',
    myReferralCode: 'KUM88',
    referredBy: 'ALI99',
    referralCount: 2,
    isSubscribed: true,
    subscriptionExpiry: new Date(Date.now() + 25 * 86400000).toISOString(),
    isApproved: true,
    isBlocked: false,
    isActive: true,
    isAvailable: true,
    isOnline: true,
    lastOnlineAt: new Date().toISOString(),
    currentLat: 1.4655,
    currentLng: 103.7578,
    returnLoad: true,
    returnLoadFrom: 'Johor Bahru',
    returnLoadTo: 'Kuala Lumpur',
    returnLoadFromOriginal: 'Johor Bahru (JB)',
    returnLoadToOriginal: 'Kuala Lumpur (KL)',
    returnLoadDate: new Date().toISOString().split('T')[0],
    returnLoadNote: 'Lori 3 Tan kotak balik kosong ke KL petang ini. Boleh muat perabot & barang kilang murah!',
    returnLoadEnabledAt: new Date().toISOString(),
    whatsappNotifyEnabled: true,
    password: 'password123',
    createdAt: '2026-01-15T08:00:00.000Z',
    completedJobsCount: 42,
    totalKmCovered: 5820,
  },
  {
    uid: 'drv-ali-02',
    name: 'Mohd Ali bin Razak',
    email: 'ali@lorrymy.com',
    phone: '0129876543',
    lorryNumber: 'BKL 8821',
    lorryTonnage: '5 Tan',
    lorryBodyType: 'Open Lorry 🚛 / Lori Kargo Terbuka / 开放式',
    fullLorryType: '5 Tan - Open Lorry',
    hasTailgate: false,
    city: 'Kuala Lumpur',
    area: 'Kepong / Batu Caves',
    myReferralCode: 'ALI99',
    referredBy: '',
    referralCount: 5,
    isSubscribed: true,
    subscriptionExpiry: new Date(Date.now() + 45 * 86400000).toISOString(),
    isApproved: true,
    isBlocked: false,
    isActive: true,
    isAvailable: true,
    isOnline: true,
    lastOnlineAt: new Date().toISOString(),
    currentLat: 3.1390,
    currentLng: 101.6869,
    returnLoad: true,
    returnLoadFrom: 'Kuala Lumpur',
    returnLoadTo: 'Penang',
    returnLoadFromOriginal: 'Kuala Lumpur (KL)',
    returnLoadToOriginal: 'Penang (Pulau Pinang)',
    returnLoadDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    returnLoadNote: 'Lori 5 Tan kargo terbuka balik ke Penang esok pagi. Boleh muat besi/kayu/pallet.',
    returnLoadEnabledAt: new Date().toISOString(),
    whatsappNotifyEnabled: true,
    password: 'password123',
    createdAt: '2026-01-10T10:00:00.000Z',
    completedJobsCount: 88,
    totalKmCovered: 12400,
  },
  {
    uid: 'drv-ahkow-03',
    name: 'Tan Ah Kow',
    email: 'ahkow@lorrymy.com',
    phone: '0176543210',
    lorryNumber: 'PNG 3399',
    lorryTonnage: '1 Tan',
    lorryBodyType: 'Closed Box 📦 / Kotak Tertutup / 封闭式',
    fullLorryType: '1 Tan - Closed Box',
    hasTailgate: true,
    city: 'Penang',
    area: 'Bayan Lepas / George Town',
    myReferralCode: 'KOW77',
    referredBy: '',
    referralCount: 1,
    isSubscribed: true,
    subscriptionExpiry: new Date(Date.now() + 10 * 86400000).toISOString(),
    isApproved: true,
    isBlocked: false,
    isActive: true,
    isAvailable: true,
    isOnline: true,
    lastOnlineAt: new Date().toISOString(),
    currentLat: 5.4141,
    currentLng: 100.3288,
    returnLoad: false,
    whatsappNotifyEnabled: true,
    password: 'password123',
    createdAt: '2026-02-01T12:00:00.000Z',
    completedJobsCount: 29,
    totalKmCovered: 3100,
  },
  {
    uid: 'drv-chong-04',
    name: 'Chong Wei Lun',
    email: 'chong@lorrymy.com',
    phone: '0182233445',
    lorryNumber: 'VAB 9012',
    lorryTonnage: '3 Tan',
    lorryBodyType: 'Curtain Sider 🚚 / Tirai Sisi (Lori Kanvas) / 帆布侧帘',
    fullLorryType: '3 Tan - Curtain Sider',
    hasTailgate: false,
    city: 'Shah Alam',
    area: 'Section 15 / Bukit Jelutong',
    myReferralCode: 'CHO33',
    referredBy: '',
    referralCount: 0,
    isSubscribed: false,
    subscriptionExpiry: null,
    isApproved: false,
    isBlocked: false,
    isActive: true,
    isAvailable: false,
    isOnline: false,
    currentLat: 3.0738,
    currentLng: 101.5183,
    returnLoad: false,
    whatsappNotifyEnabled: true,
    password: 'password123',
    createdAt: '2026-03-01T09:00:00.000Z',
    completedJobsCount: 0,
    totalKmCovered: 0,
  },
  {
    uid: 'drv-muthu-05',
    name: 'Muthusamy a/l Vengadasalam',
    email: 'muthu@lorrymy.com',
    phone: '0193344556',
    lorryNumber: 'JQR 4567',
    lorryTonnage: '10 Tan',
    lorryBodyType: 'Open Lorry 🚛 / Lori Kargo Terbuka / 开放式',
    fullLorryType: '10 Tan - Open Lorry',
    hasTailgate: false,
    city: 'Kuantan',
    area: 'Gebeng / Semambu',
    myReferralCode: 'MUT55',
    referredBy: '',
    referralCount: 4,
    isSubscribed: true,
    subscriptionExpiry: new Date(Date.now() + 60 * 86400000).toISOString(),
    isApproved: true,
    isBlocked: false,
    isActive: true,
    isAvailable: true,
    isOnline: true,
    lastOnlineAt: new Date().toISOString(),
    currentLat: 3.8077,
    currentLng: 103.3260,
    returnLoad: true,
    returnLoadFrom: 'Kuantan',
    returnLoadTo: 'Kuala Lumpur',
    returnLoadFromOriginal: 'Kuantan (Kuantan)',
    returnLoadToOriginal: 'Kuala Lumpur (KL)',
    returnLoadDate: new Date().toISOString().split('T')[0],
    returnLoadNote: 'Lori 10 Tan bersedia bawa muatan pukal/bahan mentah ke Lembah Klang harga berpatutan.',
    returnLoadEnabledAt: new Date().toISOString(),
    whatsappNotifyEnabled: true,
    password: 'password123',
    createdAt: '2026-01-20T11:00:00.000Z',
    completedJobsCount: 65,
    totalKmCovered: 18200,
  },
  {
    uid: 'drv-hassan-06',
    name: 'Hassan bin Mahmud',
    email: 'hassan@lorrymy.com',
    phone: '0134455667',
    lorryNumber: 'WC 7788',
    lorryTonnage: '3 Tan',
    lorryBodyType: 'Closed Box 📦 / Kotak Tertutup / 封闭式',
    fullLorryType: '3 Tan - Closed Box',
    hasTailgate: false,
    city: 'Kuala Lumpur',
    area: 'Cheras / Ampang',
    myReferralCode: 'HAS12',
    referredBy: 'ALI99',
    referralCount: 0,
    isSubscribed: true,
    subscriptionExpiry: new Date(Date.now() + 20 * 86400000).toISOString(),
    isApproved: true,
    isBlocked: false,
    isActive: true,
    isAvailable: true,
    isOnline: true,
    lastOnlineAt: new Date().toISOString(),
    currentLat: 3.1200,
    currentLng: 101.7100,
    returnLoad: false,
    whatsappNotifyEnabled: true,
    password: 'password123',
    createdAt: '2026-02-10T14:00:00.000Z',
    completedJobsCount: 15,
    totalKmCovered: 1980,
  }
];

export const SEED_CUSTOMERS: CustomerProfile[] = [
  {
    uid: 'cust-sarah-01',
    name: 'Sarah Lee',
    email: 'sarah@puchongtrade.com',
    phone: '0123344556',
    preferredLanguage: 'en',
    createdAt: '2026-02-15T10:00:00.000Z',
  },
  {
    uid: 'cust-hasan-02',
    name: 'Hasan Basri Enterprise',
    email: 'hasan@basrient.my',
    phone: '0198877665',
    preferredLanguage: 'ms',
    createdAt: '2026-02-20T14:30:00.000Z',
  },
];

export const SEED_BOOKINGS: Booking[] = [
  {
    bookingId: 'BK-1088',
    customerId: 'cust-sarah-01',
    customerName: 'Sarah Lee',
    customerPhone: '0123344556',
    fromAddress: 'Taman Mount Austin, Johor Bahru',
    toAddress: 'Bukit Bintang, Kuala Lumpur',
    fromCity: 'Johor Bahru',
    toCity: 'Kuala Lumpur',
    fromLat: 1.4655,
    fromLng: 103.7578,
    toLat: 3.1390,
    toLng: 101.6869,
    distanceKM: 330.0,
    distanceText: '330 KM',
    estimatedTime: '6 jam 36 min',
    lorryTonnage: '3 Tan',
    lorryBodyType: 'Closed Box 📦 / Kotak Tertutup / 封闭式',
    fullLorryType: '3 Tan - Closed Box',
    goodsType: 'Kotak Pindahan & Perabot Pejabat',
    dateTime: 'Hari Ini, 2:00 PM',
    note: 'Lori kosong balik harga boleh runding murah!',
    status: 'COMPLETED',
    isReturnLoadOffer: true,
    returnLoadDriverId: 'drv-kumar-01',
    price: null,
    driverId: 'drv-kumar-01',
    driverName: 'Kumar a/l Selvam',
    driverPhone: '0167891234',
    lorryNumber: 'WXY 1234',
    createdAt: '2026-03-01T08:30:00.000Z',
    completedAt: '2026-03-01T16:00:00.000Z',
  },
  {
    bookingId: 'BK-1095',
    customerId: 'cust-hasan-02',
    customerName: 'Hasan Basri Enterprise',
    customerPhone: '0198877665',
    fromAddress: 'Port Klang Free Zone, Klang',
    toAddress: 'Bayan Lepas FTZ, Penang',
    fromCity: 'Shah Alam',
    toCity: 'Penang',
    fromLat: 3.0738,
    fromLng: 101.5183,
    toLat: 5.4141,
    toLng: 100.3288,
    distanceKM: 365.0,
    distanceText: '365 KM',
    estimatedTime: '7 jam 18 min',
    lorryTonnage: '5 Tan',
    lorryBodyType: 'Open Lorry 🚛 / Lori Kargo Terbuka / 开放式',
    fullLorryType: '5 Tan - Open Lorry',
    goodsType: 'Pallet Kayu & Besi Struktur',
    dateTime: 'Besok, 9:00 AM',
    note: 'Perlu kain kanvas tutup rapi tahan hujan',
    status: 'PENDING',
    isReturnLoadOffer: false,
    price: null,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    bookingId: 'BK-1065',
    customerId: 'cust-sarah-01',
    customerName: 'Sarah Lee',
    customerPhone: '0123344556',
    fromAddress: 'Pusat Bandar Puchong, Selangor',
    toAddress: 'Taman Pelangi, Johor Bahru',
    fromCity: 'Kuala Lumpur',
    toCity: 'Johor Bahru',
    fromLat: 3.0333,
    fromLng: 101.6167,
    toLat: 1.4854,
    toLng: 103.7618,
    distanceKM: 324.5,
    distanceText: '325 KM',
    estimatedTime: '4 jam 15 min',
    lorryTonnage: '3 Tan',
    lorryBodyType: 'Closed Box 📦 / Kotak Tertutup / 封闭式',
    fullLorryType: '3 Tan - Closed Box',
    hasTailgate: true,
    goodsType: 'Barangan Elektronik & Kotak Pejabat',
    dateTime: 'Kelmarin, 10:00 AM',
    note: 'Selesai dihantar terus ke gudang pelanggan.',
    status: 'COMPLETED',
    isReturnLoadOffer: false,
    price: null,
    driverId: 'drv-kumar-01',
    driverName: 'Kumar a/l Selvam',
    driverPhone: '0167891234',
    lorryNumber: 'WXY 1234',
    createdAt: '2026-03-05T02:00:00.000Z',
    acceptedAt: '2026-03-05T02:10:00.000Z',
    onTheWayAt: '2026-03-05T03:00:00.000Z',
    completedAt: '2026-03-05T08:30:00.000Z',
  },
  {
    bookingId: 'BK-1048',
    customerId: 'cust-hasan-02',
    customerName: 'Hasan Basri Enterprise',
    customerPhone: '0198877665',
    fromAddress: 'Kawasan Perindustrian Balakong, Cheras',
    toAddress: 'Kuantan Port Logistics Park, Pahang',
    fromCity: 'Kuala Lumpur',
    toCity: 'Kuantan',
    fromLat: 3.0319,
    fromLng: 101.7456,
    toLat: 3.8077,
    toLng: 103.3260,
    distanceKM: 245.0,
    distanceText: '245 KM',
    estimatedTime: '3 jam 40 min',
    lorryTonnage: '5 Tan',
    lorryBodyType: 'Open Lorry 🚛 / Lori Kargo Terbuka / 开放式',
    fullLorryType: '5 Tan - Open Lorry',
    goodsType: 'Bahan Binaan Kayu & Besi',
    dateTime: '4 Mac 2026, 8:00 AM',
    note: 'Selesai diturunkan dengan selamat.',
    status: 'COMPLETED',
    isReturnLoadOffer: false,
    price: null,
    driverId: 'drv-ali-02',
    driverName: 'Mohd Ali bin Razak',
    driverPhone: '0129876543',
    lorryNumber: 'BKL 8821',
    createdAt: '2026-03-04T00:30:00.000Z',
    acceptedAt: '2026-03-04T00:45:00.000Z',
    onTheWayAt: '2026-03-04T01:30:00.000Z',
    completedAt: '2026-03-04T06:00:00.000Z',
  }
];

type StorageListener = () => void;
const listeners: Set<StorageListener> = new Set();

function notifyAll() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.warn('Listener error:', e);
    }
  });
}

// In-Memory Live Reactive Caches driven by Firestore
let driversLiveCache: DriverProfile[] = [...SEED_DRIVERS];
let bookingsLiveCache: Booking[] = [...SEED_BOOKINGS];
let customersLiveCache: CustomerProfile[] = [...SEED_CUSTOMERS];
let configLiveCache: AppConfig = { ...DEFAULT_APP_CONFIG };

let isFirestoreInitialized = false;
let driverUnsubscribe: Unsubscribe | null = null;
let bookingUnsubscribe: Unsubscribe | null = null;

// Store last FCM broadcast result for live UI feedback
let lastFcmBroadcastResult: BroadcastNotificationResult | null = null;

/**
 * Core Storage & Real-Time Sync Service using Google Firebase Firestore & FCM
 */
export const StorageService = {
  subscribe(fn: StorageListener) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },

  /**
   * Initializes Firebase Firestore dynamic real-time system:
   * 1. Replaces client-side LocalStorage keys with Firestore references.
   * 2. Binds onSnapshot listeners for drivers and bookings.
   * 3. Seeds initial data into Firestore if collections are newly provisioned.
   */
  async init() {
    if (typeof window === 'undefined' || isFirestoreInitialized) return;
    isFirestoreInitialized = true;

    // Purge deprecated LocalStorage keys as requested
    try {
      localStorage.removeItem('deliverymy_drivers');
      localStorage.removeItem('deliverymy_bookings');
    } catch {
      // Ignore in non-browser context
    }

    // Test Firestore connection
    testFirestoreConnection().catch((err) => console.warn('Test connection notice:', err));

    // 1. Setup Real-Time Listener for Firestore 'drivers' collection
    try {
      const driversCol = collection(db, 'drivers');
      driverUnsubscribe = onSnapshot(
        driversCol,
        async (snapshot) => {
          if (snapshot.empty) {
            // Seed initial drivers into Firestore
            console.log('[Firestore] Seeding drivers into Firestore collection...');
            for (const d of SEED_DRIVERS) {
              try {
                await setDoc(doc(db, 'drivers', d.uid), d);
              } catch (e) {
                console.warn('Driver seed warning:', e);
              }
            }
          } else {
            const list: DriverProfile[] = [];
            snapshot.forEach((snapDoc) => {
              const data = snapDoc.data() as DriverProfile;
              list.push({
                ...data,
                isActive: data.isActive !== undefined ? data.isActive : true,
              });
            });
            driversLiveCache = list;
            notifyAll();
          }
        },
        (error) => {
          console.error('[Firestore] Drivers onSnapshot error:', error);
          handleFirestoreError(error, OperationType.GET, 'drivers');
        }
      );
    } catch (err) {
      console.error('[Firestore] Failed setting up drivers listener:', err);
    }

    // 2. Setup Real-Time Listener for Firestore 'bookings' collection
    try {
      const bookingsCol = collection(db, 'bookings');
      bookingUnsubscribe = onSnapshot(
        bookingsCol,
        async (snapshot) => {
          if (snapshot.empty) {
            // Seed initial bookings into Firestore
            console.log('[Firestore] Seeding bookings into Firestore collection...');
            for (const b of SEED_BOOKINGS) {
              try {
                await setDoc(doc(db, 'bookings', b.bookingId), b);
              } catch (e) {
                console.warn('Booking seed warning:', e);
              }
            }
          } else {
            const list: Booking[] = [];
            snapshot.forEach((snapDoc) => {
              const data = snapDoc.data() as Booking;
              list.push(data);
            });
            // Sort by createdAt descending
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            bookingsLiveCache = list;
            notifyAll();
          }
        },
        (error) => {
          console.error('[Firestore] Bookings onSnapshot error:', error);
          handleFirestoreError(error, OperationType.GET, 'bookings');
        }
      );
    } catch (err) {
      console.error('[Firestore] Failed setting up bookings listener:', err);
    }
  },

  // -------------------------------------------------------------
  // Config Management
  // -------------------------------------------------------------
  getConfig(): AppConfig {
    try {
      const str = localStorage.getItem('deliverymy_config');
      if (!str) return configLiveCache;
      const parsed = JSON.parse(str);
      if (!parsed.advertisement) {
        parsed.advertisement = DEFAULT_APP_CONFIG.advertisement;
      }
      return parsed;
    } catch {
      return configLiveCache;
    }
  },

  saveConfig(config: AppConfig) {
    configLiveCache = config;
    localStorage.setItem('deliverymy_config', JSON.stringify(config));
    // Persist to Firestore config collection asynchronously
    setDoc(doc(db, 'config', 'global'), {
      ...config,
      updatedAt: new Date().toISOString(),
    }).catch((e) => console.warn('Config firestore save notice:', e));
    notifyAll();
  },

  // -------------------------------------------------------------
  // Session Management
  // -------------------------------------------------------------
  getSession(): {
    isLoggedIn: boolean;
    role: UserRole | null;
    user: CustomerProfile | DriverProfile | { email: string; name: string } | null;
  } {
    try {
      const logged = localStorage.getItem('deliverymy_isLoggedIn') === 'true';
      const role = (localStorage.getItem('deliverymy_role') as UserRole) || null;
      const userStr = localStorage.getItem('deliverymy_user');
      const user = userStr ? JSON.parse(userStr) : null;
      return { isLoggedIn: logged, role, user };
    } catch {
      return { isLoggedIn: false, role: null, user: null };
    }
  },

  setSession(
    role: UserRole,
    user: CustomerProfile | DriverProfile | { email: string; name: string } | null
  ) {
    localStorage.setItem('deliverymy_isLoggedIn', 'true');
    localStorage.setItem('deliverymy_role', role);
    if (user) {
      localStorage.setItem('deliverymy_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('deliverymy_user');
    }
    notifyAll();
  },

  clearSession() {
    localStorage.removeItem('deliverymy_isLoggedIn');
    localStorage.removeItem('deliverymy_role');
    localStorage.removeItem('deliverymy_user');
    notifyAll();
  },

  // -------------------------------------------------------------
  // Drivers (Firebase Firestore Reference)
  // -------------------------------------------------------------
  getDrivers(): DriverProfile[] {
    return driversLiveCache.map((d) => ({
      ...d,
      isActive: d.isActive !== undefined ? d.isActive : true,
    }));
  },

  getDriverById(uid: string): DriverProfile | null {
    return driversLiveCache.find((d) => d.uid === uid) || null;
  },

  saveDriver(driver: DriverProfile) {
    // 1. Update live cache immediately for zero latency
    const idx = driversLiveCache.findIndex((d) => d.uid === driver.uid);
    if (idx >= 0) {
      driversLiveCache[idx] = driver;
    } else {
      driversLiveCache.push(driver);
    }

    // 2. Synchronize active session user
    const session = this.getSession();
    if (session.role === 'driver' && (session.user as DriverProfile)?.uid === driver.uid) {
      localStorage.setItem('deliverymy_user', JSON.stringify(driver));
    }

    // 3. Write directly to Firestore document reference /drivers/{driverId}
    setDoc(doc(db, 'drivers', driver.uid), driver, { merge: true }).catch((err) => {
      console.error('[Firestore] Error saving driver:', err);
      handleFirestoreError(err, OperationType.WRITE, `drivers/${driver.uid}`);
    });

    notifyAll();
  },

  registerDriver(data: Partial<DriverProfile>): DriverProfile {
    const config = this.getConfig();

    // Generate myReferralCode: 3 uppercase letters + 2 digits (e.g. ALI88)
    const letters = (data.name?.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'MYR').padEnd(3, 'X');
    const randomDigits = Math.floor(10 + Math.random() * 90).toString();
    const myReferralCode = `${letters}${randomDigits}`;

    const isAutoApproved = config.approvalMode === 'auto';

    const newDriver: DriverProfile = {
      uid: `drv-${Date.now()}`,
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      lorryNumber: (data.lorryNumber || '').toUpperCase().trim(),
      lorryTonnage: data.lorryTonnage || '3 Tan',
      lorryBodyType: data.lorryBodyType || 'Closed Box 📦 / Kotak Tertutup / 封闭式',
      fullLorryType: `${data.lorryTonnage || '3 Tan'} - ${data.lorryBodyType?.split('/')[0].trim() || 'Closed Box'}${data.hasTailgate ? ' [Tailgate]' : ''}`,
      hasTailgate: !!data.hasTailgate,
      city: data.city || 'Kuala Lumpur',
      area: data.area || '',
      myReferralCode,
      referredBy: data.referredBy?.trim().toUpperCase(),
      referralCount: 0,
      isSubscribed: false,
      subscriptionExpiry: new Date(Date.now() + 30 * 86400000).toISOString(),
      isApproved: isAutoApproved,
      isBlocked: false,
      isActive: true,
      isAvailable: false,
      isOnline: false,
      returnLoad: false,
      whatsappNotifyEnabled: true,
      password: data.password || 'password123',
      createdAt: new Date().toISOString(),
      completedJobsCount: 0,
      totalKmCovered: 0,
    };

    // Referral bonus calculation
    if (newDriver.referredBy && config.referral.isReferralActive) {
      const referrer = driversLiveCache.find((d) => d.myReferralCode.toUpperCase() === newDriver.referredBy);
      if (referrer) {
        referrer.referralCount = (referrer.referralCount || 0) + 1;
        if (referrer.referralCount >= config.referral.requiredCount) {
          referrer.isSubscribed = true;
          const currentExpiry = referrer.subscriptionExpiry ? new Date(referrer.subscriptionExpiry).getTime() : Date.now();
          const baseTime = Math.max(Date.now(), currentExpiry);
          referrer.subscriptionExpiry = new Date(baseTime + config.referral.freeDays * 86400000).toISOString();
        }
        this.saveDriver(referrer);
      }
    }

    this.saveDriver(newDriver);
    return newDriver;
  },

  // -------------------------------------------------------------
  // Customers
  // -------------------------------------------------------------
  getCustomers(): CustomerProfile[] {
    return customersLiveCache;
  },

  registerCustomer(data: Partial<CustomerProfile>): CustomerProfile {
    const newCustomer: CustomerProfile = {
      uid: `cust-${Date.now()}`,
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      password: data.password || 'password123',
      preferredLanguage: data.preferredLanguage || 'ms',
      createdAt: new Date().toISOString(),
    };
    customersLiveCache.push(newCustomer);
    setDoc(doc(db, 'customers', newCustomer.uid), newCustomer).catch((err) => {
      console.warn('Customer save to firestore notice:', err);
    });
    notifyAll();
    return newCustomer;
  },

  // -------------------------------------------------------------
  // Bookings (Firebase Firestore Reference)
  // -------------------------------------------------------------
  getBookings(): Booking[] {
    return bookingsLiveCache;
  },

  getBookingById(id: string): Booking | null {
    return bookingsLiveCache.find((b) => b.bookingId === id) || null;
  },

  /**
   * Creates a delivery booking in Firestore, queries active matching drivers within 10km,
   * and broadcasts real-time FCM push notifications.
   */
  createBooking(bookingData: Omit<Booking, 'bookingId' | 'createdAt'>): Booking {
    const newBooking: Booking = {
      ...bookingData,
      bookingId: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      price: null, // STRICT RULE: NO PRICE ANYWHERE
    };

    // 1. Immediately update cache & UI
    bookingsLiveCache.unshift(newBooking);
    notifyAll();

    // 2. Persist booking to Firestore reference /bookings/{bookingId}
    setDoc(doc(db, 'bookings', newBooking.bookingId), newBooking)
      .then(() => {
        console.log(`[Firestore] Booking ${newBooking.bookingId} successfully saved to Firestore.`);
      })
      .catch((err) => {
        console.error('[Firestore] Failed creating booking in Firestore:', err);
        handleFirestoreError(err, OperationType.CREATE, `bookings/${newBooking.bookingId}`);
      });

    // 3. Dynamic Real-Time FCM Broadcast Logic:
    // When a customer creates a booking for a specific vehicle type, use geocoding APIs
    // from gpsLocationService.ts to query all active drivers with exact vehicle type within 10km,
    // and broadcast push notification via Firebase FCM simultaneously.
    sendFcmBroadcastToDrivers(newBooking, driversLiveCache)
      .then((broadcastRes) => {
        lastFcmBroadcastResult = broadcastRes;
        console.log(
          `[FCM Broadcast Executed] Dispatched to ${broadcastRes.matchedCount} matching drivers within 10km.`
        );

        // Update booking doc with matched driver IDs
        if (broadcastRes.matchedDrivers.length > 0) {
          const matchedUids = broadcastRes.matchedDrivers.map((m) => m.driver.uid);
          setDoc(
            doc(db, 'bookings', newBooking.bookingId),
            { broadcastDriverIds: matchedUids.join(',') },
            { merge: true }
          ).catch((e) => console.warn('Broadcast IDs update notice:', e));
        }
      })
      .catch((broadcastErr) => {
        console.error('[FCM Broadcast Execution Error]:', broadcastErr);
      });

    return newBooking;
  },

  updateBooking(booking: Booking) {
    const idx = bookingsLiveCache.findIndex((b) => b.bookingId === booking.bookingId);
    if (idx >= 0) {
      bookingsLiveCache[idx] = booking;
    }

    // Persist to Firestore
    setDoc(doc(db, 'bookings', booking.bookingId), booking, { merge: true }).catch((err) => {
      console.error('[Firestore] Error updating booking:', err);
      handleFirestoreError(err, OperationType.UPDATE, `bookings/${booking.bookingId}`);
    });

    notifyAll();
  },

  acceptBooking(bookingId: string, driver: DriverProfile): { success: boolean; message: string; booking?: Booking } {
    if (driver.isActive === false) {
      return { success: false, message: 'Your driver account has been deactivated by administrator.' };
    }

    if (driver.isBlocked) {
      return { success: false, message: 'Your driver account is currently suspended. Please contact admin.' };
    }

    if (!driver.isApproved) {
      return { success: false, message: 'Your driver account is pending approval from administrator.' };
    }

    const booking = bookingsLiveCache.find((b) => b.bookingId === bookingId);
    if (!booking) {
      return { success: false, message: 'Booking not found' };
    }

    if (booking.status !== 'PENDING' && booking.status !== 'PENDING_RETURN_LOAD') {
      return { success: false, message: 'Job already accepted or cancelled by another driver' };
    }

    if (booking.status === 'PENDING_RETURN_LOAD' && booking.returnLoadDriverId && booking.returnLoadDriverId !== driver.uid) {
      return { success: false, message: 'This is an exclusive return load offer reserved for another driver' };
    }

    booking.status = 'ACCEPTED';
    booking.driverId = driver.uid;
    booking.driverName = driver.name;
    booking.driverPhone = driver.phone;
    booking.lorryNumber = driver.lorryNumber;
    booking.lorryTonnage = driver.lorryTonnage;
    booking.lorryBodyType = driver.lorryBodyType;
    booking.fullLorryType = driver.fullLorryType;
    booking.acceptedAt = new Date().toISOString();

    // Mark driver busy
    driver.isAvailable = false;
    this.saveDriver(driver);
    this.updateBooking(booking);

    return { success: true, message: 'Job successfully accepted', booking };
  },

  activateDriverSubscription(driverId: string, days = 30): { success: boolean; driver?: DriverProfile; message: string } {
    const driver = driversLiveCache.find((d) => d.uid === driverId);
    if (!driver) {
      return { success: false, message: `Driver not found for ID: ${driverId}` };
    }

    const now = Date.now();
    const currentExpiry = driver.subscriptionExpiry ? new Date(driver.subscriptionExpiry).getTime() : now;
    const baseTime = currentExpiry > now ? currentExpiry : now;
    const newExpiry = new Date(baseTime + days * 86400000).toISOString();

    driver.isSubscribed = true;
    driver.subscriptionExpiry = newExpiry;
    driver.isActive = true;

    this.saveDriver(driver);
    return {
      success: true,
      driver,
      message: `Driver ${driver.name} subscription successfully activated until ${new Date(newExpiry).toLocaleDateString()}.`,
    };
  },

  generateWhatsAppLink(phone: string, text: string): string {
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '60' + clean.slice(1);
    } else if (!clean.startsWith('60')) {
      clean = '60' + clean;
    }
    return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
  },

  getCompletedTripsByDriver(driverId: string): Booking[] {
    return bookingsLiveCache
      .filter((b) => b.driverId === driverId && b.status === 'COMPLETED')
      .sort((a, b) => {
        const timeA = new Date(a.completedAt || a.createdAt).getTime();
        const timeB = new Date(b.completedAt || b.createdAt).getTime();
        return timeB - timeA;
      });
  },

  getLastFcmBroadcastResult(): BroadcastNotificationResult | null {
    return lastFcmBroadcastResult;
  },
};

// Automatically initialize Firestore real-time synchronization on load
if (typeof window !== 'undefined') {
  StorageService.init().catch((err) => console.warn('StorageService auto init error:', err));
}
