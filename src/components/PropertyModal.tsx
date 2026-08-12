import React, { useState } from "react";
import { Property } from "../data/properties";
import { AiMatch } from "../types";
import { motion } from "motion/react";
import { X, Home, Calendar, Flame, Car, CheckCircle, Trash2, Star, MessageSquare, Reply, CornerDownRight, ShieldCheck, MapPin, Map, AlertTriangle, MessageCircle, Send, Copy, Check, Facebook, Phone, GraduationCap } from "lucide-react";
import { SchoolDistancesList } from "./SchoolDistancesList";
import { getTranslation, Language } from "../utils/translations";

interface PropertyModalProps {
  property: Property;
  aiMatch?: AiMatch;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (property: Property) => void;
  onViewLandlordProfile?: (property: Property) => void;
  onViewOnMap?: (property: Property, schoolId?: string) => void;
  userSession?: { role: "student" | "landlord" | "admin"; name: string; username: string } | null;
  onAddReview?: (propertyId: string, rating: number, comment: string) => void;
  onAddReply?: (propertyId: string, reviewId: string, comment: string) => void;
  language?: Language;
}

export default function PropertyModal({
  property,
  aiMatch,
  onClose,
  onDelete,
  onEdit,
  onViewLandlordProfile,
  onViewOnMap,
  userSession,
  onAddReview,
  onAddReply,
  language = "tagalog"
}: PropertyModalProps) {
  const isTagalog = language === "tagalog";
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);
  
  // Mobile Tab State
  const [mobileTab, setMobileTab] = useState<"details" | "schools" | "contact" | "reviews">("details");

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Reply state
  const [activeReplyReviewId, setActiveReplyReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Contact & SMS Template state for students
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);
  const [copiedMessage, setCopiedMessage] = useState(false);

  const contactTemplates = [
    isTagalog 
      ? `Magandang araw po! Available pa po ba ang slot sa ${property.title} sa Brgy. ${property.neighborhood}? Magkano po ang advance/deposit?`
      : `Hello! Is the slot still available at ${property.title} in Brgy. ${property.neighborhood}? How much is the advance/deposit?`,
    isTagalog
      ? `Hello po! Student po ako sa Gumaca. Kailan po pwedeng pumunta para mag-viewing sa ${property.title}?`
      : `Hello! I am a student in Gumaca. When can I visit for a viewing at ${property.title}?`,
    isTagalog
      ? `Hi po! Tanong ko lang po kung kasama na sa ₱${property.price.toLocaleString()}/month ang kuryente at tubig sa ${property.title}? Thank you po!`
      : `Hi! May I ask if electricity and water are included in the ₱${property.price.toLocaleString()}/month rent for ${property.title}? Thank you!`
  ];

  const [contactMessage, setContactMessage] = useState(contactTemplates[0]);

  React.useEffect(() => {
    setContactMessage(contactTemplates[selectedTemplateIndex]);
  }, [selectedTemplateIndex, property.id, language]);

  const reviews = property.reviews || [];
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddReview) {
      onAddReview(property.id, rating, comment);
      setComment("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  const handleSendReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    if (onAddReply) {
      onAddReply(property.id, reviewId, replyText);
      setReplyText("");
      setActiveReplyReviewId(null);
    }
  };

  // Render Landlord Card Component
  const renderLandlordCard = () => (
    <div className="p-4 bg-white rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
      <div
        className={`flex items-center gap-3 ${onViewLandlordProfile ? "cursor-pointer group hover:bg-stone-50 p-1.5 -m-1.5 rounded-xl transition-colors" : ""}`}
        onClick={() => onViewLandlordProfile && onViewLandlordProfile(property)}
      >
        <div className="h-10 w-10 rounded-full bg-stone-200 overflow-hidden shrink-0 border border-stone-300 group-hover:border-indigo-400">
          {property.landlordAvatar ? (
            <img src={property.landlordAvatar} alt={property.landlordName || "Landlord"} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
              {(property.landlordName || "L").charAt(0)}
            </div>
          )}
        </div>
        <div>
          <h5 className="text-xs font-bold text-stone-900 flex items-center gap-1 group-hover:text-indigo-600 transition-colors">
            {property.landlordName || (isTagalog ? "Pumunta sa profile ng landlord" : "Go to landlord profile")}
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          </h5>
          <p className="text-[10px] text-stone-400">{isTagalog ? "Rehistradong Operator • I-click para sa profile 👤" : "Verified Boarding Operator • Click for profile 👤"}</p>
        </div>
      </div>

      {property.landlordPermits && (
        <div className="pt-2 border-t border-stone-100 space-y-1.5">
          <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
            {isTagalog ? "Mga Rehistradong Permit sa LGU at BFP:" : "Verified LGU & BFP Permits:"}
          </p>
          <div className="flex flex-wrap gap-1">
            {property.landlordPermits.businessPermit && (
              <span className="text-[9px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle className="h-2.5 w-2.5 text-emerald-600" />
                Business Permit
              </span>
            )}
            {property.landlordPermits.barangayClearance && (
              <span className="text-[9px] font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle className="h-2.5 w-2.5 text-blue-600" />
                Brgy Clearance
              </span>
            )}
            {property.landlordPermits.fireSafetyCert && (
              <span className="text-[9px] font-bold bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle className="h-2.5 w-2.5 text-rose-600" />
                Fire Safety (BFP)
              </span>
            )}
            {property.landlordPermits.dtiRegistration && (
              <span className="text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle className="h-2.5 w-2.5 text-amber-600" />
                DTI Registered
              </span>
            )}
          </div>
        </div>
      )}

      {onViewLandlordProfile && (
        <button
          type="button"
          onClick={() => onViewLandlordProfile(property)}
          className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl py-2 px-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
          <span>{isTagalog ? "Tingnan ang Profile ng Landlord 👤" : "View Landlord Profile 👤"}</span>
        </button>
      )}
    </div>
  );

  // Render Direct Contact & SMS Card
  const renderDirectContactCard = () => (
    <div className="p-4 bg-gradient-to-br from-indigo-50/90 via-white to-pink-50/50 rounded-2xl border border-indigo-200/80 shadow-xs space-y-3">
      <div className="flex items-center justify-between gap-1 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
          <MessageCircle className="h-4 w-4 text-indigo-600 shrink-0" />
          <span>{isTagalog ? "Direktang Kontak at Chat sa Landlord" : "Direct Landlord Contact & Chat"}</span>
        </div>
        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200 font-mono">
          📱 {property.landlordMobile || "09987654321"}
        </span>
      </div>

      <p className="text-[11px] text-stone-600 leading-snug font-light">
        {isTagalog 
          ? "Pumili ng template o i-customize ang mensahe para mag-text (SMS), mag-call, o mag-Messenger:" 
          : "Select a pre-filled template or edit the message to send an SMS, call, or open Messenger:"}
      </p>

      <div className="flex flex-wrap gap-1.5 pt-0.5">
        {contactTemplates.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setSelectedTemplateIndex(idx)}
            className={`text-[10px] font-medium px-2.5 py-1 rounded-xl transition-all cursor-pointer border ${
              selectedTemplateIndex === idx
                ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs font-bold"
                : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
            }`}
          >
            {idx === 0 && (isTagalog ? "🏠 Slot & Upa" : "🏠 Slot & Rent")}
            {idx === 1 && (isTagalog ? "🗓️ Viewing" : "🗓️ Visit")}
            {idx === 2 && (isTagalog ? "⚡ Kuryente/Tubig" : "⚡ Utilities")}
          </button>
        ))}
      </div>

      <textarea
        rows={3}
        value={contactMessage}
        onChange={(e) => setContactMessage(e.target.value)}
        className="w-full bg-white border border-indigo-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-2.5 text-xs text-stone-800 font-medium leading-relaxed resize-none shadow-2xs focus:outline-hidden"
      />

      <div className="grid grid-cols-2 gap-2 pt-1">
        <a
          href={`sms:${property.landlordMobile || "09987654321"}?body=${encodeURIComponent(contactMessage)}`}
          className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2 px-3 text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
        >
          <Send className="h-3.5 w-3.5" />
          <span>{isTagalog ? "I-Text / SMS 📱" : "Send SMS 📱"}</span>
        </a>

        <a
          href={property.landlordFacebook ? (property.landlordFacebook.startsWith("http") ? property.landlordFacebook : `https://${property.landlordFacebook}`) : `https://facebook.com`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            navigator.clipboard.writeText(contactMessage);
          }}
          className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2 px-3 text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
          title={isTagalog ? "Nakokopya ang mensahe sa clipboard para ma-paste sa Messenger" : "Auto-copies message to clipboard for easy Messenger pasting"}
        >
          <Facebook className="h-3.5 w-3.5" />
          <span>{isTagalog ? "Messenger 💬" : "Messenger 💬"}</span>
        </a>

        <a
          href={`tel:${property.landlordMobile || "09987654321"}`}
          className="flex items-center justify-center gap-1.5 bg-stone-800 hover:bg-stone-900 text-white rounded-xl py-2 px-3 text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
        >
          <Phone className="h-3.5 w-3.5 text-amber-400" />
          <span>{isTagalog ? "Tawag 📞" : "Call Landlord 📞"}</span>
        </a>

        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(contactMessage);
            setCopiedMessage(true);
            setTimeout(() => setCopiedMessage(false), 2500);
          }}
          className="flex items-center justify-center gap-1.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 rounded-xl py-2 px-3 text-xs font-bold transition-all cursor-pointer active:scale-95"
        >
          {copiedMessage ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-emerald-700">{isTagalog ? "Nakopya Na! 📋" : "Copied! 📋"}</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-stone-500" />
              <span>{isTagalog ? "Kopyahin 📋" : "Copy Text 📋"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  // Render Reviews Section
  const renderReviewsSection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
            {isTagalog ? "Mga Rating at Review ng Estudyante 🎓" : "Student Ratings & Reviews 🎓"}
          </h4>
          <p className="text-xs text-stone-500 font-light mt-0.5">
            {avgRating
              ? (isTagalog
                  ? `${avgRating} mula sa 5 bituin (${reviews.length} ${reviews.length === 1 ? 'review' : 'mga review'})`
                  : `${avgRating} out of 5 stars (${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'})`)
              : (isTagalog ? "Wala pang rating. Maging una sa pag-rate!" : "No student ratings yet. Be the first to rate!")}
          </p>
        </div>

        {avgRating && (
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-xl text-amber-900 text-sm font-bold">
            <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
            <span>{avgRating} / 5</span>
          </div>
        )}
      </div>

      {userSession?.role === "student" ? (
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
          <p className="text-xs font-bold text-stone-800">
            {isTagalog ? "Maglagay ng Rating sa Tuluyan na ito (1-5 Bituin):" : "Rate this Boarding House / Apartment (1-5 Stars):"}
          </p>

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span>{isTagalog ? "Nailagay na ang iyong rating! Maraming salamat. 🎉" : "Your rating has been submitted! Thank you. 🎉"}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-3">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`h-7 w-7 transition-colors ${
                        star <= (hoverRating || rating)
                          ? "fill-amber-400 text-amber-500"
                          : "text-stone-300 fill-stone-100"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-bold text-stone-700 font-mono">
                  {hoverRating || rating} / 5 {isTagalog ? "Bituin" : "Stars"}
                </span>
              </div>

              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={isTagalog ? "Mag-iwan ng komento o feedback para sa ibang estudyante (opsyonal)..." : "Leave a comment or feedback for other students (optional)..."}
                className="w-full bg-white border border-stone-200 rounded-xl p-2.5 text-xs text-stone-800 focus:outline-hidden focus:border-amber-500 resize-none font-light"
              />

              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2 px-4 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Star className="h-3.5 w-3.5 fill-white" />
                {isTagalog ? "I-submit ang Rating ⭐️" : "Submit Student Rating ⭐️"}
              </button>
            </form>
          )}
        </div>
      ) : (
        <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-3 text-[11px] text-amber-900 leading-relaxed">
          {isTagalog ? (
            <span>💡 Mag-log in bilang <strong>Student</strong> account upang makapaglagay ng 1-5 star rating at review para sa tuluyan na ito!</span>
          ) : (
            <span>💡 Log in with a <strong>Student</strong> account to leave a 1-5 star rating and review for this property!</span>
          )}
        </div>
      )}

      <div className="space-y-3">
        {reviews.length === 0 ? (
          <p className="text-xs text-stone-400 italic text-center py-4 bg-stone-50 rounded-xl border border-dashed border-stone-200">
            {isTagalog ? "Wala pang mga review o rating para sa tuluyan na ito." : "No reviews or ratings yet for this property."}
          </p>
        ) : (
          reviews.map((rev) => (
            <div key={rev.id} className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-stone-800">{rev.studentName}</span>
                  <span className="text-[10px] text-stone-400 font-mono">@{rev.studentUsername}</span>
                </div>
                <span className="text-[10px] text-stone-400 font-mono">{rev.date}</span>
              </div>

              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3.5 w-3.5 ${
                      star <= rev.rating
                        ? "fill-amber-400 text-amber-500"
                        : "text-stone-300 fill-stone-100"
                    }`}
                  />
                ))}
                <span className="ml-1 text-[11px] font-bold text-amber-700">{rev.rating}.0</span>
              </div>

              {rev.comment && (
                <p className="text-xs text-stone-700 font-normal leading-relaxed">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              )}

              {rev.replies && rev.replies.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-stone-200/80 space-y-2 pl-3 border-l-2 border-indigo-400/80">
                  {rev.replies.map((reply) => (
                    <div key={reply.id} className="bg-white/90 border border-stone-200 rounded-lg p-2.5 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <CornerDownRight className="h-3 w-3 text-indigo-500 shrink-0" />
                          <span className="font-bold text-stone-800">{reply.authorName}</span>
                          {reply.authorRole === "landlord" ? (
                            <span className="bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.2 rounded text-[9px] flex items-center gap-0.5">
                              <ShieldCheck className="h-2.5 w-2.5 text-indigo-600" />
                              Owner / Landlord
                            </span>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded text-[9px]">
                              Student
                            </span>
                          )}
                        </div>
                        <span className="text-stone-400 font-mono">{reply.date}</span>
                      </div>
                      <p className="text-xs text-stone-700 font-light pl-4">
                        {reply.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-1 flex items-center justify-between">
                {activeReplyReviewId !== rev.id && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveReplyReviewId(rev.id);
                      setReplyText("");
                    }}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Reply className="h-3 w-3" />
                    <span>{isTagalog ? "Sumagot sa review na ito" : "Reply to this review"}</span>
                  </button>
                )}
              </div>

              {activeReplyReviewId === rev.id && (
                <div className="mt-2 bg-white border border-indigo-200 rounded-xl p-3 space-y-2 shadow-xs">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-900">
                    <MessageSquare className="h-3.5 w-3.5 text-indigo-600" />
                    <span>{isTagalog ? `Iyong Tugon / Reply (naka-login bilang ${userSession?.name || "User"}):` : `Your Reply (logged in as ${userSession?.name || "User"}):`}</span>
                  </div>
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={isTagalog ? "Isulat ang iyong klaripikasyon o sagot sa review na ito..." : "Write your response or clarification for this review..."}
                    className="w-full bg-stone-50 border border-stone-200 focus:border-indigo-500 focus:bg-white rounded-lg p-2 text-xs text-stone-800 focus:outline-hidden resize-none"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveReplyReviewId(null);
                        setReplyText("");
                      }}
                      className="px-3 py-1 text-[11px] font-semibold text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
                    >
                      {isTagalog ? "Kanselahin" : "Cancel"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendReply(rev.id)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold py-1 px-3 rounded-lg transition-all cursor-pointer shadow-xs flex items-center gap-1"
                    >
                      <Reply className="h-3 w-3" />
                      <span>{isTagalog ? "Ipadala ang Reply 🚀" : "Send Reply 🚀"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-stone-900/60 backdrop-blur-md">
      {/* Backdrop click closer */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <motion.div
        id={`property-modal-${property.id}`}
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-5xl max-h-[92vh] bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-stone-200"
      >
        {/* Close Button */}
        <button
          id="close-modal-btn"
          onClick={onClose}
          className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-20 p-1.5 sm:p-2 bg-white/90 backdrop-blur-xs text-stone-700 hover:text-stone-950 rounded-full border border-stone-200 shadow-md hover:scale-105 transition-all cursor-pointer"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        {/* =========================================================================
            MOBILE VIEW (Screens < md) - Clean Segmented Navigation Tabs
           ========================================================================= */}
        <div className="flex md:hidden flex-col w-full max-h-[90vh] bg-white overflow-hidden">
          {/* Mobile Header Banner */}
          <div className="p-3.5 border-b border-stone-200 bg-stone-50/90 pr-10">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-stone-200 text-stone-700">
                {property.type}
              </span>
              {property.genderPolicy === "Girls Only" && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-pink-100 text-pink-800 border border-pink-200">
                  👧 {isTagalog ? "Mga Babae" : "Girls"}
                </span>
              )}
              {property.genderPolicy === "Boys Only" && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  👦 {isTagalog ? "Mga Lalaki" : "Boys"}
                </span>
              )}
              {property.genderPolicy === "Both" && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                  👫 Co-ed
                </span>
              )}
            </div>
            <h3 className="font-display text-lg font-bold text-stone-900 leading-snug line-clamp-1">
              {property.title}
            </h3>
            <div className="flex items-center justify-between gap-2 mt-1">
              <p className="text-[11px] text-stone-500 truncate flex items-center gap-1">
                <MapPin className="h-3 w-3 text-pink-500 shrink-0" />
                <span>{property.neighborhood}, {property.city}</span>
              </p>
              <span className="font-display text-sm font-black text-pink-600 shrink-0">
                ₱{property.price.toLocaleString()}<span className="text-[10px] text-stone-400 font-sans font-normal">/mo</span>
              </span>
            </div>
          </div>

          {/* Mobile Segmented Navigation Tabs */}
          <div className="flex items-center justify-around border-b border-stone-200 bg-stone-100/80 p-1 shrink-0 gap-1 overflow-x-auto no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button
              type="button"
              onClick={() => setMobileTab("details")}
              className={`flex-1 py-1.5 px-2 text-center rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap ${
                mobileTab === "details"
                  ? "bg-stone-900 text-white shadow-xs"
                  : "bg-white text-stone-700 border border-stone-200"
              }`}
            >
              <Home className="h-3.5 w-3.5 text-pink-400" />
              <span>{isTagalog ? "Detalye" : "Details"}</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileTab("schools")}
              className={`flex-1 py-1.5 px-2 text-center rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap ${
                mobileTab === "schools"
                  ? "bg-stone-900 text-white shadow-xs"
                  : "bg-white text-stone-700 border border-stone-200"
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5 text-blue-400" />
              <span>{isTagalog ? "Paaralan" : "Schools"}</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileTab("contact")}
              className={`flex-1 py-1.5 px-2 text-center rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap ${
                mobileTab === "contact"
                  ? "bg-stone-900 text-white shadow-xs"
                  : "bg-white text-stone-700 border border-stone-200"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>{isTagalog ? "Owner & SMS" : "Owner & SMS"}</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileTab("reviews")}
              className={`flex-1 py-1.5 px-2 text-center rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap ${
                mobileTab === "reviews"
                  ? "bg-stone-900 text-white shadow-xs"
                  : "bg-white text-stone-700 border border-stone-200"
              }`}
            >
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>Reviews ({reviews.length})</span>
            </button>
          </div>

          {/* Mobile Tab Content Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {mobileTab === "details" && (
              <>
                <div className="relative rounded-2xl overflow-hidden aspect-video bg-stone-100 border border-stone-100">
                  <img src={property.image} alt={property.title} className="w-full h-full object-cover" />
                </div>

                {/* Quick Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMobileTab("contact")}
                    className="py-2.5 px-3 bg-emerald-600 active:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{isTagalog ? "I-Text ang Owner 📱" : "SMS Landlord 📱"}</span>
                  </button>
                  {onViewOnMap && (
                    <button
                      type="button"
                      onClick={() => onViewOnMap(property)}
                      className="py-2.5 px-3 bg-gradient-to-r from-pink-500 to-blue-600 active:from-pink-600 active:to-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                    >
                      <Map className="h-3.5 w-3.5" />
                      <span>{isTagalog ? "Interactive Map 🗺️" : "View Map 🗺️"}</span>
                    </button>
                  )}
                </div>

                {/* Description Overview */}
                <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/70">
                  <h4 className="font-display text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                    {isTagalog ? "Pangkalahatang Detalye ng Tuluyan" : "Property Overview"}
                  </h4>
                  <p className="text-stone-700 text-xs leading-relaxed font-light whitespace-pre-line">
                    {property.description}
                  </p>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/50 flex items-center gap-2">
                    <Home className="h-4 w-4 text-stone-600 shrink-0" />
                    <div>
                      <p className="text-[9px] uppercase font-bold text-stone-400">{isTagalog ? "Uri" : "Type"}</p>
                      <p className="text-xs font-bold text-stone-800">{property.type}</p>
                    </div>
                  </div>
                  <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/50 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-stone-600 shrink-0" />
                    <div>
                      <p className="text-[9px] uppercase font-bold text-stone-400">{isTagalog ? "Taon" : "Year"}</p>
                      <p className="text-xs font-bold text-stone-800">{property.yearBuilt}</p>
                    </div>
                  </div>
                  <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/50 flex items-center gap-2">
                    <Car className="h-4 w-4 text-stone-600 shrink-0" />
                    <div>
                      <p className="text-[9px] uppercase font-bold text-stone-400">{isTagalog ? "Aparaduhan" : "Parking"}</p>
                      <p className="text-xs font-bold text-stone-800 truncate">{property.parking}</p>
                    </div>
                  </div>
                  <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/50 flex items-center gap-2">
                    <Flame className="h-4 w-4 text-stone-600 shrink-0" />
                    <div>
                      <p className="text-[9px] uppercase font-bold text-stone-400">{isTagalog ? "Palamig" : "Cooling"}</p>
                      <p className="text-xs font-bold text-stone-800 truncate">{property.heating}</p>
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/70">
                  <h4 className="font-display text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                    {isTagalog ? "Mga Pasilidad at Amenidad" : "Interior & Amenities"}
                  </h4>
                  <div className="grid grid-cols-1 gap-1.5">
                    {property.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-stone-700 text-xs">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {mobileTab === "schools" && (
              <div className="space-y-4">
                <SchoolDistancesList
                  coordinates={property.coordinates}
                  propertyName={property.title}
                  neighborhood={property.neighborhood}
                  language={language}
                  onViewSchoolOnMap={(lat, lng, name, schoolId) => {
                    if (onViewOnMap) onViewOnMap(property, schoolId);
                  }}
                />
              </div>
            )}

            {mobileTab === "contact" && (
              <div className="space-y-4">
                {/* Landlord Card */}
                {renderLandlordCard()}
                {/* Direct Contact & SMS */}
                {renderDirectContactCard()}
                {/* Landlord Actions */}
                {userSession?.role === "landlord" && (
                  <div className="space-y-2 mt-4">
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(property)}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-2 px-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <span>{isTagalog ? "I-edit ang Listing na Ito ✏️" : "Edit This Listing ✏️"}</span>
                      </button>
                    )}

                    {onDelete && (
                      showConfirmDelete ? (
                        <div className="p-3 bg-red-50 border border-red-200/90 rounded-xl space-y-2.5">
                          <div className="text-xs font-bold text-red-800 flex items-center gap-1.5">
                            <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                            <span>{isTagalog ? "Sigurado ka bang gusto mong burahin ang listing na ito?" : "Are you sure you want to delete this listing?"}</span>
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setShowConfirmDelete(false);
                                onDelete(property.id);
                                onClose();
                              }}
                              className="flex-1 bg-red-600 text-white font-bold py-1.5 px-3 rounded-lg text-xs"
                            >
                              {isTagalog ? "Oo, Burahin Na 🗑️" : "Yes, Delete Now 🗑️"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowConfirmDelete(false)}
                              className="flex-1 bg-stone-200 text-stone-800 font-bold py-1.5 px-3 rounded-lg text-xs"
                            >
                              {isTagalog ? "Kanselahin" : "Cancel"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowConfirmDelete(true)}
                          className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl py-2 px-3 text-xs font-semibold flex items-center justify-center gap-1.5"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>{isTagalog ? "Burahin ang Listing 🗑️" : "Delete Listing 🗑️"}</span>
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            )}

            {mobileTab === "reviews" && (
              <div className="space-y-4">
                {renderReviewsSection()}
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            DESKTOP VIEW (Screens >= md) - 100% UNTOUCHED Full Side-By-Side Layout
           ========================================================================= */}
        <div className="hidden md:flex flex-row w-full max-h-[92vh]">
          {/* Left Side: Rich Details & Images */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 border-r border-stone-100 max-h-[92vh]">
            {/* Header Title */}
            <div className="mb-4">
              <div className="flex flex-wrap items-center gap-2 mb-2 font-mono">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-stone-100 text-stone-700">
                  {property.type} &bull; Built {property.yearBuilt}
                </span>
                {property.genderPolicy === "Girls Only" && (
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-pink-100 text-pink-800 border border-pink-200">
                    👧 {isTagalog ? "Mga Babae Lamang" : "Girls Only"}
                  </span>
                )}
                {property.genderPolicy === "Boys Only" && (
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    👦 {isTagalog ? "Mga Lalaki Lamang" : "Boys Only"}
                  </span>
                )}
                {property.genderPolicy === "Both" && (
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 text-white shadow-xs">
                    👫 {isTagalog ? "Lalaki at Babae (Co-ed)" : "Both (Co-ed)"}
                  </span>
                )}
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-stone-900 leading-tight">
                {property.title}
              </h2>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-1">
                <p className="text-stone-500 text-sm flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-pink-500 shrink-0" />
                  <span>{property.address}, {property.city} ({property.neighborhood})</span>
                </p>
                {onViewOnMap && (
                  <button
                    type="button"
                    onClick={() => onViewOnMap(property)}
                    className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-pink-500/20 cursor-pointer shrink-0 w-fit active:scale-95"
                  >
                    <Map className="h-4 w-4" />
                    <span>{isTagalog ? "Tingnan sa Interactive Map 🗺️" : "View on Interactive Map 🗺️"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Hero Property Image */}
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-stone-100 mb-6 border border-stone-100">
              <img
                src={property.image}
                alt={property.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Description Section */}
            <div className="mb-8">
              <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-stone-400 mb-2">
                {isTagalog ? "Pangkalahatang Detalye ng Tuluyan" : "Property Overview"}
              </h4>
              <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line font-light">
                {property.description}
              </p>
            </div>

            {/* Specifications / Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/50 flex items-center gap-2.5">
                <div className="p-1.5 bg-stone-200/50 rounded-lg text-stone-700">
                  <Home className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-stone-400">{isTagalog ? "Uri" : "Type"}</p>
                  <p className="text-xs font-semibold text-stone-800">{property.type}</p>
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/50 flex items-center gap-2.5">
                <div className="p-1.5 bg-stone-200/50 rounded-lg text-stone-700">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-stone-400">{isTagalog ? "Taon ng Pagtatayo" : "Year Built"}</p>
                  <p className="text-xs font-semibold text-stone-800">{property.yearBuilt}</p>
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/50 flex items-center gap-2.5">
                <div className="p-1.5 bg-stone-200/50 rounded-lg text-stone-700">
                  <Car className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-stone-400">{isTagalog ? "Aparaduhan" : "Parking"}</p>
                  <p className="text-xs font-semibold text-stone-800 truncate max-w-[80px]">{property.parking}</p>
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/50 flex items-center gap-2.5">
                <div className="p-1.5 bg-stone-200/50 rounded-lg text-stone-700">
                  <Flame className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-stone-400">{isTagalog ? "Palamig" : "Cooling"}</p>
                  <p className="text-xs font-semibold text-stone-800 truncate max-w-[80px]">{property.heating}</p>
                </div>
              </div>
            </div>

            {/* Core Features list */}
            <div className="mb-6">
              <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-stone-400 mb-3">
                {isTagalog ? "Mga Pasilidad at Amenidad" : "Interior & Amenities"}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {property.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-stone-700 text-xs font-light">
                    <CheckCircle className="h-4 w-4 text-stone-500 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* School Distances in KM Section */}
            <div className="mb-8">
              <SchoolDistancesList
                coordinates={property.coordinates}
                propertyName={property.title}
                neighborhood={property.neighborhood}
                language={language}
                onViewSchoolOnMap={(lat, lng, name, schoolId) => {
                  if (onViewOnMap) onViewOnMap(property, schoolId);
                }}
              />
            </div>

            {/* Student Ratings & Reviews Section */}
            <div className="mt-8 pt-6 border-t border-stone-200">
              {renderReviewsSection()}
            </div>
          </div>

          {/* Right Side: Price, AI Match context & Interactive Micro Chat */}
          <div className="w-[380px] flex flex-col bg-stone-50/50 max-h-[92vh] overflow-y-auto p-6 md:p-8 justify-between">
            <div>
              {/* Real Price Display */}
              <div className="mb-6 p-4 bg-white rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
                <div>
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">{isTagalog ? "Buwanang Upa" : "Monthly Rent"}</p>
                  <p className="font-display text-3xl font-bold text-stone-950 mt-1">
                    ₱{property.price.toLocaleString()}
                    <span className="text-sm font-sans font-normal text-stone-500 ml-1">{isTagalog ? "/ buwan" : "/ month"}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-100 grid grid-cols-2 text-center text-stone-600 font-mono text-xs">
                  <div>
                    <p className="font-bold text-stone-800">{property.beds}</p>
                    <p className="text-[10px] text-stone-400">{isTagalog ? "Kama" : "Beds"}</p>
                  </div>
                  <div className="border-l border-stone-100">
                    <p className="font-bold text-stone-800">{property.baths}</p>
                    <p className="text-[10px] text-stone-400">{isTagalog ? "Banyo" : "Baths"}</p>
                  </div>
                </div>
              </div>

              {/* Landlord Card */}
              <div className="mb-6">
                {renderLandlordCard()}
              </div>

              {/* Direct Landlord Contact & SMS / Messenger Chat Card */}
              <div className="mb-6">
                {renderDirectContactCard()}
              </div>

              {/* AI Match Notification */}
              {aiMatch && (
                <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-900">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <span>Personalized {aiMatch.score}% AI Match</span>
                  </div>
                  <p className="leading-relaxed italic font-light">
                    &ldquo;{aiMatch.reason}&rdquo;
                  </p>
                </div>
              )}

              {/* Landlord Action Buttons */}
              {userSession?.role === "landlord" && (
                <div className="space-y-2 mt-4">
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(property)}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-2 px-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>{isTagalog ? "I-edit ang Listing na Ito ✏️" : "Edit This Listing ✏️"}</span>
                    </button>
                  )}

                  {onDelete && (
                    showConfirmDelete ? (
                      <div className="p-3 bg-red-50 border border-red-200/90 rounded-xl space-y-2.5 animate-fadeIn">
                        <div className="text-xs font-bold text-red-800 flex items-center gap-1.5">
                          <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                          <span>{isTagalog ? "Sigurado ka bang gusto mong burahin ang listing na ito?" : "Are you sure you want to delete this listing?"}</span>
                        </div>
                        <p className="text-[11px] text-red-600/90 leading-tight">
                          {isTagalog ? "Hindi na ito mababawi kapag tuluyang nabura sa sistema." : "This action cannot be undone once deleted from the system."}
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setShowConfirmDelete(false);
                              onDelete(property.id);
                              onClose();
                            }}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition-all cursor-pointer shadow-xs active:scale-95"
                          >
                            {isTagalog ? "Oo, Burahin Na 🗑️" : "Yes, Delete Now 🗑️"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowConfirmDelete(false)}
                            className="flex-1 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold py-1.5 px-3 rounded-lg text-xs transition-all cursor-pointer active:scale-95"
                          >
                            {isTagalog ? "Kanselahin" : "Cancel"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowConfirmDelete(true)}
                        className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 rounded-xl py-2 px-3 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>{isTagalog ? "Burahin ang Listing 🗑️" : "Delete Listing 🗑️"}</span>
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-stone-200/50 text-center text-[10px] text-stone-400 font-mono">
              ID: {property.id} &bull; CasaFinder Exclusive
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
