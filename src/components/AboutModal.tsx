import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Info, GraduationCap, Building2, ShieldCheck, MapPin, Heart } from "lucide-react";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefLanguage?: string;
}

export default function AboutModal({
  isOpen,
  onClose,
  prefLanguage = "tagalog"
}: AboutModalProps) {
  if (!isOpen) return null;

  const isTagalog = prefLanguage === "tagalog";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-800 my-8 overflow-hidden"
        >
          {/* Background Ambient Glows */}
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-stone-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors cursor-pointer z-10"
            title={isTagalog ? "Isara" : "Close"}
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="text-center space-y-2 mb-6 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
              <Info className="h-3.5 w-3.5" />
              <span>{isTagalog ? "Tungkol sa CasaFinder" : "About CasaFinder"}</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              CasaFinder Gumaca 🏠
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm max-w-lg mx-auto font-light leading-relaxed">
              {isTagalog
                ? "Ang opisyal na Housing at Boarding House Directory ng Gumaca, Quezon. Idinisenyo upang tulungan ang mga estudyante, guro, at magulang na makahanap ng ligtas at abot-kayang tirahan."
                : "The official Housing & Boarding House Directory of Gumaca, Quezon. Built to help students, teachers, and parents find safe, affordable housing near schools."}
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 relative z-10">
            {/* Card 1 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-base">
                <GraduationCap className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-stone-100 text-xs">
                {isTagalog ? "Para sa Estudyante" : "For Students"}
              </h3>
              <p className="text-[11px] text-stone-300/90 leading-relaxed font-light">
                {isTagalog
                  ? "Mabilis na paghahanap ng tirahan na pasok sa budget. May kalkulasyon ng lakad at biyahe sa trike papuntang paaralan."
                  : "Quickly find budget-friendly housing with walking and tricycle time calculations to local schools."}
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all space-y-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-base">
                <Building2 className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-stone-100 text-xs">
                {isTagalog ? "Para sa Landlord" : "For Landlords"}
              </h3>
              <p className="text-[11px] text-stone-300/90 leading-relaxed font-light">
                {isTagalog
                  ? "Libreng pag-post ng bakanteng kwarto at pag-upload ng LGU Mayor's Permit at BFP Safety Certificates."
                  : "Free vacancy listings with LGU Mayor's Permit and BFP Fire Safety Certificate uploads."}
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-stone-100 text-xs">
                {isTagalog ? "Ligtas at Rehistrado" : "Safe & Verified"}
              </h3>
              <p className="text-[11px] text-stone-300/90 leading-relaxed font-light">
                {isTagalog
                  ? "May transparent 1-5 star ratings, reviews ng mga estudyante, at interactive barangay map."
                  : "Transparent student ratings, reviews, verified landlord documents, and interactive maps."}
              </p>
            </div>
          </div>

          {/* Schools Covered Badges */}
          <div className="pt-4 border-t border-white/10 space-y-2.5 text-center relative z-10">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider flex items-center justify-center gap-1">
              <MapPin className="h-3 w-3 text-amber-400" />
              <span>{isTagalog ? "Mga Nakasasakop na Paaralan sa Gumaca" : "Schools Covered in Gumaca, Quezon"}</span>
            </p>
            <div className="flex flex-wrap justify-center gap-1.5">
              <span className="px-2.5 py-1 bg-stone-800/90 border border-stone-700/80 rounded-lg text-[11px] font-medium text-stone-300">
                🏫 Southern Luzon State University (SLSU)
              </span>
              <span className="px-2.5 py-1 bg-stone-800/90 border border-stone-700/80 rounded-lg text-[11px] font-medium text-stone-300">
                🎓 Eastern Quezon College (EQC)
              </span>
              <span className="px-2.5 py-1 bg-stone-800/90 border border-stone-700/80 rounded-lg text-[11px] font-medium text-stone-300">
                ⛪ Mount Carmel College (MCC)
              </span>
              <span className="px-2.5 py-1 bg-stone-800/90 border border-stone-700/80 rounded-lg text-[11px] font-medium text-stone-300">
                🏫 Gumaca National High School (GNHS)
              </span>
              <span className="px-2.5 py-1 bg-stone-800/90 border border-stone-700/80 rounded-lg text-[11px] font-medium text-stone-300">
                🏫 Holy Child Jesus College
              </span>
            </div>
          </div>

          {/* Footer Action */}
          <div className="mt-6 pt-4 border-t border-white/10 flex justify-center relative z-10">
            <button
              type="button"
              onClick={onClose}
              className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs py-2 px-6 rounded-xl transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-1.5"
            >
              <span>{isTagalog ? "Naintindihan Ko 🆗" : "Got It 🆗"}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
