import {
  Check,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

type TodaysAscentCardProps = {
  weaknesses:
    readonly string[];
};

type GeneratedTask = {
  id: string;
  label: string;
};

const weaknessTaskMap:
  Record<string, string> = {
  english_not_certified:
    "Plan your English certification test",

  weak_storytelling:
    "Draft your personal scholarship story",

  cv_needs_improvement:
    "Strengthen your CV achievements",

  essay_incomplete:
    "Complete your scholarship essay draft",

  previous_rejection:
    "Review your previous scholarship application",

  unclear_rejection_reasons:
    "Identify possible rejection reasons",

  leadership_achievement_gap:
    "Add measurable leadership achievements",

  cv_format_issue:
    "Correct and standardize your CV format",
};

function createTasksFromWeaknesses(
  weaknesses:
    readonly string[],
): GeneratedTask[] {
  const uniqueWeaknesses =
    Array.from(
      new Set(
        weaknesses,
      ),
    );

  return uniqueWeaknesses
    .map(
      (
        weakness,
      ): GeneratedTask => ({
        id:
          weakness,

        label:
          weaknessTaskMap[
            weakness
          ] ??
          weakness
            .replaceAll(
              "_",
              " ",
            )
            .replace(
              /^\w/,
              (
                character,
              ) =>
                character.toUpperCase(),
            ),
      }),
    )
    .slice(
      0,
      5,
    );
}

export default function TodaysAscentCard({
  weaknesses,
}: TodaysAscentCardProps) {
  const tasks =
    useMemo(
      () =>
        createTasksFromWeaknesses(
          weaknesses,
        ),
      [
        weaknesses,
      ],
    );

  const taskSignature =
    tasks
      .map(
        (
          task,
        ) =>
          task.id,
      )
      .join("|");

  const [
    completedTaskIds,
    setCompletedTaskIds,
  ] =
    useState<Set<string>>(
      new Set(),
    );

  useEffect(() => {
    setCompletedTaskIds(
      new Set(),
    );
  }, [
    taskSignature,
  ]);

  function toggleTask(
    taskId: string,
  ): void {
    setCompletedTaskIds(
      (
        currentTasks,
      ) => {
        const nextTasks =
          new Set(
            currentTasks,
          );

        if (
          nextTasks.has(
            taskId,
          )
        ) {
          nextTasks.delete(
            taskId,
          );
        } else {
          nextTasks.add(
            taskId,
          );
        }

        return nextTasks;
      },
    );
  }

  return (
    <section
      aria-labelledby="todays-ascent-title"
      className={[
        "rounded-[24px]",
        "border border-orange-100",
        "bg-white p-6",
        "shadow-[0_6px_0_#d8c6ae]",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-4">
        <h2
          id="todays-ascent-title"
          className="text-lg font-bold text-slate-900"
        >
          Today&apos;s Ascent
        </h2>

        <span
          className={[
            "rounded-full bg-[#9dcdf4]",
            "px-2.5 py-1",
            "text-xs font-bold text-[#005596]",
          ].join(" ")}
        >
          {completedTaskIds.size}/
          {tasks.length}
        </span>
      </div>

      {tasks.length >
      0 ? (
        <ul className="mt-6 space-y-4">
          {tasks.map(
            (
              task,
            ) => {
              const isCompleted =
                completedTaskIds.has(
                  task.id,
                );

              return (
                <li
                  key={
                    task.id
                  }
                  className="flex items-start gap-3"
                >
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={
                      isCompleted
                    }
                    aria-label={`${isCompleted ? "Mark incomplete" : "Mark complete"}: ${task.label}`}
                    onClick={() =>
                      toggleTask(
                        task.id,
                      )
                    }
                    className={[
                      "mt-0.5 grid h-6 w-6 shrink-0 place-items-center",
                      "rounded-md border-2 transition",
                      "focus-visible:outline-none",
                      "focus-visible:ring-4 focus-visible:ring-blue-200",
                      isCompleted
                        ? "border-[#1269a1] bg-[#1269a1] text-white"
                        : "border-[#ead2b4] bg-white text-transparent hover:border-[#79b7ef]",
                    ].join(" ")}
                  >
                    <Check
                      size={15}
                      strokeWidth={3}
                      aria-hidden="true"
                    />
                  </button>

                  <p
                    className={[
                      "text-sm leading-6",
                      isCompleted
                        ? "text-slate-400 line-through"
                        : "font-medium text-slate-700",
                    ].join(" ")}
                  >
                    {task.label}
                  </p>
                </li>
              );
            },
          )}
        </ul>
      ) : (
        <p className="mt-5 text-sm leading-6 text-slate-500">
          No recommended tasks are available yet.
        </p>
      )}

      <p className="mt-5 text-xs leading-5 text-slate-400">
        Completion is currently stored only for this browser session.
      </p>
    </section>
  );
}