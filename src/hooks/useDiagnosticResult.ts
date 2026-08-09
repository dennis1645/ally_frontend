import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useLocation,
} from "react-router";

import {
  diagnosticService,
} from "../services/diagnostic.service";

import {
  useDiagnosticGuestToken,
} from "./useDiagnosticGuestToken";

import {
  DIAGNOSTIC_GUEST_TOKEN_STORAGE_KEY,
} from "../utils/constants";

import {
  resetAssessmentProgress,
} from "../utils/resetAssessmentProgress";

import type {
  DiagnosticResultData,
} from "../types/diagnostic";

/* =========================================================
   Types
========================================================= */

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

type DiagnosticResultRouteState = {
  guestToken?:
    string;
};

/* =========================================================
   Helpers
========================================================= */

function getRouteGuestToken(
  state:
    unknown,
): string | null {
  if (
    !state ||
    typeof state !==
      "object"
  ) {
    return null;
  }

  const guestToken =
    (
      state as
        DiagnosticResultRouteState
    ).guestToken;

  if (
    typeof guestToken !==
      "string"
  ) {
    return null;
  }

  return (
    guestToken.trim() ||
    null
  );
}

/* =========================================================
   Diagnostic result hook
========================================================= */

export function useDiagnosticResult():
  UseDiagnosticResultReturn {
  const location =
    useLocation();

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
    useState(
      true,
    );

  const [
    isMissingToken,
    setIsMissingToken,
  ] =
    useState(
      false,
    );

  const [
    error,
    setError,
  ] =
    useState<
      Error | null
    >(
      null,
    );

  const [
    requestVersion,
    setRequestVersion,
  ] =
    useState(
      0,
    );

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

  useEffect(
    () => {
      const storedGuestToken =
        getGuestToken();

      const routeGuestToken =
        getRouteGuestToken(
          location.state,
        );

      const resolvedGuestToken =
        storedGuestToken ??
        routeGuestToken;

      if (
        import.meta.env.DEV
      ) {
        console.info(
          "[Diagnostic] Result page hook mounted.",
          {
            path:
              location.pathname,

            has_stored_guest_token:
              Boolean(
                storedGuestToken,
              ),

            has_route_guest_token:
              Boolean(
                routeGuestToken,
              ),
          },
        );
      }

      if (
        !resolvedGuestToken
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
       * Restore the exact submitted token if localStorage was
       * unexpectedly cleared during the route transition.
       * Never create a new token on the result page.
       */
      if (
        !storedGuestToken &&
        routeGuestToken
      ) {
        window.localStorage.setItem(
          DIAGNOSTIC_GUEST_TOKEN_STORAGE_KEY,
          routeGuestToken,
        );
      }

      const controller =
        new AbortController();

      let requestIsActive =
        true;

      async function loadResult(
        guestToken:
          string,
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

        if (
          import.meta.env.DEV
        ) {
          console.info(
            "[Diagnostic] GET /api/diagnostic/my-result started.",
            {
              has_guest_token:
                true,
            },
          );
        }

        try {
          const response =
            await diagnosticService.getMyResult(
              guestToken,
              controller.signal,
            );

          if (
            !requestIsActive
          ) {
            return;
          }

          const resultData =
            response.data;

          if (
            !resultData
          ) {
            throw new Error(
              response.message ??
                "The assessment result response did not include result data.",
            );
          }

          setResult(
            resultData,
          );

          /*
           * Only clear answers/page progress after GET confirms
           * that the result is retrievable.
           *
           * This utility intentionally does not clear the
           * diagnostic guest token.
           */
          resetAssessmentProgress();

          if (
            import.meta.env.DEV
          ) {
            console.info(
              "[Diagnostic] Assessment result loaded.",
              {
                result_id:
                  resultData.id,

                readiness_level:
                  resultData
                    .readiness_level ??
                  null,

                overall_score:
                  resultData
                    .overall_score,
              },
            );
          }
        } catch (
          requestError:
            unknown
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

          if (
            import.meta.env.DEV
          ) {
            console.error(
              "[Diagnostic] Failed to load assessment result.",
              requestError,
            );
          }
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
        resolvedGuestToken,
      );

      return () => {
        requestIsActive =
          false;

        controller.abort();
      };
    },
    [
      getGuestToken,
      location.pathname,
      location.state,
      requestVersion,
    ],
  );

  return {
    result,

    isLoading,

    isMissingToken,

    error,

    retry,
  };
}

export default useDiagnosticResult;