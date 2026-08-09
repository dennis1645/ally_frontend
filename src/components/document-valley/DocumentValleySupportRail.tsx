import {
  AlertTriangle,
  ArrowRight,
  BellRing,
  BrainCircuit,
  CalendarClock,
  Download,
  Footprints,
  Sparkles,
} from "lucide-react";

import type {
  DocumentBadge,
  TrailReminder,
} from "../../types/documentValley";

export type DocumentValleySupportRailProps = {
  title:
    string;

  progress:
    number;

  dueDate:
    string;

  mentorInsight:
    string;

  mentorAlert:
    string;

  reminders:
    TrailReminder[];

  badges:
    DocumentBadge[];

  onAnalyze:
    () => void;

  onQuickAction:
    (
      action:
        "generate-cv"
        | "download-templates",
    ) => void;
};

export default function DocumentValleySupportRail({
  title,
  progress,
  dueDate,
  mentorInsight,
  mentorAlert,
  reminders,
  badges,
  onAnalyze,
  onQuickAction,
}: DocumentValleySupportRailProps) {
  const normalizedProgress =
    Math.min(
      100,
      Math.max(
        0,
        progress,
      ),
    );

  return (
    <aside className="space-y-6">
      {/* Current milestone */}

      <section className="rounded-2xl border border-[#ead3bd] bg-white p-5 shadow-[0_3px_0_#d8c6ae]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
              Current Milestone
            </p>

            <h2 className="mt-1 text-xl font-extrabold text-[#16629b]">
              {title}
            </h2>
          </div>

          <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#bfe3ff] text-[#16629b]">
            <CalendarClock
              size={20}
            />
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex justify-between gap-3 text-xs">
            <span className="font-extrabold text-[#4b3426]">
              {normalizedProgress}% Complete
            </span>

            <span className="text-slate-500">
              Due {dueDate}
            </span>
          </div>

          <div className="relative h-3 rounded-full bg-[#eadac4]">
            <div
              className="h-3 rounded-full bg-[#63a8e5] transition-[width]"
              style={{
                width:
                  `${normalizedProgress}%`,
              }}
            />

            <span
              aria-hidden="true"
              className="absolute top-1/2 grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[#63a8e5] bg-white text-[#63a8e5] shadow"
              style={{
                left:
                  `clamp(14px, ${normalizedProgress}%, calc(100% - 14px))`,
              }}
            >
              <Footprints
                size={14}
              />
            </span>
          </div>
        </div>

        <button
          type="button"
          disabled
          className="mt-6 inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-200 px-4 font-semibold text-white"
        >
          Continue Expedition

          <ArrowRight
            size={17}
          />
        </button>
      </section>

      {/* Mentor check */}

      <section className="relative overflow-hidden rounded-2xl bg-[#166fa8] p-5 text-white shadow-[0_4px_0_#0b4d78]">
        <BrainCircuit
          aria-hidden="true"
          size={70}
          className="absolute -right-3 -top-3 text-white/15"
        />

        <h2 className="relative flex items-center gap-2 text-2xl font-extrabold">
          <Sparkles
            size={21}
          />

          Mentor Check
        </h2>

        <div className="relative mt-5 space-y-3">
          <div className="rounded-xl border border-white/20 bg-[#2579ad] p-4">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-white/70">
              Document Insight
            </p>

            <p className="mt-1 text-sm leading-6">
              {mentorInsight}
            </p>
          </div>

          <div className="rounded-xl border border-white/20 bg-[#2579ad] p-4">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#ffd6d2]">
              Critical Alert
            </p>

            <p className="mt-1 text-sm leading-6">
              {mentorAlert}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={
            onAnalyze
          }
          className="relative mt-5 min-h-11 w-full rounded-xl bg-white px-4 text-sm font-extrabold text-[#16629b] shadow-sm transition hover:bg-[#f7fbff]"
        >
          Analyze All Documents
        </button>
      </section>

      {/* Trail reminders */}

      <section className="rounded-2xl border border-[#ead3bd] bg-white p-5 shadow-[0_3px_0_#d8c6ae]">
        <h2 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#2977a8]">
          <BellRing
            size={15}
          />

          Trail Reminders
        </h2>

        <div className="mt-4 space-y-3">
          {reminders.map(
            (
              reminder,
            ) => (
              <article
                key={
                  reminder.id
                }
                className={[
                  "flex items-start gap-3 rounded-xl border p-3",

                  reminder.tone ===
                  "danger"
                    ? "border-red-100 bg-red-50"
                    : "border-[#ead3bd] bg-[#fff0e8]",
                ].join(
                  " ",
                )}
              >
                <div
                  className={[
                    "grid h-7 w-7 shrink-0 place-items-center rounded-lg",

                    reminder.tone ===
                    "danger"
                      ? "bg-red-100 text-red-500"
                      : "bg-[#75b2e5] text-[#16629b]",
                  ].join(
                    " ",
                  )}
                >
                  <AlertTriangle
                    size={15}
                  />
                </div>

                <div>
                  <h3 className="text-xs font-extrabold text-[#3e2a1e]">
                    {
                      reminder.title
                    }
                  </h3>

                  <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                    {
                      reminder.description
                    }
                  </p>
                </div>
              </article>
            ),
          )}
        </div>
      </section>

      {/* Badges */}

      <section className="rounded-2xl border border-[#ead3bd] bg-[#fff1ea] p-5 shadow-[0_3px_0_#d8c6ae]">
        <h2 className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#8b623f]">
          Badges Earned
        </h2>

        <div className="mt-5 flex flex-wrap gap-4">
          {badges.map(
            (
              badge,
            ) => {
              const Icon =
                badge.icon;

              const badgeClass =
                badge.tone ===
                "gold"
                  ? "border-[#d6aa64] bg-[#fff7df] text-[#c28a17]"
                  : badge.tone ===
                      "blue"
                    ? "border-[#8dc7ed] bg-[#eff9ff] text-[#4a9bd0]"
                    : "border-dashed border-slate-300 bg-white/40 text-slate-300";

              return (
                <div
                  key={
                    badge.id
                  }
                  title={
                    badge.label
                  }
                  className={[
                    "grid h-14 w-14 place-items-center rounded-full border-2 shadow-sm",
                    badgeClass,
                  ].join(
                    " ",
                  )}
                >
                  <Icon
                    size={23}
                  />
                </div>
              );
            },
          )}
        </div>
      </section>

      {/* Quick actions */}

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => {
            onQuickAction(
              "generate-cv",
            );
          }}
          className="flex w-full items-center gap-4 rounded-xl border border-[#ead3bd] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#d9efff] text-[#16629b]">
            <Sparkles
              size={19}
            />
          </div>

          <div>
            <p className="text-sm font-extrabold text-[#3e2a1e]">
              Generate CV
            </p>

            <p className="text-[11px] text-slate-500">
              Use our AI templates
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            onQuickAction(
              "download-templates",
            );
          }}
          className="flex w-full items-center gap-4 rounded-xl border border-[#ead3bd] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#fff0e1] text-[#8c5d38]">
            <Download
              size={19}
            />
          </div>

          <div>
            <p className="text-sm font-extrabold text-[#3e2a1e]">
              Download Templates
            </p>

            <p className="text-[11px] text-slate-500">
              Pre-formatted docs
            </p>
          </div>
        </button>
      </div>
    </aside>
  );
}