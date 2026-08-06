import {
  ASSESSMENT_CATEGORY_ALIASES,
} from "./constants";

import type {
  AssessmentSection,
  AssessmentSectionDefinition,
  AssessmentSectionKey,
  DiagnosticQuestion,
} from "../types/diagnostic";

type QuestionSectionKey =
  Exclude<
    AssessmentSectionKey,
    "review"
  >;

/* =========================================================
   Category normalization
========================================================= */

function normalizeCategory(
  category: string,
): string {
  return category
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, "_");
}

function createCategoryLookup():
  Map<string, QuestionSectionKey> {
  const lookup =
    new Map<
      string,
      QuestionSectionKey
    >();

  const entries =
    Object.entries(
      ASSESSMENT_CATEGORY_ALIASES,
    ) as Array<
      [
        QuestionSectionKey,
        readonly string[],
      ]
    >;

  for (
    const [
      sectionKey,
      aliases,
    ] of entries
  ) {
    lookup.set(
      normalizeCategory(
        sectionKey,
      ),
      sectionKey,
    );

    for (const alias of aliases) {
      lookup.set(
        normalizeCategory(
          alias,
        ),
        sectionKey,
      );
    }
  }

  return lookup;
}

const CATEGORY_LOOKUP =
  createCategoryLookup();

/* =========================================================
   Question assignment
========================================================= */

function findSectionByCategory(
  category: string,
): QuestionSectionKey | null {
  return (
    CATEGORY_LOOKUP.get(
      normalizeCategory(
        category,
      ),
    ) ?? null
  );
}

function findSectionByOrderNumber(
  orderNumber: number,
  definitions:
    readonly AssessmentSectionDefinition[],
): QuestionSectionKey | null {
  const matchingDefinition =
    definitions.find(
      (definition) => {
        if (
          definition.key ===
            "review" ||
          !definition.questionRange
        ) {
          return false;
        }

        const [
          firstQuestion,
          lastQuestion,
        ] =
          definition.questionRange;

        return (
          orderNumber >=
            firstQuestion &&
          orderNumber <=
            lastQuestion
        );
      },
    );

  if (
    !matchingDefinition ||
    matchingDefinition.key ===
      "review"
  ) {
    return null;
  }

  return matchingDefinition.key;
}

function resolveQuestionSection(
  question: DiagnosticQuestion,
  definitions:
    readonly AssessmentSectionDefinition[],
): QuestionSectionKey | null {
  const categorySection =
    findSectionByCategory(
      question.category,
    );

  if (categorySection) {
    return categorySection;
  }

  /*
   * Fallback for legacy or unexpected backend category names.
   * Category remains the primary grouping mechanism.
   */
  return findSectionByOrderNumber(
    question.order_number,
    definitions,
  );
}

/* =========================================================
   Main grouping function
========================================================= */

export function groupQuestions(
  questions:
    DiagnosticQuestion[],
  definitions:
    readonly AssessmentSectionDefinition[],
): AssessmentSection[] {
  const groupedQuestions =
    new Map<
      QuestionSectionKey,
      DiagnosticQuestion[]
    >();

  for (const definition of definitions) {
    if (
      definition.key !==
      "review"
    ) {
      groupedQuestions.set(
        definition.key,
        [],
      );
    }
  }

  const sortedQuestions =
    [...questions].sort(
      (
        firstQuestion,
        secondQuestion,
      ) => {
        if (
          firstQuestion.order_number !==
          secondQuestion.order_number
        ) {
          return (
            firstQuestion.order_number -
            secondQuestion.order_number
          );
        }

        return (
          firstQuestion.id -
          secondQuestion.id
        );
      },
    );

  for (
    const question of
      sortedQuestions
  ) {
    const sectionKey =
      resolveQuestionSection(
        question,
        definitions,
      );

    if (!sectionKey) {
      if (import.meta.env.DEV) {
        console.warn(
          `[Assessment] Question ${question.id} could not be assigned to a section.`,
          {
            category:
              question.category,
            orderNumber:
              question.order_number,
          },
        );
      }

      continue;
    }

    groupedQuestions
      .get(sectionKey)
      ?.push(question);
  }

  return definitions.map(
    (
      definition,
    ): AssessmentSection => ({
      key:
        definition.key,

      title:
        definition.title,

      description:
        definition.description,

      speech:
        definition.speech,

      questions:
        definition.key ===
        "review"
          ? []
          : groupedQuestions.get(
              definition.key,
            ) ?? [],
    }),
  );
}