import type {
  LucideIcon,
} from "lucide-react";

export type QuestMilestoneStatus =
  | "completed"
  | "current"
  | "locked";

export type QuestMilestone = {
  id: number;
  name: string;
  description: string;
  status: QuestMilestoneStatus;

  /**
   * Whether Ally has revealed/generated this milestone yet.
   *
   * Locked milestones default to undiscovered when this value
   * is omitted. Set this to true when the API has generated the
   * milestone but it is still progression-locked.
   *
   * completed/current milestones are always shown.
   */
  isDiscovered?: boolean;

  /**
   * Existing app route used when the milestone can be opened.
   * Locked milestones remain non-interactive even when a future
   * destination is added.
   */
  destination?: string;
};

export type QuestChecklistItem = {
  id: number;
  title: string;
  dueDate?: string;
  statusLabel?: string;
  completed: boolean;
  progressWeight: number;
};

export type UpcomingTrailPriority =
  | "High"
  | "Medium";

export type UpcomingTrail = {
  id: number;
  title: string;
  priority: UpcomingTrailPriority;
  dueDate: string;
};

export type QuestAchievement = {
  id: number;
  title: string;
  unlocked: boolean;
  icon: LucideIcon;
};

export type QuestTrackerMockData = {
  level: number;
  milestones: QuestMilestone[];
  currentMilestone: {
    title: string;
    description: string;
    estimatedCompletion: string;
  };
  checklist: QuestChecklistItem[];
  upcomingTrails: UpcomingTrail[];
  badges: QuestAchievement[];
};