import React from "react";
import { getSchoolDistancesForProperty, parsePropertyLatLng, SchoolDistance } from "../utils/schoolDistances";
import { GraduationCap, MapPin, Footprints, Navigation, Compass } from "lucide-react";

interface SchoolDistancesListProps {
  coordinates?: { x: number; y: number };
  propertyName?: string;
  neighborhood?: string;
  onViewSchoolOnMap?: (schoolLat: number, schoolLng: number, schoolName: string, schoolId: string) => void;
  language?: string;
}

export function SchoolDistancesList({
  coordinates,
  propertyName,
  neighborhood,
  onViewSchoolOnMap,
  language = "tagalog"
}: SchoolDistancesListProps) {
  const isTagalog = language === "tagalog";
  // Parse accurate Lat/Lng from coordinates or neighborhood fallback
  const [lat, lng] = parsePropertyLatLng(coordinates, neighborhood);

  const distances: SchoolDistance[] = getSchoolDistancesForProperty(lat, lng);

  return (
    <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-stone-200/60 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-xs">
            <GraduationCap className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-display text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              {isTagalog ? "Layo sa mga Paaralan sa Gumaca, Quezon 🏫" : "Distance to Schools in Gumaca, Quezon 🏫"}
            </h4>
            <p className="text-[10px] text-stone-500 font-light">
              {isTagalog
                ? `Kinalkula mula sa ${propertyName || "boarding house / apartment"}`
                : `Calculated from ${propertyName || "boarding house / apartment"}`}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
          {isTagalog ? "Layo sa KM" : "Distance in KM"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5 max-h-64 overflow-y-auto pr-1">
        {distances.map((item, idx) => {
          const isNearest = idx === 0;
          return (
            <div
              key={item.id}
              className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                isNearest
                  ? "bg-amber-50/90 border-amber-300/80 shadow-xs ring-1 ring-amber-400/30"
                  : "bg-white border-stone-200/80 hover:border-stone-300"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md shrink-0 mt-0.5 ${
                  isNearest ? "bg-amber-500 text-stone-950 font-mono" : "bg-stone-100 text-stone-700 font-mono"
                }`}>
                  #{idx + 1}
                </span>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-xs text-stone-900 leading-snug">
                      {item.name}
                    </span>
                    {isNearest && (
                      <span className="bg-amber-500 text-stone-950 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                        {isTagalog ? "Pinakamalapit 🌟" : "Nearest 🌟"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-stone-500 font-medium">
                    <span className="flex items-center gap-0.5 text-indigo-700">
                      <Footprints className="h-3 w-3 text-indigo-600" />
                      ~{item.walkingMinutes} {isTagalog ? "min lakad" : "min walk"}
                    </span>
                    <span className="flex items-center gap-0.5 text-emerald-700">
                      <Navigation className="h-3 w-3 text-emerald-600" />
                      ~{item.tricycleMinutes} {isTagalog ? "min trike" : "min trike"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                <div className="text-right">
                  <span className="font-mono text-sm font-extrabold text-stone-900 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200 inline-block">
                    {item.distanceKm.toFixed(2)} km
                  </span>
                </div>

                {onViewSchoolOnMap && (
                  <button
                    type="button"
                    onClick={() => onViewSchoolOnMap(item.lat, item.lng, item.name, item.id)}
                    className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                    title={isTagalog ? "Tingnan sa mapa" : "View on map"}
                  >
                    <Compass className="h-3.5 w-3.5" />
                    <span className="hidden xs:inline">{isTagalog ? "Mapa" : "Map"}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
