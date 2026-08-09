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
  status: QuestMilestoneStatus;
};

export type QuestChecklistItem = {
  id: number;
  title: string;
  dueDate?: string;
  statusLabel?: string;
  completed: boolean;

  /*
   * Mock-only progress weight.
   *
   * This lets the three visible checklist rows match the supplied
   * reference's initial 75% while keeping progress derived from
   * checklist state rather than hardcoding 75 in the component.
   */
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