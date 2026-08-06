import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  diagnosticService,
} from "../services/diagnostic.service";

import {
  useDiagnosticGuestToken,
} from "./useDiagnosticGuestToken";

import type {
  DiagnosticResultData,
} from "../types/diagnostic";

export type UseDiagnosticResultReturn = {
  result:
    DiagnosticResultData | null;

  isLoading:
    boolean;

  isMissingToken:
    boolean;

  error:
    Error | null;

  retry:
    () => void;
};

/* =========================================================
   Diagnostic result hook
========================================================= */

export function useDiagnosticResult():
  UseDiagnosticResultReturn {
  const {
    getGuestToken,
  } =
    useDiagnosticGuestToken();

  const [
    result,
    setResult,
  ] =
    useState<
      DiagnosticResultData | null
    >(
      null,
    );

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true);

  const [
    isMissingToken,
    setIsMissingToken,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<Error | null>(
      null,
    );

  const [
    requestVersion,
    setRequestVersion,
  ] =
    useState(0);

  /* =======================================================
     Retry
  ======================================================= */

  const retry =
    useCallback(
      (): void => {
        setRequestVersion(
          (
            currentVersion,
          ) =>
            currentVersion +
            1,
        );
      },
      [],
    );

  /* =======================================================
     Load anonymous result
  ======================================================= */

  useEffect(() => {
    const storedGuestToken =
      getGuestToken();

    /*
     * A visitor may open the result route directly without
     * previously completing an assessment.
     */
    if (
      !storedGuestToken
    ) {
      setResult(
        null,
      );

      setError(
        null,
      );

      setIsMissingToken(
        true,
      );

      setIsLoading(
        false,
      );

      return;
    }

    /*
     * After the null check, copy the value into a variable
     * explicitly typed as string.
     *
     * This prevents TypeScript from treating the captured
     * value as string | null inside the async function.
     */
    const guestToken:
      string =
      storedGuestToken;

    const controller =
      new AbortController();

    let requestIsActive =
      true;

    async function loadResult(
      token: string,
    ): Promise<void> {
      setIsLoading(
        true,
      );

      setIsMissingToken(
        false,
      );

      setError(
        null,
      );

      try {
        /*
         * GET /api/diagnostic/my-result
         *     ?guest_token=guest_...
         */
        const response =
          await diagnosticService.getMyResult(
            token,
            controller.signal,
          );

        if (
          !requestIsActive
        ) {
          return;
        }

        setResult(
          response.data,
        );
      } catch (
        requestError: unknown
      ) {
        if (
          controller.signal.aborted ||
          !requestIsActive
        ) {
          return;
        }

        setResult(
          null,
        );

        setError(
          requestError instanceof
            Error
            ? requestError
            : new Error(
                "Unable to load your assessment result.",
              ),
        );
      } finally {
        if (
          requestIsActive
        ) {
          setIsLoading(
            false,
          );
        }
      }
    }

    void loadResult(
      guestToken,
    );

    return () => {
      requestIsActive =
        false;

      controller.abort();
    };
  }, [
    getGuestToken,
    requestVersion,
  ]);

  return {
    result,

    isLoading,

    isMissingToken,

    error,

    retry,
  };
}