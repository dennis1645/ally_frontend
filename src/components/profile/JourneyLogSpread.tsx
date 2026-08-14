import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Flag,
  Loader2,
  MapPin,
  Mountain,
  Plus,
  Save,
  Sparkles,
  Target,
  Trash2,
  Trophy,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  createOrUpdateJournalApi,
  deleteJournalApi,
  getAllJournalsApi,
  updateJournalApi,
  type JournalEntry,
  type JournalPayload,
} from "../../api/journalApi";

import {
  Modal,
  PrimaryButton,
  SecondaryButton,
} from "../ui";

/* =========================================================
   Types
========================================================= */

type JournalMode =
  | "view"
  | "create"
  | "edit";

type JournalFormState = {
  reflection: string;
  mood: string;
  goals: string;
  achievements: string;
  challenges: string;
  progress_notes: string;
  blockers: string;
};

type DetailCardProps = {
  title: string;
  value: string | null;
  icon: ReactNode;
  className?: string;
};

type JournalTextareaProps = {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  rows?: number;
  onChange: (
    value: string,
  ) => void;
};

/* =========================================================
   Constants
========================================================= */

const emptyJournalForm: JournalFormState =
  {
    reflection: "",
    mood: "",
    goals: "",
    achievements: "",
    challenges: "",
    progress_notes: "",
    blockers: "",
  };

const moodOptions = [
  {
    value: "Excited",
    emoji: "🤩",
  },
  {
    value: "Happy",
    emoji: "😊",
  },
  {
    value: "Focused",
    emoji: "🎯",
  },
  {
    value: "Calm",
    emoji: "😌",
  },
  {
    value: "Neutral",
    emoji: "😐",
  },
  {
    value: "Tired",
    emoji: "😮‍💨",
  },
  {
    value: "Overwhelmed",
    emoji: "😣",
  },
  {
    value: "Sad",
    emoji: "😔",
  },
] as const;

const requiredJournalFields: Array<{
  field: keyof JournalFormState;
  label: string;
}> = [
  {
    field: "mood",
    label: "Mood",
  },
  {
    field: "reflection",
    label: "Reflection",
  },
  {
    field: "goals",
    label: "Goals",
  },
  {
    field: "achievements",
    label: "Achievements",
  },
  {
    field: "challenges",
    label: "Challenges",
  },
  {
    field: "progress_notes",
    label: "Progress Notes",
  },
  {
    field: "blockers",
    label: "Blockers",
  },
];

const weekDays = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

const JOURNAL_TIME_ZONE =
  "Asia/Jakarta";

/* =========================================================
   Date helpers
========================================================= */

function getLocalDateKey(
  date = new Date(),
): string {
  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getJournalDateKey(
  value: string,
): string {
  const trimmedValue =
    value.trim();

  /*
   * The journal API logically stores a calendar date.
   * If the backend already returns YYYY-MM-DD, preserve it
   * exactly and do not run it through Date/timezone parsing.
   */
  const dateOnlyMatch =
    trimmedValue.match(
      /^(\d{4}-\d{2}-\d{2})$/,
    );

  if (dateOnlyMatch) {
    return dateOnlyMatch[1];
  }

  /*
   * Some backend serializers can return the same database
   * date as a UTC timestamp. For example:
   *
   * 2026-08-14 00:00 Asia/Jakarta
   * -> 2026-08-13T17:00:00Z
   *
   * Convert timestamps back to the journal's calendar
   * timezone before creating the YYYY-MM-DD lookup key.
   */
  const parsedDate =
    new Date(trimmedValue);

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
    /*
     * Defensive fallback for an unexpected backend value.
     * This preserves the old behavior rather than crashing.
     */
    return trimmedValue.slice(
      0,
      10,
    );
  }

  const dateParts =
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone:
          JOURNAL_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      },
    ).formatToParts(
      parsedDate,
    );

  const year =
    dateParts.find(
      (part) =>
        part.type === "year",
    )?.value;

  const month =
    dateParts.find(
      (part) =>
        part.type === "month",
    )?.value;

  const day =
    dateParts.find(
      (part) =>
        part.type === "day",
    )?.value;

  if (
    !year ||
    !month ||
    !day
  ) {
    return trimmedValue.slice(
      0,
      10,
    );
  }

  return `${year}-${month}-${day}`;
}

function parseDateKey(
  dateKey: string,
): Date {
  const [year, month, day] =
    dateKey
      .split("-")
      .map(Number);

  return new Date(
    year,
    month - 1,
    day,
  );
}

function formatDate(
  dateKey: string,
): string {
  return parseDateKey(
    dateKey,
  ).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );
}

function createCalendarDates(
  visibleMonth: Date,
): Date[] {
  const year =
    visibleMonth.getFullYear();

  const month =
    visibleMonth.getMonth();

  const firstWeekday =
    new Date(
      year,
      month,
      1,
    ).getDay();

  return Array.from(
    {
      length: 42,
    },
    (_, index) =>
      new Date(
        year,
        month,
        index -
          firstWeekday +
          1,
      ),
  );
}

/* =========================================================
   Journal helpers
========================================================= */

function getMoodIcon(
  mood:
    | string
    | null
    | undefined,
): string {
  const normalized =
    mood?.toLowerCase() ?? "";

  if (
    normalized.includes(
      "excited",
    ) ||
    normalized.includes(
      "productive",
    ) ||
    normalized.includes(
      "produktif",
    ) ||
    normalized.includes(
      "motivated",
    )
  ) {
    return "🤩";
  }

  if (
    normalized.includes("happy") ||
    normalized.includes("senang")
  ) {
    return "😊";
  }

  if (
    normalized.includes("focused") ||
    normalized.includes("focus")
  ) {
    return "🎯";
  }

  if (
    normalized.includes("calm")
  ) {
    return "😌";
  }

  if (
    normalized.includes("tired") ||
    normalized.includes("lelah")
  ) {
    return "😮‍💨";
  }

  if (
    normalized.includes(
      "overwhelmed",
    ) ||
    normalized.includes("stress")
  ) {
    return "😣";
  }

  if (
    normalized.includes("sad") ||
    normalized.includes("sedih")
  ) {
    return "😔";
  }

  if (
    normalized.includes(
      "neutral",
    )
  ) {
    return "😐";
  }

  return "🧭";
}

function journalToForm(
  journal: JournalEntry,
): JournalFormState {
  return {
    reflection:
      journal.reflection ?? "",

    mood:
      journal.mood ?? "",

    goals:
      journal.goals ?? "",

    achievements:
      journal.achievements ?? "",

    challenges:
      journal.challenges ?? "",

    progress_notes:
      journal.progress_notes ?? "",

    blockers:
      journal.blockers ?? "",
  };
}

/* =========================================================
   Reusable UI
========================================================= */

function DetailCard({
  title,
  value,
  icon,
  className = "",
}: DetailCardProps) {
  return (
    <article
      className={[
        "journey-detail-card",
        className,
      ].join(" ")}
    >
      <div className="flex items-center gap-2 text-[#7a582f]">
        {icon}

        <h3 className="font-bold">
          {title}
        </h3>
      </div>

      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
        {value?.trim() ||
          "Nothing recorded."}
      </p>
    </article>
  );
}

function JournalTextarea({
  id,
  label,
  value,
  placeholder,
  rows = 3,
  onChange,
}: JournalTextareaProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="passport-field-label"
      >
        {label}{" "}
        <span
          aria-hidden="true"
          className="text-red-600"
        >
          *
        </span>
      </label>

      <textarea
        id={id}
        rows={rows}
        required
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="passport-form-control mt-2 resize-y"
      />
    </div>
  );
}

/* =========================================================
   Main component
========================================================= */

export default function JourneyLogSpread() {
  const todayKey =
    getLocalDateKey();

  const todayDate =
    parseDateKey(todayKey);

  const [
    visibleMonth,
    setVisibleMonth,
  ] = useState(
    () =>
      new Date(
        todayDate.getFullYear(),
        todayDate.getMonth(),
        1,
      ),
  );

  const [
    selectedDate,
    setSelectedDate,
  ] = useState(todayKey);

  const [
    journals,
    setJournals,
  ] = useState<JournalEntry[]>(
    [],
  );

  const [
    mode,
    setMode,
  ] = useState<JournalMode>(
    "view",
  );

  const [
    form,
    setForm,
  ] = useState<JournalFormState>(
    emptyJournalForm,
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const [
    success,
    setSuccess,
  ] = useState<string | null>(
    null,
  );

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState<JournalEntry | null>(
    null,
  );

  /* =======================================================
     Load journals
  ======================================================= */

  const loadJournals =
    useCallback(
      async (): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
          const entries =
            await getAllJournalsApi(
              100,
            );

          setJournals(entries);
        } catch (loadError) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load the Journey Log.",
          );
        } finally {
          setIsLoading(false);
        }
      },
      [],
    );

  useEffect(() => {
    void loadJournals();
  }, [loadJournals]);

  /* =======================================================
     Derived values
  ======================================================= */

  const journalByDate =
    useMemo(() => {
      return new Map<
        string,
        JournalEntry
      >(
        journals.map(
          (journal) => [
            getJournalDateKey(
              journal.date,
            ),
            journal,
          ],
        ),
      );
    }, [journals]);

  const selectedJournal =
    journalByDate.get(
      selectedDate,
    ) ?? null;

  const selectedDateObject =
    parseDateKey(selectedDate);

  const isSelectedDateToday =
    selectedDate === todayKey;

  const isSelectedDateFuture =
    selectedDateObject.getTime() >
    todayDate.getTime();

  const selectedDateDisplay =
    formatDate(selectedDate);

  const calendarDates =
    useMemo(
      () =>
        createCalendarDates(
          visibleMonth,
        ),
      [visibleMonth],
    );

  const monthLabel =
    visibleMonth.toLocaleDateString(
      "en-US",
      {
        month: "long",
        year: "numeric",
      },
    );

  const currentMonthStart =
    new Date(
      todayDate.getFullYear(),
      todayDate.getMonth(),
      1,
    );

  const isNextMonthDisabled =
    visibleMonth.getFullYear() ===
      currentMonthStart.getFullYear() &&
    visibleMonth.getMonth() ===
      currentMonthStart.getMonth();

  /* =======================================================
     Calendar navigation
  ======================================================= */

  function moveMonth(
    amount: number,
  ): void {
    setVisibleMonth(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() +
            amount,
          1,
        ),
    );

    setMode("view");
    setError(null);
    setSuccess(null);
  }

  function selectCalendarDate(
    date: Date,
  ): void {
    const dateKey =
      getLocalDateKey(date);

    if (dateKey > todayKey) {
      return;
    }

    const selectedMonth =
      date.getMonth();

    const selectedYear =
      date.getFullYear();

    if (
      selectedMonth !==
        visibleMonth.getMonth() ||
      selectedYear !==
        visibleMonth.getFullYear()
    ) {
      setVisibleMonth(
        new Date(
          selectedYear,
          selectedMonth,
          1,
        ),
      );
    }

    setSelectedDate(dateKey);
    setMode("view");
    setError(null);
    setSuccess(null);
  }

  /* =======================================================
     Create and edit actions
  ======================================================= */

  function startCreateSelectedDate(): void {
    if (isSelectedDateFuture) {
      setError(
        "Journal entries cannot be created for future dates.",
      );

      return;
    }

    if (selectedJournal) {
      setForm(
        journalToForm(
          selectedJournal,
        ),
      );

      setMode("edit");
    } else {
      setForm({
        ...emptyJournalForm,
      });

      setMode("create");
    }

    setError(null);
    setSuccess(null);
  }

  function startEditing(): void {
    if (!selectedJournal) {
      return;
    }

    setForm(
      journalToForm(
        selectedJournal,
      ),
    );

    setMode("edit");
    setError(null);
    setSuccess(null);
  }

  function cancelEditing(): void {
    setMode("view");
    setError(null);

    if (selectedJournal) {
      setForm(
        journalToForm(
          selectedJournal,
        ),
      );
    } else {
      setForm({
        ...emptyJournalForm,
      });
    }
  }

  function updateField(
    field: keyof JournalFormState,
    value: string,
  ): void {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      }),
    );

    setError(null);
    setSuccess(null);
  }

  /* =======================================================
     Save journal
  ======================================================= */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (isSelectedDateFuture) {
      setError(
        "Journal entries cannot be saved for future dates.",
      );

      return;
    }

    for (
      const requiredField of
      requiredJournalFields
    ) {
      if (
        !form[
          requiredField.field
        ].trim()
      ) {
        setError(
          `${requiredField.label} is required.`,
        );

        return;
      }
    }

    const payload: JournalPayload =
      {
        date: selectedDate,

        reflection:
          form.reflection.trim(),

        mood:
          form.mood.trim(),

        goals:
          form.goals.trim(),

        achievements:
          form.achievements.trim(),

        challenges:
          form.challenges.trim(),

        progress_notes:
          form.progress_notes.trim(),

        blockers:
          form.blockers.trim(),
      };

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (
        mode === "edit" &&
        selectedJournal
      ) {
        await updateJournalApi(
          selectedJournal.id,
          payload,
        );

        setSuccess(
          `Journal entry for ${selectedDateDisplay} was updated.`,
        );
      } else {
        await createOrUpdateJournalApi(
          payload,
        );

        setSuccess(
          `Journal entry for ${selectedDateDisplay} was created.`,
        );
      }

      await loadJournals();

      setMode("view");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save the journal entry.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  /* =======================================================
     Delete journal
  ======================================================= */

  async function confirmDelete(): Promise<void> {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      await deleteJournalApi(
        deleteTarget.id,
      );

      setDeleteTarget(null);

      await loadJournals();

      setMode("view");

      setSuccess(
        `Journal entry for ${formatDate(
          getJournalDateKey(
            deleteTarget.date,
          ),
        )} was deleted.`,
      );
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete the journal entry.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  /* =======================================================
     Journal form
  ======================================================= */

  function renderJournalForm() {
    return (
      <form
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
        className="space-y-4"
      >
        <div className="rounded-2xl border-2 border-dashed border-[#c69c6e] bg-[#fff8e8] p-4">
          <p className="passport-field-label">
            Journal Date{" "}
            <span
              aria-hidden="true"
              className="text-red-600"
            >
              *
            </span>
          </p>

          <div className="mt-2 flex items-center gap-3">
            <CalendarDays
              size={21}
              className="shrink-0 text-[#7a582f]"
            />

            <div>
              <p className="font-bold text-[#2c1607]">
                {selectedDateDisplay}
              </p>

              <p className="text-xs text-slate-500">
                {isSelectedDateToday
                  ? "Today's expedition record"
                  : "Historical expedition record"}
              </p>
            </div>
          </div>
        </div>

        <fieldset>
          <legend className="passport-field-label">
            Mood{" "}
            <span
              aria-hidden="true"
              className="text-red-600"
            >
              *
            </span>
          </legend>

          <div
            id="journal-mood"
            className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-8"
          >
            {moodOptions.map(
              (
                option,
              ) => {
                const isSelected =
                  form.mood ===
                  option.value;

                return (
                  <button
                    key={
                      option.value
                    }
                    type="button"
                    aria-pressed={
                      isSelected
                    }
                    onClick={() =>
                      updateField(
                        "mood",
                        option.value,
                      )
                    }
                    aria-label={option.value}
                    title={option.value}
                    className={[
                      "flex min-h-14 items-center justify-center rounded-xl border-2 px-2 py-2.5 text-center transition",
                      "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
                      isSelected
                        ? "border-[#16629b] bg-[#eef6fb] text-[#16629b] shadow-sm"
                        : "border-dashed border-[#c69c6e] bg-[#fff8e8] text-[#7a582f] hover:bg-[#fff1dc]",
                    ].join(
                      " ",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="text-3xl leading-none"
                    >
                      {option.emoji}
                    </span>
                  </button>
                );
              },
            )}
          </div>
        </fieldset>

        <JournalTextarea
          id="journal-reflection"
          label="Reflection"
          rows={5}
          value={form.reflection}
          placeholder="What happened during this expedition?"
          onChange={(value) =>
            updateField(
              "reflection",
              value,
            )
          }
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <JournalTextarea
            id="journal-goals"
            label="Goals"
            value={form.goals}
            placeholder="What did you plan to complete?"
            onChange={(value) =>
              updateField(
                "goals",
                value,
              )
            }
          />

          <JournalTextarea
            id="journal-achievements"
            label="Achievements"
            value={
              form.achievements
            }
            placeholder="What progress did you make?"
            onChange={(value) =>
              updateField(
                "achievements",
                value,
              )
            }
          />

          <JournalTextarea
            id="journal-challenges"
            label="Challenges"
            value={
              form.challenges
            }
            placeholder="What difficulties did you face?"
            onChange={(value) =>
              updateField(
                "challenges",
                value,
              )
            }
          />

          <JournalTextarea
            id="journal-progress"
            label="Progress Notes"
            value={
              form.progress_notes
            }
            placeholder="Record any important progress."
            onChange={(value) =>
              updateField(
                "progress_notes",
                value,
              )
            }
          />
        </div>

        <JournalTextarea
          id="journal-blockers"
          label="Blockers"
          value={form.blockers}
          placeholder="What is stopping your progress?"
          onChange={(value) =>
            updateField(
              "blockers",
              value,
            )
          }
        />

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <SecondaryButton
            type="button"
            disabled={isSaving}
            onClick={
              cancelEditing
            }
          >
            Cancel
          </SecondaryButton>

          <PrimaryButton
            type="submit"
            isLoading={isSaving}
            loadingText="Saving log..."
            leftIcon={
              <Save size={18} />
            }
          >
            {mode === "edit"
              ? "Update This Entry"
              : isSelectedDateToday
                ? "Log Today's Climb"
                : "Create Entry for This Date"}
          </PrimaryButton>
        </div>
      </form>
    );
  }

  /* =======================================================
     Right-page journal content
  ======================================================= */

  function renderJournalDetails() {
    if (isLoading) {
      return (
        <div className="grid min-h-[420px] place-items-center">
          <div className="text-center">
            <Loader2 className="mx-auto animate-spin text-ally-primary" />

            <p className="mt-3 text-sm text-slate-500">
              Reading expedition
              records...
            </p>
          </div>
        </div>
      );
    }

    if (
      mode === "create" ||
      mode === "edit"
    ) {
      return renderJournalForm();
    }

    if (!selectedJournal) {
      return (
        <div className="grid min-h-[420px] place-items-center text-center">
          <div className="max-w-sm">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border-2 border-dashed border-[#c69c6e] bg-[#fff8e8] text-[#7a582f]">
              <MapPin size={31} />
            </div>

            <p className="passport-field-label mt-5">
              Selected Date
            </p>

            <h3 className="mt-1 text-xl font-bold">
              {selectedDateDisplay}
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              {isSelectedDateFuture
                ? "This expedition date has not arrived yet."
                : "No journal entry has been recorded for this date."}
            </p>

            {error && (
              <div
                role="alert"
                className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-left text-sm text-red-700"
              >
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <span>{error}</span>
              </div>
            )}

            {success && (
              <div
                role="status"
                className="mt-5 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-left text-sm text-green-700"
              >
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <span>{success}</span>
              </div>
            )}

            {!isSelectedDateFuture && (
              <PrimaryButton
                className="mt-6"
                leftIcon={
                  <Plus size={18} />
                }
                onClick={
                  startCreateSelectedDate
                }
              >
                {isSelectedDateToday
                  ? "Create Today's Journal"
                  : "Create Entry for This Date"}
              </PrimaryButton>
            )}
          </div>
        </div>
      );
    }

    return (
      <div
        key={selectedJournal.id}
        className="journey-detail-turn"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="passport-field-label">
              Expedition Date
            </p>

            <h2 className="mt-1 text-2xl font-extrabold">
              {formatDate(
                getJournalDateKey(
                  selectedJournal.date,
                ),
              )}
            </h2>
          </div>

          <div
            className="journey-mood-label"
            aria-label={selectedJournal.mood || "Unrecorded mood"}
            title={selectedJournal.mood || "Unrecorded mood"}
          >
            <span
              aria-hidden="true"
              className="text-3xl leading-none"
            >
              {getMoodIcon(
                selectedJournal.mood,
              )}
            </span>
          </div>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          <DetailCard
            title="Reflection"
            value={
              selectedJournal.reflection
            }
            icon={
              <BookOpen size={18} />
            }
            className="sm:col-span-2"
          />

          <DetailCard
            title="Goals"
            value={
              selectedJournal.goals
            }
            icon={
              <Target size={18} />
            }
          />

          <DetailCard
            title="Achievements"
            value={
              selectedJournal.achievements
            }
            icon={
              <Trophy size={18} />
            }
          />

          <DetailCard
            title="Challenges"
            value={
              selectedJournal.challenges
            }
            icon={
              <Mountain size={18} />
            }
          />

          <DetailCard
            title="Progress Notes"
            value={
              selectedJournal.progress_notes
            }
            icon={
              <Flag size={18} />
            }
          />

          <DetailCard
            title="Blockers"
            value={
              selectedJournal.blockers
            }
            icon={
              <AlertCircle
                size={18}
              />
            }
            className="sm:col-span-2"
          />
        </div>

        {success && (
          <div
            role="status"
            className="mt-5 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700"
          >
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span>{success}</span>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-[#eaded5] pt-5">
          <SecondaryButton
            leftIcon={
              <Edit3 size={17} />
            }
            onClick={startEditing}
          >
            Edit Entry
          </SecondaryButton>

          <SecondaryButton
            destructive
            leftIcon={
              <Trash2 size={17} />
            }
            onClick={() =>
              setDeleteTarget(
                selectedJournal,
              )
            }
          >
            Delete Entry
          </SecondaryButton>
        </div>
      </div>
    );
  }

  /* =======================================================
     Passport spread
  ======================================================= */

  return (
    <>
      <section className="passport-paper passport-paper-left">
        <div className="passport-page-heading">
          <div>
            <p className="passport-page-kicker">
              Monthly Expedition
            </p>

            <h2>Journey Log</h2>
          </div>

          <span>PAGE 05</span>
        </div>

        <div className="mt-7 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-extrabold">
              {monthLabel}
            </h3>

            <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <MapPin size={15} />

              Explorer Basecamp
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() =>
                moveMonth(-1)
              }
              className="journey-calendar-control"
            >
              <ChevronLeft
                size={19}
              />
            </button>

            <button
              type="button"
              aria-label="Next month"
              disabled={
                isNextMonthDisabled
              }
              onClick={() =>
                moveMonth(1)
              }
              className="journey-calendar-control disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ChevronRight
                size={19}
              />
            </button>
          </div>
        </div>

        <div className="journey-calendar mt-6">
          {weekDays.map(
            (day) => (
              <div
                key={day}
                className="journey-weekday"
              >
                {day}
              </div>
            ),
          )}

          {calendarDates.map(
            (date) => {
              const dateKey =
                getLocalDateKey(
                  date,
                );

              const journal =
                journalByDate.get(
                  dateKey,
                );

              const isCurrentMonth =
                date.getMonth() ===
                  visibleMonth.getMonth() &&
                date.getFullYear() ===
                  visibleMonth.getFullYear();

              const isSelected =
                dateKey ===
                selectedDate;

              const isToday =
                dateKey === todayKey;

              const isFuture =
                dateKey > todayKey;

              return (
                <button
                  key={dateKey}
                  type="button"
                  disabled={isFuture}
                  aria-label={
                    journal
                      ? `${formatDate(
                          dateKey,
                        )}, journal entry available`
                      : formatDate(
                          dateKey,
                        )
                  }
                  aria-current={
                    isSelected
                      ? "date"
                      : undefined
                  }
                  onClick={() =>
                    selectCalendarDate(
                      date,
                    )
                  }
                  className={[
                    "journey-calendar-day",

                    !isCurrentMonth
                      ? "is-outside"
                      : "",

                    isSelected
                      ? "is-selected"
                      : "",

                    isToday
                      ? "is-today"
                      : "",

                    journal
                      ? "has-entry"
                      : "",

                    isFuture
                      ? "is-future"
                      : "",
                  ].join(" ")}
                >
                  <span className="journey-day-number">
                    {date.getDate()}
                  </span>

                  {journal && (
                    <span
                      className="journey-calendar-stamp"
                      title={
                        journal.mood ??
                        "Journal entry"
                      }
                    >
                      {getMoodIcon(
                        journal.mood,
                      )}
                    </span>
                  )}
                </button>
              );
            },
          )}
        </div>

        <div className="mt-6 rounded-2xl border-2 border-dashed border-[#c69c6e] bg-[#fff8e8] p-4">
          <p className="passport-handwritten">
            Explorer&apos;s calendar
          </p>

          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            Select any past date to
            create a journal entry.
            Stamped dates contain saved
            records that can be edited
            or deleted.
          </p>
        </div>

        <CalendarDays className="passport-compass-mark" />
      </section>

      <section className="passport-paper passport-paper-right">
        <div className="passport-page-heading">
          <div>
            <p className="passport-page-kicker">
              Selected Record
            </p>

            <h2>Daily Entry</h2>
          </div>

          <span>PAGE 06</span>
        </div>

        <div className="mt-7">
          {renderJournalDetails()}
        </div>

        <Sparkles className="passport-map-mark" />
      </section>

      <Modal
        isOpen={
          deleteTarget !== null
        }
        onClose={() => {
          if (!isDeleting) {
            setDeleteTarget(null);
          }
        }}
        title="Delete this journal entry?"
        description="This expedition record will be permanently removed."
        footer={
          <>
            <SecondaryButton
              disabled={isDeleting}
              onClick={() =>
                setDeleteTarget(
                  null,
                )
              }
            >
              Keep Entry
            </SecondaryButton>

            <SecondaryButton
              destructive
              isLoading={isDeleting}
              loadingText="Deleting..."
              leftIcon={
                <Trash2 size={17} />
              }
              onClick={() => {
                void confirmDelete();
              }}
            >
              Delete Entry
            </SecondaryButton>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-slate-600">
          Deleted journal entries cannot
          be restored from this page.
        </p>
      </Modal>
    </>
  );
}