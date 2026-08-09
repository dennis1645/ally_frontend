import {
  CheckCircle2,
  CreditCard,
  Landmark,
  Mountain,
  QrCode,
  Sparkles,
  Wallet,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  Navigate,
  useNavigate,
  useSearchParams,
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

type PaymentMethod =
  | "visa-mastercard"
  | "e-wallet"
  | "qris"
  | "credit-card";

type PlanConfig = {
  id:
    PaidPlan;

  name:
    string;

  tagline:
    string;

  price:
    number;

  priceLabel:
    string;

  features:
    string[];
};

type PaymentMethodConfig = {
  id:
    PaymentMethod;

  label:
    string;

  icon:
    typeof CreditCard;
};

/* =========================================================
   Plan configuration
========================================================= */

const PLAN_CONFIG: Record<
  PaidPlan,
  PlanConfig
> = {
  pro: {
    id:
      "pro",

    name:
      "Pro",

    tagline:
      "Accelerate Your Journey",

    price:
      1_250_000,

    priceLabel:
      "Rp1250k",

    features: [
      "Advanced Matching",
      "Progress Tracker",
      "Optimized Profile Builder",
      "Priority AI Support",
    ],
  },

  premium: {
    id:
      "premium",

    name:
      "Premium",

    tagline:
      "Get the Maximum Advantages",

    price:
      2_500_000,

    priceLabel:
      "Rp2500k",

    features: [
      "Advanced Matching",
      "Progress Tracker",
      "Optimized Profile Builder",
      "Unlimited Essay Builder",
      "AI + Human Mentor Session",
      "Interview Simulation",
    ],
  },
};

const PAYMENT_METHODS:
  PaymentMethodConfig[] = [
    {
      id:
        "visa-mastercard",

      label:
        "VISA / Mastercard",

      icon:
        CreditCard,
    },
    {
      id:
        "e-wallet",

      label:
        "e-Wallet",

      icon:
        Wallet,
    },
    {
      id:
        "qris",

      label:
        "QRIS",

      icon:
        QrCode,
    },
    {
      id:
        "credit-card",

      label:
        "Credit Card",

      icon:
        Landmark,
    },
  ];

/* =========================================================
   Helpers
========================================================= */

function formatRupiah(
  value:
    number,
): string {
  return new Intl.NumberFormat(
    "id-ID",
    {
      style:
        "currency",

      currency:
        "IDR",

      minimumFractionDigits:
        0,

      maximumFractionDigits:
        0,
    },
  )
    .format(
      value,
    )
    .replace(
      /\s/g,
      "",
    );
}

function formatPremiumDate(
  value:
    | string
    | null
    | undefined,
): string | null {
  if (
    !value
  ) {
    return null;
  }

  const date =
    new Date(
      value,
    );

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
  ).format(
    date,
  );
}

function isPaidPlan(
  value:
    string | null,
): value is PaidPlan {
  return (
    value ===
      "pro" ||
    value ===
      "premium"
  );
}

/* =========================================================
   Checkout page
========================================================= */

export default function CheckoutPage() {
  const navigate =
    useNavigate();

  const [
    searchParams,
  ] =
    useSearchParams();

  const {
    user,
  } =
    useAuth();

  const [
    selectedPaymentMethod,
    setSelectedPaymentMethod,
  ] =
    useState<
      PaymentMethod | null
    >(
      null,
    );

  const [
    paymentMessage,
    setPaymentMessage,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const requestedPlan =
    searchParams.get(
      "plan",
    );

  /*
   * BillingPage currently navigates to:
   *
   * /checkout?plan=pro
   * /checkout?plan=premium
   */
  if (
    !isPaidPlan(
      requestedPlan,
    )
  ) {
    return (
      <Navigate
        to="/billing"
        replace
      />
    );
  }

  const plan =
    PLAN_CONFIG[
      requestedPlan
    ];

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

  const currentPlanName =
    isPremium
      ? "Premium"
      : "Explorer (Free)";

  const currentPlanStatus =
    isPremium
      ? "Premium"
      : "Active";

  const currentPlanCheckpoint =
    isPremium
      ? premiumUntil
        ? `Premium access until ${premiumUntil}`
        : "Premium expedition access is active"
      : "Current expedition plan";

  /* =======================================================
     Transaction
  ======================================================= */

  const formattedPlanPrice =
    useMemo(
      () =>
        formatRupiah(
          plan.price,
        ),
      [
        plan.price,
      ],
    );

  const additionalFee =
    0;

  const total =
    plan.price +
    additionalFee;

  const formattedAdditionalFee =
    formatRupiah(
      additionalFee,
    );

  const formattedTotal =
    formatRupiah(
      total,
    );

  /* =======================================================
     Actions
  ======================================================= */

  function handleCancel():
    void {
    navigate(
      "/billing",
    );
  }

  function handleConfirm():
    void {
    if (
      !selectedPaymentMethod
    ) {
      setPaymentMessage(
        "Please choose a payment method before continuing.",
      );

      return;
    }

    /*
     * UI only for now.
     *
     * No payment endpoint is invented here.
     * Connect your confirmed Midtrans/payment API later.
     */
    setPaymentMessage(
      "Payment method selected. Payment gateway integration is not connected yet.",
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <UserLayout
      title="Billing"
      subtitle="Payment & Confirmation">
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
              Review your selected plan,
              choose a payment method,
              and confirm your
              transaction.
            </p>
          </div>

          {/* =================================================
              Current plan
          ================================================== */}

          <article className="mb-12 rounded-[24px] border-2 border-[#ead3bd] bg-white px-5 py-6 shadow-[5px_5px_0_#ddcbb0] sm:px-7 lg:px-8">
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
                    {currentPlanName}
                  </h3>

                  <span className="rounded-full bg-[#ffdcc6] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#7a582f]">
                    {currentPlanStatus}
                  </span>
                </div>

                <p className="mt-1.5 text-sm italic leading-6 text-[#5f626a] sm:text-base">
                  {currentPlanCheckpoint}
                </p>
              </div>
            </div>
          </article>

          {/* =================================================
              Checkout
          ================================================== */}

          <div className="grid gap-8 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.7fr)] lg:items-start">

            {/* ===============================================
                Selected plan
            ================================================ */}

            <article className="flex min-h-[490px] flex-col rounded-[28px] border border-[#ead3bd] bg-white p-7 shadow-sm sm:p-8">
              <div>
                <h3 className="text-2xl font-extrabold text-[#2c1607]">
                  {plan.name}
                </h3>

                <p className="mt-1 text-sm text-[#7a7d86]">
                  {plan.tagline}
                </p>
              </div>

              <div className="mt-7 text-4xl font-extrabold tracking-tight text-[#2c1607]">
                {plan.priceLabel}
              </div>

              <ul className="mt-8 flex-1 space-y-4 text-sm leading-6 text-[#3f4147] sm:text-base">
                {plan.features.map(
                  (
                    feature,
                  ) => (
                    <li
                      key={
                        feature
                      }
                      className="flex items-start gap-3"
                    >
                      <CheckCircle2
                        size={21}
                        className="mt-0.5 shrink-0 text-[#59a7e8]"
                      />

                      <span>
                        {feature}
                      </span>
                    </li>
                  ),
                )}
              </ul>

              <button
                type="button"
                disabled
                className="mt-10 min-h-14 w-full cursor-default rounded-xl border-2 border-[#c8ced7] bg-white px-5 font-semibold text-[#4d5560]"
              >
                Choose This Plan
              </button>
            </article>

            {/* ===============================================
                Payment + transaction
            ================================================ */}

            <div className="space-y-7">

              {/* Payment methods */}

              <section>
                <h3 className="mb-4 text-2xl font-extrabold text-[#2c1607]">
                  Payment Methods
                </h3>

                <div className="grid gap-3 rounded-[22px] border border-[#f2d8ca] bg-white p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-4">
                  {PAYMENT_METHODS.map(
                    (
                      method,
                    ) => {
                      const Icon =
                        method.icon;

                      const isSelected =
                        selectedPaymentMethod ===
                        method.id;

                      return (
                        <button
                          key={
                            method.id
                          }
                          type="button"
                          aria-pressed={
                            isSelected
                          }
                          onClick={() => {
                            setSelectedPaymentMethod(
                              method.id,
                            );

                            setPaymentMessage(
                              null,
                            );
                          }}
                          className={[
                            "flex min-h-[104px] flex-col items-center justify-center gap-3 rounded-xl border-2 px-3 py-4 text-center transition",

                            isSelected
                              ? "border-[#16629b] bg-[#f2f8fc] shadow-[0_3px_0_#b9d1e2]"
                              : "border-transparent bg-white hover:border-[#bfd5e5] hover:bg-[#fbfdff]",
                          ].join(
                            " ",
                          )}
                        >
                          <span
                            className={[
                              "grid h-9 w-12 place-items-center rounded-md border",

                              isSelected
                                ? "border-[#16629b] text-[#16629b]"
                                : "border-[#cbd0d8] text-[#4c5159]",
                            ].join(
                              " ",
                            )}
                          >
                            <Icon
                              size={21}
                            />
                          </span>

                          <span className="text-sm font-medium text-[#4d5560]">
                            {method.label}
                          </span>
                        </button>
                      );
                    },
                  )}
                </div>
              </section>

              {/* Confirm transaction */}

              <section className="rounded-[22px] border border-[#f2d8ca] bg-white p-5 sm:p-7">
                <h3 className="text-2xl font-extrabold text-[#2c1607]">
                  Confirm Transaction
                </h3>

                <div className="mt-3 border-t border-[#bfc4cc]">
                  <div className="flex items-center justify-between gap-5 border-b border-[#bfc4cc] py-4 text-sm sm:text-base">
                    <span className="text-[#5f626a]">
                      {plan.name} Plan
                    </span>

                    <span className="font-medium text-[#4d5560]">
                      {formattedPlanPrice}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-5 border-b border-[#bfc4cc] py-4 text-sm sm:text-base">
                    <span className="text-[#5f626a]">
                      Additional Fee / Tax
                    </span>

                    <span className="font-medium text-[#4d5560]">
                      {formattedAdditionalFee}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 text-base text-[#4d5560] sm:text-lg">
                    <span>
                      Total:
                    </span>

                    <span className="font-semibold">
                      {formattedTotal}
                    </span>
                  </div>
                </div>

                {paymentMessage && (
                  <div
                    role="status"
                    className="mt-6 rounded-xl border border-[#ecd7ca] bg-[#fff8f5] px-4 py-3 text-sm leading-6 text-[#6a5142]"
                  >
                    {paymentMessage}
                  </div>
                )}

                <div className="mt-8 flex flex-col items-stretch gap-4 sm:items-end">
                  <p className="text-sm text-[#5f626a]">
                    Are you sure you want
                    to proceed with your
                    payment?
                  </p>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={
                        handleCancel
                      }
                      className="min-h-11 rounded-xl border-2 border-[#16629b] bg-white px-6 font-semibold text-[#16629b] transition hover:bg-[#f4f9fc]"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={
                        handleConfirm
                      }
                      className="min-h-11 rounded-xl border-2 border-[#004b6f] bg-[#16629b] px-6 font-semibold text-white shadow-[0_3px_0_#004b6f] transition hover:bg-[#1e6da6] active:translate-y-0.5 active:shadow-none"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}