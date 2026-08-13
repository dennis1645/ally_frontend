import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  MailCheck,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router";

import {
  clearAuthToken,
  storeAuthToken,
} from "../../api/apiClient";

import {
  useAuth,
} from "../../context/AuthContext";

/* =========================================================
   Constants
========================================================= */

const PENDING_EMAIL_STORAGE_KEY =
  "ally.pendingVerificationEmail";

/* =========================================================
   Helpers
========================================================= */

function isVerifiedValue(
  value: string | null,
): boolean {
  if (!value) {
    return false;
  }

  return [
    "1",
    "true",
    "yes",
    "verified",
  ].includes(
    value.trim().toLowerCase(),
  );
}

function clearPendingVerificationEmail(): void {
  try {
    window.localStorage.removeItem(
      PENDING_EMAIL_STORAGE_KEY,
    );

    window.sessionStorage.removeItem(
      PENDING_EMAIL_STORAGE_KEY,
    );
  } catch {
    // Cleanup is non-critical.
  }
}

function removeTokenFromVisibleUrl(): void {
  try {
    /*
     * The backend redirects to:
     *
     * /profile?token=...&verified=true
     *
     * Remove the token from the address bar immediately so it is
     * not left visible while the token is being validated.
     */
    window.history.replaceState(
      window.history.state,
      document.title,
      "/profile",
    );
  } catch {
    // The later dashboard navigation also replaces the callback URL.
  }
}

/* =========================================================
   Callback gate
========================================================= */

/**
 * This route guard must sit OUTSIDE ProtectedRoute.
 *
 * Normal visit:
 *
 * /profile
 *   -> <Outlet />
 *   -> ProtectedRoute
 *   -> RoleRoute
 *   -> ProfilePage
 *
 * Email verification callback:
 *
 * /profile?token=...&verified=true
 *   -> read backend token
 *   -> remove token from visible URL
 *   -> save token
 *   -> GET /api/profile through refreshProfile()
 *   -> /dashboard
 */
export default function EmailVerificationCallbackGate() {
  const location =
    useLocation();

  const navigate =
    useNavigate();

  const [
    searchParams,
  ] =
    useSearchParams();

  const {
    refreshProfile,
  } =
    useAuth();

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const processingRef =
    useRef(false);

  const callback =
    useMemo(
      () => {
        const isProfilePath =
          location.pathname ===
          "/profile";

        const hasCallbackParameters =
          searchParams.has("token") ||
          searchParams.has("verified");

        const token =
          searchParams
            .get("token")
            ?.trim() ??
          "";

        const verified =
          isVerifiedValue(
            searchParams.get(
              "verified",
            ),
          );

        return {
          isCallback:
            isProfilePath &&
            hasCallbackParameters,
          token,
          verified,
        };
      },
      [
        location.pathname,
        searchParams,
      ],
    );

  useEffect(
    () => {
      if (
        !callback.isCallback ||
        processingRef.current
      ) {
        return;
      }

      processingRef.current =
        true;

      /*
       * Scrub the sensitive token from the visible URL before any
       * asynchronous request begins.
       */
      removeTokenFromVisibleUrl();

      async function completeVerification(): Promise<void> {
        if (!callback.verified) {
          clearAuthToken();

          setError(
            "The verification link did not confirm a successful email verification.",
          );

          return;
        }

        if (!callback.token) {
          clearAuthToken();

          setError(
            "The verification link did not include a valid authentication token.",
          );

          return;
        }

        try {
          /*
           * The token came from the backend after successful email
           * verification.
           *
           * `true` stores it in localStorage so the verified session
           * survives a refresh/new tab.
           *
           * storeAuthToken() also clears an older registration token
           * before saving this verified one.
           */
          storeAuthToken(
            callback.token,
            "Bearer",
            true,
          );

          /*
           * Do not trust `verified=true` alone.
           *
           * Validate the token against the real authenticated profile
           * endpoint. refreshProfile() also updates AuthContext.
           */
          await refreshProfile();

          clearPendingVerificationEmail();

          navigate(
            "/dashboard",
            {
              replace: true,
            },
          );
        } catch (verificationError) {
          clearAuthToken();

          setError(
            verificationError instanceof Error
              ? verificationError.message
              : "We could not validate your verified session. Please sign in and try again.",
          );
        }
      }

      void completeVerification();
    },
    [
      callback.isCallback,
      callback.token,
      callback.verified,
      navigate,
      refreshProfile,
    ],
  );

  /*
   * Not a backend verification callback.
   * Continue through the app's normal ProtectedRoute.
   */
  if (!callback.isCallback) {
    return <Outlet />;
  }

  return (
    <main className="grid min-h-screen place-items-center bg-ally-background px-6">
      <section className="w-full max-w-md rounded-[32px] border border-ally-border bg-ally-surface p-7 text-center shadow-sm sm:p-8">
        {error ? (
          <>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-500">
              <AlertCircle
                size={27}
                aria-hidden="true"
              />
            </div>

            <h1 className="mt-5 text-xl font-bold text-ally-primary">
              Verification Session Error
            </h1>

            <p className="mt-2 text-sm leading-6 text-ally-muted">
              {error}
            </p>

            <button
              type="button"
              onClick={() => {
                navigate(
                  "/auth?mode=login",
                  {
                    replace: true,
                  },
                );
              }}
              className="squishy-button mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-ally-blue py-4 font-bold text-white"
            >
              Go to Sign In
            </button>
          </>
        ) : (
          <>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-ally-surface-strong text-ally-primary">
              <MailCheck
                size={27}
                aria-hidden="true"
              />
            </div>

            <h1 className="mt-5 text-xl font-bold text-ally-primary">
              Email Verified!
            </h1>

            <p className="mt-2 text-sm leading-6 text-ally-muted">
              Your Explorer Passport is ready.
              We&apos;re opening your dashboard now.
            </p>

            <div className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-ally-primary">
              <Loader2
                size={18}
                className="animate-spin"
                aria-hidden="true"
              />

              Preparing your expedition...
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-ally-muted">
              <CheckCircle2
                size={16}
                aria-hidden="true"
              />

              Secure session received
            </div>
          </>
        )}
      </section>
    </main>
  );
}