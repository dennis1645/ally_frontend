import {
  AlertCircle,
  Bell,
  CalendarDays,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";

import type {
  Reminder,
} from "../../api/reminderApi";

export type NotificationPanelProps = {
  open:
    boolean;

  reminders:
    Reminder[];

  loading:
    boolean;

  error:
    string | null;

  onClose:
    () => void;

  onRetry:
    () => void;
};

function formatDeadline(
  reminder: Reminder,
): string {
  if (
    reminder.daysRemaining ===
    0
  ) {
    return "Due today";
  }

  if (
    reminder.daysRemaining ===
    1
  ) {
    return "Due tomorrow";
  }

  if (
    reminder.daysRemaining !==
      null &&
    reminder.daysRemaining >
      1
  ) {
    return `Due in ${reminder.daysRemaining} days`;
  }

  if (
    !reminder.deadline
  ) {
    return "Upcoming";
  }

  const parsed =
    new Date(
      reminder.deadline,
    );

  if (
    Number.isNaN(
      parsed.getTime(),
    )
  ) {
    return reminder.deadline;
  }

  return parsed.toLocaleDateString(
    undefined,
    {
      month:
        "short",
      day:
        "numeric",
      year:
        "numeric",
    },
  );
}

function kindLabel(
  reminder: Reminder,
): string {
  switch (
    reminder.kind
  ) {
    case "mentor_task":
      return "Mentor task";

    case "scholarship":
      return "Scholarship";

    case "milestone":
      return "Quest milestone";

    default:
      return "Expedition";
  }
}

function toneClasses(
  reminder: Reminder,
): string {
  if (
    reminder.daysRemaining !==
      null &&
    reminder.daysRemaining <=
      1
  ) {
    return "border-[#f3c9b8] bg-[#fff8f3]";
  }

  if (
    reminder.kind ===
    "mentor_task"
  ) {
    return "border-[#ead9be] bg-[#fffbf3]";
  }

  return "border-[#dbe9f2] bg-[#f8fcff]";
}

export default function NotificationPanel({
  open,
  reminders,
  loading,
  error,
  onClose,
  onRetry,
}: NotificationPanelProps) {
  if (
    !open
  ) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Notifications"
      className={[
        "absolute right-0 top-[calc(100%+10px)] z-[90]",
        "w-[min(360px,calc(100vw-2rem))]",
        "rounded-[22px] border border-[#dbe3e8]",
        "bg-white p-4",
        "shadow-[0_18px_50px_rgba(25,40,55,0.18)]",
      ].join(
        " ",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#eaf5fb] text-[#16629b]">
            <Bell
              size={18}
              aria-hidden="true"
            />
          </div>

          <div>
            <p className="font-extrabold text-[#2c1607]">
              Notifications
            </p>

            <p className="text-[11px] text-slate-400">
              Expedition updates
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label="Close notifications"
          onClick={
            onClose
          }
          className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X
            size={17}
            aria-hidden="true"
          />
        </button>
      </div>

      {loading ? (
        <div className="mt-4 space-y-2">
          {[
            0,
            1,
            2,
          ].map(
            (
              item,
            ) => (
              <div
                key={
                  item
                }
                className="h-[74px] animate-pulse rounded-2xl bg-slate-100"
              />
            ),
          )}
        </div>
      ) : error ? (
        <div className="mt-4 rounded-2xl border border-[#f0d4c8] bg-[#fff9f6] px-4 py-5 text-center">
          <AlertCircle
            size={21}
            className="mx-auto text-[#c66c48]"
            aria-hidden="true"
          />

          <p className="mt-2 text-sm font-bold text-[#2c1607]">
            Couldn&apos;t load updates
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={
              onRetry
            }
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-[#16629b] transition hover:bg-[#eef7fc]"
          >
            <RefreshCw
              size={14}
              aria-hidden="true"
            />
            Try again
          </button>
        </div>
      ) : reminders.length ===
        0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-[#dce4e9] bg-[#fafcfd] px-4 py-6 text-center">
          <div className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-white text-slate-400 shadow-sm">
            <Bell
              size={20}
              aria-hidden="true"
            />
          </div>

          <p className="mt-3 text-sm font-bold text-[#2c1607]">
            No expedition updates yet
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Upcoming scholarship, milestone, and mentor-task reminders will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-4 max-h-[380px] space-y-2 overflow-y-auto pr-1">
          {reminders
            .slice(
              0,
              8,
            )
            .map(
              (
                reminder,
              ) => (
                <article
                  key={`${reminder.kind}-${reminder.id}`}
                  className={[
                    "rounded-2xl border p-3.5",
                    toneClasses(
                      reminder,
                    ),
                  ].join(
                    " ",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={[
                        "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl",
                        reminder.kind ===
                        "mentor_task"
                          ? "bg-[#fff0d9] text-[#9a681f]"
                          : "bg-[#eaf5fb] text-[#16629b]",
                      ].join(
                        " ",
                      )}
                    >
                      {reminder.kind ===
                      "mentor_task" ? (
                        <Sparkles
                          size={16}
                          aria-hidden="true"
                        />
                      ) : (
                        <CalendarDays
                          size={16}
                          aria-hidden="true"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                          {kindLabel(
                            reminder,
                          )}
                        </span>

                        {reminder.daysRemaining ===
                          1 && (
                          <span className="rounded-full bg-[#fce3d7] px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-[#b85f3b]">
                            H-1
                          </span>
                        )}
                      </div>

                      <h3 className="mt-1 text-sm font-extrabold leading-5 text-[#2c1607]">
                        {
                          reminder.title
                        }
                      </h3>

                      {reminder.description && (
                        <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-500">
                          {
                            reminder.description
                          }
                        </p>
                      )}

                      <p
                        className={[
                          "mt-2 text-[11px] font-bold",
                          reminder.daysRemaining !==
                            null &&
                          reminder.daysRemaining <=
                            1
                            ? "text-[#bd5f3c]"
                            : "text-[#16629b]",
                        ].join(
                          " ",
                        )}
                      >
                        {formatDeadline(
                          reminder,
                        )}
                      </p>
                    </div>
                  </div>
                </article>
              ),
            )}
        </div>
      )}

      {!loading &&
        !error &&
        reminders.length >
          0 && (
        <p className="mt-3 text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
          Upcoming reminders from Ally
        </p>
      )}
    </div>
  );
}
