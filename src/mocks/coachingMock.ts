import {
  FileText,
  Globe2,
  MessageSquareText,
  PenLine,
} from "lucide-react";

import type {
  CoachingGuidedPath,
  CoachingSession,
  UpcomingCoachingSession,
} from "../types/coaching";

export const coachingHero = {
  quote:
    "Need expert advice? Every explorer benefits from an experienced guide before climbing the next mountain.",

  subtitle:
    "Learn from experienced mentors who have successfully reached the summit.",
};

export const upcomingCoachingSession:
  UpcomingCoachingSession = {
  id:
    1,

  month:
    "Oct",

  day:
    "12",

  time:
    "14:00 - 15:00 GMT+7",

  title:
    "Mock Interview Session",

  mentorName:
    "Sarah Jenkins",

  mentorSubtitle:
    "Chevening Alumna 2021",

  mentorInitials:
    "SJ",

  countdownSeconds:
    2 * 60 * 60 +
    14 * 60 +
    42,
};

export const coachingGuidedPaths:
  CoachingGuidedPath[] = [
    {
      id:
        "consultation",

      title:
        "Scholarship Consultation",

      description:
        "Map out your scholarship journey with a step-by-step strategy.",

      actionLabel:
        "Start Here",

      icon:
        FileText,

      tone:
        "blue",
    },
    {
      id:
        "essay-review",

      title:
        "Essay Review",

      description:
        "Polish your story. Get deep feedback on your personal statements.",

      actionLabel:
        "Submit Draft",

      icon:
        PenLine,

      tone:
        "warm",
    },
    {
      id:
        "mock-interview",

      title:
        "Mock Interview",

      description:
        "Face your nerves. Realistic interview simulations with experts.",

      actionLabel:
        "Practice Now",

      icon:
        MessageSquareText,

      tone:
        "blue",
    },
    {
      id:
        "ielts-guidance",

      title:
        "IELTS Guidance",

      description:
        "Master the language requirements and boost your overall score.",

      actionLabel:
        "Book Lesson",

      icon:
        Globe2,

      tone:
        "warm",
    },
  ];

export const coachingPastSessions:
  CoachingSession[] = [
    {
      id:
        1,

      mentorName:
        "Sarah Jenkins",

      mentorInitials:
        "SJ",

      date:
        "Sept 28, 2023",

      focus:
        "Essay Review",

      focusTone:
        "blue",

      notes:
        "Focused on strengthening the opening paragraph, clarifying leadership examples, and connecting the personal statement more directly to the scholarship's selection criteria.",
    },
    {
      id:
        2,

      mentorName:
        "Ahmed Khan",

      mentorInitials:
        "AK",

      date:
        "Sept 15, 2023",

      focus:
        "Discovery Call",

      focusTone:
        "warm",

      notes:
        "Reviewed target scholarships, application priorities, document readiness, and an initial preparation timeline for the next application cycle.",
    },
  ];