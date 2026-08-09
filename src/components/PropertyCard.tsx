import { Property } from "../data/properties";
import { AiMatch } from "../types";
import { motion } from "motion/react";
import { MapPin, BedDouble, Bath, Maximize, Star, UserCheck, Edit3, ShieldCheck, GraduationCap, Map } from "lucide-react";
import { getSchoolDistancesForProperty } from "../utils/schoolDistances";
import { getTranslation, Language } from "../utils/translations";

interface PropertyCardProps {
  property: Property;
  aiMatch?: AiMatch;
  onSelect: () => void;
  onEdit?: (property: Property) => void;
  onViewLandlordProfile?: (property: Property) => void;
  onViewOnMap?: (property: Property, schoolId?: string) => void;
  currentUserRole?: "student" | "landlord" | null;
  language?: Language;
  key?: string;
}

export default function PropertyCard({
  property,
  aiMatch,
  onSelect,
  onEdit,
  onViewLandlordProfile,
  onViewOnMap,
  currentUserRole,
  language = "tagalog"
}: PropertyCardProps) {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);
  // Format price helper
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Nearest school distance calculation
  const schoolDistances = getSchoolDistancesForProperty(
    property.coordinates,
    property.neighborhood
  );
  const nearestSchool = schoolDistances[0];

  // Calculate student reviews rating
  const reviews = property.reviews || [];
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  // Determine score color/badge
  const getScoreBadgeStyles = (score: number) => {
    if (score >= 90) return "bg-amber-500/10 text-amber-600 border-amber-500/30 ring-4 ring-amber-500/5";
    if (score >= 70) return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30";
    return "bg-stone-100 text-stone-600 border-stone-200";
  };

  return (
    <motion.div
      id={`property-card-${property.id}`}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-stone-200/80 bg-white transition-all duration-300 hover:border-pink-400 hover:shadow-xl hover:shadow-pink-500/10 cursor-pointer"
      onClick={onSelect}
    >
      {/* Property Image & Overlays */}
      <div className="relative aspect-video overflow-hidden bg-stone-100">
        <img
          src={property.image}
          alt={property.title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />

        {/* Property Type & Gender Policy Badges */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-wrap gap-1 items-center max-w-[85%]">
          <span className="rounded-full bg-stone-900/80 backdrop-blur-md px-2.5 py-1 text-[9px] sm:text-[10px] font-bold text-white shadow-xs border border-white/20">
            {property.type}
          </span>
          {property.genderPolicy === "Girls Only" && (
            <span className="rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold px-2.5 py-1 text-[9px] sm:text-[10px] shadow-xs">
              👧 {language === "tagalog" ? "Pang-babe" : "Girls Only"}
            </span>
          )}
          {property.genderPolicy === "Boys Only" && (
            <span className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold px-2.5 py-1 text-[9px] sm:text-[10px] shadow-xs">
              👦 {language === "tagalog" ? "Pang-lalaki" : "Boys Only"}
            </span>
          )}
          {property.genderPolicy === "Both" && (
            <span className="rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 text-white font-bold px-2.5 py-1 text-[9px] sm:text-[10px] shadow-xs">
              🚻 Co-ed
            </span>
          )}
        </div>

        {/* AI Match Score Badge */}
        {aiMatch && (
          <div className={`absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1 rounded-full border px-2.5 py-1 text-[9px] sm:text-xs font-semibold backdrop-blur-md shadow-xs transition-all duration-300 ${getScoreBadgeStyles(aiMatch.score)}`}>
            <span>{aiMatch.score}%</span>
          </div>
        )}

        {/* Location Tag Bottom-Left overlay */}
        <div className="absolute bottom-2 left-2.5 sm:bottom-3 sm:left-3 flex items-center gap-1 text-white max-w-[90%] truncate">
          <MapPin className="h-3.5 w-3.5 text-pink-400 shrink-0 drop-shadow-xs" />
          <span className="text-[10px] sm:text-xs font-semibold text-white shadow-xs drop-shadow-md truncate">
            {property.neighborhood}, {property.city}
          </span>
        </div>
      </div>

      {/* Card Info Content */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-5">
        <div className="mb-1.5 sm:mb-2 flex items-center justify-between gap-1 flex-wrap">
          <span className="font-display text-lg sm:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-indigo-600">
            {formatPrice(property.price)}
            <span className="text-[10px] sm:text-xs font-sans font-medium text-stone-400 ml-0.5">{t("perMonth")}</span>
          </span>

          <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-xl border border-amber-200 text-[10px] sm:text-xs font-bold text-amber-800 shrink-0">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
            <span>{avgRating ? avgRating : "New"}</span>
            {reviews.length > 0 && (
              <span className="text-[9px] text-amber-600/70 font-normal">({reviews.length})</span>
            )}
          </div>
        </div>

        <h3 className="mb-1.5 font-display text-sm sm:text-base font-bold leading-snug text-stone-900 group-hover:text-pink-600 transition-colors line-clamp-1">
          {property.title}
        </h3>

        <p className="mb-3 line-clamp-2 text-[11px] sm:text-xs leading-relaxed text-stone-500 font-light">
          {property.description}
        </p>

        {/* School Distance Badge */}
        {nearestSchool && (
          <div
            onClick={(e) => {
              if (onViewOnMap) {
                e.stopPropagation();
                onViewOnMap(property, nearestSchool.id);
              }
            }}
            className="mb-3 bg-gradient-to-r from-pink-50/90 via-indigo-50/50 to-blue-50/90 hover:from-pink-100 hover:to-indigo-100 border border-pink-200/80 rounded-xl p-2 flex items-center justify-between text-xs text-stone-800 font-medium transition-colors cursor-pointer group/school gap-1 shadow-2xs"
            title="I-click para makita ang linya papuntang paaralan sa mapa"
          >
            <div className="flex items-center gap-1.5 truncate">
              <GraduationCap className="h-3.5 w-3.5 text-pink-600 shrink-0" />
              <span className="truncate text-[10px] sm:text-[11px]">
                <strong>{nearestSchool.distanceKm.toFixed(1)}km</strong> {nearestSchool.shortName || nearestSchool.name.replace(/ [🎓🏫🏛️]/g, '')}
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] bg-gradient-to-r from-pink-500 to-indigo-600 group-hover/school:from-pink-600 group-hover/school:to-indigo-700 text-white font-mono font-bold px-2 py-0.5 rounded-md shrink-0 shadow-2xs">
              {nearestSchool.walkingMinutes}m
            </span>
          </div>
        )}

        {/* Features Row */}
        <div className="mb-3 flex flex-wrap gap-1">
          {property.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-lg bg-stone-100/80 px-2 py-0.5 text-[10px] font-medium text-stone-600 border border-stone-200/60 truncate max-w-[120px]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Spacer & Specs */}
        <div className="mt-auto pt-3 border-t border-stone-100 flex items-center justify-between text-stone-500 gap-1">
          {/* Specs */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5 text-stone-400" />
              <strong className="text-stone-700">{property.beds}</strong> <span className="text-stone-400 hidden sm:inline">bed</span>
            </span>
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5 text-stone-400" />
              <strong className="text-stone-700">{property.baths}</strong> <span className="text-stone-400 hidden sm:inline">bath</span>
            </span>
          </div>

          {/* Edit Button for Landlords */}
          {currentUserRole === "landlord" && onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(property);
              }}
              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Edit3 className="h-3 w-3 text-amber-600" />
              <span>Edit</span>
            </button>
          )}
        </div>

        {/* Landlord Profile Bar */}
        <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs gap-1">
          <div
            className={`flex items-center gap-2 min-w-0 ${onViewLandlordProfile ? "cursor-pointer group/owner hover:opacity-80 transition-opacity" : ""}`}
            onClick={(e) => {
              if (onViewLandlordProfile) {
                e.stopPropagation();
                onViewLandlordProfile(property);
              }
            }}
          >
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-stone-200 overflow-hidden shrink-0 border border-stone-300">
              {property.landlordAvatar ? (
                <img
                  src={property.landlordAvatar}
                  alt={property.landlordName || "Landlord"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">
                  {(property.landlordName || "L").charAt(0)}
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-stone-800 leading-none flex items-center gap-1 truncate group-hover/owner:text-indigo-600 transition-colors">
                <span className="truncate">{property.landlordName || "Owner"}</span>
                {property.landlordPermits?.businessPermit && (
                  <ShieldCheck className="h-3 w-3 text-emerald-600 shrink-0" />
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {onViewOnMap && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewOnMap(property);
                }}
                className="p-1 sm:px-2.5 sm:py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-lg text-[10px] sm:text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="Tingnan ang lokasyon sa interactive map"
              >
                <Map className="h-3 w-3 text-emerald-600" />
                <span className="hidden sm:inline">Mapa</span>
              </button>
            )}

            {onViewLandlordProfile && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewLandlordProfile(property);
                }}
                className="p-1 sm:px-2.5 sm:py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-lg text-[10px] sm:text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <UserCheck className="h-3 w-3 text-indigo-600" />
                <span className="hidden sm:inline">Profile</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AI Recommendation Context Footer */}
      {aiMatch && aiMatch.reason && (
        <div id={`property-match-reason-${property.id}`} className="bg-amber-500/5 border-t border-amber-500/10 px-5 py-3 text-xs text-amber-800 flex gap-2 items-start">
          <p className="italic leading-relaxed">
            {aiMatch.reason}
          </p>
        </div>
      )}
    </motion.div>
  );
}
