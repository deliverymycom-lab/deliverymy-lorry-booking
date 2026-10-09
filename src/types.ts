export type Language = 'ms' | 'en' | 'zh';

export type UserRole = 'customer' | 'driver' | 'admin';

export type BookingStatus = 
  | 'PENDING'
  | 'PENDING_RETURN_LOAD'
  | 'ACCEPTED'
  | 'ON_THE_WAY'
  | 'COMPLETED'
  | 'CANCELLED';

export interface CustomerProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  preferredLanguage: Language;
  createdAt: string;
}

export interface DriverProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  lorryNumber: string; // e.g. WXY 1234
  lorryTonnage: string; // e.g. 3 Tan
  lorryBodyType: string; // e.g. Closed Box
  fullLorryType: string; // e.g. 3 Tan - Closed Box
  hasTailgate?: boolean; // Tailgate / Hydraulic Lift (Pintu Angkat / ஹைட்ராலிக் லிப்ட்)
  city: string; // e.g. Kuala Lumpur, Johor Bahru
  area?: string;
  myReferralCode: string; // e.g. ALI88 (3 letters + 2 digits)
  referredBy?: string;
  referralCount: number;
  isSubscribed: boolean;
  subscriptionExpiry: string | null; // ISO Date string
  isApproved: boolean; // default false (needs admin approval)
  isBlocked: boolean;
  isActive?: boolean; // Admin Safety Toggle: when false, completely blocked from jobs
  isAvailable: boolean; // OFF by default
  isOnline: boolean;
  lastOnlineAt?: string;
  currentLat?: number;
  currentLng?: number;
  returnLoad: boolean;
  returnLoadFrom?: string;
  returnLoadTo?: string;
  returnLoadFromOriginal?: string;
  returnLoadToOriginal?: string;
  returnLoadDate?: string;
  returnLoadNote?: string;
  returnLoadEnabledAt?: string;
  whatsappNotifyEnabled: boolean;
  password?: string;
  createdAt: string;
  fcmToken?: string;
  completedJobsCount?: number;
  totalKmCovered?: number;
}

export interface FcmBroadcastRecord {
  id: string;
  bookingId: string;
  fullLorryType: string;
  pickupLat: number;
  pickupLng: number;
  radiusKm: number;
  matchedCount: number;
  targetDriverUids: string[];
  title: string;
  body: string;
  timestamp: string;
}

export interface Booking {
  bookingId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  fromAddress: string;
  toAddress: string;
  fromCity: string;
  toCity: string;
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
  distanceKM: number; // e.g. 330.5
  distanceText: string; // e.g. "331 KM"
  estimatedTime: string; // e.g. "6 jam 36 min"
  lorryTonnage: string;
  lorryBodyType: string;
  fullLorryType: string;
  hasTailgate?: boolean; // Tailgate / Hydraulic Lift requested
  goodsType: string;
  dateTime: string;
  note?: string;
  status: BookingStatus;
  isReturnLoadOffer: boolean;
  returnLoadDriverId?: string;
  price: null; // STRICT: NO PRICE ANYWHERE
  returnLoadExpiry?: string | null; // ISO string (5 minutes from creation)
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  lorryNumber?: string;
  acceptedAt?: string;
  onTheWayAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface AdItemConfig {
  enabled: boolean;
  text: string;
  subtext?: string;
  badge?: string;
  linkUrl?: string;
  bgTheme?: 'amber' | 'emerald' | 'blue' | 'purple' | 'slate';
}

export interface AdvertisementConfig {
  topAd: AdItemConfig;
  bottomAd: AdItemConfig;
}

export interface AppConfig {
  subscription: {
    price: number; // default 25
    days: number; // default 30
  };
  referral: {
    isReferralActive: boolean; // default true
    requiredCount: number; // default 3
    freeDays: number; // default 30
  };
  returnLoad: {
    isEnabled: boolean; // default true
  };
  approvalMode?: 'auto' | 'manual'; // Auto Approval vs Manual Approval
  lorryConfig: {
    tonnages: string[];
    bodyTypes: string[];
  };
  advertisement: AdvertisementConfig;
  whatsapp: {
    bookingConfirm: {
      ms: string;
      en: string;
      zh: string;
    };
    onTheWay: {
      ms: string;
      en: string;
      zh: string;
    };
    completed: {
      ms: string;
      en: string;
      zh: string;
    };
    returnLoad: {
      ms: string;
      en: string;
      zh: string;
    };
  };
  paymentConfig: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    duitNowQrUrl?: string;
    supportWhatsApp: string;
  };
}

export interface Coordinates {
  lat: number;
  lng: number;
  address: string;
  city: string;
}
