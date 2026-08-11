export type DashboardMentorTaskStatus =
  | "pending"
  | "in_progress"
  | "completed";

export type DashboardMentorTask = {
  id: string;
  title: string;
  description?: string;
  assignedBy: string;
  dueDate: string;
  status: DashboardMentorTaskStatus;
};

/**
 * Dashboard-only fallback data.
 *
 * No documented mentee-facing GET endpoint for mentor action plans was found
 * in the supplied API set, so temporary values stay isolated here.
 */
export const dashboardFallback = {
  streakCount: 3,

  mentorTasks: [
    {
      id: "mentor-task-1",
      title: "Prepare scholarship shortlist",
      description:
        "Review your strongest scholarship matches before your next mentor session.",
      assignedBy: "Kak Ria",
      dueDate: "2026-08-18",
      status: "in_progress",
    },
    {
      id: "mentor-task-2",
      title: "Review personal statement",
      description:
        "Refine the opening and make your motivation more specific.",
      assignedBy: "Kak Ria",
      dueDate: "2026-08-22",
      status: "pending",
    },
    {
      id: "mentor-task-3",
      title: "Complete IELTS practice",
      description:
        "Finish one focused practice session and note the areas that still need work.",
      assignedBy: "Mentor",
      dueDate: "2026-08-25",
      status: "pending",
    },
  ] satisfies DashboardMentorTask[],
} as const;