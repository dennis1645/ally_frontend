import {
  Award,
  FileCheck2,
  FolderSearch2,
  MapPinned,
} from "lucide-react";

import type {
  QuestTrackerMockData,
} from "../types/questTracker";

/**
 * Frontend-only expedition state.
 *
 * Ally now shows six milestones in total:
 *
 * 1. Basecamp — starter/setup checkpoint
 * 2. Research Trail
 * 3. Document Valley
 * 4. Essay Pass
 * 5. Interview Summit
 * 6. Submission Gate
 *
 * Basecamp represents the explorer's starting preparation and is
 * already completed once they reach the main scholarship expedition.
 * Research Trail remains the first active scholarship-preparation
 * milestone.
 *
 * Fog-of-war rule:
 * - completed/current -> visible
 * - locked + isDiscovered: false -> covered by fog
 * - locked + isDiscovered: true -> visible but still locked
 *
 * Replace these values with API-backed journey state later without
 * changing the Quest Tracker component contract.
 */
export const questTrackerMockData: QuestTrackerMockData = {
  level: 1,

  milestones: [
    {
      id: 1,
      name: "Basecamp",
      description:
        "Set up your explorer profile and readiness baseline before beginning the scholarship trail.",
      status: "completed",
      isDiscovered: true,
    },
    {
      id: 2,
      name: "Research Trail",
      description:
        "Use Ally AI to discover scholarships that match your goals, profile, and study plans.",
      status: "current",
      isDiscovered: true,
      destination: "/scholarships",
    },
    {
      id: 3,
      name: "Document Valley",
      description:
        "Gather transcripts, your CV, reference letters, and the supporting documents each application needs.",
      status: "locked",
      isDiscovered: false,
      destination: "/quests/document-valley",
    },
    {
      id: 4,
      name: "Essay Pass",
      description:
        "Draft and refine your personal statement with Ally AI and mentor feedback.",
      status: "locked",
      isDiscovered: false,
      destination: "/quests/essay-pass",
    },
    {
      id: 5,
      name: "Interview Summit",
      description:
        "Practice mock interviews and prepare confident answers for scholarship panels.",
      status: "locked",
      isDiscovered: false,
    },
    {
      id: 6,
      name: "Submission Gate",
      description:
        "Complete your final review before submitting on the scholarship's official website.",
      status: "locked",
      isDiscovered: false,
    },
  ],

  currentMilestone: {
    title: "Research Trail",
    description:
      "Discover scholarships that match your goals and build your first shortlist.",
    estimatedCompletion: "Start now",
  },

  checklist: [
    {
      id: 1,
      title: "Define your scholarship goals",
      statusLabel: "Ready",
      completed: false,
      progressWeight: 30,
    },
    {
      id: 2,
      title: "Run your first Ally scholarship match",
      statusLabel: "Next",
      completed: false,
      progressWeight: 40,
    },
    {
      id: 3,
      title: "Save scholarships to your shortlist",
      statusLabel: "Locked",
      completed: false,
      progressWeight: 30,
    },
  ],

  upcomingTrails: [
    {
      id: 1,
      title: "Prepare document checklist",
      priority: "High",
      dueDate: "After Research Trail",
    },
    {
      id: 2,
      title: "Plan your personal statement",
      priority: "Medium",
      dueDate: "After Document Valley",
    },
  ],

  badges: [
    {
      id: 1,
      title: "Trail Scout",
      unlocked: false,
      icon: MapPinned,
    },
    {
      id: 2,
      title: "Research Ready",
      unlocked: false,
      icon: FolderSearch2,
    },
    {
      id: 3,
      title: "Scholarship Ready",
      unlocked: false,
      icon: FileCheck2,
    },
    {
      id: 4,
      title: "Summit Reached",
      unlocked: false,
      icon: Award,
    },
  ],
};