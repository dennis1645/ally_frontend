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
  SubmitAssessmentPayload,
  SubmitAssessmentResponse,
} from "../types/diagnostic";

export type SubmitAssessmentStatus =
  | "idle"
  | "submitting"
  | "success"
  | "error";

export type UseSubmitAssessmentReturn = {
  status:
    SubmitAssessmentStatus;

  isSubmitting:
    boolean;

  isSuccess:
    boolean;

  error:
    DiagnosticServiceError | null;

  response:
    SubmitAssessmentResponse | null;

  submit: (
    payload:
      SubmitAssessmentPayload,
  ) => Promise<SubmitAssessmentResponse>;

  reset:
    () => void;
};

function normalizeSubmissionError(
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
      : "Unable to submit the assessment.",
    {
      code:
        "unknown",

      responseData:
        error,
    },
  );
}

export function useSubmitAssessment():
  UseSubmitAssessmentReturn {
  const [
    status,
    setStatus,
  ] =
    useState<SubmitAssessmentStatus>(
      "idle",
    );

  const [
    error,
    setError,
  ] =
    useState<DiagnosticServiceError | null>(
      null,
    );

  const [
    response,
    setResponse,
  ] =
    useState<SubmitAssessmentResponse | null>(
      null,
    );

  const controllerRef =
    useRef<AbortController | null>(
      null,
    );

  const activePromiseRef =
    useRef<Promise<SubmitAssessmentResponse> | null>(
      null,
    );

  const submit =
    useCallback(
      async (
        payload:
          SubmitAssessmentPayload,
      ): Promise<SubmitAssessmentResponse> => {
        if (
          activePromiseRef.current
        ) {
          return activePromiseRef.current;
        }

        const controller =
          new AbortController();

        controllerRef.current =
          controller;

        setStatus(
          "submitting",
        );

        setError(
          null,
        );

        setResponse(
          null,
        );

        const requestPromise =
          diagnosticService.submitAssessment(
            payload,
            controller.signal,
          );

        activePromiseRef.current =
          requestPromise;

        try {
          const submissionResponse =
            await requestPromise;

          if (
            controller.signal.aborted
          ) {
            throw new DiagnosticServiceError(
              "Assessment submission was cancelled.",
              {
                code:
                  "unknown",
              },
            );
          }

          setResponse(
            submissionResponse,
          );

          setStatus(
            "success",
          );

          return submissionResponse;
        } catch (
          submissionError
        ) {
          const normalizedError =
            normalizeSubmissionError(
              submissionError,
            );

          if (
            !controller.signal.aborted
          ) {
            setError(
              normalizedError,
            );

            setStatus(
              "error",
            );
          }

          throw normalizedError;
        } finally {
          activePromiseRef.current =
            null;

          controllerRef.current =
            null;
        }
      },
      [],
    );

  const reset =
    useCallback(() => {
      controllerRef.current?.abort();

      activePromiseRef.current =
        null;

      setStatus(
        "idle",
      );

      setError(
        null,
      );

      setResponse(
        null,
      );
    }, []);

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  return {
    status,

    isSubmitting:
      status ===
      "submitting",

    isSuccess:
      status ===
      "success",

    error,

    response,

    submit,

    reset,
  };
}