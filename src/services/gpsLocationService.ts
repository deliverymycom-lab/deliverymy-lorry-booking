import { Coordinates } from '../types';
import { MALAYSIAN_CITIES, MalaysianLocation } from './malaysiaLocations';
import { calculateDistance } from './distanceUtils';

export interface GpsResult {
  success: boolean;
  coords: Coordinates;
  isRealGps: boolean;
  accuracyMeters?: number;
  message?: string;
  isOutsideMalaysia?: boolean;
  errorCode?: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'NOT_SUPPORTED';
}

/**
 * Checks if coordinates fall inside Malaysia or immediate border areas (e.g. Johor-Singapore)
 */
export const isWithinMalaysia = (lat: number, lng: number): boolean => {
  return lat >= 0.8 && lat <= 7.5 && lng >= 99.5 && lng <= 119.5;
};

/**
 * Finds the closest Malaysian major hub/city from given coordinates
 */
export const findClosestMalaysianCity = (lat: number, lng: number): MalaysianLocation => {
  let closest = MALAYSIAN_CITIES[0];
  let minDistance = calculateDistance(lat, lng, closest.lat, closest.lng);

  for (let i = 1; i < MALAYSIAN_CITIES.length; i++) {
    const city = MALAYSIAN_CITIES[i];
    const dist = calculateDistance(lat, lng, city.lat, city.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = city;
    }
  }
  return closest;
};

/**
 * High-accuracy reverse geocoding via OpenStreetMap Nominatim with street-level resolution.
 * Accurately extracts road, neighbourhood, city, state and country globally.
 */
export const reverseGeocodeCoords = async (
  lat: number,
  lng: number
): Promise<{ address: string; city: string; state: string; country?: string; isMalaysia: boolean; road?: string }> => {
  const isMy = isWithinMalaysia(lat, lng);
  const closest = isMy ? findClosestMalaysianCity(lat, lng) : null;
  const fallbackAddr = closest
    ? `${closest.popularPlaces?.[0] || 'Kawasan'}, ${closest.city}, ${closest.state}`
    : `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;

  // Try OpenStreetMap Nominatim with appropriate headers
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          'Accept-Language': 'ms,en',
          'User-Agent': 'DeliveryMY-LorryApp/1.0 (deliverymy.com@gmail.com)',
        },
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const a = data.address;
        const road = a.road || a.pedestrian || a.street || a.highway || a.commercial || a.industrial || '';
        const area = a.suburb || a.neighbourhood || a.residential || a.quarter || a.village || a.hamlet || '';
        const rawCity = a.city || a.town || a.municipality || a.county || a.state_district || (closest ? closest.city : 'Bandar');
        const city = rawCity.replace(/^(Majlis Perbandaran|Majlis Bandaraya|Daerah|Bahagian)\s+/i, '').trim();
        const postcode = a.postcode ? `${a.postcode} ` : '';
        const state = a.state || (closest ? closest.state : '');
        const country = a.country || '';

        const parts: string[] = [];
        if (road) parts.push(road);
        if (area && area.toLowerCase() !== road.toLowerCase() && area.toLowerCase() !== city.toLowerCase()) parts.push(area);
        if (city) parts.push(`${postcode}${city}`.trim());
        if (state && !city.toLowerCase().includes(state.toLowerCase())) parts.push(state);
        if (country && !isMy) parts.push(country);

        const formattedAddress = parts.length > 0 ? parts.join(', ') : data.display_name?.split(',').slice(0, 4).join(', ');

        return {
          address: formattedAddress || fallbackAddr,
          city: city || (closest ? closest.city : 'Bandar'),
          state: state || (closest ? closest.state : ''),
          country,
          isMalaysia: isMy,
          road,
        };
      }
    }
  } catch (err) {
    console.warn('Reverse geocode primary attempt failed:', err);
  }

  // Backup reverse geocoding via bigdatacloud open reverse geocode API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const bdcRes = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (bdcRes.ok) {
      const bdcData = await bdcRes.json();
      const city = bdcData.city || bdcData.locality || (closest ? closest.city : 'Bandar');
      const state = bdcData.principalSubdivision || (closest ? closest.state : '');
      const country = bdcData.countryName || '';
      const locality = bdcData.locality || '';
      const parts = [locality, city, state].filter(Boolean);
      const uniqueParts = Array.from(new Set(parts));

      return {
        address: uniqueParts.join(', ') || fallbackAddr,
        city: city || (closest ? closest.city : 'Bandar'),
        state: state || (closest ? closest.state : ''),
        country,
        isMalaysia: isMy,
        road: locality,
      };
    }
  } catch (err) {
    console.warn('Backup reverse geocode failed:', err);
  }

  return {
    address: fallbackAddr,
    city: closest ? closest.city : 'Bandar',
    state: closest ? closest.state : '',
    country: isMy ? 'Malaysia' : '',
    isMalaysia: isMy,
  };
};

/**
 * Searches and geocodes any typed address into exact coordinates and structured address.
 * Prioritizes Malaysian database, then queries OpenStreetMap Nominatim globally.
 */
export const geocodeAddressQuery = async (
  query: string
): Promise<Coordinates | null> => {
  const clean = query.trim();
  if (!clean || clean.length < 2) return null;

  // 1. Fast match against local Malaysian cities and popular places
  const lower = clean.toLowerCase();
  for (const c of MALAYSIAN_CITIES) {
    if (
      c.name.toLowerCase().includes(lower) ||
      c.city.toLowerCase().includes(lower) ||
      c.state.toLowerCase().includes(lower) ||
      c.popularPlaces?.some((p) => p.toLowerCase().includes(lower) || lower.includes(p.toLowerCase()))
    ) {
      return {
        lat: c.lat,
        lng: c.lng,
        city: c.city,
        address: `${clean}, ${c.state}`,
      };
    }
  }

  // 2. Query Nominatim: try Malaysia first, then worldwide
  const searchUrls = [
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(clean)}&countrycodes=my&limit=1&addressdetails=1`,
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(clean)}&limit=1&addressdetails=1`
  ];

  for (const url of searchUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept-Language': 'ms,en' },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list) && list.length > 0) {
          const item = list[0];
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          const inMy = isWithinMalaysia(lat, lng);
          const closest = inMy ? findClosestMalaysianCity(lat, lng) : null;
          const addrDetails = item.address;
          const detectedCity =
            addrDetails?.city || addrDetails?.town || addrDetails?.municipality || addrDetails?.county || (closest ? closest.city : 'Kawasan Tempatan');

          return {
            lat,
            lng,
            city: detectedCity,
            address: item.display_name?.split(',').slice(0, 4).join(', ') || clean,
          };
        }
      }
    } catch (err) {
      console.warn('Geocoding query error:', err);
    }
  }

  // 3. Fallback: match closest known city
  const fallback = MALAYSIAN_CITIES.find(
    (c) => lower.includes(c.city.toLowerCase()) || lower.includes(c.state.toLowerCase())
  ) || MALAYSIAN_CITIES[1];

  return {
    lat: fallback.lat,
    lng: fallback.lng,
    city: fallback.city,
    address: clean,
  };
};

/**
 * Returns address suggestions for live autocomplete as the user types
 */
export const getAddressAutocompleteSuggestions = async (
  query: string
): Promise<Array<{ title: string; subtitle: string; lat: number; lng: number; city: string; address: string }>> => {
  const clean = query.trim().toLowerCase();
  if (!clean || clean.length < 2) return [];

  const results: Array<{ title: string; subtitle: string; lat: number; lng: number; city: string; address: string }> = [];

  // 1. Search local known cities & places
  for (const c of MALAYSIAN_CITIES) {
    if (c.name.toLowerCase().includes(clean) || c.city.toLowerCase().includes(clean) || c.state.toLowerCase().includes(clean)) {
      results.push({
        title: c.name,
        subtitle: `${c.city}, ${c.state}`,
        lat: c.lat,
        lng: c.lng,
        city: c.city,
        address: `${c.popularPlaces?.[0] || 'Pusat Bandar'}, ${c.city}, ${c.state}`,
      });
    }
    if (c.popularPlaces) {
      for (const p of c.popularPlaces) {
        if (p.toLowerCase().includes(clean)) {
          results.push({
            title: p,
            subtitle: `${c.city}, ${c.state}`,
            lat: c.lat,
            lng: c.lng,
            city: c.city,
            address: `${p}, ${c.city}, ${c.state}`,
          });
        }
      }
    }
  }

  // 2. Query Nominatim for global/live places
  if (results.length < 3 && clean.length >= 3) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        clean
      )}&limit=4&addressdetails=1`;
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept-Language': 'ms,en' },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list)) {
          for (const item of list) {
            const lat = parseFloat(item.lat);
            const lng = parseFloat(item.lon);
            const inMy = isWithinMalaysia(lat, lng);
            const closest = inMy ? findClosestMalaysianCity(lat, lng) : null;
            const title = item.name || item.display_name.split(',')[0];
            const subtitle = item.display_name.split(',').slice(1, 3).join(',').trim();
            results.push({
              title,
              subtitle: subtitle || (closest ? closest.city : 'Kawasan'),
              lat,
              lng,
              city: closest ? closest.city : title,
              address: item.display_name.split(',').slice(0, 4).join(', '),
            });
          }
        }
      }
    } catch {
      // Ignore network errors
    }
  }

  // Remove duplicates
  const seen = new Set<string>();
  return results.filter((item) => {
    const key = `${item.title}-${item.city}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 5);
};

/**
 * High-accuracy multi-sampling browser position retrieval with intelligent Wi-Fi/IP fallback:
 * 1. First attempt: satellite high-accuracy watch/positioning (enableHighAccuracy: true).
 * 2. If satellite lock times out or fails (e.g. laptop browsers without GPS chipsets),
 *    automatically falls back to standard network/Wi-Fi/broadband triangulation (enableHighAccuracy: false).
 */
export const getAccurateBrowserPosition = async (forceFresh = true): Promise<GeolocationPosition> => {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    const err: any = new Error('Geolocation not supported');
    err.code = 0;
    throw err;
  }

  const getSinglePosition = (options: PositionOptions): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  };

  // Attempt 1: High Accuracy (Satellite / Mobile GPS)
  try {
    const highAccuracyPromise = new Promise<GeolocationPosition>((resolve, reject) => {
      let bestPosition: GeolocationPosition | null = null;
      let watchId: number | null = null;
      let timer: any = null;

      const cleanup = () => {
        if (timer) clearTimeout(timer);
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
          watchId = null;
        }
      };

      timer = setTimeout(() => {
        cleanup();
        if (bestPosition) {
          resolve(bestPosition);
        } else {
          reject(new Error('HIGH_ACCURACY_TIMEOUT'));
        }
      }, 3500);

      try {
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            if (!bestPosition || pos.coords.accuracy < bestPosition.coords.accuracy) {
              bestPosition = pos;
            }
            if (pos.coords.accuracy <= 50) {
              cleanup();
              resolve(pos);
            }
          },
          (err) => {
            if (err.code === 1) {
              cleanup();
              reject(err);
            }
          },
          {
            enableHighAccuracy: true,
            maximumAge: forceFresh ? 0 : 5000,
            timeout: 3500,
          }
        );
      } catch {
        cleanup();
        reject(new Error('WATCH_FAILED'));
      }
    });

    return await highAccuracyPromise;
  } catch (firstErr: any) {
    if (firstErr?.code === 1) {
      throw firstErr;
    }
  }

  // Attempt 2: Intelligent Fallback for Laptops (Wi-Fi / Broadband IP Triangulation)
  try {
    return await getSinglePosition({
      enableHighAccuracy: false,
      timeout: 8000,
      maximumAge: forceFresh ? 0 : 30000,
    });
  } catch (secondErr: any) {
    if (secondErr?.code === 1) {
      throw secondErr;
    }
  }

  // Attempt 3: IP Geolocation direct fallback if browser Geolocation provider is unreachable
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (res.ok) {
      const data = await res.json();
      if (data && data.latitude && data.longitude) {
        return {
          coords: {
            latitude: data.latitude,
            longitude: data.longitude,
            accuracy: 2500,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        } as GeolocationPosition;
      }
    }
  } catch {
    // Continue
  }

  const finalErr: any = new Error('Isyarat lokasi tidak dapat dikunci');
  finalErr.code = 2;
  throw finalErr;
};

/**
 * High-level GPS location retrieval for the application:
 * 1. Obtains device coordinates with satellite lock or laptop Wi-Fi/IP fallback.
 * 2. Reverse geocodes using OpenStreetMap Nominatim for Karaikudi, India or any Malaysian city.
 * 3. Returns detailed status so UI can notify user immediately.
 */
export const getCurrentGpsLocation = async (defaultCityIndex = 1): Promise<GpsResult> => {
  try {
    const pos = await getAccurateBrowserPosition(true);
    const accuracyMeters = pos.coords.accuracy ? Math.round(pos.coords.accuracy) : 100;
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    const inMalaysia = isWithinMalaysia(lat, lng);
    const resolved = await reverseGeocodeCoords(lat, lng);

    return {
      success: true,
      isRealGps: true,
      accuracyMeters,
      coords: {
        lat,
        lng,
        city: resolved.city,
        address: resolved.address,
      },
      message: `Lokasi dikesan: ${resolved.address}`,
      isOutsideMalaysia: !inMalaysia,
    };
  } catch (err: any) {
    console.warn('GPS location detection failed:', err);
    throw err;
  }
};
