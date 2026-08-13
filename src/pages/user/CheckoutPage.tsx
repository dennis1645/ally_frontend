import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Landmark,
  LoaderCircle,
  Package,
  QrCode,
  Sparkles,
  Wallet,
} from "lucide-react";

import {
  useCallback,
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
  findShopTransactionByOrderIdApi,
  getShopItemsApi,
  type ShopItem,
} from "../../api/shopApi";

import UserLayout from "../../components/layout/UserLayout";
import AllyPopup from "../../components/ui/AllyPopup";

import {
  useAuth,
} from "../../context/AuthContext";

import type {
  AuthUser,
} from "../../types/auth";

/* =========================================================
   Midtrans checkout memory
========================================================= */

const PENDING_CHECKOUT_KEY =
  "ally_pending_checkout";

type PendingCheckout = {
  orderId: string;
  itemId: number;
  itemName: string;
  itemType: string;
  tokenReward: number;
  durationDays: number | null;
  total: string;
  tokenBalanceBefore: number | null;
  isPremiumBefore: boolean;
  premiumUntilBefore: string | null;
  createdAt: number;
};

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function savePendingCheckout(
  value: PendingCheckout,
): void {
  window.sessionStorage.setItem(
    PENDING_CHECKOUT_KEY,
    JSON.stringify(value),
  );
}

function readPendingCheckout():
  PendingCheckout | null {
  try {
    const raw =
      window.sessionStorage.getItem(
        PENDING_CHECKOUT_KEY,
      );

    if (!raw) {
      return null;
    }

    const parsed: unknown =
      JSON.parse(raw);

    if (!isRecord(parsed)) {
      return null;
    }

    const orderId =
      typeof parsed.orderId === "string"
        ? parsed.orderId.trim()
        : "";

    const itemId =
      Number(parsed.itemId);

    const itemName =
      typeof parsed.itemName === "string"
        ? parsed.itemName.trim()
        : "";

    const itemType =
      typeof parsed.itemType === "string"
        ? parsed.itemType.trim()
        : "";

    const tokenReward =
      Number(parsed.tokenReward);

    const durationDays =
      parsed.durationDays === null ||
      parsed.durationDays === undefined
        ? null
        : Number(parsed.durationDays);

    const total =
      typeof parsed.total === "string"
        ? parsed.total.trim()
        : String(parsed.total ?? "").trim();

    const tokenBalanceBefore =
      parsed.tokenBalanceBefore === null ||
      parsed.tokenBalanceBefore === undefined
        ? null
        : Number(parsed.tokenBalanceBefore);

    const isPremiumBefore =
      parsed.isPremiumBefore === true;

    const premiumUntilBefore =
      typeof parsed.premiumUntilBefore === "string"
        ? parsed.premiumUntilBefore.trim() || null
        : null;

    const createdAt =
      Number(parsed.createdAt);

    if (
      !orderId ||
      !Number.isInteger(itemId) ||
      itemId <= 0 ||
      !itemName ||
      !itemType ||
      !Number.isFinite(tokenReward) ||
      tokenReward < 0 ||
      (
        durationDays !== null &&
        !Number.isFinite(durationDays)
      ) ||
      !total ||
      (
        tokenBalanceBefore !== null &&
        !Number.isFinite(
          tokenBalanceBefore,
        )
      ) ||
      !Number.isFinite(createdAt)
    ) {
      return null;
    }

    return {
      orderId,
      itemId,
      itemName,
      itemType,
      tokenReward,
      durationDays,
      total,
      tokenBalanceBefore,
      isPremiumBefore,
      premiumUntilBefore,
      createdAt,
    };
  } catch {
    return null;
  }
}

function clearPendingCheckout(): void {
  window.sessionStorage.removeItem(
    PENDING_CHECKOUT_KEY,
  );
}

/* =========================================================
   Helpers
========================================================= */

function parseItemId(
  value: string | null,
): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);

  return (
    Number.isInteger(parsed) &&
    parsed > 0
      ? parsed
      : null
  );
}

function cleanQueryValue(
  value: string | null,
): string | null {
  const normalized =
    value?.trim() ?? "";

  return normalized || null;
}

function formatRupiah(
  value: string | number,
): string {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return "Rp0";
  }

  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    },
  )
    .format(parsed)
    .replace(/\s/g, "");
}

function formatPremiumDate(
  value:
    | string
    | null
    | undefined,
): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

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
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  ).format(date);
}

function getTokenBalance(
  user:
    | AuthUser
    | null
    | undefined,
): number | null {
  return (
    typeof user?.token_balance ===
      "number" &&
    Number.isFinite(
      user.token_balance,
    )
      ? Math.max(
          0,
          user.token_balance,
        )
      : null
  );
}

function isPurchasable(
  item: ShopItem,
): boolean {
  if (!item.is_active) {
    return false;
  }

  /*
   * Subscription records in the backend can use stock_quantity = 0
   * because access is duration-based rather than inventory-based.
   */
  if (
    item.item_type ===
    "subscription"
  ) {
    return true;
  }

  return (
    item.stock_quantity > 0
  );
}

function getItemBenefits(
  item: ShopItem,
): string[] {
  const benefits: string[] = [];

  if (
    item.item_type ===
      "subscription" &&
    item.duration_days
  ) {
    benefits.push(
      `${item.duration_days} days of Premium access`,
    );
  }

  if (
    item.token_reward > 0
  ) {
    benefits.push(
      `${item.token_reward} Mentor ${
        item.token_reward === 1
          ? "Token"
          : "Tokens"
      } included`,
    );
  }

  if (
    item.item_type ===
    "subscription"
  ) {
    benefits.push(
      "Full Premium Ally features",
    );
  }

  return benefits;
}

function sleep(
  milliseconds: number,
): Promise<void> {
  return new Promise(
    (resolve) => {
      window.setTimeout(
        resolve,
        milliseconds,
      );
    },
  );
}

type PaymentReturnKind =
  | "success"
  | "pending"
  | "failed"
  | "unknown";

function getPaymentReturnKind(
  status: string | null,
): PaymentReturnKind {
  const normalized =
    status?.toLowerCase() ?? "";

  if (
    normalized === "settlement" ||
    normalized === "capture" ||
    normalized === "success"
  ) {
    return "success";
  }

  if (
    normalized === "pending" ||
    normalized === "authorize"
  ) {
    return "pending";
  }

  if (
    [
      "deny",
      "cancel",
      "expire",
      "expired",
      "failure",
      "failed",
    ].includes(normalized)
  ) {
    return "failed";
  }

  return "unknown";
}

function entitlementApplied(
  profile: AuthUser,
  pending: PendingCheckout,
): boolean {
  const currentTokenBalance =
    getTokenBalance(profile);

  const currentPremiumUntil =
    typeof profile.premium_until ===
      "string"
      ? profile.premium_until.trim() || null
      : null;

  const premiumApplied =
    pending.itemType ===
      "subscription" &&
    profile.is_premium === true &&
    (
      !pending.isPremiumBefore ||
      (
        currentPremiumUntil !== null &&
        currentPremiumUntil !==
          pending.premiumUntilBefore
      )
    );

  const tokenApplied =
    pending.tokenReward > 0 &&
    currentTokenBalance !== null &&
    (
      pending.tokenBalanceBefore ===
        null
        ? currentTokenBalance > 0
        : currentTokenBalance >
          pending.tokenBalanceBefore
    );

  return (
    premiumApplied ||
    tokenApplied
  );
}

/* =========================================================
   Checkout page
========================================================= */

export default function CheckoutPage() {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  const {
    user,
    refreshProfile,
  } = useAuth();

  const returnedOrderId =
    cleanQueryValue(
      searchParams.get(
        "order_id",
      ),
    );

  const urlTransactionStatus =
    cleanQueryValue(
      searchParams.get(
        "transaction_status",
      ),
    );

  const statusCode =
    cleanQueryValue(
      searchParams.get(
        "status_code",
      ),
    );

  /*
   * A pending checkout is written immediately before leaving Ally for
   * Midtrans. If Midtrans returns to the configured finish URL without
   * preserving its normal query parameters, this session record still
   * lets us identify the exact order and ask Ally's backend for status.
   */
  const pendingCheckout =
    useMemo(
      () =>
        readPendingCheckout(),
      [],
    );

  const resolvedOrderId =
    returnedOrderId ??
    pendingCheckout?.orderId ??
    null;

  const [
    resolvedTransactionStatus,
    setResolvedTransactionStatus,
  ] =
    useState<string | null>(
      urlTransactionStatus,
    );

  const [
    paymentStatusCheckComplete,
    setPaymentStatusCheckComplete,
  ] =
    useState(false);

  const [
    isResolvingPaymentStatus,
    setIsResolvingPaymentStatus,
  ] =
    useState(false);

  const paymentReturnKind =
    getPaymentReturnKind(
      resolvedTransactionStatus,
    );

  const isPaymentReturn =
    Boolean(
      returnedOrderId ||
      urlTransactionStatus ||
      statusCode ||
      pendingCheckout,
    );

  const requestedItemId =
    parseItemId(
      searchParams.get("item"),
    );

  const itemId =
    requestedItemId ??
    pendingCheckout?.itemId ??
    null;

  const [item, setItem] =
    useState<ShopItem | null>(
      null,
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState<string | null>(
      null,
    );

  const [isCheckingOut, setIsCheckingOut] =
    useState(false);

  const [checkoutError, setCheckoutError] =
    useState<string | null>(
      null,
    );

  const [successPopupOpen, setSuccessPopupOpen] =
    useState(false);

  const [entitlementConfirmed, setEntitlementConfirmed] =
    useState(false);

  const checkoutLockRef =
    useRef(false);

  /* =======================================================
     Load selected backend item
  ======================================================= */

  useEffect(
    () => {
      if (itemId === null) {
        setIsLoading(false);
        return;
      }

      let active = true;

      async function loadItem():
        Promise<void> {
        setIsLoading(true);
        setLoadError(null);

        try {
          const items =
            await getShopItemsApi();

          if (!active) {
            return;
          }

          const selected =
            items.find(
              (candidate) =>
                candidate.id ===
                itemId,
            ) ?? null;

          if (!selected) {
            throw new Error(
              "This billing item is no longer available.",
            );
          }

          setItem(selected);
        } catch (
          error: unknown
        ) {
          if (!active) {
            return;
          }

          setItem(null);

          setLoadError(
            error instanceof Error
              ? error.message
              : "Unable to load this billing item.",
          );
        } finally {
          if (active) {
            setIsLoading(false);
          }
        }
      }

      void loadItem();

      return () => {
        active = false;
      };
    },
    [itemId],
  );

  /* =======================================================
     Resolve payment after returning from Midtrans

     Do not rely on the browser return URL alone.

     Source of truth:
     1. Midtrans transaction status already persisted by Ally backend:
        GET /api/transactions
        GET /api/transactions/{id}
     2. GET /api/profile confirms the purchased entitlement.

     Midtrans can return before the server-to-server webhook is fully
     processed, so we poll briefly instead of showing an "unknown" result
     immediately.
  ======================================================= */

  const resolvePaymentReturn =
    useCallback(
      async (): Promise<void> => {
        if (!isPaymentReturn) {
          return;
        }

        const pending =
          readPendingCheckout();

        const orderId =
          returnedOrderId ??
          pending?.orderId ??
          null;

        /*
         * A definitive failed URL status can be shown immediately.
         * For success, pending, or missing status we still consult the
         * backend because that is where the webhook writes final state.
         */
        if (
          getPaymentReturnKind(
            urlTransactionStatus,
          ) === "failed"
        ) {
          setResolvedTransactionStatus(
            urlTransactionStatus,
          );

          setPaymentStatusCheckComplete(
            true,
          );

          void refreshProfile().catch(
            () => undefined,
          );

          return;
        }

        setIsResolvingPaymentStatus(
          true,
        );

        /*
         * If the browser URL already says settlement/capture, celebrate
         * immediately, then keep syncing the real Ally entitlement.
         */
        if (
          getPaymentReturnKind(
            urlTransactionStatus,
          ) === "success"
        ) {
          setSuccessPopupOpen(
            true,
          );
        }

        try {
          for (
            let attempt = 0;
            attempt < 8;
            attempt += 1
          ) {
            let backendKind:
              PaymentReturnKind =
                "unknown";

            if (orderId) {
              try {
                const transaction =
                  await findShopTransactionByOrderIdApi(
                    orderId,
                  );

                if (
                  transaction?.transaction_status
                ) {
                  setResolvedTransactionStatus(
                    transaction.transaction_status,
                  );

                  backendKind =
                    getPaymentReturnKind(
                      transaction.transaction_status,
                    );

                  if (
                    backendKind ===
                      "success"
                  ) {
                    setSuccessPopupOpen(
                      true,
                    );
                  }

                  if (
                    backendKind ===
                      "failed"
                  ) {
                    setPaymentStatusCheckComplete(
                      true,
                    );

                    return;
                  }
                }
              } catch {
                /*
                 * A transaction list read can race the webhook. Continue
                 * checking the authenticated profile instead of failing
                 * the whole return experience.
                 */
              }
            }

            try {
              const profile =
                await refreshProfile();

              if (
                pending &&
                entitlementApplied(
                  profile,
                  pending,
                )
              ) {
                setEntitlementConfirmed(
                  true,
                );

                /*
                 * If the return URL omitted transaction_status and the
                 * transaction endpoint is still catching up, a real
                 * backend entitlement change is enough to identify this
                 * checkout as successful.
                 */
                if (
                  backendKind ===
                    "unknown" &&
                  getPaymentReturnKind(
                    urlTransactionStatus,
                  ) === "unknown"
                ) {
                  setResolvedTransactionStatus(
                    "settlement",
                  );
                }

                setSuccessPopupOpen(
                  true,
                );

                setPaymentStatusCheckComplete(
                  true,
                );

                return;
              }
            } catch {
              // Keep polling while the webhook/profile state catches up.
            }

            if (
              backendKind ===
                "success"
            ) {
              /*
               * Payment is authoritative even if account benefits need a
               * few more seconds to appear. Keep the success popup open
               * and continue polling profile state.
               */
              setSuccessPopupOpen(
                true,
              );
            }

            if (attempt < 7) {
              await sleep(
                1500,
              );
            }
          }
        } finally {
          setIsResolvingPaymentStatus(
            false,
          );

          setPaymentStatusCheckComplete(
            true,
          );
        }
      },
      [
        isPaymentReturn,
        refreshProfile,
        returnedOrderId,
        urlTransactionStatus,
      ],
    );

  useEffect(
    () => {
      void resolvePaymentReturn();
    },
    [
      resolvePaymentReturn,
    ],
  );

  /* =======================================================
     Current account
  ======================================================= */

  const isPremium =
    user?.is_premium === true;

  const premiumUntil =
    formatPremiumDate(
      user?.premium_until,
    );

  const tokenBalance =
    getTokenBalance(user);

  const benefits =
    useMemo(
      () =>
        item
          ? getItemBenefits(item)
          : [],
      [item],
    );

  const receiptItemName =
    pendingCheckout?.itemName ??
    item?.name ??
    "Ally purchase";

  const receiptTotal =
    pendingCheckout?.total ??
    item?.price_rupiah ??
    "0";

  /* =======================================================
     Create Midtrans checkout
  ======================================================= */

  async function handleConfirm():
    Promise<void> {
    if (
      !item ||
      checkoutLockRef.current ||
      !isPurchasable(item)
    ) {
      return;
    }

    checkoutLockRef.current = true;
    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      const response =
        await checkoutShopItemApi({
          shop_item_id: item.id,
        });

      savePendingCheckout({
        orderId:
          response.data.order_id,
        itemId:
          item.id,
        itemName:
          item.name,
        itemType:
          item.item_type,
        tokenReward:
          item.token_reward,
        durationDays:
          item.duration_days,
        total:
          response.data.total,
        tokenBalanceBefore:
          tokenBalance,
        isPremiumBefore:
          isPremium,
        premiumUntilBefore:
          user?.premium_until ??
          null,
        createdAt:
          Date.now(),
      });

      /*
       * redirect_url is validated in shopApi.ts and must be a secure
       * Midtrans-hosted URL before navigation is allowed.
       */
      window.location.assign(
        response.data.redirect_url,
      );
    } catch (
      error: unknown
    ) {
      checkoutLockRef.current = false;
      setIsCheckingOut(false);

      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Unable to start Midtrans checkout.",
      );
    }
  }

  function closeSuccessPopup(): void {
    setSuccessPopupOpen(false);
    clearPendingCheckout();

    navigate(
      "/billing",
      {
        replace: true,
      },
    );
  }

  if (
    itemId === null &&
    !isPaymentReturn
  ) {
    return (
      <Navigate
        to="/billing"
        replace
      />
    );
  }

  return (
    <UserLayout
      title="Billing"
      subtitle="Secure Checkout"
      topbarProps={{
        showSearch: false,
      }}
    >
      <AllyPopup
        isOpen={
          successPopupOpen
        }
        badge="Payment Complete"
        badgeIcon={
          <CheckCircle2
            size={14}
            aria-hidden="true"
          />
        }
        mascotSrc={
          allyMascot
        }
        mascotAlt="Ally celebrating your successful payment"
        title="Payment successful!"
        description={
          entitlementConfirmed
            ? pendingCheckout?.itemType ===
                "subscription"
              ? "Your Premium access is now active."
              : "Your purchase has been added to your Ally account."
            : "Your payment is confirmed. Ally is updating your account now."
        }
        onClose={
          closeSuccessPopup
        }
        closeLabel="Close payment success"
      >
        <div className="mt-5 rounded-2xl border border-[#d7e4ec] bg-white p-4 text-left shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-[#2c1607]">
                {receiptItemName}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {resolvedOrderId ??
                  "Midtrans payment"}
              </p>
            </div>

            <p className="shrink-0 text-base font-extrabold text-[#16629b]">
              {formatRupiah(
                receiptTotal,
              )}
            </p>
          </div>
        </div>

        {isResolvingPaymentStatus &&
          !entitlementConfirmed && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
            <LoaderCircle
              size={15}
              className="animate-spin"
              aria-hidden="true"
            />

            Updating your Ally account...
          </div>
        )}
      </AllyPopup>

      <section className="min-h-[calc(100vh-80px)] bg-[#fff8f5]">
        <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="mb-9 flex flex-col gap-5 md:flex-row md:items-center">
            <div className="relative shrink-0 self-start">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-2 border-[#f1d8c7] bg-[#ffe3d2] p-1.5 shadow-[3px_4px_0_#d1c0aa]">
                <img
                  src={allyMascot}
                  alt="Ally explorer mascot"
                  className="h-full w-full rounded-xl object-contain"
                />
              </div>

              <div className="absolute -bottom-2 -right-2 grid h-7 w-7 place-items-center rounded-full border-2 border-[#fff8f5] bg-[#16629b] text-white shadow-sm">
                <Sparkles
                  size={14}
                  aria-hidden="true"
                />
              </div>
            </div>

            <div className="flex-1 rounded-2xl border-2 border-[#ecdcd1] bg-[#faf2ed] px-6 py-5 shadow-[4px_4px_0_#ecdcd1] sm:px-7">
              <p className="text-base font-semibold leading-7 text-[#2c1607]">
                Review your plan, then continue securely to Midtrans to complete payment.
              </p>
            </div>
          </div>

          {isPaymentReturn &&
            paymentReturnKind !==
              "success" && (
            <div
              className={[
                "mb-8 rounded-2xl border px-5 py-4 text-sm leading-6",
                paymentReturnKind ===
                  "pending"
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : paymentReturnKind ===
                      "failed"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-sky-200 bg-sky-50 text-sky-700",
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                {isResolvingPaymentStatus ||
                paymentReturnKind ===
                  "pending" ? (
                  <LoaderCircle
                    size={20}
                    className="mt-0.5 shrink-0 animate-spin"
                  />
                ) : (
                  <AlertCircle
                    size={20}
                    className="mt-0.5 shrink-0"
                  />
                )}

                <div>
                  <p className="font-extrabold">
                    {paymentReturnKind ===
                    "pending"
                      ? "Payment is still processing"
                      : paymentReturnKind ===
                          "failed"
                        ? "Payment was not completed"
                        : isResolvingPaymentStatus
                          ? "Confirming your payment..."
                          : "Payment confirmation is taking longer than expected"}
                  </p>

                  <p className="mt-1">
                    {paymentReturnKind ===
                    "pending"
                      ? "You do not need to pay again. Ally is waiting for the final payment confirmation."
                      : paymentReturnKind ===
                          "failed"
                        ? "This payment was not completed. You can return to Billing and try again."
                        : isResolvingPaymentStatus
                          ? "Ally is checking the transaction with the backend."
                          : "Do not pay again yet. The payment may already be complete while the backend finishes syncing."}
                  </p>
                </div>
              </div>

              {paymentStatusCheckComplete &&
                !isResolvingPaymentStatus && (
                <button
                  type="button"
                  onClick={() => {
                    if (
                      paymentReturnKind ===
                        "failed"
                    ) {
                      clearPendingCheckout();
                    }

                    navigate(
                      "/billing",
                      {
                        replace: true,
                      },
                    );
                  }}
                  className="mt-4 rounded-xl border border-current px-4 py-2 font-bold"
                >
                  Back to Billing
                </button>
              )}
            </div>
          )}

          {isLoading && (
            <div className="grid min-h-[320px] place-items-center rounded-[28px] border border-[#ead3bd] bg-white">
              <div className="text-center">
                <LoaderCircle
                  size={32}
                  className="mx-auto animate-spin text-[#16629b]"
                />

                <p className="mt-4 font-semibold text-[#4d5560]">
                  Loading checkout...
                </p>
              </div>
            </div>
          )}

          {!isLoading &&
            loadError && (
            <div className="mx-auto max-w-2xl rounded-[28px] border border-red-200 bg-white p-8 text-center shadow-sm">
              <AlertCircle
                size={36}
                className="mx-auto text-red-600"
              />

              <h2 className="mt-4 text-xl font-extrabold text-[#2c1607]">
                Unable to load checkout
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#6b6670]">
                {loadError}
              </p>

              <button
                type="button"
                onClick={() => {
                  navigate("/billing");
                }}
                className="mt-5 rounded-xl bg-[#16629b] px-5 py-3 font-bold text-white"
              >
                Back to Billing
              </button>
            </div>
          )}

          {!isPaymentReturn &&
            !isLoading &&
            !loadError &&
            item && (
            <>
              <article className="mb-8 rounded-[24px] border-2 border-[#ead3bd] bg-white px-5 py-5 shadow-[5px_5px_0_#ddcbb0] sm:px-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#7a582f]">
                      Current plan
                    </p>

                    <h2 className="mt-1 text-xl font-extrabold text-[#2c1607]">
                      {isPremium
                        ? "Premium"
                        : "Explorer (Free)"}
                    </h2>

                    <p className="mt-1 text-sm text-[#6b6670]">
                      {isPremium
                        ? premiumUntil
                          ? `Active until ${premiumUntil}`
                          : "Premium access is active"
                        : "Free expedition access"}
                    </p>
                  </div>

                  {tokenBalance !== null && (
                    <div className="rounded-xl bg-[#edf6fc] px-4 py-3 text-right">
                      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#59798e]">
                        Mentor Tokens
                      </p>

                      <p className="text-2xl font-extrabold text-[#16629b]">
                        {tokenBalance}
                      </p>
                    </div>
                  )}
                </div>
              </article>

              <div className="grid gap-7 lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.4fr)] lg:items-start">
                <article className="rounded-[28px] border border-[#ead3bd] bg-white p-7 shadow-sm sm:p-8">
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

                  <h2 className="mt-5 text-2xl font-extrabold text-[#2c1607]">
                    {item.name}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#6b6670]">
                    {item.description}
                  </p>

                  <p className="mt-6 text-4xl font-extrabold tracking-tight text-[#2c1607]">
                    {formatRupiah(
                      item.price_rupiah,
                    )}
                  </p>

                  <ul className="mt-6 space-y-3 text-sm leading-6 text-[#4c5159]">
                    {benefits.map(
                      (benefit) => (
                        <li
                          key={benefit}
                          className="flex items-start gap-2.5"
                        >
                          <CheckCircle2
                            size={18}
                            className="mt-0.5 shrink-0 text-[#3b82c4]"
                          />

                          {benefit}
                        </li>
                      ),
                    )}
                  </ul>
                </article>

                <div className="space-y-6">
                  <section>
                    <h3 className="text-xl font-extrabold text-[#2c1607]">
                      Pay securely with Midtrans
                    </h3>

                    <p className="mt-1 text-sm text-[#6b6670]">
                      Choose your payment method on the Midtrans payment page.
                    </p>

                    <div className="mt-4 grid gap-3 rounded-[22px] border border-[#f2d8ca] bg-white p-4 sm:grid-cols-2 xl:grid-cols-4">
                      {[
                        [
                          "Card",
                          <CreditCard
                            key="card"
                            size={20}
                          />,
                        ],
                        [
                          "e-Wallet",
                          <Wallet
                            key="wallet"
                            size={20}
                          />,
                        ],
                        [
                          "QRIS",
                          <QrCode
                            key="qris"
                            size={20}
                          />,
                        ],
                        [
                          "Bank",
                          <Landmark
                            key="bank"
                            size={20}
                          />,
                        ],
                      ].map(
                        ([label, icon]) => (
                          <div
                            key={String(label)}
                            className="flex min-h-[90px] flex-col items-center justify-center gap-2 rounded-xl bg-[#fbfcfd] text-center text-sm font-semibold text-[#4d5560]"
                          >
                            <span className="text-[#16629b]">
                              {icon}
                            </span>

                            {label}
                          </div>
                        ),
                      )}
                    </div>
                  </section>

                  <section className="rounded-[22px] border border-[#f2d8ca] bg-white p-5 sm:p-7">
                    <div className="flex items-center justify-between gap-4 border-b border-[#e4e7ea] pb-4">
                      <span className="font-semibold text-[#5f626a]">
                        Total
                      </span>

                      <span className="text-2xl font-extrabold text-[#2c1607]">
                        {formatRupiah(
                          item.price_rupiah,
                        )}
                      </span>
                    </div>

                    {checkoutError && (
                      <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                        <AlertCircle
                          size={18}
                          className="mt-0.5 shrink-0"
                        />

                        {checkoutError}
                      </div>
                    )}

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
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
                        className="min-h-11 rounded-xl border-2 border-[#16629b] bg-white px-6 font-bold text-[#16629b] disabled:opacity-60"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        disabled={
                          isCheckingOut ||
                          !isPurchasable(item)
                        }
                        onClick={() => {
                          void handleConfirm();
                        }}
                        className="squishy-button inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-2 border-[#004b6f] bg-[#16629b] px-6 font-bold text-white shadow-[0_3px_0_#004b6f] transition hover:bg-[#1e6da6] active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:border-[#9ca9b1] disabled:bg-[#b9c4ca] disabled:shadow-none"
                      >
                        {isCheckingOut && (
                          <LoaderCircle
                            size={18}
                            className="animate-spin"
                          />
                        )}

                        {isCheckingOut
                          ? "Opening Midtrans..."
                          : "Continue to Midtrans"}
                      </button>
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