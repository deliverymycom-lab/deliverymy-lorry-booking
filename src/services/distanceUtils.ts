import { Language } from '../types';

/**
 * Exact Haversine formula:
 * double calculateDistance(lat1, lon1, lat2, lon2) {
 *   var p = 0.017453292519943295;
 *   var c = cos;
 *   var a = 0.5 - c((lat2-lat1)*p)/2 + c(lat1*p)*c(lat2*p)*(1-c((lon2-lon1)*p))/2;
 *   return 12742*asin(sqrt(a));
 * }
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const p = 0.017453292519943295;
  const c = Math.cos;
  const a = 0.5 - c((lat2 - lat1) * p) / 2 + c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p)) / 2;
  const dist = 12742 * Math.asin(Math.sqrt(Math.max(0, Math.min(1, a))));
  return Math.round(dist * 10) / 10;
}

// Well-known Malaysian commercial highway route distances (KM)
const INTERCITY_HIGHWAY_DISTANCES: Record<string, number> = {
  'johor bahru-kuala lumpur': 330,
  'kuala lumpur-johor bahru': 330,
  'johor-kuala lumpur': 330,
  'kuala lumpur-johor': 330,
  'kuala lumpur-penang': 355,
  'penang-kuala lumpur': 355,
  'johor bahru-penang': 685,
  'penang-johor bahru': 685,
  'kuala lumpur-ipoh': 205,
  'ipoh-kuala lumpur': 205,
  'kuala lumpur-melaka': 145,
  'melaka-kuala lumpur': 145,
  'johor bahru-melaka': 215,
  'melaka-johor bahru': 215,
  'kuala lumpur-kuantan': 255,
  'kuantan-kuala lumpur': 255,
  'kuala lumpur-shah alam': 28,
  'shah alam-kuala lumpur': 28,
  'kuala lumpur-seremban': 68,
  'seremban-kuala lumpur': 68,
  'ipoh-penang': 160,
  'penang-ipoh': 160,
  'kuala lumpur-klang': 36,
  'klang-kuala lumpur': 36,
};

/**
 * Real-world Malaysian road transit calculation:
 * - Checks calibrated highway inter-city matrix
 * - Multiplies straight-line Haversine by 1.35x Malaysian highway/road winding factor
 * - Ensures a sensible minimum distance (e.g. 12 KM) for commercial lorry delivery
 *   instead of showing confusing 1-2 KM radius
 */
export function calculateRealTransitDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  city1?: string,
  city2?: string
): number {
  if (city1 && city2) {
    const c1 = city1.toLowerCase().trim();
    const c2 = city2.toLowerCase().trim();

    // Check exact or partial key match
    for (const [routeKey, km] of Object.entries(INTERCITY_HIGHWAY_DISTANCES)) {
      const [fromK, toK] = routeKey.split('-');
      if (
        (c1.includes(fromK) || fromK.includes(c1)) &&
        (c2.includes(toK) || toK.includes(c2))
      ) {
        return km;
      }
    }
  }

  // Raw Haversine
  const straightLine = calculateDistance(lat1, lon1, lat2, lon2);

  // If coordinates are virtually identical (< 0.5km), minimum intra-premise 5 KM
  if (straightLine < 0.5) {
    return 10;
  }

  // Real Malaysian road curvature factor (typically 1.3x to 1.4x straight flight line)
  let roadDistance = straightLine * 1.35;

  // Commercial lorry transit minimum in city
  if (roadDistance < 10) {
    roadDistance = Math.max(10, Math.round(roadDistance));
  }

  return Math.round(roadDistance);
}

export function formatDistance(distanceKm: number): string {
  const rounded = Math.round(distanceKm);
  return `${rounded} KM`;
}

/**
 * Estimated travel time at average 50 km/h lorry transit speed
 */
export function formatEstimatedTime(distanceKm: number, lang: Language = 'ms'): string {
  const totalHours = distanceKm / 50;
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);

  if (lang === 'zh') {
    if (hours === 0) return `${minutes}分钟`;
    return `${hours}小时 ${minutes}分钟`;
  } else if (lang === 'en') {
    if (hours === 0) return `${minutes} mins`;
    return `${hours} hrs ${minutes} mins`;
  } else {
    if (hours === 0) return `${minutes} min`;
    return `${hours} jam ${minutes} min`;
  }
}
