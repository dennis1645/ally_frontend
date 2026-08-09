import type {
  DailyObjective,
  EssayAnalysisScore,
  EssayGear,
  EssayRecommendation,
  EssayTemplate,
  EssayVersion,
  LanguageSkillProgress,
} from "../types/essayPass";

export const essayPassData = {
  progress:
    64,

  completedMilestones:
    4,

  totalMilestones:
    7,

  nextMilestone:
    "Interview Summit",

  daysRemaining:
    14,

  minimumWords:
    500,

  deadline: {
    scholarship:
      "Global Scholars Fellowship",

    date:
      "August 12, 2026",

    remaining:
      "3 days",
  },
};

export const essayTemplates:
  EssayTemplate[] = [
    {
      id:
        "personal-statement",

      title:
        "Personal Statement",

      description:
        "Focus on individual growth",

      sections: [
        "Introduction",
        "Academic Background",
        "Personal Growth",
        "Future Goals",
        "Scholarship Motivation",
        "Conclusion",
      ],

      content: `Introduction

Introduce who you are, the central experience that shaped your goals, and the direction of your scholarship journey.

Academic Background

Describe your academic preparation, relevant coursework, research, projects, or achievements.

Personal Growth

Explain a challenge or turning point and how it changed your skills, perspective, or leadership.

Future Goals

Describe the impact you want to create after completing your studies.

Scholarship Motivation

Explain why this scholarship and its community are the right fit for your goals.

Conclusion

Reconnect your past experience, current readiness, and future contribution in a concise closing paragraph.`,
    },
    {
      id:
        "motivation-letter",

      title:
        "Motivation Letter",

      description:
        "Articulate your path",

      sections: [
        "Opening",
        "Academic Background",
        "Motivation",
        "Relevant Experience",
        "Future Goals",
        "Closing",
      ],

      content: `Opening

State the programme or scholarship you are applying for and your primary motivation.

Academic Background

Summarize the academic experiences that prepared you for this opportunity.

Motivation

Explain why this programme, institution, and scholarship matter to your development.

Relevant Experience

Connect your projects, leadership, work, or community activities to the opportunity.

Future Goals

Describe how you plan to use the experience and what impact you want to create.

Closing

Reaffirm your motivation and readiness to contribute to the scholarship community.`,
    },
  ];

export const essayVersions:
  EssayVersion[] = [
    {
      id:
        3,

      label:
        "Version 3",

      dateLabel:
        "Today, 10:42 AM",

      characterCount:
        2840,

      content:
        "My scholarship journey has been shaped by a desire to connect academic learning with practical impact. Through university projects, leadership experiences, and collaboration with people from different backgrounds, I have learned that meaningful progress begins with curiosity and consistent action.\n\nI now want to build on that foundation through an international scholarship experience that will strengthen both my technical knowledge and my ability to contribute to communities around me.",
    },
    {
      id:
        2,

      label:
        "Version 2",

      dateLabel:
        "Yesterday, 6:20 PM",

      characterCount:
        2410,

      content:
        "My academic journey taught me that growth rarely happens in a straight line. The projects that challenged me most were also the ones that helped me understand how collaboration, persistence, and reflection shape stronger outcomes.\n\nA scholarship would allow me to deepen these lessons in a new academic environment and prepare for work that creates measurable value for others.",
    },
    {
      id:
        1,

      label:
        "Version 1",

      dateLabel:
        "Aug 7, 2026",

      characterCount:
        1850,

      content:
        "I am applying for this scholarship because I want to expand my academic perspective and develop the skills required to contribute more effectively to my field. My previous experiences have given me a strong starting point, and I am ready to take the next step.",
    },
  ];

export const essayAnalysisScores:
  EssayAnalysisScore[] = [
    {
      id:
        "grammar",

      label:
        "Grammar",

      value:
        92,

      tone:
        "green",
    },
    {
      id:
        "clarity",

      label:
        "Clarity",

      value:
        85,

      tone:
        "blue",
    },
    {
      id:
        "structure",

      label:
        "Structure",

      value:
        78,

      tone:
        "gold",
    },
    {
      id:
        "vocabulary",

      label:
        "Vocab",

      value:
        81,

      tone:
        "blue",
    },
    {
      id:
        "coherence",

      label:
        "Coherence",

      value:
        90,

      tone:
        "green",
    },
    {
      id:
        "impact",

      label:
        "Impact",

      value:
        64,

      tone:
        "red",
    },
  ];

export const essayRecommendations:
  EssayRecommendation[] = [
    {
      id:
        1,

      tone:
        "success",

      text:
        "Excellent transitions in paragraphs 2–3.",
    },
    {
      id:
        2,

      tone:
        "warning",

      text:
        "Passive voice detected in the conclusion.",
    },
    {
      id:
        3,

      tone:
        "success",

      text:
        "Your leadership example is clear and evidence-based.",
    },
    {
      id:
        4,

      tone:
        "warning",

      text:
        "Strengthen the final paragraph by reconnecting it to the scholarship mission.",
    },
  ];

export const languageProgress:
  LanguageSkillProgress[] = [
    {
      id:
        "reading",

      label:
        "Reading",

      progress:
        72,

      band:
        "7.5",
    },
    {
      id:
        "listening",

      label:
        "Listening",

      progress:
        64,

      band:
        "7.0",
    },
    {
      id:
        "writing",

      label:
        "Writing",

      progress:
        58,

      band:
        "6.5",
    },
    {
      id:
        "speaking",

      label:
        "Speaking",

      progress:
        68,

      band:
        "7.0",
    },
  ];

export const initialDailyObjectives:
  DailyObjective[] = [
    {
      id:
        1,

      title:
        "Finish essay introduction",

      completed:
        true,
    },
    {
      id:
        2,

      title:
        "30 min Listening drill",

      completed:
        false,
    },
  ];

export const essayGear:
  EssayGear[] = [
    {
      id:
        1,

      name:
        "Essay Compass",

      description:
        "Helps you keep each paragraph aligned with your main scholarship narrative.",

      unlocked:
        true,

      tone:
        "gold",
    },
    {
      id:
        2,

      name:
        "Language Lens",

      description:
        "Highlights clarity, vocabulary, and language-development opportunities.",

      unlocked:
        true,

      tone:
        "blue",
    },
    {
      id:
        3,

      name:
        "Interview Kit",

      description:
        "Unlocks after Essay Pass is complete and prepares you for Interview Summit.",

      unlocked:
        false,

      tone:
        "locked",
    },
  ];