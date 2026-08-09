import {
  axiosClient,
} from "./axiosClient";

import {
  DIAGNOSTIC_GUEST_TOKEN_STORAGE_KEY,
} from "../utils/constants";

/* =========================================================
   Authentication storage
========================================================= */

const ACCESS_TOKEN_KEY =
  "ally_access_token";

const TOKEN_TYPE_KEY =
  "ally_token_type";

/* =========================================================
   Registration types
========================================================= */

export type RegisterFormData = {
  name: string;

  email: string;

  phone_number: string;

  password: string;

  password_confirmation: string;
};

export type RegisterRequestPayload = {
  name: string;

  email: string;

  phone_number: string;

  password: string;

  password_confirmation: string;

  guest_token:
    string | null;
};

export type RegisteredUser = {
  id: number;

  name: string;

  email: string;

  phone_number:
    string | null;

  role: string;

  readiness_score:
    number | null;
};

export type RegisterResponse = {
  status:
    "success" | "error";

  message?: string;

  data?: {
    user?:
      RegisteredUser;

    access_token?:
      string;

    token?:
      string;

    token_type?:
      string;
  };
};

/* =========================================================
   Browser storage helpers
========================================================= */

function getStoredGuestToken():
  string | null {
  if (
    typeof window ===
    "undefined"
  ) {
    return null;
  }

  const storedToken =
    window.localStorage.getItem(
      DIAGNOSTIC_GUEST_TOKEN_STORAGE_KEY,
    );

  return storedToken?.trim() ||
    null;
}

function saveAuthenticationToken(
  accessToken: string,
  tokenType = "Bearer",
): void {
  window.localStorage.setItem(
    ACCESS_TOKEN_KEY,
    accessToken,
  );

  window.localStorage.setItem(
    TOKEN_TYPE_KEY,
    tokenType,
  );
}

function removeGuestToken():
  void {
  window.localStorage.removeItem(
    DIAGNOSTIC_GUEST_TOKEN_STORAGE_KEY,
  );
}

/* =========================================================
   Register
========================================================= */

export async function registerUser(
  formData:
    RegisterFormData,
): Promise<RegisterResponse> {
  /*
   * Retrieve the token generated before the anonymous
   * assessment started.
   */
  const guestToken =
    getStoredGuestToken();

  const payload:
    RegisterRequestPayload = {
    name:
      formData.name.trim(),

    email:
      formData.email.trim(),

    phone_number:
      formData.phone_number.trim(),

    password:
      formData.password,

    password_confirmation:
      formData.password_confirmation,

    guest_token:
      guestToken,
  };

  const response =
    await axiosClient.post<
      RegisterResponse
    >(
      "/api/register",
      payload,
      {
        headers: {
          "Content-Type":
            "application/json",
        },
      },
    );

  const responseData =
    response.data;

  if (
    responseData.status !==
      "success"
  ) {
    throw new Error(
      responseData.message ??
        "Unable to create your account.",
    );
  }

  /*
   * Depending on the backend response, the access token
   * may be called access_token or token.
   */
  const accessToken =
    responseData.data
      ?.access_token ??
    responseData.data
      ?.token;

  const tokenType =
    responseData.data
      ?.token_type ??
    "Bearer";

  if (
    accessToken
  ) {
    saveAuthenticationToken(
      accessToken,
      tokenType,
    );
  }

  /*
   * Only remove the guest token after registration has
   * succeeded. At this point, the backend should have:
   *
   * 1. Created the user
   * 2. Linked the diagnostic result to user_id
   * 3. Updated the user's readiness_score
   */
  if (
    guestToken
  ) {
    removeGuestToken();
  }

  return responseData;
}