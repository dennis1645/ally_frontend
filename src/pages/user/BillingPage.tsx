import {
  BadgeCheck,
  CheckCircle2,
  Mountain,
  Sparkles,
} from "lucide-react";

import {
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router";

import allyMascot from "../../assets/ally-assessment-mascot.png";

import UserLayout from "../../components/layout/UserLayout";

import {
  useAuth,
} from "../../context/AuthContext";

/* =========================================================
   Types
========================================================= */

type PaidPlan =
  | "pro"
  | "premium";

type FeatureItemProps = {
  children: string;
  light?: boolean;
};

/* =========================================================
   Plan features
========================================================= */

const freeFeatures: string[] = [
  "Initial Assessment",
  "Scholarship Finder",
  "Basic Profile Builder",
  "Estimated Preparation Time",
  "Ally Coaching with AI",
];

const proFeatures: string[] = [
  "Advanced Matching",
  "Progress Tracker",
  "Optimized Profile Builder",
  "Priority AI Support",
];

const premiumFeatures: string[] = [
  "Advanced Matching",
  "Progress Tracker",
  "Optimized Profile Builder",
  "Unlimited Essay Builder",
  "AI + Human Mentor Session",
  "Interview Simulation",
];

/* =========================================================
   Helpers
========================================================= */

function formatPremiumDate(
  value:
    | string
    | null
    | undefined,
): string | null {
  if (!value) {
    return null;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month:
        "short",

      day:
        "numeric",

      year:
        "numeric",
    },
  ).format(date);
}

/* =========================================================
   Feature item
========================================================= */

function FeatureItem({
  children,
  light = false,
}: FeatureItemProps) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle2
        size={21}
        className={
          light
            ? "mt-0.5 shrink-0 text-[#9bcaff]"
            : "mt-0.5 shrink-0 text-[#3b82c4]"
        }
      />

      <span>
        {children}
      </span>
    </li>
  );
}

/* =========================================================
   Billing page
========================================================= */

export default function BillingPage() {
  const navigate =
    useNavigate();

  const {
    user,
  } =
    useAuth();

  const plansSectionRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const [
    showPlans,
    setShowPlans,
  ] =
    useState(false);

  /* =======================================================
     Current plan
  ======================================================= */

  const isPremium =
    user?.is_premium ===
    true;

  const premiumUntil =
    formatPremiumDate(
      user?.premium_until,
    );

  const planName =
    isPremium
      ? "Premium"
      : "Explorer (Free)";

  const planStatus =
    isPremium
      ? "Premium"
      : "Active";

  const checkpointText =
    isPremium
      ? premiumUntil
        ? `Premium access until ${premiumUntil}`
        : "Premium expedition access is active"
      : "Free plan";

  /* =======================================================
     Unlock plans
  ======================================================= */

  function handleUnlockMore():
    void {
    setShowPlans(true);

    window.setTimeout(
      () => {
        plansSectionRef.current
          ?.scrollIntoView({
            behavior:
              "smooth",

            block:
              "start",
          });
      },
      50,
    );
  }

  /* =======================================================
     Choose paid plan
  ======================================================= */

  function handleChoosePlan(
    plan:
      PaidPlan,
  ): void {
    navigate(
      `/checkout?plan=${plan}`,
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <UserLayout
      title="Billing"
      subtitle="Expedition Plans">
      <section className="min-h-[calc(100vh-80px)] bg-[#fff8f5]">
        <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">

          {/* =================================================
              Ally message
          ================================================== */}

          <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-center">
            <div className="relative shrink-0 self-start">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-[#f1d8c7] bg-[#ffe3d2] p-1.5 shadow-[3px_4px_0_#d1c0aa]">
                <img
                  src={
                    allyMascot
                  }
                  alt="Ally explorer mascot"
                  className="h-full w-full rounded-xl object-contain"
                />
              </div>

              <div className="absolute -bottom-2 -right-2 grid h-7 w-7 place-items-center rounded-full border-2 border-[#fff8f5] bg-[#16629b] text-white shadow-sm">
                <Sparkles
                  size={14}
                />
              </div>
            </div>

            <div className="relative flex-1">
              <div
                aria-hidden="true"
                className="absolute left-[-9px] top-9 hidden h-5 w-5 rotate-45 border-b border-l border-[#ead3bd] bg-[#faf2ed] md:block"
              />

              <div className="relative rounded-2xl border-2 border-[#ecdcd1] bg-[#faf2ed] px-6 py-6 shadow-[4px_4px_0_#ecdcd1] sm:px-8">
                <p className="text-base italic leading-7 text-[#2c1607] sm:text-lg">
                  &ldquo;Every expedition
                  begins with the right
                  equipment. Choose the
                  plan that helps you
                  reach your scholarship
                  summit.&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              Heading
          ================================================== */}

          <div className="mb-8">
            <h2 className="text-2xl font-extrabold tracking-tight text-[#2c1607] sm:text-3xl">
              Expedition Plans
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#6b6670] sm:text-base">
              Choose the expedition
              plan that best supports
              your scholarship journey.
            </p>
          </div>

          {/* =================================================
              Current plan
          ================================================== */}

          <article className="rounded-[24px] border-2 border-[#ead3bd] bg-white px-5 py-6 shadow-[5px_5px_0_#ddcbb0] sm:px-7 lg:px-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

              <div className="flex min-w-0 items-center gap-5">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#ffe3d2] text-[#16629b]">
                  <Mountain
                    size={31}
                    strokeWidth={2.5}
                    fill="currentColor"
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-bold text-[#2c1607] sm:text-2xl">
                      {planName}
                    </h3>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ffdcc6] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#7a582f]">
                      <BadgeCheck
                        size={13}
                      />

                      {planStatus}
                    </span>
                  </div>

                  <p className="mt-1.5 text-sm italic leading-6 text-[#5f626a] sm:text-base">
                    {
                      checkpointText
                    }
                  </p>
                </div>
              </div>

              {!isPremium ? (
                <button
                  type="button"
                  onClick={
                    handleUnlockMore
                  }
                  className="min-h-14 w-full rounded-xl border-2 border-[#004b6f] bg-[#16629b] px-8 text-sm font-semibold text-white shadow-[0_5px_0_#004b6f] transition hover:-translate-y-0.5 hover:bg-[#1e6da6] active:translate-y-1 active:shadow-none sm:text-base md:w-auto"
                >
                  {showPlans
                    ? "View Plans"
                    : "Unlock More"}
                </button>
              ) : (
                <div className="inline-flex min-h-14 items-center justify-center rounded-xl border-2 border-[#bfd0dc] bg-[#edf4f8] px-8 text-sm font-semibold text-[#43677e]">
                  Premium Active
                </div>
              )}
            </div>
          </article>

          {/* =================================================
              Expanded plans
          ================================================== */}

          {showPlans &&
            !isPremium && (
              <div
                ref={
                  plansSectionRef
                }
                className="scroll-mt-28 pt-14"
              >
                <div className="mb-8">
                  <h2 className="text-2xl font-extrabold text-[#2c1607] sm:text-3xl">
                    Choose Your Expedition
                  </h2>

                  <p className="mt-2 text-[#6b6670]">
                    Compare the plans
                    and choose the level
                    of support that fits
                    your scholarship
                    journey.
                  </p>
                </div>

                <div className="grid gap-7 lg:grid-cols-3">

                  {/* =========================================
                      FREE PLAN
                  ========================================== */}

                  <article className="flex min-h-[560px] flex-col rounded-[28px] bg-[#8b5e3c] p-7 text-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl sm:p-8">
                    <div className="mb-8">
                      <h3 className="text-3xl font-extrabold">
                        Free
                      </h3>

                      <p className="mt-2 text-white/80">
                        The Basic Foundation
                      </p>
                    </div>

                    <div className="mb-9">
                      <span className="text-5xl font-extrabold">
                        Rp0
                      </span>
                    </div>

                    <ul className="mb-10 flex-1 space-y-4 text-sm leading-6 sm:text-base">
                      {freeFeatures.map(
                        (
                          feature,
                        ) => (
                          <FeatureItem
                            key={
                              feature
                            }
                            light
                          >
                            {feature}
                          </FeatureItem>
                        ),
                      )}
                    </ul>

                    <button
                      type="button"
                      disabled
                      className="min-h-14 w-full cursor-default rounded-xl bg-[#bfa07f] px-5 font-bold text-[#463326] opacity-90"
                    >
                      Current Plan
                    </button>
                  </article>

                  {/* =========================================
                      PRO PLAN
                  ========================================== */}

                  <article className="relative flex min-h-[560px] flex-col rounded-[28px] border-2 border-[#16629b] bg-white p-7 shadow-[0_8px_24px_rgba(22,98,155,0.12)] transition duration-200 hover:-translate-y-1 hover:shadow-xl sm:p-8 lg:-translate-y-3">
                    <span className="absolute right-5 top-5 rounded-full bg-[#16629b] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      Best Value
                    </span>

                    <div className="mb-8 pr-20">
                      <h3 className="text-3xl font-extrabold text-[#2c1607]">
                        Pro
                      </h3>

                      <p className="mt-2 text-[#6b6670]">
                        Accelerate Your
                        Journey
                      </p>
                    </div>

                    <div className="mb-9">
                      <span className="text-4xl font-extrabold text-[#2c1607] sm:text-5xl">
                        Rp1250k
                      </span>
                    </div>

                    <ul className="mb-10 flex-1 space-y-4 text-sm leading-6 text-[#4c5159] sm:text-base">
                      {proFeatures.map(
                        (
                          feature,
                        ) => (
                          <FeatureItem
                            key={
                              feature
                            }
                          >
                            {feature}
                          </FeatureItem>
                        ),
                      )}
                    </ul>

                    <button
                      type="button"
                      onClick={() => {
                        handleChoosePlan(
                          "pro",
                        );
                      }}
                      className="min-h-14 w-full rounded-xl border-2 border-[#004b6f] bg-[#16629b] px-5 font-bold text-white shadow-[0_5px_0_#004b6f] transition hover:bg-[#1e6da6] active:translate-y-1 active:shadow-none"
                    >
                      Choose This Plan
                    </button>
                  </article>

                  {/* =========================================
                      PREMIUM PLAN
                  ========================================== */}

                  <article className="flex min-h-[560px] flex-col rounded-[28px] border-2 border-[#e4ddd7] bg-white p-7 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl sm:p-8">
                    <div className="mb-8">
                      <h3 className="text-3xl font-extrabold text-[#2c1607]">
                        Premium
                      </h3>

                      <p className="mt-2 text-[#6b6670]">
                        Get the Maximum
                        Advantages
                      </p>
                    </div>

                    <div className="mb-9">
                      <span className="text-4xl font-extrabold text-[#2c1607] sm:text-5xl">
                        Rp2500k
                      </span>
                    </div>

                    <ul className="mb-10 flex-1 space-y-4 text-sm leading-6 text-[#4c5159] sm:text-base">
                      {premiumFeatures.map(
                        (
                          feature,
                        ) => (
                          <FeatureItem
                            key={
                              feature
                            }
                          >
                            {feature}
                          </FeatureItem>
                        ),
                      )}
                    </ul>

                    <button
                      type="button"
                      onClick={() => {
                        handleChoosePlan(
                          "premium",
                        );
                      }}
                      className="min-h-14 w-full rounded-xl border-2 border-[#d2d6dc] bg-white px-5 font-bold text-[#4c5159] transition hover:border-[#16629b] hover:text-[#16629b]"
                    >
                      Choose This Plan
                    </button>
                  </article>
                </div>
              </div>
            )}
        </div>
      </section>
    </UserLayout>
  );
}