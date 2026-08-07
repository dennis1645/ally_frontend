import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  DiagnosticServiceError,
  diagnosticService,
} from "../services/diagnostic.service";

import type {
  DiagnosticQuestion,
} from "../types/diagnostic";

type DiagnosticQuestionsState = {
  questions:
    DiagnosticQuestion[];

  isLoading:
    boolean;

  error:
    DiagnosticServiceError | null;
};

export type UseDiagnosticQuestionsReturn = {
  questions:
    DiagnosticQuestion[];

  isLoading:
    boolean;

  isEmpty:
    boolean;

  error:
    DiagnosticServiceError | null;

  retry:
    () => Promise<void>;
};

function normalizeHookError(
  error: unknown,
): DiagnosticServiceError {
  if (
    error instanceof
    DiagnosticServiceError
  ) {
    return error;
  }

  return new DiagnosticServiceError(
    error instanceof Error
      ? error.message
      : "Unable to load assessment.",
    {
      code:
        "unknown",

      responseData:
        error,
    },
  );
}

export function useDiagnosticQuestions():
  UseDiagnosticQuestionsReturn {
  const [
    state,
    setState,
  ] =
    useState<DiagnosticQuestionsState>({
      questions: [],
      isLoading: true,
      error: null,
    });

  const activeControllerRef =
    useRef<AbortController | null>(
      null,
    );

  const requestIdRef =
    useRef(0);

  const loadQuestions =
    useCallback(
      async (): Promise<void> => {
        activeControllerRef.current?.abort();

        const controller =
          new AbortController();

        activeControllerRef.current =
          controller;

        const requestId =
          requestIdRef.current + 1;

        requestIdRef.current =
          requestId;

        setState(
          (currentState) => ({
            ...currentState,
            isLoading: true,
            error: null,
          }),
        );

        try {
          const questions =
            await diagnosticService.getQuestions(
              controller.signal,
            );

          if (
            controller.signal.aborted ||
            requestId !==
              requestIdRef.current
          ) {
            return;
          }

          setState({
            questions,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          if (
            controller.signal.aborted ||
            requestId !==
              requestIdRef.current
          ) {
            return;
          }

          setState({
            questions: [],
            isLoading: false,
            error:
              normalizeHookError(
                error,
              ),
          });
        }
      },
      [],
    );

  useEffect(() => {
    void loadQuestions();

    return () => {
      activeControllerRef.current?.abort();
    };
  }, [loadQuestions]);

  return {
    questions:
      state.questions,

    isLoading:
      state.isLoading,

    isEmpty:
      !state.isLoading &&
      state.error === null &&
      state.questions.length ===
        0,

    error:
      state.error,

    retry:
      loadQuestions,
  };
}