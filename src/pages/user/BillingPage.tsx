import {
  AlertCircle,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Coins,
  Mountain,
  Package,
  RefreshCcw,
  Sparkles,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router";

import allyMascot from "../../assets/ally-assessment-mascot.png";

import {
  getShopItemsApi,
  type ShopItem,
} from "../../api/shopApi";

import UserLayout from "../../components/layout/UserLayout";

import {
  useAuth,
} from "../../context/AuthContext";

/* =========================================================
   Types
========================================================= */

type FeatureItemProps = {
  children:
    string;

  light?:
    boolean;
};

/* =========================================================
   Static free-plan features
========================================================= */

const freeFeatures:
  string[] = [
    "Initial Assessment",
    "Scholarship Finder",
    "Basic Profile Builder",
    "Estimated Preparation Time",
    "Ally Coaching with AI",
  ];

/* =========================================================
   Helpers
========================================================= */

function formatRupiah(
  value:
    string | number,
): string {
  const parsed =
    Number(
      value,
    );

  if (
    !Number.isFinite(
      parsed,
    )
  ) {
    return "Rp0";
  }

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
      parsed,
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

function getSubscriptionBenefits(
  item:
    ShopItem,
): string[] {
  const benefits:
    string[] = [];

  if (
    item.duration_days
  ) {
    benefits.push(
      `${item.duration_days} days of premium access`,
    );
  }

  if (
    item.token_reward >
    0
  ) {
    benefits.push(
      `${item.token_reward} Mentor Tokens included`,
    );
  }

  benefits.push(
    "All premium Ally features",
  );

  return benefits;
}

function getTokenBenefits(
  item:
    ShopItem,
): string[] {
  const benefits:
    string[] = [];

  if (
    item.token_reward >
    0
  ) {
    benefits.push(
      `${item.token_reward} Mentor ${
        item.token_reward ===
        1
          ? "Token"
          : "Tokens"
      }`,
    );
  }

  benefits.push(
    "Use tokens for mentor consultation bookings",
  );

  return benefits;
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

  const [
    items,
    setItems,
  ] =
    useState<
      ShopItem[]
    >(
      [],
    );

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(
      true,
    );

  const [
    loadError,
    setLoadError,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    reloadVersion,
    setReloadVersion,
  ] =
    useState(
      0,
    );

  const [
    plansVisible,
    setPlansVisible,
  ] =
    useState(
      false,
    );

  /*
   * Billing content may scroll inside UserLayout rather than
   * on window itself. These refs track the user's downward
   * scroll intent independent of which element owns scrolling.
   */
  const scrollIntentRef =
    useRef(
      0,
    );

  const touchStartYRef =
    useRef<number | null>(
      null,
    );

  /* =======================================================
     Reveal plans on downward scroll

     IMPORTANT:
     UserLayout can own scrolling through an internal
     overflow-y-auto container. Listening only to
     window.scrollY therefore misses real user scrolling.

     This listener supports:
     - browser/window scrolling
     - nested scroll containers
     - mouse wheel / trackpad
     - touch swipe
     - keyboard page scrolling

     The plans reveal once and remain visible afterward.
  ======================================================= */

  useEffect(
    () => {
      if (
        plansVisible
      ) {
        return;
      }

      const revealScrollTop =
        80;

      const revealWheelIntent =
        100;

      const revealTouchDistance =
        55;

      function revealPlans():
        void {
        setPlansVisible(
          true,
        );
      }

      function getScrollTop(
        target:
          EventTarget | null,
      ): number {
        if (
          target instanceof
          HTMLElement
        ) {
          return target.scrollTop;
        }

        if (
          target instanceof
          Document
        ) {
          return (
            document.scrollingElement
              ?.scrollTop ??
            window.scrollY
          );
        }

        return window.scrollY;
      }

      /*
       * Scroll does not normally bubble, therefore use capture=true.
       * This catches scrolling from UserLayout's internal scroll area.
       */
      function handleAnyScroll(
        event:
          Event,
      ): void {
        if (
          getScrollTop(
            event.target,
          ) >=
          revealScrollTop
        ) {
          revealPlans();
        }
      }

      /*
       * Wheel/trackpad intent is also tracked. This makes the reveal
       * reliable even when the current page is only barely scrollable.
       */
      function handleWheel(
        event:
          WheelEvent,
      ): void {
        if (
          event.deltaY <=
          0
        ) {
          return;
        }

        scrollIntentRef.current +=
          event.deltaY;

        if (
          scrollIntentRef.current >=
          revealWheelIntent
        ) {
          revealPlans();
        }
      }

      function handleTouchStart(
        event:
          TouchEvent,
      ): void {
        touchStartYRef.current =
          event.touches[0]
            ?.clientY ??
          null;
      }

      function handleTouchMove(
        event:
          TouchEvent,
      ): void {
        const startY =
          touchStartYRef.current;

        const currentY =
          event.touches[0]
            ?.clientY;

        if (
          startY ===
            null ||
          currentY ===
            undefined
        ) {
          return;
        }

        /*
         * Finger moving upward means the page is being scrolled down.
         */
        if (
          startY -
            currentY >=
          revealTouchDistance
        ) {
          revealPlans();
        }
      }

      function handleKeyDown(
        event:
          KeyboardEvent,
      ): void {
        if (
          [
            "ArrowDown",
            "PageDown",
            "End",
            " ",
          ].includes(
            event.key,
          )
        ) {
          revealPlans();
        }
      }

      document.addEventListener(
        "scroll",
        handleAnyScroll,
        true,
      );

      window.addEventListener(
        "wheel",
        handleWheel,
        {
          passive:
            true,
        },
      );

      window.addEventListener(
        "touchstart",
        handleTouchStart,
        {
          passive:
            true,
        },
      );

      window.addEventListener(
        "touchmove",
        handleTouchMove,
        {
          passive:
            true,
        },
      );

      window.addEventListener(
        "keydown",
        handleKeyDown,
      );

      return () => {
        document.removeEventListener(
          "scroll",
          handleAnyScroll,
          true,
        );

        window.removeEventListener(
          "wheel",
          handleWheel,
        );

        window.removeEventListener(
          "touchstart",
          handleTouchStart,
        );

        window.removeEventListener(
          "touchmove",
          handleTouchMove,
        );

        window.removeEventListener(
          "keydown",
          handleKeyDown,
        );
      };
    },
    [
      plansVisible,
    ],
  );

  /* =======================================================
     Load backend shop items
  ======================================================= */

  useEffect(
    () => {
      let active =
        true;

      async function loadShopItems():
        Promise<void> {
        setIsLoading(
          true,
        );

        setLoadError(
          null,
        );

        try {
          const responseItems =
            await getShopItemsApi();

          if (
            !active
          ) {
            return;
          }

          setItems(
            responseItems.filter(
              (
                item,
              ) =>
                item.is_active,
            ),
          );
        } catch (
          error:
            unknown
        ) {
          if (
            !active
          ) {
            return;
          }

          setItems(
            [],
          );

          setLoadError(
            error instanceof
              Error
              ? error.message
              : "Unable to load expedition shop items.",
          );
        } finally {
          if (
            active
          ) {
            setIsLoading(
              false,
            );
          }
        }
      }

      void loadShopItems();

      return () => {
        active =
          false;
      };
    },
    [
      reloadVersion,
    ],
  );

  const subscriptionItems =
    useMemo(
      () =>
        items.filter(
          (
            item,
          ) =>
            item.item_type ===
            "subscription",
        ),
      [
        items,
      ],
    );

  const tokenItems =
    useMemo(
      () =>
        items.filter(
          (
            item,
          ) =>
            item.item_type ===
            "token_package",
        ),
      [
        items,
      ],
    );

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
     Actions
  ======================================================= */

  function handleChooseItem(
    itemId:
      number,
  ): void {
    navigate(
      `/checkout?item=${itemId}`,
    );
  }

  function handleRetry():
    void {
    setReloadVersion(
      (
        current,
      ) =>
        current +
        1,
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <UserLayout
      title="Subscription"
      subtitle="Expedition Plans"
      topbarProps={{
        showSearch:
          false,
      }}
    >
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
              Available plans and mentor
              token packages are loaded
              directly from the Ally
              shop.
            </p>
          </div>

          {/* =================================================
              Current plan
          ================================================== */}

          <article className="rounded-[24px] border-2 border-[#ead3bd] bg-white px-5 py-6 shadow-[5px_5px_0_#ddcbb0] sm:px-7 lg:px-8">
            <div className="flex flex-col gap-6">

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
                    {checkpointText}
                  </p>
                </div>
              </div>

            </div>
          </article>

          <div
            aria-hidden="true"
            className="mt-5 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#8a7a6d]"
          >
            <span>Keep scrolling to reveal plans &amp; mentor tokens</span>
            <span className="text-base leading-none">↓</span>
          </div>

          {/* =================================================
              Backend loading error
          ================================================== */}

          {loadError && (
            <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0"
                />

                <div>
                  <p className="font-semibold">
                    Unable to load shop
                  </p>

                  <p className="mt-1 text-sm leading-6">
                    {loadError}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  handleRetry
                }
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-300 bg-white px-4 font-semibold"
              >
                <RefreshCcw
                  size={17}
                />

                Retry
              </button>
            </div>
          )}

          {/* =================================================
              Shop
          ================================================== */}

          {plansVisible && (
            <div
              className={[
                "pt-14",
                "animate-[allyPlansReveal_420ms_ease-out]",
              ].join(
                " ",
              )}
            >
              <div className="mb-8">
                <h2 className="text-2xl font-extrabold text-[#2c1607] sm:text-3xl">
                  Choose Your Expedition
                </h2>

                <p className="mt-2 text-[#6b6670]">
                  Unlock premium features and mentor tokens now!
                </p>
              </div>

              {isLoading ? (
                <div className="grid gap-7 md:grid-cols-2">
                  {[0, 1, 2].map(
                    (
                      item,
                    ) => (
                      <div
                        key={
                          item
                        }
                        className="h-[360px] animate-pulse rounded-[28px] border border-[#ead3bd] bg-white"
                      />
                    ),
                  )}
                </div>
              ) : (
                <>
                  {/* =========================================
                      FREE PLAN
                  ========================================== */}

                  {!isPremium && (
                    <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
                      <article className="flex min-h-[480px] flex-col rounded-[28px] bg-[#8b5e3c] p-7 text-white shadow-sm sm:p-8">
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

                      {subscriptionItems.map(
                        (
                          item,
                        ) => (
                          <article
                            key={
                              item.id
                            }
                            className="relative flex min-h-[480px] flex-col rounded-[28px] border-2 border-[#16629b] bg-white p-7 shadow-[0_8px_24px_rgba(22,98,155,0.12)] transition duration-200 hover:-translate-y-1 hover:shadow-xl sm:p-8"
                          >
                            <span className="absolute right-5 top-5 rounded-full bg-[#16629b] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                              Premium
                            </span>

                            <div className="mb-7 pr-20">
                              <h3 className="text-2xl font-extrabold text-[#2c1607] sm:text-3xl">
                                {item.name}
                              </h3>

                              <p className="mt-2 text-sm leading-6 text-[#6b6670]">
                                {item.description}
                              </p>
                            </div>

                            <div className="mb-8">
                              <span className="text-4xl font-extrabold text-[#2c1607] sm:text-5xl">
                                {formatRupiah(
                                  item.price_rupiah,
                                )}
                              </span>
                            </div>

                            <ul className="mb-9 flex-1 space-y-4 text-sm leading-6 text-[#4c5159] sm:text-base">
                              {getSubscriptionBenefits(
                                item,
                              ).map(
                                (
                                  benefit,
                                ) => (
                                  <FeatureItem
                                    key={
                                      benefit
                                    }
                                  >
                                    {benefit}
                                  </FeatureItem>
                                ),
                              )}
                            </ul>

                            <button
                              type="button"
                              disabled={
                                item.stock_quantity <=
                                0
                              }
                              onClick={() => {
                                handleChooseItem(
                                  item.id,
                                );
                              }}
                              className="min-h-14 w-full rounded-xl border-2 border-[#004b6f] bg-[#16629b] px-5 font-bold text-white shadow-[0_5px_0_#004b6f] transition hover:bg-[#1e6da6] active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:border-[#b8c1c8] disabled:bg-[#d8dde1] disabled:text-[#70777d] disabled:shadow-none"
                            >
                              {item.stock_quantity >
                              0
                                ? "Choose This Plan"
                                : "Unavailable"}
                            </button>
                          </article>
                        ),
                      )}
                    </div>
                  )}

                  {/* =========================================
                      Premium already active
                  ========================================== */}

                  {isPremium &&
                    subscriptionItems.length >
                      0 && (
                      <div className="mb-12 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm leading-6 text-[#315b78]">
                        Your Premium
                        subscription is
                        already active.
                        Subscription
                        products are hidden
                        to avoid accidental
                        duplicate purchases.
                      </div>
                    )}

                  {/* =========================================
                      Mentor token packages
                  ========================================== */}

                  {tokenItems.length >
                    0 && (
                    <div
                      className={
                        !isPremium
                          ? "mt-12"
                          : ""
                      }
                    >
                      <div className="mb-6">
                        <div className="flex items-center gap-3">
                          <Coins
                            size={25}
                            className="text-[#16629b]"
                          />

                          <h3 className="text-2xl font-extrabold text-[#2c1607]">
                            Mentor Token Packs
                          </h3>
                        </div>

                        <p className="mt-2 text-[#6b6670]">
                          Add mentor
                          consultation tokens
                          to your account.
                        </p>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {tokenItems.map(
                          (
                            item,
                          ) => (
                            <article
                              key={
                                item.id
                              }
                              className="flex min-h-[320px] flex-col rounded-[24px] border border-[#ead3bd] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                            >
                              <div className="mb-5 flex items-start justify-between gap-4">
                                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#fff0e7] text-[#16629b]">
                                  <Package
                                    size={23}
                                  />
                                </div>

                                {item.token_reward >
                                  0 && (
                                  <span className="rounded-full bg-[#eef7ff] px-3 py-1 text-xs font-bold text-[#16629b]">
                                    +{item.token_reward} token
                                    {item.token_reward ===
                                    1
                                      ? ""
                                      : "s"}
                                  </span>
                                )}
                              </div>

                              <h4 className="text-xl font-bold text-[#2c1607]">
                                {item.name}
                              </h4>

                              <p className="mt-2 flex-1 text-sm leading-6 text-[#6b6670]">
                                {item.description}
                              </p>

                              <ul className="mt-5 space-y-3 text-sm text-[#4c5159]">
                                {getTokenBenefits(
                                  item,
                                ).map(
                                  (
                                    benefit,
                                  ) => (
                                    <FeatureItem
                                      key={
                                        benefit
                                      }
                                    >
                                      {benefit}
                                    </FeatureItem>
                                  ),
                                )}
                              </ul>

                              <div className="mt-6 flex items-end justify-between gap-4">
                                <span className="text-2xl font-extrabold text-[#2c1607]">
                                  {formatRupiah(
                                    item.price_rupiah,
                                  )}
                                </span>

                                <button
                                  type="button"
                                  disabled={
                                    item.stock_quantity <=
                                    0
                                  }
                                  onClick={() => {
                                    handleChooseItem(
                                      item.id,
                                    );
                                  }}
                                  className="rounded-xl border-2 border-[#16629b] bg-white px-4 py-2.5 text-sm font-bold text-[#16629b] transition hover:bg-[#edf6fc] disabled:cursor-not-allowed disabled:border-[#cbd0d5] disabled:text-[#92979b]"
                                >
                                  Buy
                                </button>
                              </div>
                            </article>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {subscriptionItems.length ===
                    0 &&
                    tokenItems.length ===
                      0 &&
                    !loadError && (
                      <div className="rounded-2xl border border-[#ead3bd] bg-white p-8 text-center">
                        <CalendarDays
                          size={34}
                          className="mx-auto text-[#16629b]"
                        />

                        <h3 className="mt-4 text-xl font-bold text-[#2c1607]">
                          No shop items are
                          currently available
                        </h3>

                        <p className="mt-2 text-[#6b6670]">
                          Please check again
                          later.
                        </p>
                      </div>
                    )}
                </>
              )}
            </div>
          )}
        </div>

        <style>
          {`
            @keyframes allyPlansReveal {
              from {
                opacity: 0;
                transform: translateY(22px);
              }

              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}
        </style>
      </section>
    </UserLayout>
  );
}