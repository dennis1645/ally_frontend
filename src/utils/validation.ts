import type {
  AssessmentAnswers,
  AssessmentAnswersPayload,
  AssessmentValidationResult,
  DiagnosticOption,
  DiagnosticQuestion,
} from "../types/diagnostic";

/* =========================================================
   Basic answer helpers
========================================================= */

export function getAnswerForQuestion(
  answers: AssessmentAnswers,
  questionId: number,
): number | undefined {
  return answers[
    String(questionId)
  ];
}

export function getSelectedOption(
  question: DiagnosticQuestion,
  answers: AssessmentAnswers,
): DiagnosticOption | null {
  const selectedOptionId =
    getAnswerForQuestion(
      answers,
      question.id,
    );

  if (
    selectedOptionId ===
    undefined
  ) {
    return null;
  }

  return (
    question.options.find(
      (option) =>
        option.id ===
        selectedOptionId,
    ) ?? null
  );
}

export function isQuestionAnswered(
  question: DiagnosticQuestion,
  answers: AssessmentAnswers,
): boolean {
  return (
    getSelectedOption(
      question,
      answers,
    ) !== null
  );
}

/* =========================================================
   Page validation
========================================================= */

/*
 * The original function name is retained because
 * useAssessment.ts currently imports validateSectionAnswers.
 *
 * In the current architecture, this validates one frontend
 * assessment page rather than an old category section.
 */
export function validateSectionAnswers(
  questions:
    DiagnosticQuestion[],
  answers:
    AssessmentAnswers,
): AssessmentValidationResult {
  const unansweredQuestionIds =
    questions
      .filter(
        (question) =>
          !isQuestionAnswered(
            question,
            answers,
          ),
      )
      .map(
        (question) =>
          question.id,
      );

  return {
    valid:
      unansweredQuestionIds.length ===
      0,

    unansweredQuestionIds,
  };
}

/*
 * Preferred page-based function name.
 */
export function validatePageAnswers(
  questions:
    DiagnosticQuestion[],
  answers:
    AssessmentAnswers,
): AssessmentValidationResult {
  return validateSectionAnswers(
    questions,
    answers,
  );
}

/* =========================================================
   Full assessment validation
========================================================= */

export function validateAllAnswers(
  questions:
    DiagnosticQuestion[],
  answers:
    AssessmentAnswers,
): AssessmentValidationResult {
  return validateSectionAnswers(
    questions,
    answers,
  );
}

/* =========================================================
   Submission-answer validation
========================================================= */

function assertValidSelectedOption(
  question: DiagnosticQuestion,
  optionId: number,
): void {
  const optionExists =
    question.options.some(
      (option) =>
        option.id ===
        optionId,
    );

  if (
    !optionExists
  ) {
    throw new Error(
      `Option ${optionId} is not valid for question ${question.id}.`,
    );
  }
}

/* =========================================================
   Answer-only payload creation
========================================================= */

/*
 * This helper creates only:
 *
 * {
 *   answers: [...]
 * }
 *
 * InitialAssessment.tsx is responsible for adding:
 *
 * - assessment_type
 * - guest_token
 */
export function createSubmissionPayload(
  questions:
    DiagnosticQuestion[],
  answers:
    AssessmentAnswers,
): AssessmentAnswersPayload {
  const validation =
    validateAllAnswers(
      questions,
      answers,
    );

  if (
    !validation.valid
  ) {
    throw new Error(
      "Cannot create the submission payload because some questions are unanswered.",
    );
  }

  /*
   * Preserve the question order supplied by the service.
   * The backend may restart order_number within categories,
   * so globally sorting only by order_number could reorder
   * questions incorrectly.
   */
  const payloadAnswers =
    questions.map(
      (question) => {
        const optionId =
          getAnswerForQuestion(
            answers,
            question.id,
          );

        if (
          optionId ===
          undefined
        ) {
          throw new Error(
            `Question ${question.id} does not have an answer.`,
          );
        }

        assertValidSelectedOption(
          question,
          optionId,
        );

        return {
          question_id:
            question.id,

          option_id:
            optionId,
        };
      },
    );

  return {
    answers:
      payloadAnswers,
  };
}