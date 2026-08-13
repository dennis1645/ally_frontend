import {
  Check,
  Flame,
  RefreshCw,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type JournalRecord = {
  date?: string | null;
};

type WeekDay = {
  label: string;
  dateKey: string;
  isToday: boolean;
  isFuture: boolean;
  isCompleted: boolean;
};

const DAY_LABELS = [
  "M",
  "T",
  "W",
  "T",
  "F",
  "S",
  "S",
];

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

function toDateKey(
  date: Date,
): string {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");
  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(
  date: Date,
  amount: number,
): Date {
  const result = new Date(date);

  result.setDate(
    result.getDate() + amount,
  );

  return result;
}

function getMonday(
  date: Date,
): Date {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  const day = result.getDay();

  const difference =
    day === 0
      ? -6
      : 1 - day;

  result.setDate(
    result.getDate() + difference,
  );

  return result;
}

function extractJournals(
  payload: unknown,
): JournalRecord[] {
  /*
   * Supports:
   *
   * [...]
   *
   * { data: [...] }
   *
   * { data: { data: [...] } }
   *
   * { journals: [...] }
   *
   * This is defensive because the Postman collection
   * does not include an example GET response body.
   */

  if (Array.isArray(payload)) {
    return payload.filter(
      isRecord,
    ) as JournalRecord[];
  }

  if (!isRecord(payload)) {
    return [];
  }

  if (
    Array.isArray(payload.data)
  ) {
    return payload.data.filter(
      isRecord,
    ) as JournalRecord[];
  }

  if (
    isRecord(payload.data) &&
    Array.isArray(
      payload.data.data,
    )
  ) {
    return payload.data.data.filter(
      isRecord,
    ) as JournalRecord[];
  }

  if (
    Array.isArray(
      payload.journals,
    )
  ) {
    return payload.journals.filter(
      isRecord,
    ) as JournalRecord[];
  }

  return [];
}

function calculateStreak(
  completedDates: Set<string>,
): number {
  if (
    completedDates.size === 0
  ) {
    return 0;
  }

  const today = new Date();

  today.setHours(
    0,
    0,
    0,
    0,
  );

  /*
   * If today's activity hasn't been completed yet,
   * preserve yesterday's streak until the day ends.
   */
  let cursor =
    completedDates.has(
      toDateKey(today),
    )
      ? today
      : addDays(today, -1);

  let streak = 0;

  while (
    completedDates.has(
      toDateKey(cursor),
    )
  ) {
    streak += 1;

    cursor = addDays(
      cursor,
      -1,
    );
  }

  return streak;
}

function buildCurrentWeek(
  completedDates: Set<string>,
): WeekDay[] {
  const today = new Date();

  today.setHours(
    0,
    0,
    0,
    0,
  );

  const monday =
    getMonday(today);

  const todayKey =
    toDateKey(today);

  return DAY_LABELS.map(
    (label, index) => {
      const date = addDays(
        monday,
        index,
      );

      const dateKey =
        toDateKey(date);

      return {
        label,
        dateKey,
        isToday:
          dateKey === todayKey,
        isFuture:
          date.getTime() >
          today.getTime(),
        isCompleted:
          completedDates.has(
            dateKey,
          ),
      };
    },
  );
}

export default function StreakStatusCard() {
  const [
    completedDates,
    setCompletedDates,
  ] = useState<Set<string>>(
    new Set(),
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const loadStreak =
    useCallback(
      async (
        signal?: AbortSignal,
      ) => {
        setIsLoading(true);
        setError(null);

        try {
          const baseUrl = (
            import.meta.env
              .VITE_API_BASE_URL ??
            ""
          ).replace(/\/$/, "");

          const token =
            localStorage.getItem(
              "access_token",
            ) ??
            localStorage.getItem(
              "token",
            );

          const response =
            await fetch(
              `${baseUrl}/api/journals?per_page=31`,
              {
                method: "GET",

                headers: {
                  Accept:
                    "application/json",

                  ...(token
                    ? {
                        Authorization:
                          `Bearer ${token}`,
                      }
                    : {}),
                },

                signal,
              },
            );

          if (!response.ok) {
            throw new Error(
              `Unable to load streak (${response.status})`,
            );
          }

          const payload: unknown =
            await response.json();

          const journals =
            extractJournals(
              payload,
            );

          const dates =
            new Set<string>();

          journals.forEach(
            (journal) => {
              if (
                typeof journal.date ===
                  "string" &&
                journal.date.trim()
              ) {
                /*
                 * Handles both:
                 * 2026-08-12
                 *
                 * and:
                 * 2026-08-12T10:30:00...
                 */
                dates.add(
                  journal.date.slice(
                    0,
                    10,
                  ),
                );
              }
            },
          );

          setCompletedDates(
            dates,
          );
        } catch (caughtError) {
          if (
            caughtError instanceof
              DOMException &&
            caughtError.name ===
              "AbortError"
          ) {
            return;
          }

          console.error(
            "Failed to load streak:",
            caughtError,
          );

          setError(
            "We couldn't load your expedition streak.",
          );
        } finally {
          if (
            !signal?.aborted
          ) {
            setIsLoading(
              false,
            );
          }
        }
      },
      [],
    );

  useEffect(() => {
    const controller =
      new AbortController();

    void loadStreak(
      controller.signal,
    );

    return () => {
      controller.abort();
    };
  }, [loadStreak]);

  const streakCount =
    useMemo(
      () =>
        calculateStreak(
          completedDates,
        ),
      [completedDates],
    );

  const week =
    useMemo(
      () =>
        buildCurrentWeek(
          completedDates,
        ),
      [completedDates],
    );

  /*
   * Loading state
   */
  if (isLoading) {
    return (
      <section
        aria-label="Loading expedition streak"
        className={[
          "h-full rounded-[22px]",
          "border border-[#f0d8ca] bg-white",
          "p-5 shadow-[0_5px_0_#e7d6c9]",
        ].join(" ")}
      >
        <div className="animate-pulse">
          <div className="h-6 w-36 rounded-lg bg-[#f3ece6]" />

          <div className="mt-6 grid grid-cols-7 gap-2">
            {DAY_LABELS.map(
              (_, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="h-3 w-4 rounded bg-slate-200" />

                  <div className="h-9 w-9 rounded-full bg-slate-100" />
                </div>
              ),
            )}
          </div>

          <div className="mt-5 h-4 w-3/4 rounded bg-slate-100" />
        </div>
      </section>
    );
  }

  /*
   * Error state
   */
  if (error) {
    return (
      <section
        aria-label="Expedition streak error"
        className={[
          "h-full rounded-[22px]",
          "border border-[#f0d8ca] bg-white",
          "p-5 shadow-[0_5px_0_#e7d6c9]",
        ].join(" ")}
      >
        <div className="flex h-full flex-col items-center justify-center text-center">
          <div
            className={[
              "grid h-12 w-12 place-items-center",
              "rounded-2xl bg-[#fff0e4]",
              "text-[#e46f35]",
            ].join(" ")}
          >
            <Flame
              size={24}
              aria-hidden="true"
            />
          </div>

          <p className="mt-3 text-sm font-bold text-[#2c1607]">
            Streak unavailable
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() => {
              void loadStreak();
            }}
            className={[
              "mt-4 inline-flex items-center gap-2",
              "rounded-xl bg-[#e8f3fc]",
              "px-3 py-2",
              "text-xs font-bold text-[#16629b]",
              "transition-colors",
              "hover:bg-[#d8ecfb]",
            ].join(" ")}
          >
            <RefreshCw
              size={14}
              aria-hidden="true"
            />

            Try again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Daily expedition streak"
      className={[
        "relative h-full overflow-hidden rounded-[22px]",
        "border border-[#f0d8ca] bg-white",
        "p-5 shadow-[0_5px_0_#e7d6c9]",
      ].join(" ")}
    >
      <div className="relative flex h-full flex-col">
        {/* Streak title */}
        <div className="flex items-center gap-2">
          <Flame
            size={25}
            fill="currentColor"
            className="text-[#e46f35]"
            aria-hidden="true"
          />

          <h3 className="text-xl font-extrabold tracking-tight text-[#2c1607]">
            {streakCount} Day Streak
          </h3>
        </div>

        {/* Empty state */}
        {completedDates.size === 0 && (
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Your trail is ready. Complete an expedition activity to begin your streak.
          </p>
        )}

        {/* Weekly streak */}
        <div className="mt-5 grid grid-cols-7 gap-1 sm:gap-2">
          {week.map(
            (day) => (
              <div
                key={
                  day.dateKey
                }
                className="flex min-w-0 flex-col items-center"
              >
                {/* Day name */}
                <span
                  className={[
                    "mb-2 text-[11px] font-extrabold",
                    day.isToday
                      ? "text-[#16629b]"
                      : day.isFuture
                        ? "text-slate-300"
                        : "text-slate-500",
                  ].join(" ")}
                >
                  {day.label}
                </span>

                {/* Day state */}
                <div
                  title={
                    day.isToday
                      ? "Today"
                      : day.dateKey
                  }
                  aria-label={[
                    day.dateKey,
                    day.isToday
                      ? "today"
                      : "",
                    day.isCompleted
                      ? "completed"
                      : day.isFuture
                        ? "future"
                        : "not completed",
                  ]
                    .filter(Boolean)
                    .join(", ")}
                  className={[
                    "relative grid h-9 w-9 place-items-center",
                    "rounded-full transition-all",

                    /*
                     * Completed
                     */
                    day.isCompleted
                      ? [
                          "bg-[#e46f35]",
                          "text-white",
                          "shadow-[0_3px_0_#c85c29]",
                        ].join(" ")
                      : "",

                    /*
                     * Inactive / future
                     */
                    !day.isCompleted
                      ? [
                          "border-2 border-[#e6e7e9]",
                          "bg-[#f8f8f8]",
                          "text-slate-300",
                        ].join(" ")
                      : "",

                    /*
                     * Current day
                     */
                    day.isToday
                      ? [
                          "ring-2 ring-[#79b7ef]",
                          "ring-offset-2",
                        ].join(" ")
                      : "",

                    /*
                     * Future days
                     */
                    day.isFuture
                      ? "opacity-45"
                      : "",
                  ].join(" ")}
                >
                  {day.isCompleted ? (
                    <Check
                      size={17}
                      strokeWidth={3}
                      aria-hidden="true"
                    />
                  ) : (
                    <span
                      className={[
                        "h-2.5 w-2.5 rounded-full",
                        day.isToday
                          ? "bg-[#79b7ef]"
                          : "bg-slate-300",
                      ].join(" ")}
                    />
                  )}
                </div>

                {/* Today marker */}
                <span
                  className={[
                    "mt-1.5 min-h-[12px]",
                    "text-[8px] font-extrabold uppercase",
                    "tracking-wider",
                    day.isToday
                      ? "text-[#16629b]"
                      : "text-transparent",
                  ].join(" ")}
                >
                  Today
                </span>
              </div>
            ),
          )}
        </div>

        {/* Footer */}
        <p className="mt-auto pt-4 text-xs leading-5 text-slate-500">
          {streakCount > 0
            ? "Keep moving, Explorer. Every day takes you closer to the summit."
            : "Take one step today to start your expedition streak."}
        </p>
      </div>
    </section>
  );
}