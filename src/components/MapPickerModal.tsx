import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Navigation, X, Check, Compass, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Coordinates } from '../types';
import { MALAYSIAN_CITIES, MalaysianLocation } from '../services/malaysiaLocations';
import { 
  getAccurateBrowserPosition, 
  reverseGeocodeCoords, 
  geocodeAddressQuery,
  findClosestMalaysianCity,
  getCurrentGpsLocation 
} from '../services/gpsLocationService';

interface MapPickerModalProps {
  isOpen: boolean;
  title: string;
  initialLocation?: Coordinates;
  onConfirm: (loc: Coordinates) => void;
  onClose: () => void;
}

export const MapPickerModal: React.FC<MapPickerModalProps> = ({
  isOpen,
  title,
  initialLocation,
  onConfirm,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>(
    initialLocation?.city || 'Kuala Lumpur'
  );
  const [selectedAddress, setSelectedAddress] = useState<string>(
    initialLocation?.address || 'Bukit Bintang, Kuala Lumpur'
  );
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: initialLocation?.lat || 3.1390,
    lng: initialLocation?.lng || 101.6869,
  });
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [gpsModalAlert, setGpsModalAlert] = useState<{ text: string; type: 'success' | 'warning' } | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const leafletMarkerRef = useRef<any>(null);

  // Sync state whenever modal is opened or initialLocation changes
  useEffect(() => {
    if (isOpen && initialLocation) {
      const lat = initialLocation.lat || 3.1390;
      const lng = initialLocation.lng || 101.6869;
      const city = initialLocation.city || 'Kuala Lumpur';
      const address = initialLocation.address || 'Kuala Lumpur, Malaysia';

      setCoords({ lat, lng });
      setSelectedCity(city);
      setSelectedAddress(address);
      setSearchQuery('');
      setGpsModalAlert(null);

      if (leafletMapRef.current) {
        leafletMapRef.current.setView([lat, lng], 14);
        if (leafletMarkerRef.current) {
          leafletMarkerRef.current.setLatLng([lat, lng]);
        }
      }
    }
  }, [isOpen, initialLocation?.lat, initialLocation?.lng, initialLocation?.address]);

  // Update marker icon when selectedCity changes
  const updateMarkerIcon = (cityName: string) => {
    if (!leafletMarkerRef.current) return;
    try {
      const L = (window as any).L;
      if (!L) return;
      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="background: #10b981; color: white; padding: 6px 12px; border-radius: 20px; font-weight: 800; font-size: 12px; display: flex; align-items: center; gap: 4px; box-shadow: 0 4px 14px rgba(0,0,0,0.4); border: 2px solid white; transform: translate(-50%, -50%); white-space: nowrap;">
            <span>📍</span> <span>${cityName || 'Lokasi Dipilih'}</span>
          </div>
        `,
        iconSize: [120, 36],
        iconAnchor: [60, 18],
      });
      leafletMarkerRef.current.setIcon(customIcon);
    } catch {}
  };

  // Reverse geocode: high-precision street & area resolution
  const resolveAddressFromCoords = async (lat: number, lng: number) => {
    setIsResolvingAddress(true);
    // Instant fallback to closest city so UI updates immediately
    const closest = findClosestMalaysianCity(lat, lng);
    setSelectedCity(closest.city);
    setSelectedAddress(`${closest.popularPlaces?.[0] || 'Kawasan'}, ${closest.city}, ${closest.state}`);
    updateMarkerIcon(closest.city);

    // Asynchronously refine with exact street name
    const resolved = await reverseGeocodeCoords(lat, lng);
    setSelectedAddress(resolved.address);
    setSelectedCity(resolved.city);
    updateMarkerIcon(resolved.city);
    setIsResolvingAddress(false);
  };

  // Filter cities by search query
  const filteredCities = MALAYSIAN_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.popularPlaces?.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Initialize Leaflet Map
  useEffect(() => {
    if (!isOpen) return;

    let timer = setTimeout(async () => {
      try {
        const L = (window as any).L || (await import('leaflet')).default;
        if (!mapContainerRef.current) return;

        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
          leafletMapRef.current = null;
        }

        const map = L.map(mapContainerRef.current, {
          center: [coords.lat, coords.lng],
          zoom: 14,
          zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap',
        }).addTo(map);

        const customIcon = L.divIcon({
          className: 'custom-map-marker',
          html: `
            <div style="background: #10b981; color: white; padding: 6px 12px; border-radius: 20px; font-weight: 800; font-size: 12px; display: flex; align-items: center; gap: 4px; box-shadow: 0 4px 14px rgba(0,0,0,0.4); border: 2px solid white; transform: translate(-50%, -50%); white-space: nowrap;">
              <span>📍</span> <span>${selectedCity}</span>
            </div>
          `,
          iconSize: [120, 36],
          iconAnchor: [60, 18],
        });

        const marker = L.marker([coords.lat, coords.lng], {
          draggable: true,
          icon: customIcon,
        }).addTo(map);

        marker.on('dragend', (e: any) => {
          const latlng = e.target.getLatLng();
          setCoords({ lat: latlng.lat, lng: latlng.lng });
          resolveAddressFromCoords(latlng.lat, latlng.lng);
        });

        map.on('click', (e: any) => {
          marker.setLatLng(e.latlng);
          setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
          resolveAddressFromCoords(e.latlng.lat, e.latlng.lng);
        });

        leafletMapRef.current = map;
        leafletMarkerRef.current = marker;

        setTimeout(() => {
          map.invalidateSize();
        }, 200);
      } catch (err) {
        console.warn('Map rendering fallback to coordinate view', err);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (leafletMapRef.current) {
        try {
          leafletMapRef.current.remove();
          leafletMapRef.current = null;
        } catch {}
      }
    };
  }, [isOpen]);

  const updateLocation = (city: MalaysianLocation, specificPlace?: string, instantConfirm = false) => {
    const address = specificPlace
      ? `${specificPlace}, ${city.name}`
      : `${city.popularPlaces?.[0] || 'Pusat Bandar'}, ${city.name}`;

    setSelectedCity(city.city);
    setSelectedAddress(address);
    setCoords({ lat: city.lat, lng: city.lng });
    setSearchQuery('');
    updateMarkerIcon(city.city);

    if (leafletMapRef.current) {
      leafletMapRef.current.setView([city.lat, city.lng], 14);
      if (leafletMarkerRef.current) {
        leafletMarkerRef.current.setLatLng([city.lat, city.lng]);
      }
    }

    if (instantConfirm) {
      onConfirm({
        lat: city.lat,
        lng: city.lng,
        address,
        city: city.city,
      });
      onClose();
    }
  };

  // Handle Search Input in Modal
  const handleExecuteSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setGpsModalAlert(null);

    try {
      const result = await geocodeAddressQuery(searchQuery);
      if (result) {
        setCoords({ lat: result.lat, lng: result.lng });
        setSelectedCity(result.city);
        setSelectedAddress(result.address);

        if (leafletMapRef.current) {
          leafletMapRef.current.setView([result.lat, result.lng], 15);
          if (leafletMarkerRef.current) {
            leafletMarkerRef.current.setLatLng([result.lat, result.lng]);
          }
        }

        setGpsModalAlert({
          text: `✓ Lokasi ditemui di peta: ${result.city} (${result.address})`,
          type: 'success',
        });
        setTimeout(() => setGpsModalAlert(null), 4000);
      } else {
        setGpsModalAlert({
          text: 'Alamat tidak ditemui. Sila cuba taip nama bandar atau poskod.',
          type: 'warning',
        });
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleGetCurrentLocation = async () => {
    setIsLocating(true);
    setGpsModalAlert(null);

    // 1. If user has typed a location in the search box (e.g. "Bukit Beruntung"), locate that address immediately!
    if (searchQuery.trim().length >= 2) {
      try {
        const result = await geocodeAddressQuery(searchQuery);
        if (result) {
          setCoords({ lat: result.lat, lng: result.lng });
          setSelectedCity(result.city);
          setSelectedAddress(result.address);

          if (leafletMapRef.current) {
            leafletMapRef.current.setView([result.lat, result.lng], 15);
            if (leafletMarkerRef.current) {
              leafletMarkerRef.current.setLatLng([result.lat, result.lng]);
            }
          }

          setGpsModalAlert({
            text: `✓ Lokasi dikesan di peta: ${result.city} (${result.address})`,
            type: 'success',
          });
          setTimeout(() => setGpsModalAlert(null), 5000);
          setIsLocating(false);
          return;
        }
      } catch {
        // Continue to hardware/network GPS
      }
    }

    // 2. Query device/network GPS location via getCurrentGpsLocation
    try {
      const res = await getCurrentGpsLocation();
      const lat = res.coords.lat;
      const lng = res.coords.lng;
      const city = res.coords.city;
      const address = res.coords.address;

      setCoords({ lat, lng });
      setSelectedCity(city);
      setSelectedAddress(address);
      updateMarkerIcon(city);

      if (leafletMapRef.current) {
        leafletMapRef.current.setView([lat, lng], 15);
        if (leafletMarkerRef.current) {
          leafletMarkerRef.current.setLatLng([lat, lng]);
        }
      }

      setGpsModalAlert({
        text: `✓ Lokasi GPS berjaya dikesan: ${city} (${address})`,
        type: 'success',
      });
      setTimeout(() => setGpsModalAlert(null), 5000);
    } catch {
      // User can click on map or type in search
      const fallback = findClosestMalaysianCity(coords.lat, coords.lng);
      setCoords({ lat: fallback.lat, lng: fallback.lng });
      setSelectedCity(fallback.city);
      setSelectedAddress(`${fallback.popularPlaces?.[0] || 'Pusat Bandar'}, ${fallback.name}`);

      if (leafletMapRef.current) {
        leafletMapRef.current.setView([fallback.lat, fallback.lng], 14);
        if (leafletMarkerRef.current) {
          leafletMarkerRef.current.setLatLng([fallback.lat, fallback.lng]);
        }
      }

      setGpsModalAlert({
        text: `📍 Sila ketik/klik mana-mana titik pada peta di atas untuk letak pin lokasi tepat anda.`,
        type: 'warning',
      });
      setTimeout(() => setGpsModalAlert(null), 6000);
    } finally {
      setIsLocating(false);
    }
  };

  const handleConfirmAndFill = () => {
    const finalAddress = selectedAddress || `${selectedCity}, Malaysia`;
    onConfirm({
      lat: coords.lat,
      lng: coords.lng,
      address: finalAddress,
      city: selectedCity,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[94vh] max-h-[720px]">
        {/* 1. Modal Header (Fixed at top) */}
        <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm leading-tight">{title}</h3>
              <p className="text-[11px] text-slate-400">
                Ketik mana-mana tempat di peta, taip alamat, atau pilih bandar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Search & Quick Bandar Chips (Fixed) */}
        <div className="shrink-0 p-3 bg-slate-950 border-b border-slate-800 space-y-2.5">
          <form onSubmit={handleExecuteSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Taip alamat, bandar atau poskod & tekan Enter..."
                className="w-full pl-9 pr-7 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Cari</span>
            </button>

            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={isLocating}
              className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/25 border border-blue-400/40 rounded-xl text-xs font-black flex items-center gap-1.5 shrink-0 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              title="Kesan Lokasi GPS Semasa / Cari Alamat"
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-white' : 'text-white'}`} />
              <span className="font-black tracking-wide">{isLocating ? 'Mengesan...' : 'GPS'}</span>
            </button>
          </form>

          {/* GPS Accurate Alert */}
          {gpsModalAlert && (
            <div
              className={`p-2.5 rounded-xl text-[11px] font-bold transition-all animate-in fade-in duration-150 ${
                gpsModalAlert.type === 'success'
                  ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/80 border border-amber-500/40 text-amber-300'
              }`}
            >
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 truncate">
                  {gpsModalAlert.type === 'success' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  )}
                  <span className="truncate">{gpsModalAlert.text}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setGpsModalAlert(null)}
                  className="text-[10px] text-slate-400 hover:text-white px-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Filter Suggestions dropdown if search active */}
        {searchQuery && filteredCities.length > 0 && (
          <div className="shrink-0 max-h-36 overflow-y-auto bg-slate-900 border-b border-slate-800 divide-y divide-slate-800 z-20">
            {filteredCities.map((city) => (
              <div key={city.name} className="p-2.5 hover:bg-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-xs block">{city.name}</span>
                  <span className="text-[10px] text-slate-400">{city.state}</span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateLocation(city, undefined, false)}
                    className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-[10px] font-bold"
                  >
                    Lihat di Peta
                  </button>
                  <button
                    type="button"
                    onClick={() => updateLocation(city, undefined, true)}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold"
                  >
                    Pilih & Isi
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. Map Canvas Area (FLEXIBLE HEIGHT) */}
        <div className="relative flex-1 min-h-[180px] bg-slate-950 overflow-hidden">
          <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

          {/* Floating Instructions Banner on Top of Map */}
          <div className="absolute top-2 left-2 right-2 z-10 pointer-events-none flex items-center justify-center">
            <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 px-3.5 py-1.5 rounded-full shadow-lg text-[10px] text-slate-100 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sentuh atau klik peta untuk alihkan pin lokasi</span>
            </div>
          </div>
        </div>

        {/* 4. ALWAYS VISIBLE STICKY CONFIRMATION FOOTER (Fixed at bottom of modal) */}
        <div className="shrink-0 p-3 sm:p-4 bg-slate-900 border-t border-slate-800 shadow-2xl space-y-2.5">
          {/* Selected Address Display Card */}
          <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  📍 {selectedCity} {isResolvingAddress && '• Mengesan alamat...'}
                </div>
                <div className="text-xs font-bold text-white truncate">
                  {selectedAddress}
                </div>
              </div>
            </div>
            <div className="text-[10px] font-mono text-slate-400 shrink-0 bg-slate-900 px-2 py-1 rounded border border-slate-800">
              {coords.lat.toFixed(3)}, {coords.lng.toFixed(3)}
            </div>
          </div>

          {/* Action Buttons: Confirm & Fill Address Bar */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-xs font-bold transition-colors shrink-0 cursor-pointer"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleConfirmAndFill}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 transition-all cursor-pointer active:scale-[0.99]"
            >
              <Check className="w-4 h-4" />
              <span>✅ SAHKAN & ISI ALAMAT INI</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
