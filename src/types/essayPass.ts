export type EssayTemplateId =
  | "personal-statement"
  | "motivation-letter";

export type EssayTemplate = {
  id:
    EssayTemplateId;

  title:
    string;

  description:
    string;

  sections:
    string[];

  content:
    string;
};

export type EssayVersion = {
  id:
    number;

  label:
    string;

  dateLabel:
    string;

  characterCount:
    number;

  content:
    string;
};

export type EssayAnalysisScore = {
  id:
    string;

  label:
    string;

  value:
    number;

  tone:
    "green"
    | "blue"
    | "gold"
    | "red";
};

export type EssayRecommendation = {
  id:
    number;

  tone:
    "success"
    | "warning";

  text:
    string;
};

export type LanguageSkillProgress = {
  id:
    string;

  label:
    string;

  progress:
    number;

  band:
    string;
};

export type DailyObjective = {
  id:
    number;

  title:
    string;

  completed:
    boolean;
};

export type EssayGear = {
  id:
    number;

  name:
    string;

  description:
    string;

  unlocked:
    boolean;

  tone:
    "gold"
    | "blue"
    | "locked";
};

export type EssayPassRequirements = {
  essayDraft:
    boolean;

  minimumWordCount:
    boolean;

  aiAnalysis:
    boolean;

  languagePractice:
    boolean;

  dailyObjectives:
    boolean;
};