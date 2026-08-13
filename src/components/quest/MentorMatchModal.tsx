import {
  GraduationCap,
  Loader2,
  RefreshCw,
  Sparkles,
  Star,
} from "lucide-react";

import allyMascot from "../../assets/ally-assessment-mascot.png";

import type {
  MentorMatchResult,
} from "../../api/coachingApi";

import AllyPopup from "../ui/AllyPopup";

export type MentorMatchModalState =
  | "matching"
  | "matched"
  | "error";

type MentorMatchModalProps = {
  isOpen: boolean;
  state: MentorMatchModalState;
  match: MentorMatchResult | null;
  error: string | null;
  scholarshipName: string | null;
  onClose: () => void;
  onRetry: () => void;
};

function mentorInitials(
  name: string,
): string {
  const words =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);

  if (
    words.length ===
    0
  ) {
    return "AM";
  }

  return words
    .map(
      (
        word,
      ) =>
        word
          .charAt(0)
          .toUpperCase(),
    )
    .join("");
}

function cleanLabel(
  value:
    | string
    | null
    | undefined,
): string | null {
  const normalized =
    value?.trim() ??
    "";

  return (
    normalized ||
    null
  );
}

export default function MentorMatchModal({
  isOpen,
  state,
  match,
  error,
  scholarshipName,
  onClose,
  onRetry,
}: MentorMatchModalProps) {
  const displayScholarship =
    cleanLabel(
      match?.scholarship ??
        scholarshipName,
    );

  const mentorSubtitle =
    cleanLabel(
      match?.headline ??
        match?.specialization ??
        match?.field ??
        null,
    ) ??
    "Ally Scholarship Mentor";

  if (
    state ===
      "matching"
  ) {
    return (
      <AllyPopup
        isOpen={
          isOpen
        }
        badge="Premium Mentor Match"
        badgeIcon={
          <Sparkles
            size={14}
            aria-hidden="true"
          />
        }
        mascotSrc={
          allyMascot
        }
        mascotAlt="Ally finding your mentor"
        mascotAnimated
        title="Finding your mentor"
        description="Ally is matching you with a mentor for your scholarship journey."
        onClose={
          onClose
        }
        closeLabel="Close mentor matching"
      >
        <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-[#d6e7f2] bg-[#f4f9fc] px-4 py-3 text-sm font-bold text-[#16629b]">
          <Loader2
            size={17}
            className="animate-spin"
            aria-hidden="true"
          />

          Matching your profile...
        </div>
      </AllyPopup>
    );
  }

  if (
    state ===
      "matched" &&
    match
  ) {
    return (
      <AllyPopup
        isOpen={
          isOpen
        }
        badge="Premium Mentor Match"
        badgeIcon={
          <Sparkles
            size={14}
            aria-hidden="true"
          />
        }
        mascotSrc={
          allyMascot
        }
        mascotAlt="Ally celebrating your mentor match"
        title="Your mentor match is ready!"
        description={`You’ve been matched with ${match.name}.`}
        onClose={
          onClose
        }
        closeLabel="Close mentor match"
      >
        <div className="mt-5 rounded-2xl border border-[#d7e4ec] bg-white p-4 text-left shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl border-4 border-[#edf7fd] bg-[#dceeff] text-base font-extrabold text-[#16629b]">
              {match.profilePictureUrl ? (
                <img
                  src={
                    match.profilePictureUrl
                  }
                  alt={`${match.name} mentor profile`}
                  className="h-full w-full object-cover"
                />
              ) : (
                mentorInitials(
                  match.name,
                )
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-lg font-extrabold text-[#2c1607]">
                  {match.name}
                </h3>

                {match.matchScore !==
                  null && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#fff7df] px-2 py-1 text-[10px] font-extrabold text-[#8b641e]">
                    <Star
                      size={11}
                      fill="currentColor"
                      aria-hidden="true"
                    />

                    {Math.round(
                      match.matchScore,
                    )}
                    % match
                  </span>
                )}
              </div>

              <p className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-slate-500">
                {mentorSubtitle}
              </p>
            </div>
          </div>

          {displayScholarship && (
            <div className="mt-3 inline-flex max-w-full items-center gap-1.5 rounded-full bg-[#f4f9fc] px-2.5 py-1.5 text-xs font-bold text-[#406479]">
              <GraduationCap
                size={13}
                className="shrink-0"
                aria-hidden="true"
              />

              <span className="truncate">
                {displayScholarship}
              </span>
            </div>
          )}
        </div>

        <p className="mt-4 text-xs leading-5 text-slate-400">
          Your mentor match is now part of your Premium journey.
        </p>
      </AllyPopup>
    );
  }

  return (
    <AllyPopup
      isOpen={
        isOpen
      }
      badge="Premium Mentor Match"
      badgeIcon={
        <Sparkles
          size={14}
          aria-hidden="true"
        />
      }
      mascotSrc={
        allyMascot
      }
      mascotAlt="Ally"
      title="Mentor match unavailable"
      description={
        error ??
        "We couldn't finish the match right now. You can try again."
      }
      onClose={
        onClose
      }
      closeLabel="Close mentor match"
    >
      <button
        type="button"
        onClick={
          onRetry
        }
        className="squishy-button mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#16629b] px-5 py-3.5 text-sm font-extrabold text-white shadow-[0_4px_0_#0d4773] transition hover:-translate-y-0.5 hover:bg-[#115787] active:translate-y-0 active:shadow-none"
      >
        <RefreshCw
          size={16}
          aria-hidden="true"
        />

        Try Again
      </button>
    </AllyPopup>
  );
}