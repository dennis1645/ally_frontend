import {
  Award,
  FileCheck2,
  FolderCheck,
  Sun,
} from "lucide-react";

import type {
  QuestTrackerMockData,
} from "../types/questTracker";

export const questTrackerMockData: QuestTrackerMockData = {
  level:
    12,

  milestones: [
    {
      id:
        1,

      name:
        "Basecamp",

      status:
        "completed",
    },
    {
      id:
        2,

      name:
        "Research Trail",

      status:
        "completed",
    },
    {
      id:
        3,

      name:
        "Document Valley",

      status:
        "current",
    },
    {
      id:
        4,

      name:
        "Essay Pass",

      status:
        "locked",
    },
    {
      id:
        5,

      name:
        "Interview Summit",

      status:
        "locked",
    },
    {
      id:
        6,

      name:
        "Submission Gate",

      status:
        "locked",
    },
  ],

  currentMilestone: {
    title:
      "Document Valley",

    description:
      "Prepare your essential application documents",

    estimatedCompletion:
      "Oct 18",
  },

  /*
   * Three visible tasks match the supplied screenshot.
   *
   * The first two tasks carry 75% of the mock milestone weight,
   * so the initial UI is 75% complete while progress is still
   * calculated from the interactive checklist state.
   */
  checklist: [
    {
      id:
        1,

      title:
        "Upload transcript",

      dueDate:
        "Oct 05",

      completed:
        true,

      progressWeight:
        37.5,
    },
    {
      id:
        2,

      title:
        "Prepare CV",

      dueDate:
        "Oct 08",

      completed:
        true,

      progressWeight:
        37.5,
    },
    {
      id:
        3,

      title:
        "Request recommendation letter",

      statusLabel:
        "In Progress",

      completed:
        false,

      progressWeight:
        25,
    },
  ],

  upcomingTrails: [
    {
      id:
        1,

      title:
        "Draft Essay",

      priority:
        "High",

      dueDate:
        "Oct 20",
    },
    {
      id:
        2,

      title:
        "IELTS Practice",

      priority:
        "Medium",

      dueDate:
        "Oct 22",
    },
  ],

  badges: [
    {
      id:
        1,

      title:
        "Document Master",

      unlocked:
        true,

      icon:
        FolderCheck,
    },
    {
      id:
        2,

      title:
        "Early Riser",

      unlocked:
        true,

      icon:
        Sun,
    },
    {
      id:
        3,

      title:
        "Scholarship Ready",

      unlocked:
        false,

      icon:
        FileCheck2,
    },
    {
      id:
        4,

      title:
        "Summit Reached",

      unlocked:
        false,

      icon:
        Award,
    },
  ],
};