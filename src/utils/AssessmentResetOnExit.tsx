import {
  useEffect,
  useRef,
} from "react";

import {
  useLocation,
} from "react-router";

import {
  INITIAL_ASSESSMENT_ROUTE,
} from "../routes/assessment.routes";

import {
  resetAssessmentProgress,
} from "./resetAssessmentProgress";

export default function AssessmentResetOnExit() {
  const location =
    useLocation();

  const previousPathnameRef =
    useRef(
      location.pathname,
    );

  useEffect(() => {
    const previousPathname =
      previousPathnameRef.current;

    const userWasOnAssessment =
      previousPathname ===
      INITIAL_ASSESSMENT_ROUTE;

    const userIsStillOnAssessment =
      location.pathname ===
      INITIAL_ASSESSMENT_ROUTE;

    /*
     * Clear saved progress only when the user leaves
     * the assessment route.
     *
     * Moving between assessment pages 1–4 does not
     * change the URL, so answers remain available.
     */
    if (
      userWasOnAssessment &&
      !userIsStillOnAssessment
    ) {
      resetAssessmentProgress();
    }

    previousPathnameRef.current =
      location.pathname;
  }, [
    location.pathname,
  ]);

  return null;
}