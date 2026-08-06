import {
  AlertCircle,
  CalendarDays,
  FileText,
  Video,
} from "lucide-react";

type DeadlineTone =
  | "urgent"
  | "normal"
  | "event";

type Deadline = {
  id: number;
  title: string;
  detail: string;
  tone: DeadlineTone;
};

const dummyDeadlines:
  Deadline[] = [
  {
    id: 1,
    title:
      "Rhodes Scholarship Application",
    detail:
      "3 Days Remaining",
    tone:
      "urgent",
  },
  {
    id: 2,
    title:
      "Reference Letters Due",
    detail:
      "8 Days Remaining",
    tone:
      "normal",
  },
  {
    id: 3,
    title:
      "Interview Workshop",
    detail:
      "October 14, 2:00 PM",
    tone:
      "event",
  },
];

function DeadlineIcon({
  tone,
}: {
  tone: DeadlineTone;
}) {
  if (
    tone ===
    "urgent"
  ) {
    return (
      <AlertCircle
        size={15}
        aria-hidden="true"
      />
    );
  }

  if (
    tone ===
    "event"
  ) {
    return (
      <Video
        size={14}
        aria-hidden="true"
      />
    );
  }

  return (
    <FileText
      size={14}
      aria-hidden="true"
    />
  );
}

export default function UpcomingDeadlinesCard() {
  return (
    <section
      aria-labelledby="upcoming-deadlines-title"
      className={[
        "rounded-[24px]",
        "border border-orange-200",
        "bg-[#fff0e5] p-6",
        "shadow-[0_4px_18px_rgba(0,0,0,0.03)]",
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        <CalendarDays
          size={20}
          className="text-[#493426]"
          aria-hidden="true"
        />

        <h2
          id="upcoming-deadlines-title"
          className="text-lg font-bold text-[#39281c]"
        >
          Upcoming Deadlines
        </h2>
      </div>

      <div className="relative mt-6 ml-2 space-y-6 border-l-2 border-[#e1d4ca] pb-1">
        {dummyDeadlines.map(
          (
            deadline,
          ) => (
            <article
              key={
                deadline.id
              }
              className="relative pl-7"
            >
              <div
                className={[
                  "absolute -left-[11px] top-0.5",
                  "grid h-5 w-5 place-items-center rounded-full",
                  "border-2 border-[#fff0e5] text-white",
                  deadline.tone ===
                  "urgent"
                    ? "bg-red-600"
                    : "",
                  deadline.tone ===
                  "normal"
                    ? "bg-[#69ace1]"
                    : "",
                  deadline.tone ===
                  "event"
                    ? "bg-[#b88b5d]"
                    : "",
                ].join(" ")}
              >
                <DeadlineIcon
                  tone={
                    deadline.tone
                  }
                />
              </div>

              <h3 className="text-sm font-bold leading-5 text-slate-900">
                {deadline.title}
              </h3>

              <p
                className={[
                  "mt-1 text-xs",
                  deadline.tone ===
                  "urgent"
                    ? "font-bold text-red-600"
                    : "text-slate-500",
                ].join(" ")}
              >
                {deadline.detail}
              </p>
            </article>
          ),
        )}
      </div>

      <p className="mt-6 text-[11px] font-medium uppercase tracking-wider text-[#a07050]">
        Sample deadline data
      </p>
    </section>
  );
}