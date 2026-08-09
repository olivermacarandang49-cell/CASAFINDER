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
    <div className="bg-gradient-to-br from-pink-50/50 via-white to-blue-50/50 border border-pink-100 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-pink-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-tr from-pink-500 to-blue-600 text-white rounded-lg shadow-xs">
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
        <span className="text-[10px] font-bold bg-gradient-to-r from-pink-50 to-blue-50 text-pink-700 border border-pink-200/80 px-2.5 py-0.5 rounded-full">
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
                  ? "bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 border-pink-300 shadow-xs ring-1 ring-pink-400/30"
                  : "bg-white border-pink-100/80 hover:border-pink-300"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md shrink-0 mt-0.5 ${
                  isNearest ? "bg-gradient-to-r from-pink-500 to-blue-600 text-white font-mono" : "bg-stone-100 text-stone-700 font-mono"
                }`}>
                  #{idx + 1}
                </span>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-xs text-stone-900 leading-snug">
                      {item.name}
                    </span>
                    {isNearest && (
                      <span className="bg-gradient-to-r from-pink-500 to-rose-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                        {isTagalog ? "Pinakamalapit 🌟" : "Nearest 🌟"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-stone-500 font-medium">
                    <span className="flex items-center gap-0.5 text-pink-700">
                      <Footprints className="h-3 w-3 text-pink-600" />
                      ~{item.walkingMinutes} {isTagalog ? "min lakad" : "min walk"}
                    </span>
                    <span className="flex items-center gap-0.5 text-blue-700">
                      <Navigation className="h-3 w-3 text-blue-600" />
                      ~{item.tricycleMinutes} {isTagalog ? "min trike" : "min trike"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0 border-t sm:border-t-0 border-pink-50">
                <div className="text-right">
                  <span className="font-mono text-sm font-extrabold text-stone-900 bg-pink-50/70 px-2.5 py-1 rounded-lg border border-pink-100 inline-block">
                    {item.distanceKm.toFixed(2)} km
                  </span>
                </div>

                {onViewSchoolOnMap && (
                  <button
                    type="button"
                    onClick={() => onViewSchoolOnMap(item.lat, item.lng, item.name, item.id)}
                    className="p-1.5 bg-gradient-to-r from-pink-50 to-blue-50 hover:from-pink-100 hover:to-blue-100 text-pink-700 border border-pink-200/80 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                    title={isTagalog ? "Tingnan sa mapa" : "View on map"}
                  >
                    <Compass className="h-3.5 w-3.5 text-pink-600" />
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
