export type AIMentorMessageRole =
  | "assistant"
  | "user";

export type AIMentorMessage = {
  id: number;
  role: AIMentorMessageRole;
  text: string;
  time: string;
};

export type AIMentorToolId =
  | "essay-reviewer"
  | "cv-reviewer"
  | "interview-simulator"
  | "study-planner";

export type AIMentorTool = {
  id: AIMentorToolId;
  label: string;
  tone: "blue" | "warm";
};

export type AIMentorQuestTask = {
  id: number;
  label: string;
  completed: boolean;
};

export type AIMentorRecentSession = {
  id: number;
  category: "Essays" | "Scholarships";
  title: string;
};

export const aiMentorMock = {
  introduction:
    "Your expedition companion is here to guide you every step toward your scholarship summit.",

  welcomeMessage:
    "Hi, Explorer! I'm Ally,your expedition companion. Ask me anything about scholarships, essays, interviews, or your next milestone!",

  milestone: {
    name: "Document Valley",
    readiness: 45,
  },

  messages: [
    {
      id: 1,
      role: "assistant",
      text:
        "I've analyzed your progress in Document Valley. You're doing great, but your Recommendation Letters are still pending. Would you like me to draft an outreach email for your professors today?",
      time: "10:24 AM",
    },
    {
      id: 2,
      role: "user",
      text:
        "Yes, please! That would be a huge help. I need to reach out to Dr. Simmons and Prof. Zhang.",
      time: "10:25 AM",
    },
  ] satisfies AIMentorMessage[],

  quickPrompts: [
    "Help me find scholarships",
    "Review my scholarship essay",
    "Practice interview questions",
    "Create my study plan",
  ],

  tools: [
    {
      id: "essay-reviewer",
      label: "Essay Reviewer",
      tone: "blue",
    },
    {
      id: "cv-reviewer",
      label: "CV Reviewer",
      tone: "blue",
    },
    {
      id: "interview-simulator",
      label: "Interview Simulator",
      tone: "warm",
    },
    {
      id: "study-planner",
      label: "Study Planner",
      tone: "warm",
    },
  ] satisfies AIMentorTool[],

  currentQuest: {
    title: "Document Valley",
    progress: 45,

    tasks: [
      {
        id: 1,
        label: "Passport Copy",
        completed: true,
      },
      {
        id: 2,
        label: "2 Recommendation Letters",
        completed: false,
      },
      {
        id: 3,
        label: "English Proficiency Proof",
        completed: false,
      },
    ] satisfies AIMentorQuestTask[],
  },

  recentSessions: [
    {
      id: 1,
      category: "Essays",
      title: "Rhodes Scholarship Draft v2",
    },
    {
      id: 2,
      category: "Essays",
      title: "Common App Brainstorming",
    },
    {
      id: 3,
      category: "Scholarships",
      title: "Chevening Application Prep",
    },
  ] satisfies AIMentorRecentSession[],

  proTip:
    "When emailing professors for recommendations, include your updated CV and a short summary of the scholarship criteria to make their job easier.",
};