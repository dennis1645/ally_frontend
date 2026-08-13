import {
  Check,
  CheckCircle2,
  Compass,
  Loader2,
  Mail,
  MailCheck,
  ShieldCheck,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router";

import {
  useAuth,
} from "../context/AuthContext";

import type {
  AuthUser,
} from "../types/auth";

import allyCheckpoint from "../assets/ally-checkpoint.png";

/* =========================================================
   Types
========================================================= */

type VerificationLocationState = {
  email?: string;
};

type EmailVerificationState =
  | "verified"
  | "unverified"
  | "unknown";

/* =========================================================
   Constants
========================================================= */

const PENDING_EMAIL_STORAGE_KEY =
  "ally.pendingVerificationEmail";

const AUTO_CHECK_INTERVAL_MS =
  5000;

/* =========================================================
   Storage helpers
========================================================= */

function getStoredPendingEmail(): string {
  try {
    return (
      localStorage.getItem(
        PENDING_EMAIL_STORAGE_KEY,
      ) ?? ""
    );
  } catch {
    return "";
  }
}

function storePendingEmail(
  email: string,
): void {
  try {
    localStorage.setItem(
      PENDING_EMAIL_STORAGE_KEY,
      email,
    );
  } catch {
    // Non-critical.
  }
}

function clearStoredPendingEmail():
  void {
  try {
    localStorage.removeItem(
      PENDING_EMAIL_STORAGE_KEY,
    );
  } catch {
    // Non-critical.
  }
}

/* =========================================================
   Verification helpers
========================================================= */

function getEmailVerificationState(
  user:
    | AuthUser
    | null,
): EmailVerificationState {
  if (!user) {
    return "unknown";
  }

  if (
    typeof user.email_verified_at ===
    "string"
  ) {
    return user.email_verified_at.trim()
      ? "verified"
      : "unverified";
  }

  if (
    user.email_verified_at ===
    null
  ) {
    return "unverified";
  }

  const emailVerified =
    user.email_verified;

  if (
    typeof emailVerified ===
    "boolean"
  ) {
    return emailVerified
      ? "verified"
      : "unverified";
  }

  const isEmailVerified =
    user.is_email_verified;

  if (
    typeof isEmailVerified ===
    "boolean"
  ) {
    return isEmailVerified
      ? "verified"
      : "unverified";
  }

  return "unknown";
}

function hasVerifiedCallbackSignal(
  searchParams: URLSearchParams,
): boolean {
  const truthyValues =
    new Set([
      "1",
      "true",
      "yes",
      "verified",
    ]);

  const verified =
    searchParams
      .get("verified")
      ?.trim()
      .toLowerCase();

  const emailVerified =
    searchParams
      .get("email_verified")
      ?.trim()
      .toLowerCase();

  const verificationStatus =
    searchParams
      .get("status")
      ?.trim()
      .toLowerCase();

  return (
    (verified
      ? truthyValues.has(
          verified,
        )
      : false) ||
    (emailVerified
      ? truthyValues.has(
          emailVerified,
        )
      : false) ||
    verificationStatus ===
      "verified"
  );
}

/* =========================================================
   Page
========================================================= */

export default function VerificationPendingPage() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [
    searchParams,
  ] =
    useSearchParams();

  const {
    user,
    status,
    refreshProfile,
  } =
    useAuth();

  const locationState =
    location.state as
      | VerificationLocationState
      | null;

  const email =
    useMemo(
      () => {
        const stateEmail =
          locationState?.email?.trim() ??
          "";

        const queryEmail =
          searchParams
            .get("email")
            ?.trim() ??
          "";

        const profileEmail =
          user?.email?.trim() ??
          "";

        const storedEmail =
          getStoredPendingEmail().trim();

        return (
          stateEmail ||
          queryEmail ||
          profileEmail ||
          storedEmail
        );
      },
      [
        locationState?.email,
        searchParams,
        user?.email,
      ],
    );

  const callbackVerified =
    useMemo(
      () =>
        hasVerifiedCallbackSignal(
          searchParams,
        ),
      [
        searchParams,
      ],
    );

  const [
    isChecking,
    setIsChecking,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    success,
    setSuccess,
  ] =
    useState<string | null>(
      null,
    );

  const checkInFlightRef =
    useRef(false);

  const redirectingRef =
    useRef(false);

  const redirectTimerRef =
    useRef<number | null>(
      null,
    );

  useEffect(
    () => {
      if (email) {
        storePendingEmail(
          email,
        );
      }
    },
    [
      email,
    ],
  );

  useEffect(
    () => {
      return () => {
        if (
          redirectTimerRef.current !==
          null
        ) {
          window.clearTimeout(
            redirectTimerRef.current,
          );
        }
      };
    },
    [],
  );

  const finishVerification =
    useCallback(
      (): void => {
        if (
          redirectingRef.current
        ) {
          return;
        }

        redirectingRef.current =
          true;

        clearStoredPendingEmail();

        setError(
          null,
        );

        setSuccess(
          "Email verified! Your Explorer Passport is ready.",
        );

        redirectTimerRef.current =
          window.setTimeout(
            () => {
              navigate(
                "/dashboard",
                {
                  replace: true,
                },
              );
            },
            900,
          );
      },
      [
        navigate,
      ],
    );

  const checkVerification =
    useCallback(
      async (
        allowUnknownFallback:
          boolean,
      ): Promise<void> => {
        if (
          redirectingRef.current ||
          checkInFlightRef.current
        ) {
          return;
        }

        if (
          status ===
            "loading"
        ) {
          return;
        }

        if (
          status !==
            "authenticated"
        ) {
          setError(
            "Your registration session is no longer available. Please sign in again.",
          );
          return;
        }

        checkInFlightRef.current =
          true;

        setIsChecking(true);
        setError(null);

        try {
          const profile =
            await refreshProfile();

          const verificationState =
            getEmailVerificationState(
              profile,
            );

          if (
            verificationState ===
              "verified"
          ) {
            finishVerification();
            return;
          }

          if (
            verificationState ===
              "unknown" &&
            (
              callbackVerified ||
              allowUnknownFallback
            )
          ) {
            finishVerification();
            return;
          }

          if (
            verificationState ===
              "unverified" &&
            allowUnknownFallback
          ) {
            setError(
              "Your email still appears unverified. Open the verification link in your inbox, then return here and try again.",
            );
          }
        } catch (
          requestError
        ) {
          setError(
            requestError instanceof
              Error
              ? requestError.message
              : "Unable to refresh your verification status.",
          );
        } finally {
          checkInFlightRef.current =
            false;

          setIsChecking(false);
        }
      },
      [
        callbackVerified,
        finishVerification,
        refreshProfile,
        status,
      ],
    );

  useEffect(
    () => {
      if (
        getEmailVerificationState(
          user,
        ) ===
        "verified"
      ) {
        finishVerification();
      }
    },
    [
      finishVerification,
      user,
    ],
  );

  useEffect(
    () => {
      if (
        status !==
          "authenticated"
      ) {
        return;
      }

      void checkVerification(
        false,
      );

      const intervalId =
        window.setInterval(
          () => {
            void checkVerification(
              false,
            );
          },
          AUTO_CHECK_INTERVAL_MS,
        );

      return () => {
        window.clearInterval(
          intervalId,
        );
      };
    },
    [
      checkVerification,
      status,
    ],
  );

  useEffect(
    () => {
      function handleFocus():
        void {
        if (
          status ===
            "authenticated"
        ) {
          void checkVerification(
            false,
          );
        }
      }

      function handleVisibilityChange():
        void {
        if (
          document.visibilityState ===
            "visible" &&
          status ===
            "authenticated"
        ) {
          void checkVerification(
            false,
          );
        }
      }

      window.addEventListener(
        "focus",
        handleFocus,
      );

      document.addEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );

      return () => {
        window.removeEventListener(
          "focus",
          handleFocus,
        );

        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange,
        );
      };
    },
    [
      checkVerification,
      status,
    ],
  );

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ally-cream px-4 py-10 sm:px-6">
      {/* Soft decorative background to match the auth experience */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-20 h-64 w-64 rounded-full border border-ally-border/50 bg-white/25"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-16 h-72 w-72 rounded-full border border-ally-border/50 bg-white/25"
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-[32px] border border-ally-border bg-ally-surface p-7 shadow-sm sm:p-8">
          {/* Small checkpoint badge */}
          <div className="mb-6 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-ally-surface-strong px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-ally-primary">
              <MailCheck
                size={16}
                aria-hidden="true"
              />
              Verification Checkpoint
            </div>
          </div>

          {/* Ally mascot */}
          <div className="mb-5 flex flex-col items-center text-center">
            <div className="mb-2 rounded-2xl bg-ally-surface-strong px-4 py-2 text-sm font-semibold text-ally-primary">
              “One last checkpoint before your adventure!”
            </div>

            <img
              src={allyCheckpoint}
              alt="Ally the explorer holding an email verification letter"
              className="h-auto w-[132px] object-contain drop-shadow-sm sm:w-[150px]"
            />
          </div>

          {/* Heading */}
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-ally-surface-strong text-ally-primary">
              <Mail
                size={24}
                aria-hidden="true"
              />
            </div>

            <h1 className="text-2xl font-bold text-ally-primary">
              Verify Your Email
            </h1>

            <p className="mt-2 text-sm leading-6 text-ally-muted">
              We&apos;ve sent a verification
              link to{" "}
              <strong className="font-bold text-ally-primary">
                {email ||
                  "your registered email"}
              </strong>
              . Open your inbox and select the
              link to activate your Explorer
              Passport.
            </p>
          </div>

          {/* Registration progress */}
          <div className="mb-7">
            <div className="relative flex items-start justify-between">
              <div className="absolute left-[16%] right-[16%] top-5 h-1 rounded-full bg-ally-surface-strong">
                <div className="h-full w-1/2 rounded-full bg-ally-blue" />
              </div>

              <div className="relative z-10 flex w-1/3 flex-col items-center text-center">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-ally-blue text-white shadow-sm">
                  <Check
                    size={17}
                    aria-hidden="true"
                  />
                </div>

                <span className="mt-2 text-[11px] font-bold text-ally-primary">
                  Register
                </span>
              </div>

              <div className="relative z-10 flex w-1/3 flex-col items-center text-center">
                <div className="grid h-10 w-10 place-items-center rounded-full border-2 border-ally-blue bg-white text-ally-blue shadow-sm">
                  <Mail
                    size={17}
                    aria-hidden="true"
                  />
                </div>

                <span className="mt-2 text-[11px] font-bold text-ally-primary">
                  Verify Email
                </span>
              </div>

              <div className="relative z-10 flex w-1/3 flex-col items-center text-center">
                <div className="grid h-10 w-10 place-items-center rounded-full border-2 border-ally-border bg-white text-ally-muted">
                  <Compass
                    size={17}
                    aria-hidden="true"
                  />
                </div>

                <span className="mt-2 text-[11px] font-medium text-ally-muted">
                  Start Exploring
                </span>
              </div>
            </div>
          </div>

          {/* Waiting / success / error message */}
          <div
            className={[
              "mb-6 flex items-start gap-3 rounded-2xl border p-4",
              success
                ? "border-green-200 bg-green-50"
                : error
                  ? "border-red-200 bg-red-50"
                  : "border-ally-border bg-ally-surface-strong",
            ].join(" ")}
            role={
              error
                ? "alert"
                : "status"
            }
          >
            <div
              className={[
                "mt-0.5 shrink-0",
                success
                  ? "text-green-600"
                  : error
                    ? "text-red-500"
                    : "text-ally-primary",
              ].join(" ")}
            >
              {success ? (
                <CheckCircle2
                  size={20}
                  aria-hidden="true"
                />
              ) : isChecking ? (
                <Loader2
                  size={20}
                  className="animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <ShieldCheck
                  size={20}
                  aria-hidden="true"
                />
              )}
            </div>

            <div>
              <p className="text-sm font-bold text-ally-primary">
                {success
                  ? "Your Explorer Passport is ready!"
                  : isChecking
                    ? "Checking your verification status..."
                    : error
                      ? "Verification is still pending."
                      : "Your Explorer Passport is almost ready."}
              </p>

              <p
                className={[
                  "mt-1 text-xs leading-5",
                  error
                    ? "text-red-600"
                    : success
                      ? "text-green-700"
                      : "text-ally-muted",
                ].join(" ")}
              >
                {success
                  ? success
                  : error
                    ? error
                    : "Didn't receive the email? Check your Spam, Junk, or Promotions folder."}
              </p>
            </div>
          </div>

          {/* Primary action — same visual language as AuthCard */}
          <button
            type="button"
            disabled={
              isChecking ||
              Boolean(
                success,
              )
            }
            onClick={() => {
              void checkVerification(
                true,
              );
            }}
            className="squishy-button flex w-full items-center justify-center gap-2 rounded-xl bg-ally-blue py-4 text-base font-bold text-white shadow-sm transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60 sm:py-5"
          >
            {isChecking ? (
              <>
                <Loader2
                  size={20}
                  className="animate-spin"
                  aria-hidden="true"
                />
                Checking...
              </>
            ) : success ? (
              <>
                <CheckCircle2
                  size={20}
                  aria-hidden="true"
                />
                Opening Dashboard...
              </>
            ) : (
              <>
                <ShieldCheck
                  size={20}
                  aria-hidden="true"
                />
                I&apos;ve Verified My Email
              </>
            )}
          </button>

          <p className="mt-4 text-center text-xs leading-5 text-ally-muted">
            After clicking the verification
            link in your email, return to Ally.
            We&apos;ll also check automatically.
          </p>
        </div>
      </div>
    </main>
  );
}