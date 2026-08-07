import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { getGumacaSchools } from "../utils/schoolDistances";
import {
  Navigation,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Crosshair,
  Maximize2,
  X,
  Compass,
  Check
} from "lucide-react";

interface PostingLocationMapProps {
  lat: number | null;
  lng: number | null;
  onChangeLocation: (lat: number, lng: number) => void;
  neighborhood?: string;
}

// Default fallback coordinates for Gumaca barangays
export const getNeighborhoodDefaultLatLng = (neighborhood?: string): [number, number] => {
  if (!neighborhood) return [13.9220, 122.0995];
  if (neighborhood.includes("Tabing Dagat")) return [13.9232, 122.1014];
  if (neighborhood.includes("Villa Nava")) return [13.9121, 122.1040];
  if (neighborhood.includes("San Diego")) return [13.9202, 122.1038];
  if (neighborhood.includes("Pipisik")) return [13.9252, 122.0975];
  if (neighborhood.includes("Peñafrancia")) return [13.9245, 122.0968];
  if (neighborhood.includes("Rizal")) return [13.9215, 122.1025];
  if (neighborhood.includes("Bagong Buhay")) return [13.9190, 122.0980];
  if (neighborhood.includes("Mabini")) return [13.9220, 122.0985];
  if (neighborhood.includes("Maunlad")) return [13.9210, 122.0965];
  if (neighborhood.includes("Buensuceso")) return [13.9280, 122.0950];
  if (neighborhood.includes("Progreso")) return [13.9180, 122.1010];
  if (neighborhood.includes("Rosario")) return [13.9240, 122.0990];
  return [13.9220, 122.0995];
};

export const PostingLocationMap: React.FC<PostingLocationMapProps> = ({
  lat,
  lng,
  onChangeLocation,
  neighborhood,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const propertyMarkerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userAccuracyCircleRef = useRef<L.Circle | null>(null);
  const schoolsLayerRef = useRef<L.LayerGroup | null>(null);

  const [isFullView, setIsFullView] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isGpsSuccess, setIsGpsSuccess] = useState(false);
  const [showSchoolsOnMap, setShowSchoolsOnMap] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
  } | null>(null);

  // Determine current active property coordinates
  const defaultCoords = getNeighborhoodDefaultLatLng(neighborhood);
  const currentLat = lat ?? defaultCoords[0];
  const currentLng = lng ?? defaultCoords[1];

  // Initialize Leaflet Map ONCE on mount
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [currentLat, currentLng],
        zoom: 16,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // Map click handler to update property pin location
      map.on("click", (e: L.LeafletMouseEvent) => {
        onChangeLocation(e.latlng.lat, e.latlng.lng);
      });

      leafletMapRef.current = map;
    }

    setTimeout(() => {
      if (leafletMapRef.current) {
        leafletMapRef.current.invalidateSize();
      }
    }, 150);

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Sync Leaflet viewport dimensions whenever isFullView changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (leafletMapRef.current) {
        leafletMapRef.current.invalidateSize();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [isFullView]);

  // Update Property Listing Pin on Map
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    const propertyIcon = L.divIcon({
      className: "custom-posting-property-pin",
      html: `
        <div class="relative flex flex-col items-center cursor-grab active:cursor-grabbing group">
          <div class="bg-indigo-600 text-white p-2 rounded-2xl shadow-xl ring-4 ring-indigo-500/30 border-2 border-white flex items-center justify-center transition-transform transform group-hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <div class="bg-indigo-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md mt-0.5 whitespace-nowrap border border-white/50">
            🏠 Inilagay na Pin
          </div>
          <div class="w-3 h-3 bg-indigo-600 rotate-45 -mt-2 border-r border-b border-white shadow-xs"></div>
        </div>
      `,
      iconSize: [120, 60],
      iconAnchor: [60, 52],
    });

    if (!propertyMarkerRef.current) {
      const marker = L.marker([currentLat, currentLng], {
        icon: propertyIcon,
        draggable: true,
      }).addTo(map);

      marker.on("dragend", (e: any) => {
        const position = e.target.getLatLng();
        onChangeLocation(position.lat, position.lng);
      });

      propertyMarkerRef.current = marker;
    } else {
      propertyMarkerRef.current.setLatLng([currentLat, currentLng]);
    }

    map.panTo([currentLat, currentLng], { animate: true });
  }, [currentLat, currentLng]);

  // Draw or update User Exact Position Marker
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || !userLocation) return;

    // User exact location pin with pulsing effect
    const userExactIcon = L.divIcon({
      className: "user-exact-gps-pin",
      html: `
        <div class="relative flex flex-col items-center">
          <div class="absolute -top-1 w-10 h-10 bg-sky-500/30 rounded-full animate-ping"></div>
          <div class="bg-sky-500 text-white p-2 rounded-full shadow-lg ring-4 ring-sky-400/50 border-2 border-white flex items-center justify-center z-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="10"/></svg>
          </div>
          <div class="bg-sky-950 text-sky-200 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md mt-1 border border-sky-400/40 whitespace-nowrap z-10">
            📍 Exact Location Mo
          </div>
        </div>
      `,
      iconSize: [110, 50],
      iconAnchor: [55, 20],
    });

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: userExactIcon,
        zIndexOffset: 1000,
      }).addTo(map);
    } else {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    }

    // Accuracy Circle
    if (!userAccuracyCircleRef.current) {
      userAccuracyCircleRef.current = L.circle([userLocation.lat, userLocation.lng], {
        radius: Math.max(userLocation.accuracy, 15),
        color: "#0284c7",
        fillColor: "#38bdf8",
        fillOpacity: 0.2,
        weight: 1.5,
      }).addTo(map);
    } else {
      userAccuracyCircleRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      userAccuracyCircleRef.current.setRadius(Math.max(userLocation.accuracy, 15));
    }
  }, [userLocation]);

  // Render all school pinpoints on PostingLocationMap if enabled
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    if (!schoolsLayerRef.current) {
      schoolsLayerRef.current = L.layerGroup().addTo(map);
    } else {
      schoolsLayerRef.current.clearLayers();
    }

    if (!showSchoolsOnMap) return;

    const schools = getGumacaSchools();
    schools.forEach((sch) => {
      const schoolIcon = L.divIcon({
        className: "custom-posting-school-marker !bg-transparent !border-none",
        html: `
          <div class="cursor-pointer group flex flex-col items-center transition-transform hover:scale-110 active:scale-95">
            <div class="relative flex items-center justify-center">
              <div class="w-7 h-7 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-amber-300 rounded-full border-2 border-amber-400 shadow-lg flex items-center justify-center">
                <span class="text-[10px]">🎓</span>
              </div>
            </div>
            <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-amber-400 -mt-0.5"></div>
            <div class="bg-indigo-950/90 text-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded shadow mt-0.5 border border-amber-400/40 whitespace-nowrap">
              ${sch.shortName || sch.name}
            </div>
          </div>
        `,
        iconSize: [100, 45],
        iconAnchor: [50, 25]
      });

      const marker = L.marker([sch.lat, sch.lng], {
        icon: schoolIcon,
        title: sch.name
      });

      marker.bindPopup(`
        <div class="p-2 font-sans min-w-[180px]">
          <div class="flex items-center gap-1.5 mb-1">
            <span class="text-sm">🎓</span>
            <strong class="text-xs font-bold text-stone-900">${sch.name}</strong>
          </div>
          <p class="text-[10px] text-stone-600 m-0">${sch.desc}</p>
        </div>
      `);

      schoolsLayerRef.current?.addLayer(marker);
    });
  }, [showSchoolsOnMap]);

  const [gpsNotice, setGpsNotice] = useState<{
    type: "warning" | "info";
    title: string;
    message: string;
  } | null>(null);

  // Process and validate obtained GPS position
  const processPosition = (position: GeolocationPosition) => {
    const userLat = position.coords.latitude;
    const userLng = position.coords.longitude;
    const accuracy = position.coords.accuracy || 20;

    setUserLocation({
      lat: userLat,
      lng: userLng,
      accuracy,
    });
    setIsLocating(false);

    // Validate if coordinates are inside Philippines (Lat 4.5..21.5, Lng 116..127)
    const isPhilippines = userLat >= 4.5 && userLat <= 21.5 && userLng >= 116.0 && userLng <= 127.0;
    // Check if within Gumaca / Quezon region (~ Lat 13.70..14.15, Lng 121.80..122.30)
    const isGumacaRegion = userLat >= 13.70 && userLat <= 14.15 && userLng >= 121.80 && userLng <= 122.30;

    if (!isPhilippines) {
      // Returned a datacenter/VPN location outside PH (e.g. Singapore, US)
      setGpsNotice({
        type: "warning",
        title: "⚠️ Pahiwatig sa VPN / Server IP Location",
        message: `Ang kasalukuyang GPS ng iyong device ay nasa labas ng Pilipinas (Lat: ${userLat.toFixed(2)}, Lng: ${userLng.toFixed(2)}). Napanatili ang inyong inilagay na pin sa mapa sa Gumaca.`
      });
      setIsGpsSuccess(false);

      if (leafletMapRef.current) {
        leafletMapRef.current.flyTo([currentLat, currentLng], 16, { animate: true });
      }
      return;
    }

    if (!isGumacaRegion) {
      // Inside PH but outside Gumaca
      setGpsNotice({
        type: "info",
        title: "📍 Nahanap ang GPS sa labas ng Gumaca",
        message: `Nakuha ang GPS ng device mo (Lat: ${userLat.toFixed(4)}, Lng: ${userLng.toFixed(4)}), ngunit ang posting na ito ay para sa Bayan ng Gumaca, Quezon. Napanatili ang inyong inilagay na pin sa mapa.`
      });
      setIsGpsSuccess(false);

      if (leafletMapRef.current) {
        leafletMapRef.current.flyTo([currentLat, currentLng], 16, { animate: true });
      }
      return;
    }

    // Valid Gumaca GPS position
    onChangeLocation(userLat, userLng);
    setGpsNotice(null);
    setIsGpsSuccess(true);

    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([userLat, userLng], 17, {
        animate: true,
        duration: 0.8,
      });
    }
  };

  // Fast GPS Trigger with immediate fallback
  const handleGetGPSLocation = () => {
    setIsLocating(true);
    setGpsError(null);
    setGpsNotice(null);
    setIsGpsSuccess(false);

    if (!navigator.geolocation) {
      setGpsError("Hindi supported ng iyong browser ang Geolocation. I-click na lamang ang pwesto sa mapa.");
      setIsLocating(false);
      return;
    }

    // Fast attempt 1: High accuracy with tight 3.5s timeout
    navigator.geolocation.getCurrentPosition(
      (pos) => processPosition(pos),
      () => {
        // Fast attempt 2: Standard accuracy (super fast < 1s via wifi/cell)
        navigator.geolocation.getCurrentPosition(
          (pos) => processPosition(pos),
          (err) => {
            setIsLocating(false);
            if (err.code === err.PERMISSION_DENIED) {
              setGpsError("Paki-tulutan ang Location Access sa browser o i-click ang pwesto sa mapa ng Gumaca.");
            } else {
              setGpsError("Hindi makuha ang GPS. Maaari mong i-click nang direkta sa mapa ang eksaktong pwesto.");
            }
          },
          { enableHighAccuracy: false, timeout: 3000, maximumAge: 300000 }
        );
      },
      { enableHighAccuracy: true, timeout: 3500, maximumAge: 60000 }
    );
  };

  // Instant Reset to Gumaca Barangay Center
  const handleResetToGumacaBarangay = () => {
    const coords = getNeighborhoodDefaultLatLng(neighborhood);
    onChangeLocation(coords[0], coords[1]);
    setGpsError(null);
    setGpsNotice(null);
    setIsGpsSuccess(false);
    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([coords[0], coords[1]], 16, { animate: true });
    }
  };

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 space-y-3">
      {/* Header & Geolocation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-indigo-100 rounded-xl text-indigo-700">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-800">
              Lokasyon sa Mapa (Gumaca, Quezon Pin) 📍
            </h4>
            <p className="text-[10px] text-stone-500">
              I-click ang eksaktong pwesto ng bahay o apartment sa Gumaca, Quezon
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap sm:flex-nowrap">
          {/* Quick Reset to Barangay Button */}
          <button
            type="button"
            onClick={handleResetToGumacaBarangay}
            className="bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-xl py-1.5 px-2.5 text-xs font-medium transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs active:scale-95 whitespace-nowrap"
            title="I-center ang pin sa napiling Barangay sa Gumaca"
          >
            <Compass className="h-3.5 w-3.5 text-indigo-600" />
            <span>Reset sa Barangay 📍</span>
          </button>

          {/* GPS Button */}
          <button
            type="button"
            onClick={handleGetGPSLocation}
            disabled={isLocating}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-1.5 px-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 disabled:opacity-60 whitespace-nowrap"
          >
            {isLocating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Kinukuha ang GPS...</span>
              </>
            ) : (
              <>
                <Navigation className="h-3.5 w-3.5 fill-white/20" />
                <span>Exact GPS Location Ko 📍</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* GPS Status & Notifications */}
      {isGpsSuccess && userLocation && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] p-2.5 rounded-xl flex items-center justify-between gap-2 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Nahanap ang Exact Location mo sa Gumaca!</strong> (Lat: {userLocation.lat.toFixed(5)}, Lng: {userLocation.lng.toFixed(5)})
            </span>
          </div>
          <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
            ±{Math.round(userLocation.accuracy)}m Accuracy
          </span>
        </div>
      )}

      {gpsNotice && (
        <div className={`p-2.5 rounded-xl border text-[11px] font-medium flex items-start gap-2 ${
          gpsNotice.type === "warning" ? "bg-amber-50 border-amber-200 text-amber-900" : "bg-blue-50 border-blue-200 text-blue-900"
        }`}>
          <AlertCircle className={`h-4 w-4 shrink-0 mt-0.5 ${gpsNotice.type === "warning" ? "text-amber-600" : "text-blue-600"}`} />
          <div className="space-y-0.5">
            <p className="font-bold">{gpsNotice.title}</p>
            <p className="text-[10px] leading-relaxed opacity-90">{gpsNotice.message}</p>
          </div>
        </div>
      )}

      {gpsError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[11px] p-2 rounded-xl flex items-center gap-1.5 font-medium">
          <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* PERSISTENT SINGLE MAP CONTAINER WRAPPER */}
      <div
        className={
          isFullView
            ? "fixed inset-0 z-[200] bg-stone-900/90 backdrop-blur-md p-2 sm:p-4 flex flex-col transition-all duration-200"
            : "relative rounded-xl overflow-hidden border border-stone-200 shadow-inner group"
        }
      >
        {/* Full View Header Bar */}
        {isFullView && (
          <div className="bg-stone-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 rounded-t-3xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 text-white rounded-2xl shadow-md">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                  Gumaca Expanded Map Location Selector 🗺️
                </h3>
                <p className="text-xs text-stone-300 font-light">
                  I-point out ang exact location o i-drag ang pin sa eksaktong pwesto.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGetGPSLocation}
                disabled={isLocating}
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl py-2 px-3.5 text-xs font-bold transition-all flex items-center gap-2 shadow-md cursor-pointer active:scale-95 disabled:opacity-60"
              >
                {isLocating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Kinukuha ang GPS...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="h-4 w-4 fill-white/20" />
                    <span>Eksaktong Lokasyon Ko 📍</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsFullView(false)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl py-2 px-4 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95"
              >
                <Check className="h-4 w-4" />
                <span>I-confirm Lokasyon</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFullView(false)}
                className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-2xl transition-colors cursor-pointer"
                title="Isara ang Full View"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* GPS Banner in Full View */}
        {isFullView && userLocation && (
          <div className="bg-sky-900 text-sky-100 text-xs px-4 py-2 border-b border-sky-800 flex items-center justify-between shrink-0 font-medium">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 bg-sky-400 rounded-full animate-ping"></span>
              <span>
                📍 Natukoy ang iyong exact GPS location: <strong>Lat {userLocation.lat.toFixed(6)}, Lng {userLocation.lng.toFixed(6)}</strong>
              </span>
            </div>
            <span className="text-[11px] bg-sky-800 px-2.5 py-0.5 rounded-full font-bold">
              Accurate within ±{Math.round(userLocation.accuracy)} meters
            </span>
          </div>
        )}

        {/* PERMANENT LEAFLET MAP ELEMENT */}
        <div className={isFullView ? "relative flex-1 w-full bg-stone-100 rounded-b-3xl overflow-hidden" : "relative w-full h-56"}>
          <div
            ref={mapContainerRef}
            className="w-full h-full z-0"
            style={{ height: isFullView ? "100%" : "220px" }}
          />

          {/* Expand Button Overlay (Compact Mode) */}
          {!isFullView && (
            <div className="absolute top-2 right-2 z-10">
              <button
                type="button"
                onClick={() => setIsFullView(true)}
                className="bg-white/90 hover:bg-white text-stone-800 p-2 rounded-xl shadow-md border border-stone-200 flex items-center gap-1 text-xs font-bold cursor-pointer backdrop-blur-xs transition-transform active:scale-95"
              >
                <Maximize2 className="h-3.5 w-3.5 text-indigo-600" />
                <span className="hidden sm:inline">I-expand</span>
              </button>
            </div>
          )}

          {/* Coordinates Overlay (Compact Mode) */}
          {!isFullView && (
            <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-xs border border-stone-200 rounded-xl p-2 shadow-md flex items-center justify-between text-[11px] z-10">
              <div className="flex items-center gap-1.5 font-mono text-stone-800">
                <Crosshair className="h-3.5 w-3.5 text-indigo-600" />
                <span className="font-semibold">Lat:</span> {currentLat.toFixed(6)},{" "}
                <span className="font-semibold">Lng:</span> {currentLng.toFixed(6)}
              </div>
              <span className="text-[10px] text-stone-500 hidden sm:inline">
                I-drag ang pin o i-click ang mapa upang palitan
              </span>
            </div>
          )}

          {/* Floating Bottom Card (Full View Mode) */}
          {isFullView && (
            <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-stone-200 shadow-xl z-10 flex flex-col space-y-2">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <Crosshair className="h-4 w-4 text-indigo-600" />
                  Selected Pin Coordinates
                </span>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md font-bold">
                  Active Pin
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-stone-50 p-2 rounded-xl border border-stone-100">
                <div>
                  <span className="text-[10px] text-stone-400 font-sans uppercase font-bold block">Latitude</span>
                  <span className="text-stone-800 font-bold">{currentLat.toFixed(6)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 font-sans uppercase font-bold block">Longitude</span>
                  <span className="text-stone-800 font-bold">{currentLng.toFixed(6)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFullView(false)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2 text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Gamitin ang Coordinates na Ito 👍
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="text-[10px] text-stone-500 italic flex items-center gap-1">
        <span>💡</span>
        <span>
          Pwedeng i-drag ang pin o pindutin ang <strong>I-expand</strong> button sa ibabaw ng mapa para sa mas malaking layout.
        </span>
      </p>
    </div>
  );
};
