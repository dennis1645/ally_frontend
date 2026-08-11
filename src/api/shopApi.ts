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
  id:
    number;

  name:
    string;

  item_type:
    ShopItemType;

  description:
    string;

  price_rupiah:
    string;

  price_xp:
    number;

  token_reward:
    number;

  duration_days:
    number | null;

  stock_quantity:
    number;

  image_url:
    string | null;

  is_active:
    boolean;

  created_at:
    string;

  updated_at:
    string;
};

export type ShopItemsResponse = {
  status:
    string;

  data:
    ShopItem[];
};

export type ShopCheckoutPayload = {
  shop_item_id:
    number;
};

export type ShopCheckoutResponse = {
  status?:
    string;

  message?:
    string;

  data?:
    unknown;

  [key: string]:
    unknown;
};

/* =========================================================
   Validation helpers
========================================================= */

function isRecord(
  value:
    unknown,
): value is Record<string, unknown> {
  return (
    typeof value ===
      "object" &&
    value !==
      null &&
    !Array.isArray(
      value,
    )
  );
}

function toFiniteNumber(
  value:
    unknown,
): number | null {
  if (
    typeof value ===
      "number" &&
    Number.isFinite(
      value,
    )
  ) {
    return value;
  }

  if (
    typeof value ===
      "string" &&
    value.trim() !==
      ""
  ) {
    const parsed =
      Number(
        value,
      );

    if (
      Number.isFinite(
        parsed,
      )
    ) {
      return parsed;
    }
  }

  return null;
}

function toInteger(
  value:
    unknown,
): number | null {
  const parsed =
    toFiniteNumber(
      value,
    );

  if (
    parsed ===
      null ||
    !Number.isInteger(
      parsed,
    )
  ) {
    return null;
  }

  return parsed;
}

function normalizeShopItem(
  value:
    unknown,
): ShopItem {
  if (
    !isRecord(
      value,
    )
  ) {
    throw new Error(
      "The shop server returned an invalid item.",
    );
  }

  const id =
    toInteger(
      value.id,
    );

  const name =
    typeof value.name ===
      "string"
      ? value.name.trim()
      : "";

  const itemType =
    typeof value.item_type ===
      "string"
      ? value.item_type.trim()
      : "";

  const description =
    typeof value.description ===
      "string"
      ? value.description.trim()
      : "";

  const priceRupiah =
    typeof value.price_rupiah ===
      "string"
      ? value.price_rupiah.trim()
      : String(
          value.price_rupiah ??
            "",
        ).trim();

  const parsedPrice =
    toFiniteNumber(
      priceRupiah,
    );

  const priceXp =
    toFiniteNumber(
      value.price_xp,
    );

  const tokenReward =
    toFiniteNumber(
      value.token_reward,
    );

  const durationDays =
    value.duration_days ===
      null
      ? null
      : toInteger(
          value.duration_days,
        );

  const stockQuantity =
    toInteger(
      value.stock_quantity,
    );

  const imageUrl =
    value.image_url ===
      null
      ? null
      : typeof value.image_url ===
          "string"
        ? value.image_url.trim() ||
          null
        : null;

  const isActive =
    value.is_active ===
      true ||
    value.is_active ===
      1 ||
    value.is_active ===
      "1";

  const createdAt =
    typeof value.created_at ===
      "string"
      ? value.created_at.trim()
      : "";

  const updatedAt =
    typeof value.updated_at ===
      "string"
      ? value.updated_at.trim()
      : "";

  if (
    id ===
      null ||
    id <=
      0 ||
    !name ||
    !itemType ||
    parsedPrice ===
      null ||
    parsedPrice <
      0 ||
    priceXp ===
      null ||
    tokenReward ===
      null ||
    stockQuantity ===
      null
  ) {
    throw new Error(
      "The shop server returned incomplete item data.",
    );
  }

  return {
    id,

    name,

    item_type:
      itemType,

    description,

    price_rupiah:
      priceRupiah,

    price_xp:
      priceXp,

    token_reward:
      tokenReward,

    duration_days:
      durationDays,

    stock_quantity:
      stockQuantity,

    image_url:
      imageUrl,

    is_active:
      isActive,

    created_at:
      createdAt,

    updated_at:
      updatedAt,
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
        method:
          "GET",
      },
    );

  if (
    !isRecord(
      response,
    )
  ) {
    throw new Error(
      "The shop server returned an invalid response.",
    );
  }

  if (
    response.status ===
      "error"
  ) {
    throw new Error(
      typeof response.message ===
        "string"
        ? response.message
        : "Unable to load shop items.",
    );
  }

  if (
    !Array.isArray(
      response.data,
    )
  ) {
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
========================================================= */

export async function checkoutShopItemApi(
  payload:
    ShopCheckoutPayload,
): Promise<ShopCheckoutResponse> {
  if (
    !Number.isInteger(
      payload.shop_item_id,
    ) ||
    payload.shop_item_id <=
      0
  ) {
    throw new Error(
      "A valid shop item is required for checkout.",
    );
  }

  const response =
    await apiRequest<unknown>(
      "/api/shop/checkout",
      {
        method:
          "POST",

        body:
          JSON.stringify({
            shop_item_id:
              payload.shop_item_id,
          }),
      },
    );

  if (
    !isRecord(
      response,
    )
  ) {
    throw new Error(
      "The checkout server returned an invalid response.",
    );
  }

  if (
    response.status ===
      "error"
  ) {
    throw new Error(
      typeof response.message ===
        "string"
        ? response.message
        : "Unable to create checkout.",
    );
  }

  return response as
    ShopCheckoutResponse;
}