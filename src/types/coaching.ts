import type {
  LucideIcon,
} from "lucide-react";

export type CoachingPathId =
  | "consultation"
  | "essay-review"
  | "mock-interview"
  | "ielts-guidance";

export type CoachingGuidedPath = {
  id:
    CoachingPathId;

  title:
    string;

  description:
    string;

  actionLabel:
    string;

  icon:
    LucideIcon;

  tone:
    "blue" | "warm";
};

export type CoachingSession = {
  id:
    number;

  mentorName:
    string;

  mentorInitials:
    string;

  date:
    string;

  focus:
    string;

  focusTone:
    "blue" | "warm";

  notes:
    string;
};

export type UpcomingCoachingSession = {
  id:
    number;

  month:
    string;

  day:
    string;

  time:
    string;

  title:
    string;

  mentorName:
    string;

  mentorSubtitle:
    string;

  mentorInitials:
    string;

  countdownSeconds:
    number;
};