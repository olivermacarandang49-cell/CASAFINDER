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
  const [schoolRevision, setSchoolRevision] = React.useState(0);

  React.useEffect(() => {
    const handleUpdate = () => {
      setSchoolRevision(r => r + 1);
    };
    window.addEventListener("casafinder_school_coords_updated", handleUpdate);
    return () => window.removeEventListener("casafinder_school_coords_updated", handleUpdate);
  }, []);

  // Parse accurate Lat/Lng from coordinates or neighborhood fallback
  const [lat, lng] = parsePropertyLatLng(coordinates, neighborhood);

  const distances: SchoolDistance[] = React.useMemo(() => {
    return getSchoolDistancesForProperty(lat, lng);
  }, [lat, lng, schoolRevision]);

  return (
    <div className="bg-gradient-to-br from-pink-50/50 via-white to-blue-50/50 border border-pink-100/80 rounded-2xl p-2.5 sm:p-3 space-y-2">
      <div className="flex items-center justify-between border-b border-pink-100/80 pb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="p-1 bg-gradient-to-tr from-pink-500 to-blue-600 text-white rounded-md shadow-2xs shrink-0">
            <GraduationCap className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <h4 className="font-display text-[11px] sm:text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1 truncate">
              {isTagalog ? "Layo sa mga Paaralan sa Gumaca 🏫" : "Distance to Schools in Gumaca 🏫"}
            </h4>
            <p className="text-[9px] sm:text-[10px] text-stone-500 font-light truncate">
              {isTagalog
                ? `Mula sa ${propertyName || "tuluyan"}`
                : `Calculated from ${propertyName || "property"}`}
            </p>
          </div>
        </div>
        <span className="text-[9px] sm:text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-200/80 px-2 py-0.5 rounded-full shrink-0">
          {isTagalog ? "Layo sa KM" : "In KM"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-1.5 max-h-72 overflow-y-auto pr-0.5 scrollbar-thin">
        {distances.map((item, idx) => {
          const isNearest = idx === 0;
          return (
            <div
              key={item.id}
              className={`p-2 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                isNearest
                  ? "bg-gradient-to-r from-pink-50/90 via-purple-50/60 to-blue-50/90 border-pink-300 shadow-2xs ring-1 ring-pink-400/20"
                  : "bg-white border-pink-100/80 hover:border-pink-300"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shrink-0 font-mono ${
                  isNearest ? "bg-gradient-to-r from-pink-500 to-blue-600 text-white" : "bg-stone-100 text-stone-600"
                }`}>
                  #{idx + 1}
                </span>

                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="font-bold text-[11px] sm:text-xs text-stone-900 leading-tight truncate">
                      {item.name}
                    </span>
                    {isNearest && (
                      <span className="bg-gradient-to-r from-pink-500 to-rose-600 text-white text-[8px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider shrink-0">
                        {isTagalog ? "Malapit 🌟" : "Nearest 🌟"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[9.5px] text-stone-500 font-medium">
                    <span className="flex items-center gap-0.5 text-pink-700 shrink-0">
                      <Footprints className="h-2.5 w-2.5 text-pink-600" />
                      ~{item.walkingMinutes}m
                    </span>
                    <span className="flex items-center gap-0.5 text-blue-700 shrink-0">
                      <Navigation className="h-2.5 w-2.5 text-blue-600" />
                      ~{item.tricycleMinutes}m trike
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-mono text-xs font-bold text-stone-900 bg-pink-50/80 px-1.5 py-0.5 rounded-md border border-pink-100">
                  {item.distanceKm.toFixed(2)} km
                </span>

                {onViewSchoolOnMap && (
                  <button
                    type="button"
                    onClick={() => onViewSchoolOnMap(item.lat, item.lng, item.name, item.id)}
                    className="p-1 bg-gradient-to-r from-pink-50 to-blue-50 hover:from-pink-100 hover:to-blue-100 text-pink-700 border border-pink-200/80 rounded-md text-[9px] font-bold flex items-center gap-0.5 transition-colors cursor-pointer shrink-0"
                    title={isTagalog ? "Tingnan sa mapa" : "View on map"}
                  >
                    <Compass className="h-3 w-3 text-pink-600" />
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
