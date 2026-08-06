import {
  lazy,
  Suspense,
} from "react";

import {
  LoadingSkeleton,
} from "../components/assessment";

import {
  INITIAL_ASSESSMENT_ROUTE,
} from "../utils/constants";

const InitialAssessmentPage =
  lazy(
    () =>
      import(
        "../pages/InitialAssessment"
      ),
  );

export {
  INITIAL_ASSESSMENT_ROUTE,
};

export function InitialAssessmentRouteElement() {
  return (
    <Suspense
      fallback={
        <LoadingSkeleton />
      }
    >
      <InitialAssessmentPage />
    </Suspense>
  );
}