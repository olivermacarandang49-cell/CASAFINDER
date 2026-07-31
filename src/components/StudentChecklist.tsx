import { useState } from "react";
import { CheckCircle2, Circle, ClipboardCheck } from "lucide-react";
import { Language } from "../utils/translations";

interface ChecklistItem {
  id: string;
  textEn: string;
  textTl: string;
  categoryEn: "Utilities" | "Location" | "House Rules" | "Safety";
  categoryTl: "Utility" | "Lokasyon" | "Patakaran" | "Kaseguruhan";
}

interface StudentChecklistProps {
  language?: Language;
}

export default function StudentChecklist({ language = "english" }: StudentChecklistProps) {
  const items: ChecklistItem[] = [
    {
      id: "1",
      textEn: "Test cellular signal inside the room (Smart/Globe/DITO)",
      textTl: "I-test ang signal ng cellphone sa loob ng kwarto (Smart/Globe/DITO)",
      categoryEn: "Utilities",
      categoryTl: "Utility",
    },
    {
      id: "2",
      textEn: "Check water pressure & separate utility meters",
      textTl: "Suriin ang lakas ng tubig at sariling sub-meter ng kuryente at tubig",
      categoryEn: "Utilities",
      categoryTl: "Utility",
    },
    {
      id: "3",
      textEn: "Confirm if curfew hours exist (strict vs flexible gates)",
      textTl: "Alamin kung may curfew o lock ng gate sa gabi",
      categoryEn: "House Rules",
      categoryTl: "Patakaran",
    },
    {
      id: "4",
      textEn: "Ask if classmate study-visits or group works are allowed",
      textTl: "Itanong kung pinapayagan ang classmate mag-study o mag-group work",
      categoryEn: "House Rules",
      categoryTl: "Patakaran",
    },
    {
      id: "5",
      textEn: "Measure distance/walking time to SLSU/EQC campus gates",
      textTl: "Sukatin ang distansya at lakad patungong SLSU o EQC gate",
      categoryEn: "Location",
      categoryTl: "Lokasyon",
    },
    {
      id: "6",
      textEn: "Verify proximity to tricycle line & budget eateries (carinderias)",
      textTl: "Suriin ang lapit sa sakayan ng tricycle at mga karinderya",
      categoryEn: "Location",
      categoryTl: "Lokasyon",
    },
    {
      id: "7",
      textEn: "Check gate padlocks, emergency exits & window screens",
      textTl: "Tingnan ang lock ng gate, emergency exit, at Screen ng bintana",
      categoryEn: "Safety",
      categoryTl: "Kaseguruhan",
    },
    {
      id: "8",
      textEn: "Confirm roommate limits per room and bunk-bed stability",
      textTl: "Alamin ang maximum na kasama sa kwarto at tibay ng double deck",
      categoryEn: "Safety",
      categoryTl: "Kaseguruhan",
    },
  ];

  const [checkedIds, setCheckedIds] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const progressPercentage = Math.round((checkedIds.length / items.length) * 100);
  const isTagalog = language === "tagalog";

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <ClipboardCheck className="h-4 w-4" />
          </div>
          <h3 className="font-display text-sm font-semibold text-stone-800">
            {isTagalog ? "Student Inspection Checklist 📋" : "Student Inspection Checklist 📋"}
          </h3>
        </div>
        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-100">
          {progressPercentage}% {isTagalog ? "Nacheck Na" : "Checked"}
        </span>
      </div>

      <p className="text-stone-500 text-[11px] font-light leading-relaxed">
        {isTagalog
          ? "Huwag kalimutang suriin ang mga mahalagang detalye na ito bago kumuha ng boarding room o makipag-usap sa landlord!"
          : "Don't forget to check these critical details when inspecting boarding rooms or meeting landlords!"}
      </p>

      {/* Progress Bar */}
      <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-emerald-500 h-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="space-y-2 pt-1 max-h-[220px] overflow-y-auto">
        {items.map((item) => {
          const isChecked = checkedIds.includes(item.id);
          const itemText = isTagalog ? item.textTl : item.textEn;
          const categoryText = isTagalog ? item.categoryTl : item.categoryEn;

          return (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`flex items-start gap-2.5 p-2 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                isChecked
                  ? "bg-emerald-50/40 border-emerald-100/80 text-stone-500"
                  : "bg-stone-50/50 border-stone-100 text-stone-800 hover:bg-stone-50 hover:border-stone-200"
              }`}
            >
              <button type="button" className="shrink-0 mt-0.5 text-stone-400 hover:text-stone-600">
                {isChecked ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Circle className="h-4 w-4 text-stone-300" />
                )}
              </button>
              <div className="flex-1">
                <p className={`leading-relaxed ${isChecked ? "line-through" : "font-light"}`}>
                  {itemText}
                </p>
                <span
                  className={`inline-block text-[9px] font-medium px-1.5 py-0.2 rounded-md mt-1 ${
                    item.categoryEn === "Utilities"
                      ? "bg-blue-50 text-blue-600"
                      : item.categoryEn === "House Rules"
                      ? "bg-amber-50 text-amber-600"
                      : item.categoryEn === "Safety"
                      ? "bg-rose-50 text-rose-600"
                      : "bg-indigo-50 text-indigo-600"
                  }`}
                >
                  {categoryText}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
