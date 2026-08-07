import type {
  DiagnosticQuestion,
} from "../types/diagnostic";

export const QUESTIONS_PER_PAGE =
  5;

export type AssessmentQuestionPage = {
  key: string;
  pageNumber: number;
  title: string;
  description: string;
  speech: string;
  questions: DiagnosticQuestion[];
};

type PageContent = {
  title: string;
  speech: string;
};

const PAGE_CONTENT: PageContent[] = [
  {
    title: "Your Starting Point",
    speech:
      "Let’s begin by learning more about your academic background and scholarship goals.",
  },
  {
    title: "Your Experience",
    speech:
      "Great progress! Now let’s explore the experiences and achievements that strengthen your profile.",
  },
  {
    title: "Your Preparation",
    speech:
      "You’re halfway there! These questions will help us understand your current application preparation.",
  },
  {
    title: "Your Readiness",
    speech:
      "Almost finished! Complete these final questions so Ally can calculate your readiness.",
  },
];

function sortQuestions(
  questions: DiagnosticQuestion[],
): DiagnosticQuestion[] {
  return [...questions].sort(
    (
      first,
      second,
    ): number => {
      const orderDifference =
        first.order_number -
        second.order_number;

      if (orderDifference !== 0) {
        return orderDifference;
      }

      return first.id - second.id;
    },
  );
}

function getPageContent(
  pageIndex: number,
): PageContent {
  return (
    PAGE_CONTENT[pageIndex] ?? {
      title: `Assessment Part ${
        pageIndex + 1
      }`,
      speech:
        "Continue answering each question honestly so Ally can understand your scholarship readiness.",
    }
  );
}

export function paginateQuestions(
  questions: DiagnosticQuestion[],
): AssessmentQuestionPage[] {
  const sortedQuestions =
    sortQuestions(questions);

  const pages:
    AssessmentQuestionPage[] =
    [];

  for (
    let startIndex = 0;
    startIndex <
    sortedQuestions.length;
    startIndex +=
      QUESTIONS_PER_PAGE
  ) {
    const questionsForPage =
      sortedQuestions.slice(
        startIndex,
        startIndex +
          QUESTIONS_PER_PAGE,
      );

    const pageIndex =
      pages.length;

    const pageNumber =
      pageIndex + 1;

    const firstQuestionNumber =
      startIndex + 1;

    const lastQuestionNumber =
      startIndex +
      questionsForPage.length;

    const content =
      getPageContent(
        pageIndex,
      );

    pages.push({
      key: `assessment-page-${pageNumber}`,

      pageNumber,

      title: content.title,

      description:
        `Questions ${firstQuestionNumber}–${lastQuestionNumber}. ` +
        "Select one answer for every question before continuing.",

      speech:
        content.speech,

      questions:
        questionsForPage,
    });
  }

  return pages;
}