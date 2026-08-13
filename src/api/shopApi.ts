import {
  apiRequest,
} from "./apiClient";

/* =========================================================
   Types
========================================================= */

export type ShopItemType =
  | "subscription"
  | "token_package"
  | string;

export type ShopItem = {
  id: number;
  name: string;
  item_type: ShopItemType;
  description: string;
  price_rupiah: string;
  price_xp: number;
  token_reward: number;
  duration_days: number | null;
  stock_quantity: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ShopItemsResponse = {
  status: string;
  data: ShopItem[];
};

export type ShopCheckoutPayload = {
  shop_item_id: number;
};

/**
 * Exact successful response supplied for:
 *
 * POST /api/shop/checkout
 */
export type ShopCheckoutData = {
  order_id: string;
  snap_token: string;
  redirect_url: string;
  item: string;
  total: string;
};

export type ShopCheckoutResponse = {
  status: string;
  message: string;
  data: ShopCheckoutData;
};


export type ShopTransaction = {
  id: string | number | null;
  order_id: string;
  transaction_status: string;
  payment_type: string | null;
  gross_amount: string | null;
};

/* =========================================================
   Validation helpers
========================================================= */

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function toFiniteNumber(
  value: unknown,
): number | null {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (
    typeof value === "string" &&
    value.trim() !== ""
  ) {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function toInteger(
  value: unknown,
): number | null {
  const parsed = toFiniteNumber(value);

  if (
    parsed === null ||
    !Number.isInteger(parsed)
  ) {
    return null;
  }

  return parsed;
}

function requiredString(
  value: unknown,
  field: string,
): string {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    throw new Error(
      `The checkout server did not return a valid ${field}.`,
    );
  }

  return value.trim();
}

function normalizeRedirectUrl(
  value: unknown,
): string {
  const url = requiredString(
    value,
    "redirect_url",
  );

  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    throw new Error(
      "The checkout server returned an invalid payment redirect URL.",
    );
  }

  const hostname =
    parsed.hostname.toLowerCase();

  const isMidtransHost =
    hostname === "midtrans.com" ||
    hostname.endsWith(".midtrans.com");

  if (
    parsed.protocol !== "https:" ||
    !isMidtransHost
  ) {
    throw new Error(
      "The checkout server did not return a secure Midtrans payment URL.",
    );
  }

  return parsed.toString();
}


function normalizeTransaction(
  value: unknown,
): ShopTransaction | null {
  if (!isRecord(value)) {
    return null;
  }

  const orderId =
    typeof value.order_id === "string"
      ? value.order_id.trim()
      : typeof value.orderId === "string"
        ? value.orderId.trim()
        : "";

  if (!orderId) {
    return null;
  }

  const rawId =
    value.id ??
    null;

  const id =
    typeof rawId === "string" ||
    typeof rawId === "number"
      ? rawId
      : null;

  const transactionStatus =
    typeof value.transaction_status === "string"
      ? value.transaction_status.trim()
      : typeof value.payment_status === "string"
        ? value.payment_status.trim()
        : typeof value.status === "string"
          ? value.status.trim()
          : "";

  const paymentType =
    typeof value.payment_type === "string"
      ? value.payment_type.trim() || null
      : typeof value.payment_method === "string"
        ? value.payment_method.trim() || null
        : null;

  const grossAmount =
    typeof value.gross_amount === "string"
      ? value.gross_amount.trim() || null
      : typeof value.amount === "string"
        ? value.amount.trim() || null
        : typeof value.amount === "number" &&
            Number.isFinite(value.amount)
          ? String(value.amount)
          : null;

  return {
    id,
    order_id: orderId,
    transaction_status:
      transactionStatus,
    payment_type:
      paymentType,
    gross_amount:
      grossAmount,
  };
}

function extractTransactionList(
  response: unknown,
): unknown[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (!isRecord(response)) {
    return [];
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (isRecord(response.data)) {
    const data = response.data;

    if (Array.isArray(data.data)) {
      return data.data;
    }

    if (Array.isArray(data.transactions)) {
      return data.transactions;
    }

    if (Array.isArray(data.items)) {
      return data.items;
    }
  }

  if (Array.isArray(response.transactions)) {
    return response.transactions;
  }

  return [];
}

/* =========================================================
   GET /api/transactions
========================================================= */

export async function getShopTransactionsApi():
  Promise<ShopTransaction[]> {
  const response =
    await apiRequest<unknown>(
      "/api/transactions",
      {
        method: "GET",
      },
    );

  if (
    isRecord(response) &&
    response.status === "error"
  ) {
    throw new Error(
      typeof response.message === "string" &&
      response.message.trim()
        ? response.message.trim()
        : "Unable to check payment status.",
    );
  }

  return extractTransactionList(
    response,
  )
    .map(
      normalizeTransaction,
    )
    .filter(
      (
        transaction,
      ): transaction is ShopTransaction =>
        transaction !== null,
    );
}

/* =========================================================
   GET /api/transactions/{id}
========================================================= */

export async function getShopTransactionDetailApi(
  id: string | number,
): Promise<ShopTransaction | null> {
  const response =
    await apiRequest<unknown>(
      `/api/transactions/${encodeURIComponent(
        String(id),
      )}`,
      {
        method: "GET",
      },
    );

  if (
    isRecord(response) &&
    response.status === "error"
  ) {
    return null;
  }

  const raw =
    isRecord(response) &&
    isRecord(response.data)
      ? response.data
      : response;

  return normalizeTransaction(
    raw,
  );
}

/* =========================================================
   Resolve the transaction created by POST /api/shop/checkout

   The checkout response gives us order_id, while the backend status
   endpoints are GET /api/transactions and GET /api/transactions/{id}.
========================================================= */

export async function findShopTransactionByOrderIdApi(
  orderId: string,
): Promise<ShopTransaction | null> {
  const normalizedOrderId =
    orderId.trim();

  if (!normalizedOrderId) {
    return null;
  }

  const transactions =
    await getShopTransactionsApi();

  const matched =
    transactions.find(
      (transaction) =>
        transaction.order_id ===
        normalizedOrderId,
    ) ??
    null;

  if (!matched) {
    return null;
  }

  if (
    matched.id !== null
  ) {
    try {
      const detail =
        await getShopTransactionDetailApi(
          matched.id,
        );

      if (
        detail &&
        detail.order_id ===
          normalizedOrderId
      ) {
        return detail;
      }
    } catch {
      // The list result is still useful when the detail request
      // is unavailable or the backend is briefly catching up.
    }
  }

  return matched;
}

/* =========================================================
   Shop item normalization
========================================================= */

function normalizeShopItem(
  value: unknown,
): ShopItem {
  if (!isRecord(value)) {
    throw new Error(
      "The shop server returned an invalid item.",
    );
  }

  const id = toInteger(value.id);

  const name =
    typeof value.name === "string"
      ? value.name.trim()
      : "";

  const itemType =
    typeof value.item_type === "string"
      ? value.item_type.trim()
      : "";

  const description =
    typeof value.description === "string"
      ? value.description.trim()
      : "";

  const priceRupiah =
    typeof value.price_rupiah === "string"
      ? value.price_rupiah.trim()
      : String(
          value.price_rupiah ?? "",
        ).trim();

  const parsedPrice =
    toFiniteNumber(priceRupiah);

  const priceXp =
    toFiniteNumber(value.price_xp);

  const tokenReward =
    toFiniteNumber(value.token_reward);

  const durationDays =
    value.duration_days === null ||
    value.duration_days === undefined
      ? null
      : toInteger(value.duration_days);

  const stockQuantity =
    toInteger(value.stock_quantity);

  const imageUrl =
    value.image_url === null ||
    value.image_url === undefined
      ? null
      : typeof value.image_url === "string"
        ? value.image_url.trim() || null
        : null;

  const isActive =
    value.is_active === true ||
    value.is_active === 1 ||
    value.is_active === "1" ||
    value.is_active === "true";

  const createdAt =
    typeof value.created_at === "string"
      ? value.created_at.trim()
      : "";

  const updatedAt =
    typeof value.updated_at === "string"
      ? value.updated_at.trim()
      : "";

  if (
    id === null ||
    id <= 0 ||
    !name ||
    !itemType ||
    parsedPrice === null ||
    parsedPrice < 0 ||
    priceXp === null ||
    tokenReward === null ||
    stockQuantity === null
  ) {
    throw new Error(
      "The shop server returned incomplete item data.",
    );
  }

  return {
    id,
    name,
    item_type: itemType,
    description,
    price_rupiah: priceRupiah,
    price_xp: priceXp,
    token_reward: tokenReward,
    duration_days: durationDays,
    stock_quantity: stockQuantity,
    image_url: imageUrl,
    is_active: isActive,
    created_at: createdAt,
    updated_at: updatedAt,
  };
}

/* =========================================================
   GET /api/shop/items
========================================================= */

export async function getShopItemsApi():
  Promise<ShopItem[]> {
  const response =
    await apiRequest<unknown>(
      "/api/shop/items",
      {
        method: "GET",
      },
    );

  if (!isRecord(response)) {
    throw new Error(
      "The shop server returned an invalid response.",
    );
  }

  if (response.status === "error") {
    throw new Error(
      typeof response.message === "string"
        ? response.message
        : "Unable to load shop items.",
    );
  }

  if (!Array.isArray(response.data)) {
    throw new Error(
      "The shop response did not contain an item list.",
    );
  }

  return response.data.map(
    normalizeShopItem,
  );
}

/* =========================================================
   POST /api/shop/checkout

   Request:
   {
     "shop_item_id": 1
   }

   Successful response:
   {
     "status": "success",
     "message": "...",
     "data": {
       "order_id": "...",
       "snap_token": "...",
       "redirect_url": "...",
       "item": "...",
       "total": "25000.00"
     }
   }
========================================================= */

export async function checkoutShopItemApi(
  payload: ShopCheckoutPayload,
): Promise<ShopCheckoutResponse> {
  if (
    !Number.isInteger(payload.shop_item_id) ||
    payload.shop_item_id <= 0
  ) {
    throw new Error(
      "A valid shop item is required for checkout.",
    );
  }

  const response =
    await apiRequest<unknown>(
      "/api/shop/checkout",
      {
        method: "POST",
        body: JSON.stringify({
          shop_item_id:
            payload.shop_item_id,
        }),
      },
    );

  if (!isRecord(response)) {
    throw new Error(
      "The checkout server returned an invalid response.",
    );
  }

  if (response.status === "error") {
    throw new Error(
      typeof response.message === "string" &&
      response.message.trim()
        ? response.message.trim()
        : "Unable to create checkout.",
    );
  }

  if (response.status !== "success") {
    throw new Error(
      typeof response.message === "string" &&
      response.message.trim()
        ? response.message.trim()
        : "Checkout was not created successfully.",
    );
  }

  if (!isRecord(response.data)) {
    throw new Error(
      "The checkout server did not return payment data.",
    );
  }

  const data = response.data;

  const orderId =
    requiredString(
      data.order_id,
      "order_id",
    );

  const snapToken =
    requiredString(
      data.snap_token,
      "snap_token",
    );

  const redirectUrl =
    normalizeRedirectUrl(
      data.redirect_url,
    );

  const item =
    requiredString(
      data.item,
      "item",
    );

  const total =
    typeof data.total === "string"
      ? data.total.trim()
      : typeof data.total === "number" &&
          Number.isFinite(data.total)
        ? String(data.total)
        : "";

  if (!total) {
    throw new Error(
      "The checkout server did not return a valid total.",
    );
  }

  return {
    status: "success",
    message:
      typeof response.message === "string" &&
      response.message.trim()
        ? response.message.trim()
        : "Checkout created successfully.",
    data: {
      order_id: orderId,
      snap_token: snapToken,
      redirect_url: redirectUrl,
      item,
      total,
    },
  };
}