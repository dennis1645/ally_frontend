import {
  ArrowLeft,
  Check,
  Compass,
  Mail,
  MailCheck,
  ShieldCheck,
} from "lucide-react";

import {
  useEffect,
  useMemo,
} from "react";

import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router";

import allyCheckpoint from "../assets/ally-checkpoint.png";

/* =========================================================
   Types
========================================================= */

type VerificationLocationState = {
  email?: string;
};

/* =========================================================
   Constants
========================================================= */

const PENDING_EMAIL_STORAGE_KEY =
  "ally.pendingVerificationEmail";

/* =========================================================
   Session storage helpers
========================================================= */

function getStoredPendingEmail(): string {
  try {
    return (
      sessionStorage.getItem(
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
    sessionStorage.setItem(
      PENDING_EMAIL_STORAGE_KEY,
      email,
    );
  } catch {
    /*
     * The page can still display the email
     * from route state or the URL.
     */
  }
}

/* =========================================================
   Page
========================================================= */

export default function VerificationPendingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [
    searchParams,
  ] = useSearchParams();

  const locationState =
    location.state as
      | VerificationLocationState
      | null;

  /*
   * Resolve the registered email from:
   *
   * 1. Router state after registration.
   * 2. The URL query parameter.
   * 3. Session storage after a refresh.
   */
  const email = useMemo(() => {
    const stateEmail =
      locationState?.email?.trim() ??
      "";

    const queryEmail =
      searchParams
        .get("email")
        ?.trim() ?? "";

    const storedEmail =
      getStoredPendingEmail().trim();

    return (
      stateEmail ||
      queryEmail ||
      storedEmail
    );
  }, [
    locationState?.email,
    searchParams,
  ]);

  useEffect(() => {
    if (email) {
      storePendingEmail(email);
    }
  }, [email]);

  function handleBackToLogin(): void {
    navigate(
      "/auth?mode=login",
      {
        replace: true,
      },
    );
  }

  function handleGoHome(): void {
    navigate("/");
  }

  return (
    <main className="verification-pending-page">
      <div
        aria-hidden="true"
        className="verification-map-pattern"
      />

      {/* Header */}
      <header className="verification-pending-header">
        <button
          type="button"
          aria-label="Go to the Ally homepage"
          className="verification-brand"
          onClick={handleGoHome}
        >
          <span
            className="ally-logo text-[38px]"
            aria-label="Ally"
          >
            <span
              aria-hidden="true"
              className="ally-logo-a"
            >
              A
            </span>

            <span
              aria-hidden="true"
              className="ally-logo-lly"
            >
              lly
            </span>
          </span>

          <span className="verification-brand-subtitle">
            Scholarship Expedition
          </span>
        </button>

        <div className="verification-checkpoint-badge">
          <MailCheck size={17} />

          Verification Checkpoint
        </div>
      </header>

      {/* Main content */}
      <section className="verification-pending-content">
        {/* Ally mascot */}
        <div className="verification-mascot-section">
          <div className="verification-speech-bubble">
            <p>
              “One last checkpoint
              before your adventure!”
            </p>
          </div>

          <img
            src={allyCheckpoint}
            alt="Ally the explorer holding an email verification letter"
            className="verification-ally-image"
          />
        </div>

        {/* Verification card */}
        <section className="verification-pending-card">
          <div className="verification-card-trail" />

          <div
            aria-hidden="true"
            className="verification-card-decoration verification-card-decoration-left"
          >
            <Compass />
          </div>

          <div
            aria-hidden="true"
            className="verification-card-decoration verification-card-decoration-right"
          >
            <MailCheck />
          </div>

          <div className="verification-card-heading">
            <div className="verification-mail-icon">
              <Mail size={30} />
            </div>

            <h1>
              Verify Your Email
            </h1>

            <p>
              We&apos;ve sent a
              verification link to{" "}
              <strong>
                {email ||
                  "your registered email"}
              </strong>
              . Open your inbox and
              select the link to
              activate your Explorer
              Passport.
            </p>
          </div>

          {/* Registration progress */}
          <div
            className="verification-progress"
            aria-label="Registration progress: email verification pending"
          >
            <div className="verification-progress-background" />

            <div className="verification-progress-completed" />

            <div className="verification-step is-complete">
              <div className="verification-step-circle">
                <Check size={17} />
              </div>

              <span>
                Register
              </span>
            </div>

            <div className="verification-step is-active">
              <div className="verification-step-circle">
                <Mail size={18} />
              </div>

              <span>
                Verify Email
              </span>
            </div>

            <div className="verification-step">
              <div className="verification-step-circle">
                <Compass size={18} />
              </div>

              <span>
                Start Exploring
              </span>
            </div>
          </div>

          {/* Waiting information */}
          <div className="verification-waiting-note">
            <ShieldCheck size={20} />

            <div>
              <strong>
                Your Explorer Passport
                is almost ready.
              </strong>

              <p>
                Open the verification
                email and follow the
                link. Once your email
                has been verified,
                return to login to
                continue your
                scholarship expedition.
              </p>
            </div>
          </div>

          {/* Login action */}
          <div className="verification-actions">
            <button
              type="button"
              className="verification-login-primary"
              onClick={handleBackToLogin}
            >
              <ArrowLeft size={18} />

              Back to Login
            </button>
          </div>
        </section>

        <p className="verification-footer-note">
          Didn&apos;t receive the
          email? Check your Spam, Junk,
          or Promotions folder.
        </p>
      </section>
    </main>
  );
}