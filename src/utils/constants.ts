import type {
  AssessmentSectionDefinition,
  AssessmentSectionKey,
} from "../types/diagnostic";

/* =========================================================
   Assessment route
========================================================= */

export const INITIAL_ASSESSMENT_ROUTE =
  "/onboarding/diagnostic";

/* =========================================================
   Local-storage configuration
========================================================= */

export const ASSESSMENT_STORAGE_KEY =
  "ally.initial-assessment.v1";

export const ASSESSMENT_STORAGE_VERSION =
  1 as const;

/* =========================================================
   Step configuration
========================================================= */

export const QUESTION_SECTION_COUNT =
  7;

export const REVIEW_STEP_INDEX =
  7;

export const TOTAL_ASSESSMENT_STEPS =
  8;

/* =========================================================
   Section definitions
========================================================= */

export const ASSESSMENT_SECTION_DEFINITIONS:
  readonly AssessmentSectionDefinition[] =
  [
    {
      key: "academic",
      title: "Academic Background",
      description:
        "Tell us about your current academic journey and performance.",
      speech:
        "Let's start with your academic journey.",
      questionRange: [1, 4],
    },
    {
      key: "scholarship",
      title: "Scholarship Planning",
      description:
        "Share your scholarship goals and current preparation.",
      speech:
        "Great! Now let's discover where you're headed.",
      questionRange: [5, 6],
    },
    {
      key: "leadership",
      title: "Leadership",
      description:
        "Help us understand your leadership and community impact.",
      speech:
        "Every explorer leaves footprints. Tell me about yours.",
      questionRange: [7, 8],
    },
    {
      key: "experience",
      title: "Experience",
      description:
        "Share the experiences and skills that support your journey.",
      speech:
        "Experience makes every expedition stronger.",
      questionRange: [9, 12],
    },
    {
      key: "language",
      title: "Language",
      description:
        "Tell us about your communication and language readiness.",
      speech:
        "Communication is your passport to the world.",
      questionRange: [13, 14],
    },
    {
      key: "motivation",
      title: "Motivation",
      description:
        "Describe the purpose and motivation behind your goals.",
      speech:
        "Your destination begins with a clear purpose.",
      questionRange: [15, 16],
    },
    {
      key: "documents",
      title: "Documents",
      description:
        "Check the readiness of your scholarship documents.",
      speech:
        "Almost there! Let's prepare your expedition gear.",
      questionRange: [17, 18],
    },
    {
      key: "review",
      title: "Final Review",
      description:
        "Review your answers before calculating your readiness.",
      speech:
        "Everything looks ready. Let's calculate your readiness!",
      questionRange: null,
    },
  ] as const;

/* =========================================================
   Category aliases
========================================================= */

/**
 * The backend should ideally return:
 *
 * academic
 * scholarship
 * leadership
 * experience
 * language
 * motivation
 * documents
 *
 * These aliases allow the frontend to remain compatible with
 * slightly different backend naming conventions.
 */
export const ASSESSMENT_CATEGORY_ALIASES:
  Readonly<
    Record<
      Exclude<
        AssessmentSectionKey,
        "review"
      >,
      readonly string[]
    >
  > = {
  academic: [
    "academic",
    "academics",
    "academic_background",
    "academic background",
    "education",
    "education_background",
  ],

  scholarship: [
    "scholarship",
    "scholarship_planning",
    "scholarship planning",
    "scholarship_goals",
    "scholarship goals",
    "planning",
  ],

  leadership: [
    "leadership",
    "leadership_impact",
    "leadership impact",
    "community_impact",
    "community impact",
  ],

  experience: [
    "experience",
    "experiences",
    "skills",
    "achievements",
    "achievements_skills",
    "achievements and skills",
    "professional_experience",
  ],

  language: [
    "language",
    "english",
    "english_language",
    "english_communication",
    "english communication",
    "communication",
  ],

  motivation: [
    "motivation",
    "application_readiness",
    "application readiness",
    "readiness",
    "purpose",
    "goals",
  ],

  documents: [
    "documents",
    "document",
    "application_documents",
    "application documents",
    "document_readiness",
    "document readiness",
    "cv",
    "resume",
  ],
} as const;

/* =========================================================
   Shared interface messages
========================================================= */

export const ASSESSMENT_MESSAGES = {
  incompleteSection:
    "Please answer all questions before continuing.",

  emptyAssessment:
    "No assessment questions are currently available.",

  loadingError:
    "Unable to load assessment.",

  submissionError:
    "Unable to submit the assessment. Please try again.",

  invalidSubmission:
    "Some assessment answers are missing or invalid.",

  successfulSubmission:
    "Your assessment has been submitted successfully.",
} as const;