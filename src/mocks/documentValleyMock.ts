import {
  BadgeCheck,
  BookOpenCheck,
  FileBadge2,
  FileText,
  Globe2,
  GraduationCap,
  IdCard,
  LockKeyhole,
  Medal,
  MessageSquareText,
} from "lucide-react";

import type {
  BackpackSection,
  DocumentBadge,
  DocumentValleyChecklistItem,
  TrailReminder,
} from "../types/documentValley";

export const documentValleyMilestone = {
  title:
    "Document Valley",

  progress:
    75,

  dueDate:
    "Oct 15",

  readyCount:
    6,

  totalCount:
    9,
};

export const documentValleyChecklist:
  DocumentValleyChecklistItem[] = [
    {
      id:
        1,

      title:
        "Curriculum Vitae",

      status:
        "complete",

      statusText:
        "Updated 2 days ago",

      icon:
        FileText,
    },
    {
      id:
        2,

      title:
        "Academic Transcript",

      status:
        "complete",

      statusText:
        "Updated 1 week ago",

      icon:
        GraduationCap,
    },
    {
      id:
        3,

      title:
        "Degree Certificate",

      status:
        "missing",

      statusText:
        "Missing Document",

      actionLabel:
        "Upload Now",

      icon:
        FileBadge2,
    },
    {
      id:
        4,

      title:
        "Passport Copy",

      status:
        "complete",

      statusText:
        "Updated 1 month ago",

      icon:
        IdCard,
    },
    {
      id:
        5,

      title:
        "English Proficiency",

      status:
        "complete",

      statusText:
        "Updated 5 days ago",

      icon:
        Globe2,
    },
    {
      id:
        6,

      title:
        "Rec Letter (1)",

      status:
        "pending",

      statusText:
        "Awaiting Sign-off",

      actionLabel:
        "Remind Ref",

      icon:
        MessageSquareText,
    },
  ];

export const documentValleyBackpack:
  BackpackSection[] = [
    {
      id:
        "academic",

      title:
        "Academic Documents",

      status:
        "done",

      icon:
        GraduationCap,

      files: [
        {
          id:
            1,

          name:
            "Bachelor_Transcript_Final.pdf",

          size:
            "2.4 MB",
        },
        {
          id:
            2,

          name:
            "Graduation_Certificate.pdf",

          size:
            "1.1 MB",
        },
      ],
    },
    {
      id:
        "essays",

      title:
        "Essays & Motivation",

      status:
        "in-progress",

      icon:
        FileText,

      files: [
        {
          id:
            3,

          name:
            "Scholarship_Essay_Draft.docx",

          size:
            "684 KB",
        },
      ],
    },
    {
      id:
        "identity",

      title:
        "Identity Documents",

      status:
        "done",

      icon:
        IdCard,

      files: [
        {
          id:
            4,

          name:
            "Passport_Copy.pdf",

          size:
            "1.8 MB",
        },
        {
          id:
            5,

          name:
            "English_Certificate.pdf",

          size:
            "920 KB",
        },
      ],
    },
  ];

export const documentValleyMentorCheck = {
  insight:
    "Your CV looks good, but I recommend adding more specific metrics to your project descriptions for the Fulbright scholarship.",

  alert:
    "You're missing a certified translation for your Transcript. Most DAAD applications require this.",
};

export const documentValleyReminders:
  TrailReminder[] = [
    {
      id:
        1,

      title:
        "Rec Letter due in 5 days",

      description:
        "Professor Jenkins hasn't responded yet.",

      tone:
        "danger",
    },
    {
      id:
        2,

      title:
        "Update Essay Draft",

      description:
        "Last edited 10 days ago.",

      tone:
        "warm",
    },
  ];

export const documentValleyBadges:
  DocumentBadge[] = [
    {
      id:
        1,

      label:
        "Document Master",

      unlocked:
        true,

      icon:
        Medal,

      tone:
        "gold",
    },
    {
      id:
        2,

      label:
        "Valley Reader",

      unlocked:
        true,

      icon:
        BookOpenCheck,

      tone:
        "blue",
    },
    {
      id:
        3,

      label:
        "Scholarship Ready",

      unlocked:
        false,

      icon:
        LockKeyhole,

      tone:
        "locked",
    },
  ];

export const documentValleyQuickActions = [
  {
    id:
      "generate-cv",

    title:
      "Generate CV",

    description:
      "Use our AI templates",

    icon:
      BadgeCheck,

    tone:
      "blue",
  },
  {
    id:
      "download-templates",

    title:
      "Download Templates",

    description:
      "Pre-formatted docs",

    icon:
      FileText,

    tone:
      "warm",
  },
] as const;