import {
  useEffect,
  useRef,
} from "react";

import {
  useLocation,
} from "react-router";

import {
  DIAGNOSTIC_RESULT_ROUTE,
  INITIAL_ASSESSMENT_ROUTE,
} from "./constants";

import {
  resetAssessmentProgress,
} from "./resetAssessmentProgress";

/* =========================================================
   Helpers
========================================================= */

function normalizePathname(
  pathname:
    string,
): string {
  if (
    pathname.length > 1 &&
    pathname.endsWith("/")
  ) {
    return pathname.replace(
      /\/+$/,
      "",
    );
  }

  return pathname;
}

/* =========================================================
   Assessment reset watcher
========================================================= */

export default function AssessmentResetOnExit() {
  const location =
    useLocation();

  const currentPathname =
    normalizePathname(
      location.pathname,
    );

  const assessmentPathname =
    normalizePathname(
      INITIAL_ASSESSMENT_ROUTE,
    );

  const resultPathname =
    normalizePathname(
      DIAGNOSTIC_RESULT_ROUTE,
    );

  const previousPathnameRef =
    useRef(
      currentPathname,
    );

  useEffect(
    () => {
      const previousPathname =
        previousPathnameRef.current;

      const userWasOnAssessment =
        previousPathname ===
        assessmentPathname;

      const userIsOnAssessment =
        currentPathname ===
        assessmentPathname;

      const userIsGoingToResult =
        currentPathname ===
        resultPathname;

      /*
       * Reset abandoned progress when leaving the assessment,
       * except for the successful transition to the result page.
       *
       * /onboarding/diagnostic
       *          ↓
       * /assessment/result
       *
       * is intentionally left untouched here. The result hook
       * clears assessment progress after the GET succeeds.
       */
      if (
        userWasOnAssessment &&
        !userIsOnAssessment &&
        !userIsGoingToResult
      ) {
        resetAssessmentProgress();
      }

      previousPathnameRef.current =
        currentPathname;
    },
    [
      assessmentPathname,
      currentPathname,
      resultPathname,
    ],
  );

  return null;
}