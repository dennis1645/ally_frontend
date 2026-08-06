import type {
  AssessmentAnswers,
  AssessmentValidationResult,
  DiagnosticOption,
  DiagnosticQuestion,
  SubmitAssessmentPayload,
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
   Section validation
========================================================= */

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
   Submission payload creation
========================================================= */

export function createSubmissionPayload(
  questions:
    DiagnosticQuestion[],
  answers:
    AssessmentAnswers,
): SubmitAssessmentPayload {
  const validation =
    validateAllAnswers(
      questions,
      answers,
    );

  if (!validation.valid) {
    throw new Error(
      "Cannot create the submission payload because some questions are unanswered.",
    );
  }

  const sortedQuestions =
    [...questions].sort(
      (
        firstQuestion,
        secondQuestion,
      ) =>
        firstQuestion.order_number -
        secondQuestion.order_number,
    );

  return {
    answers:
      sortedQuestions.map(
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

          return {
            question_id:
              question.id,

            option_id:
              optionId,
          };
        },
      ),
  };
}