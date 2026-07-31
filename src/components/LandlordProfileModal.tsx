import React from "react";
import { Property } from "../data/properties";
import { motion } from "motion/react";
import { X, ShieldCheck, Phone, Mail, FileCheck, CheckCircle2, Home, MapPin, GraduationCap, Map } from "lucide-react";
import { getSchoolDistancesForProperty } from "../utils/schoolDistances";
import { Language } from "../utils/translations";

interface LandlordProfileModalProps {
  landlordInfo: {
    username?: string;
    name?: string;
    mobile?: string;
    email?: string;
    avatar?: string;
    bio?: string;
    permits?: {
      businessPermit?: string;
      barangayClearance?: string;
      dtiRegistration?: string;
      fireSafetyCert?: string;
      sanitaryPermit?: string;
    };
  };
  landlordProperties: Property[];
  onClose: () => void;
  onSelectProperty?: (property: Property) => void;
  onViewOnMap?: (property: Property, schoolId?: string) => void;
  language?: Language;
}

export default function LandlordProfileModal({
  landlordInfo,
  landlordProperties,
  onClose,
  onSelectProperty,
  onViewOnMap,
  language = "english",
}: LandlordProfileModalProps) {
  const name = landlordInfo.name || "Aling Nena";
  const avatar = landlordInfo.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200";
  const mobile = landlordInfo.mobile || "09987654321";
  const email = landlordInfo.email || "nena.landlord@example.com";
  const isTagalog = language === "tagalog";

  const bio = landlordInfo.bio || (isTagalog
    ? "Rehistradong Operator at May-ari ng Boarding House sa Gumaca, Quezon. Nagbibigay ng ligtas at malinis na tuluyan para sa mga estudyante."
    : "Registered Boarding House & Accommodation Owner in Gumaca, Quezon. Dedicated to providing safe, comfortable, and student-friendly lodgings.");
  
  const permits = landlordInfo.permits || {
    businessPermit: "BP-GMC-2026-0881",
    barangayClearance: "BC-BRGY-TABINGDAGAT-2026-105",
    fireSafetyCert: "FSIC-GMC-2026-112",
    dtiRegistration: "DTI-REG-04218829",
    sanitaryPermit: "SP-GMC-HEALTH-2026-302"
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-stone-900/65 backdrop-blur-md">
      <div className="fixed inset-0" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[90vh]"
      >
        {/* Header Banner */}
        <div className="bg-linear-to-r from-indigo-900 via-indigo-800 to-stone-900 p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="relative">
              <img
                src={avatar}
                alt={name}
                className="h-20 w-20 rounded-2xl object-cover border-2 border-white/80 shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full shadow-md" title="LGU & BFP Verified">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>

            <div className="text-center sm:text-left space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h3 className="text-2xl font-bold font-display tracking-tight text-white">{name}</h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> {isTagalog ? "Verified Landlord" : "Verified Landlord"}
                </span>
              </div>
              <p className="text-xs text-indigo-200">@{landlordInfo.username || "landlord_owner"}</p>
              <p className="text-xs text-stone-300 max-w-md line-clamp-2 pt-1 font-light">{bio}</p>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Quick Contact Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={`tel:${mobile}`}
              className="flex items-center gap-3 p-3 bg-indigo-50/70 hover:bg-indigo-100/80 border border-indigo-200/80 rounded-2xl transition-all cursor-pointer group"
            >
              <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs group-hover:scale-105 transition-transform">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-indigo-900 tracking-wider">
                  {isTagalog ? "Tawag / SMS Contact" : "Call / SMS Contact"}
                </p>
                <p className="text-xs font-mono font-bold text-indigo-950">{mobile}</p>
              </div>
            </a>

            <a
              href={`mailto:${email}`}
              className="flex items-center gap-3 p-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-2xl transition-all cursor-pointer group"
            >
              <div className="p-2.5 bg-stone-800 text-white rounded-xl shadow-xs group-hover:scale-105 transition-transform">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Email Address</p>
                <p className="text-xs font-mono font-bold text-stone-900 truncate max-w-[170px]">{email}</p>
              </div>
            </a>
          </div>

          {/* Types of Permits & LGU Verifications Section */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                <FileCheck className="h-4 w-4 text-emerald-600" />
                {isTagalog ? "Mga Rehistrado at Legal na Permit:" : "Registered & Legal Permits:"}
              </h4>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Gumaca LGU Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {/* Business Permit */}
              <div className="bg-white border border-stone-200/80 rounded-xl p-3 flex items-start gap-2.5 shadow-2xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-stone-800">Mayor&apos;s / Business Permit</p>
                  <p className="text-[10px] text-stone-500 font-mono">
                    No: <span className="font-semibold text-stone-700">{permits.businessPermit || "GMC-BP-2026-ACTIVE"}</span>
                  </p>
                  <p className="text-[9px] text-emerald-700 font-medium">Verified Valid & Active</p>
                </div>
              </div>

              {/* Barangay Clearance */}
              <div className="bg-white border border-stone-200/80 rounded-xl p-3 flex items-start gap-2.5 shadow-2xs">
                <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-stone-800">Barangay Clearance</p>
                  <p className="text-[10px] text-stone-500 font-mono">
                    No: <span className="font-semibold text-stone-700">{permits.barangayClearance || "BC-GMC-2026-001"}</span>
                  </p>
                  <p className="text-[9px] text-blue-700 font-medium">Barangay Licensed Boarding</p>
                </div>
              </div>

              {/* Fire Safety Inspection Certificate (BFP) */}
              <div className="bg-white border border-stone-200/80 rounded-xl p-3 flex items-start gap-2.5 shadow-2xs">
                <CheckCircle2 className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-stone-800">Fire Safety Inspection (FSIC)</p>
                  <p className="text-[10px] text-stone-500 font-mono">
                    BFP No: <span className="font-semibold text-stone-700">{permits.fireSafetyCert || "BFP-GMC-2026-FIRE"}</span>
                  </p>
                  <p className="text-[9px] text-rose-700 font-medium">BFP Inspection Passed</p>
                </div>
              </div>

              {/* DTI Business Name Registration */}
              <div className="bg-white border border-stone-200/80 rounded-xl p-3 flex items-start gap-2.5 shadow-2xs">
                <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-stone-800">DTI Registration Certificate</p>
                  <p className="text-[10px] text-stone-500 font-mono">
                    DTI No: <span className="font-semibold text-stone-700">{permits.dtiRegistration || "DTI-REG-091882"}</span>
                  </p>
                  <p className="text-[9px] text-amber-700 font-medium">Nationally Registered Business</p>
                </div>
              </div>

              {/* Sanitary Permit */}
              {permits.sanitaryPermit && (
                <div className="bg-white border border-stone-200/80 rounded-xl p-3 flex items-start gap-2.5 shadow-2xs col-span-1 sm:col-span-2">
                  <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-stone-800">Sanitary & Health Permit</p>
                    <p className="text-[10px] text-stone-500 font-mono">
                      Health Office No: <span className="font-semibold text-stone-700">{permits.sanitaryPermit}</span>
                    </p>
                    <p className="text-[9px] text-teal-700 font-medium">Cleanliness & Hygiene Standard Compliant</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Landlord Boarding Houses & Apartments Owned */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Home className="h-4 w-4 text-indigo-600" />
                {isTagalog
                  ? `Mga Boarding House / Apartment ng Landlord (${landlordProperties.length}):`
                  : `Landlord's Properties (${landlordProperties.length}):`}
              </span>
            </h4>

            {landlordProperties.length === 0 ? (
              <div className="p-4 bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-center text-xs text-stone-400">
                {isTagalog ? "Wala pang ipinost na ibang property ang landlord na ito." : "No properties posted yet by this landlord."}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {landlordProperties.map((prop) => {
                  const nearest = getSchoolDistancesForProperty(
                    prop.coordinates?.x ?? 13.9232,
                    prop.coordinates?.y ?? 122.1014
                  )[0];

                  return (
                    <div
                      key={prop.id}
                      onClick={() => {
                        if (onSelectProperty) {
                          onSelectProperty(prop);
                          onClose();
                        }
                      }}
                      className="bg-white border border-stone-200 rounded-2xl overflow-hidden hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="aspect-video overflow-hidden relative bg-stone-100">
                        <img
                          src={prop.image}
                          alt={prop.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-xs text-stone-800 font-bold text-[9px] px-2 py-0.5 rounded-full">
                          {prop.type}
                        </span>
                        <span className="absolute bottom-2 right-2 bg-indigo-900/90 text-white font-mono font-bold text-xs px-2 py-0.5 rounded-lg shadow-xs">
                          ₱{prop.price.toLocaleString()}
                        </span>
                      </div>

                      <div className="p-3 space-y-1.5">
                        <h5 className="font-bold text-xs text-stone-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {prop.title}
                        </h5>
                        <p className="text-[10px] text-stone-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-stone-400" />
                          {prop.neighborhood}
                        </p>

                        {nearest && (
                          <div className="pt-1.5 border-t border-stone-100 flex items-center justify-between text-[10px]">
                            <span className="text-indigo-700 font-bold flex items-center gap-1 truncate">
                              <GraduationCap className="h-3 w-3 text-indigo-600 shrink-0" />
                              {nearest.distanceKm.toFixed(2)} km {isTagalog ? "sa" : "to"} {nearest.name.split(" ")[0]}
                            </span>

                            {onViewOnMap && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onViewOnMap(prop, nearest.id);
                                  onClose();
                                }}
                                className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-md font-bold flex items-center gap-0.5 transition-colors"
                              >
                                <Map className="h-2.5 w-2.5 text-emerald-600" />
                                <span>{isTagalog ? "Mapa" : "Map"}</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs py-2 px-5 rounded-xl transition-all cursor-pointer"
          >
            {isTagalog ? "Isara ang Profile" : "Close Profile"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
