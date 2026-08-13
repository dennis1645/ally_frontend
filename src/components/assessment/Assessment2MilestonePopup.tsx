import {
  Sparkles,
} from "lucide-react";

import allyMascot from "../../assets/ally-assessment-mascot.png";

import AllyPopup from "../ui/AllyPopup";

export type Assessment2MilestonePopupProps = {
  isOpen: boolean;
  onClose: () => void;
  onStartAssessment: () => void;
};

export default function Assessment2MilestonePopup({
  isOpen,
  onClose,
  onStartAssessment,
}: Assessment2MilestonePopupProps) {
  return (
    <AllyPopup
      isOpen={
        isOpen
      }
      badge="Assessment 2"
      badgeIcon={
        <Sparkles
          size={14}
          aria-hidden="true"
        />
      }
      mascotSrc={
        allyMascot
      }
      mascotAlt="Ally guiding you to Assessment 2"
      title="Deep Scholarship Readiness Assessment"
      description="Help Ally understand your goals and strengths so your scholarship journey can be more personalized."
      onClose={
        onClose
      }
      closeLabel="Close Assessment 2"
    >
      <div className="mt-5 space-y-3">
        <button
          type="button"
          onClick={
            onStartAssessment
          }
          className="squishy-button inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#16629b] px-5 py-3.5 text-sm font-extrabold text-white shadow-[0_4px_0_#0d4773] transition hover:-translate-y-0.5 hover:bg-[#115787] active:translate-y-0 active:shadow-none"
        >
          <Sparkles
            size={16}
            aria-hidden="true"
          />

          Start Assessment 2
        </button>

        <button
          type="button"
          onClick={
            onClose
          }
          className="inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
        >
          Maybe Later
        </button>
      </div>
    </AllyPopup>
  );
}