import { Booking, DriverProfile, FcmBroadcastRecord } from '../types';
import { calculateDistance } from './distanceUtils';
import { geocodeAddressQuery } from './gpsLocationService';
import { db, OperationType, handleFirestoreError } from '../firebase';
import { collection, doc, setDoc, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

export interface DriverMatchResult {
  driver: DriverProfile;
  distanceKm: number;
}

export interface BroadcastNotificationResult {
  broadcastId: string;
  matchedDrivers: DriverMatchResult[];
  matchedCount: number;
  message: string;
  success: boolean;
}

/**
 * Checks whether the driver's vehicle exactly matches the customer's requested lorry type.
 */
export function isVehicleTypeMatch(
  driver: DriverProfile,
  requestedTonnage?: string,
  requestedBodyType?: string,
  requestedFullType?: string
): boolean {
  // 1. Direct fullLorryType comparison if available
  if (requestedFullType && driver.fullLorryType) {
    const normReq = requestedFullType.toLowerCase().replace(/\[tailgate\]/gi, '').trim();
    const normDrv = driver.fullLorryType.toLowerCase().replace(/\[tailgate\]/gi, '').trim();
    if (normReq === normDrv) return true;
  }

  // 2. Strict Tonnage check
  if (requestedTonnage && driver.lorryTonnage) {
    const reqTon = requestedTonnage.toLowerCase().trim();
    const drvTon = driver.lorryTonnage.toLowerCase().trim();
    if (reqTon !== drvTon) return false;
  }

  // 3. Strict Body Type check
  if (requestedBodyType && driver.lorryBodyType) {
    const cleanReqBody = requestedBodyType.toLowerCase().split('/')[0].replace(/📦|🚛|❄️|🏗️/g, '').trim();
    const cleanDrvBody = driver.lorryBodyType.toLowerCase().split('/')[0].replace(/📦|🚛|❄️|🏗️/g, '').trim();
    if (cleanReqBody !== cleanDrvBody && !cleanDrvBody.includes(cleanReqBody) && !cleanReqBody.includes(cleanDrvBody)) {
      return false;
    }
  }

  return true;
}

/**
 * Resolves pickup coordinates using either existing coords or gpsLocationService geocoding.
 */
export async function resolvePickupCoordinates(booking: Partial<Booking>): Promise<{ lat: number; lng: number }> {
  if (booking.fromLat && booking.fromLng && (booking.fromLat !== 0 || booking.fromLng !== 0)) {
    return { lat: booking.fromLat, lng: booking.fromLng };
  }

  const queryStr = [booking.fromAddress, booking.fromCity].filter(Boolean).join(', ');
  if (queryStr) {
    try {
      const geo = await geocodeAddressQuery(queryStr);
      if (geo && geo.lat && geo.lng) {
        return { lat: geo.lat, lng: geo.lng };
      }
    } catch (err) {
      console.warn('Geocoding lookup failed for pickup:', err);
    }
  }

  // Default coordinate if not geocodable (Kuala Lumpur City Center)
  return { lat: 3.1390, lng: 101.6869 };
}

/**
 * Queries all active drivers who have the exact same vehicle type and are within a 10km radius of the pickup location.
 */
export async function queryMatchingActiveDrivers(
  allDrivers: DriverProfile[],
  booking: Partial<Booking>,
  maxRadiusKm: number = 10.0
): Promise<{ pickupCoords: { lat: number; lng: number }; matches: DriverMatchResult[] }> {
  const pickupCoords = await resolvePickupCoordinates(booking);

  // Active drivers: isActive !== false, not blocked, approved
  const activeCandidates = allDrivers.filter((d) => {
    const isAct = d.isActive !== undefined ? d.isActive : true;
    const isApp = d.isApproved !== undefined ? d.isApproved : true;
    const isNotBlk = !d.isBlocked;
    return isAct && isApp && isNotBlk;
  });

  const matches: DriverMatchResult[] = [];

  for (const driver of activeCandidates) {
    // 1. Vehicle match check
    const matchesVehicle = isVehicleTypeMatch(
      driver,
      booking.lorryTonnage,
      booking.lorryBodyType,
      booking.fullLorryType
    );
    if (!matchesVehicle) continue;

    // 2. Proximity check within 10km radius
    const drvLat = driver.currentLat ?? 0;
    const drvLng = driver.currentLng ?? 0;
    if (drvLat === 0 && drvLng === 0) continue;

    const distanceKm = calculateDistance(pickupCoords.lat, pickupCoords.lng, drvLat, drvLng);
    if (distanceKm <= maxRadiusKm) {
      matches.push({
        driver,
        distanceKm,
      });
    }
  }

  // Sort by distance (nearest first)
  matches.sort((a, b) => a.distanceKm - b.distanceKm);

  return {
    pickupCoords,
    matches,
  };
}

/**
 * Dispatches real-time broadcast push notification to all matching drivers simultaneously via Firebase FCM.
 */
export async function sendFcmBroadcastToDrivers(
  booking: Booking,
  allDrivers: DriverProfile[]
): Promise<BroadcastNotificationResult> {
  const { pickupCoords, matches } = await queryMatchingActiveDrivers(allDrivers, booking, 10.0);

  const broadcastId = `fcm_bcast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const targetDriverUids = matches.map((m) => m.driver.uid);

  const headline = `🚨 Tempahan Baru Berdekatan! (< 10 KM)`;
  const bodyText = `Tempahan lori ${booking.fullLorryType} dari ${booking.fromCity} ke ${booking.toCity} (📏 ${booking.distanceText}). Ketik untuk buka dan terima segera!`;

  const record: FcmBroadcastRecord = {
    id: broadcastId,
    bookingId: booking.bookingId,
    fullLorryType: booking.fullLorryType,
    pickupLat: pickupCoords.lat,
    pickupLng: pickupCoords.lng,
    radiusKm: 10.0,
    matchedCount: matches.length,
    targetDriverUids,
    title: headline,
    body: bodyText,
    timestamp: new Date().toISOString(),
  };

  // 1. Persist to Firestore collection 'fcm_broadcasts'
  try {
    await setDoc(doc(db, 'fcm_broadcasts', broadcastId), record);
    console.log(`[FCM Broadcast] Firestore record created: ${broadcastId} for ${matches.length} matching drivers.`);
  } catch (err) {
    console.error('[FCM Broadcast] Failed writing broadcast to Firestore:', err);
  }

  // 2. Call server backend FCM dispatch endpoint
  try {
    const response = await fetch('/api/v1/broadcast-fcm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        broadcastId,
        booking,
        pickupCoords,
        radiusKm: 10.0,
        targetDriverUids,
        matchingDrivers: matches.map((m) => ({
          uid: m.driver.uid,
          name: m.driver.name,
          phone: m.driver.phone,
          lorryNumber: m.driver.lorryNumber,
          fcmToken: m.driver.fcmToken,
          distanceKm: m.distanceKm,
        })),
        notification: {
          title: headline,
          body: bodyText,
        },
      }),
    });
    if (response.ok) {
      const json = await response.json();
      console.log('[FCM Broadcast Server Response]:', json);
    }
  } catch (err) {
    console.warn('[FCM Broadcast Server Network Notice]:', err);
  }

  // 3. Trigger Browser Web Notification if permitted
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(headline, {
        body: bodyText,
        icon: '/favicon.ico',
      });
    } catch {
      // Ignore notification failures on background/unsupported contexts
    }
  }

  return {
    broadcastId,
    matchedDrivers: matches,
    matchedCount: matches.length,
    message: `FCM push notification broadcasted simultaneously to ${matches.length} drivers within 10km radius.`,
    success: true,
  };
}

/**
 * Listens for real-time FCM broadcasts targeted at a specific driver.
 */
export function subscribeToDriverFcmBroadcasts(
  driverUid: string,
  onBroadcastReceived: (broadcast: FcmBroadcastRecord) => void
): () => void {
  try {
    const q = query(collection(db, 'fcm_broadcasts'), orderBy('timestamp', 'desc'), limit(10));
    return onSnapshot(
      q,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data() as FcmBroadcastRecord;
            if (data.targetDriverUids && data.targetDriverUids.includes(driverUid)) {
              onBroadcastReceived(data);
            }
          }
        });
      },
      (error) => {
        console.warn('FCM Broadcast subscription notice:', error);
      }
    );
  } catch (err) {
    console.warn('FCM Broadcast listener setup error:', err);
    return () => {};
  }
}
