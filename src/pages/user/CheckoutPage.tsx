import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Landmark,
  LoaderCircle,
  Mountain,
  Package,
  QrCode,
  RefreshCcw,
  Sparkles,
  Wallet,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Navigate,
  useNavigate,
  useSearchParams,
} from "react-router";

import allyMascot from "../../assets/ally-assessment-mascot.png";

import {
  checkoutShopItemApi,
  getShopItemsApi,
  type ShopCheckoutResponse,
  type ShopItem,
} from "../../api/shopApi";

import UserLayout from "../../components/layout/UserLayout";

import {
  useAuth,
} from "../../context/AuthContext";

/* =========================================================
   Helpers
========================================================= */

function parseItemId(
  value:
    string | null,
): number | null {
  if (
    !value
  ) {
    return null;
  }

  const parsed =
    Number(
      value,
    );

  if (
    !Number.isInteger(
      parsed,
    ) ||
    parsed <=
      0
  ) {
    return null;
  }

  return parsed;
}

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

function getItemBenefits(
  item:
    ShopItem,
): string[] {
  const benefits:
    string[] = [];

  if (
    item.item_type ===
      "subscription" &&
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
      `${item.token_reward} Mentor ${
        item.token_reward ===
        1
          ? "Token"
          : "Tokens"
      }`,
    );
  }

  if (
    item.item_type ===
    "subscription"
  ) {
    benefits.push(
      "Access to premium Ally features",
    );
  }

  if (
    item.item_type ===
    "token_package"
  ) {
    benefits.push(
      "Use tokens for 1-on-1 mentor consultation bookings",
    );
  }

  return benefits;
}

function getCheckoutMessage(
  response:
    ShopCheckoutResponse,
): string {
  if (
    typeof response.message ===
      "string" &&
    response.message.trim()
  ) {
    return response.message.trim();
  }

  return "Checkout created successfully.";
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

  const itemId =
    parseItemId(
      searchParams.get(
        "item",
      ),
    );

  const [
    item,
    setItem,
  ] =
    useState<
      ShopItem | null
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
    isCheckingOut,
    setIsCheckingOut,
  ] =
    useState(
      false,
    );

  const [
    checkoutError,
    setCheckoutError,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    checkoutMessage,
    setCheckoutMessage,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const checkoutLockRef =
    useRef(
      false,
    );

  /* =======================================================
     Load selected shop item
  ======================================================= */

  useEffect(
    () => {
      if (
        itemId ===
        null
      ) {
        setIsLoading(
          false,
        );

        return;
      }

      let active =
        true;

      async function loadItem():
        Promise<void> {
        setIsLoading(
          true,
        );

        setLoadError(
          null,
        );

        try {
          const items =
            await getShopItemsApi();

          if (
            !active
          ) {
            return;
          }

          const selectedItem =
            items.find(
              (
                shopItem,
              ) =>
                shopItem.id ===
                  itemId &&
                shopItem.is_active,
            ) ??
            null;

          if (
            !selectedItem
          ) {
            throw new Error(
              "This shop item is no longer available.",
            );
          }

          setItem(
            selectedItem,
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

          setItem(
            null,
          );

          setLoadError(
            error instanceof
              Error
              ? error.message
              : "Unable to load the selected shop item.",
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

      void loadItem();

      return () => {
        active =
          false;
      };
    },
    [
      itemId,
      reloadVersion,
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

  const itemBenefits =
    useMemo(
      () =>
        item
          ? getItemBenefits(
              item,
            )
          : [],
      [
        item,
      ],
    );

  /* =======================================================
     Checkout
  ======================================================= */

  async function handleConfirm():
    Promise<void> {
    if (
      !item ||
      checkoutLockRef.current
    ) {
      return;
    }

    checkoutLockRef.current =
      true;

    setIsCheckingOut(
      true,
    );

    setCheckoutError(
      null,
    );

    setCheckoutMessage(
      null,
    );

    try {
      /*
       * Exact backend contract:
       *
       * POST /api/shop/checkout
       *
       * {
       *   "shop_item_id": item.id
       * }
       */
      const response =
        await checkoutShopItemApi({
          shop_item_id:
            item.id,
        });

      setCheckoutMessage(
        getCheckoutMessage(
          response,
        ),
      );

      /*
       * The POST response contract for the Midtrans handoff
       * has not been supplied yet, so this page intentionally
       * does not invent a snap_token or redirect_url field.
       *
       * Once that response is known, the Midtrans handoff
       * should be added here.
       */
    } catch (
      error:
        unknown
    ) {
      checkoutLockRef.current =
        false;

      setCheckoutError(
        error instanceof
          Error
          ? error.message
          : "Unable to create checkout.",
      );
    } finally {
      setIsCheckingOut(
        false,
      );
    }
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
     Invalid item query
  ======================================================= */

  if (
    itemId ===
    null
  ) {
    return (
      <Navigate
        to="/billing"
        replace
      />
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <UserLayout
      title="Billing"
      subtitle="Payment & Confirmation"
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
                  equipment. Review your
                  selected item before
                  continuing to
                  payment.&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              Loading
          ================================================== */}

          {isLoading && (
            <div className="grid min-h-[400px] place-items-center rounded-[28px] border border-[#ead3bd] bg-white">
              <div className="text-center">
                <LoaderCircle
                  size={34}
                  className="mx-auto animate-spin text-[#16629b]"
                />

                <p className="mt-4 font-semibold text-[#4d5560]">
                  Loading checkout...
                </p>
              </div>
            </div>
          )}

          {/* =================================================
              Load error
          ================================================== */}

          {!isLoading &&
            loadError && (
              <div className="mx-auto max-w-2xl rounded-[28px] border border-red-200 bg-white p-8 text-center shadow-sm">
                <AlertCircle
                  size={38}
                  className="mx-auto text-red-600"
                />

                <h2 className="mt-5 text-2xl font-bold text-[#2c1607]">
                  Unable to load checkout
                </h2>

                <p className="mt-3 leading-7 text-[#6b6670]">
                  {loadError}
                </p>

                <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={
                      handleRetry
                    }
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-[#16629b] bg-white px-5 font-semibold text-[#16629b]"
                  >
                    <RefreshCcw
                      size={17}
                    />

                    Retry
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigate(
                        "/billing",
                      );
                    }}
                    className="min-h-12 rounded-xl border-2 border-[#004b6f] bg-[#16629b] px-5 font-semibold text-white"
                  >
                    Back to Billing
                  </button>
                </div>
              </div>
            )}

          {/* =================================================
              Loaded checkout
          ================================================== */}

          {!isLoading &&
            !loadError &&
            item && (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-extrabold tracking-tight text-[#2c1607] sm:text-3xl">
                    Confirm Your Purchase
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#6b6670] sm:text-base">
                    Checkout now before your selected item is no longer available.
                  </p>
                </div>

                {/* ===========================================
                    Current plan
                ============================================ */}

                <article className="mb-10 rounded-[24px] border-2 border-[#ead3bd] bg-white px-5 py-6 shadow-[5px_5px_0_#ddcbb0] sm:px-7 lg:px-8">
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

                <div className="grid gap-8 lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.7fr)] lg:items-start">

                  {/* =========================================
                      Selected item
                  ========================================== */}

                  <article className="flex min-h-[460px] flex-col rounded-[28px] border border-[#ead3bd] bg-white p-7 shadow-sm sm:p-8">
                    <div className="flex items-start justify-between gap-4">
                      <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#fff0e7] text-[#16629b]">
                        {item.item_type ===
                        "subscription" ? (
                          <CalendarDays
                            size={24}
                          />
                        ) : (
                          <Package
                            size={24}
                          />
                        )}
                      </div>

                      <span className="rounded-full bg-[#edf6fc] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#16629b]">
                        {item.item_type.replaceAll(
                          "_",
                          " ",
                        )}
                      </span>
                    </div>

                    <h3 className="mt-6 text-2xl font-extrabold leading-tight text-[#2c1607]">
                      {item.name}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-[#6b6670]">
                      {item.description}
                    </p>

                    <div className="mt-7 text-4xl font-extrabold tracking-tight text-[#2c1607]">
                      {formatRupiah(
                        item.price_rupiah,
                      )}
                    </div>

                    <ul className="mt-8 flex-1 space-y-4 text-sm leading-6 text-[#4c5159]">
                      {itemBenefits.map(
                        (
                          benefit,
                        ) => (
                          <li
                            key={
                              benefit
                            }
                            className="flex items-start gap-3"
                          >
                            <CheckCircle2
                              size={20}
                              className="mt-0.5 shrink-0 text-[#59a7e8]"
                            />

                            <span>
                              {benefit}
                            </span>
                          </li>
                        ),
                      )}
                    </ul>

                    <button
                      type="button"
                      onClick={() => {
                        navigate(
                          "/billing",
                        );
                      }}
                      className="mt-8 min-h-13 w-full rounded-xl border-2 border-[#c8ced7] bg-white px-5 font-semibold text-[#4d5560] transition hover:border-[#16629b] hover:text-[#16629b]"
                    >
                      Choose Another Item
                    </button>
                  </article>

                  {/* =========================================
                      Payment and confirmation
                  ========================================== */}

                  <div className="space-y-7">

                    {/* Payment methods */}

                    <section>
                      <div className="mb-4">
                        <h3 className="text-2xl font-extrabold text-[#2c1607]">
                          Payment Methods
                        </h3>

                        <p className="mt-1 text-sm text-[#6b6670]">
                          Your final
                          payment method
                          is handled by the
                          payment gateway
                          after checkout is
                          created.
                        </p>
                      </div>

                      <div className="grid gap-3 rounded-[22px] border border-[#f2d8ca] bg-white p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-4">
                        <div className="flex min-h-[104px] flex-col items-center justify-center gap-3 rounded-xl px-3 py-4 text-center">
                          <span className="grid h-9 w-12 place-items-center rounded-md border border-[#cbd0d8] text-[#4c5159]">
                            <CreditCard
                              size={21}
                            />
                          </span>

                          <span className="text-sm font-medium text-[#4d5560]">
                            VISA / Mastercard
                          </span>
                        </div>

                        <div className="flex min-h-[104px] flex-col items-center justify-center gap-3 rounded-xl px-3 py-4 text-center">
                          <span className="grid h-9 w-12 place-items-center rounded-md border border-[#cbd0d8] text-[#4c5159]">
                            <Wallet
                              size={21}
                            />
                          </span>

                          <span className="text-sm font-medium text-[#4d5560]">
                            e-Wallet
                          </span>
                        </div>

                        <div className="flex min-h-[104px] flex-col items-center justify-center gap-3 rounded-xl px-3 py-4 text-center">
                          <span className="grid h-9 w-12 place-items-center rounded-md border border-[#cbd0d8] text-[#4c5159]">
                            <QrCode
                              size={21}
                            />
                          </span>

                          <span className="text-sm font-medium text-[#4d5560]">
                            QRIS
                          </span>
                        </div>

                        <div className="flex min-h-[104px] flex-col items-center justify-center gap-3 rounded-xl px-3 py-4 text-center">
                          <span className="grid h-9 w-12 place-items-center rounded-md border border-[#cbd0d8] text-[#4c5159]">
                            <Landmark
                              size={21}
                            />
                          </span>

                          <span className="text-sm font-medium text-[#4d5560]">
                            Bank / Card
                          </span>
                        </div>
                      </div>
                    </section>

                    {/* Confirm transaction */}

                    <section className="rounded-[22px] border border-[#f2d8ca] bg-white p-5 sm:p-7">
                      <h3 className="text-2xl font-extrabold text-[#2c1607]">
                        Confirm Transaction
                      </h3>

                      <div className="mt-3 border-t border-[#bfc4cc]">
                        <div className="flex items-start justify-between gap-5 border-b border-[#bfc4cc] py-4 text-sm sm:text-base">
                          <div>
                            <span className="font-medium text-[#4d5560]">
                              {item.name}
                            </span>

                            <p className="mt-1 text-xs text-[#7a7d86]">
                              Shop item #{item.id}
                            </p>
                          </div>

                          <span className="font-medium text-[#4d5560]">
                            {formatRupiah(
                              item.price_rupiah,
                            )}
                          </span>
                        </div>

                        {item.token_reward >
                          0 && (
                          <div className="flex items-center justify-between gap-5 border-b border-[#bfc4cc] py-4 text-sm sm:text-base">
                            <span className="text-[#5f626a]">
                              Mentor Tokens
                            </span>

                            <span className="font-medium text-[#4d5560]">
                              +{item.token_reward}
                            </span>
                          </div>
                        )}

                        {item.duration_days && (
                          <div className="flex items-center justify-between gap-5 border-b border-[#bfc4cc] py-4 text-sm sm:text-base">
                            <span className="text-[#5f626a]">
                              Access Duration
                            </span>

                            <span className="font-medium text-[#4d5560]">
                              {item.duration_days} days
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-5 pt-4 text-base sm:text-lg">
                          <span className="font-semibold text-[#4d5560]">
                            Total
                          </span>

                          <span className="text-xl font-extrabold text-[#2c1607]">
                            {formatRupiah(
                              item.price_rupiah,
                            )}
                          </span>
                        </div>
                      </div>

                      {checkoutError && (
                        <div
                          role="alert"
                          className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                        >
                          <AlertCircle
                            size={19}
                            className="mt-0.5 shrink-0"
                          />

                          {checkoutError}
                        </div>
                      )}

                      {checkoutMessage && (
                        <div
                          role="status"
                          className="mt-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-700"
                        >
                          <CheckCircle2
                            size={19}
                            className="mt-0.5 shrink-0"
                          />

                          <div>
                            <p className="font-semibold">
                              Checkout created
                            </p>

                            <p className="mt-1">
                              {checkoutMessage}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="mt-8 flex flex-col items-stretch gap-4 sm:items-end">
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            disabled={
                              isCheckingOut
                            }
                            onClick={() => {
                              navigate(
                                "/billing",
                              );
                            }}
                            className="min-h-11 rounded-xl border-2 border-[#16629b] bg-white px-6 font-semibold text-[#16629b] transition hover:bg-[#f4f9fc] disabled:opacity-60"
                          >
                            Cancel
                          </button>

                          <button
                            type="button"
                            disabled={
                              isCheckingOut ||
                              checkoutMessage !==
                                null ||
                              item.stock_quantity <=
                                0
                            }
                            onClick={() => {
                              void handleConfirm();
                            }}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-2 border-[#004b6f] bg-[#16629b] px-6 font-semibold text-white shadow-[0_3px_0_#004b6f] transition hover:bg-[#1e6da6] active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:border-[#9ca9b1] disabled:bg-[#b9c4ca] disabled:shadow-none"
                          >
                            {isCheckingOut && (
                              <LoaderCircle
                                size={18}
                                className="animate-spin"
                              />
                            )}

                            {isCheckingOut
                              ? "Creating Checkout..."
                              : checkoutMessage
                                ? "Checkout Created"
                                : "Confirm"}
                          </button>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </>
            )}
        </div>
      </section>
    </UserLayout>
  );
}