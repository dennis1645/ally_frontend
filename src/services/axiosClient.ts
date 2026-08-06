import axios from "axios";

import type {
  InternalAxiosRequestConfig,
} from "axios";

/* =========================================================
   Environment configuration
========================================================= */

const rawApiBaseUrl =
  import.meta.env
    .VITE_API_BASE_URL as
    | string
    | undefined;

if (!rawApiBaseUrl) {
  throw new Error(
    "VITE_API_BASE_URL is missing. Add it to the project-root .env file.",
  );
}

const API_BASE_URL =
  rawApiBaseUrl.replace(
    /\/+$/,
    "",
  );

/* =========================================================
   Authentication storage
========================================================= */

const ACCESS_TOKEN_KEY =
  "ally_access_token";

const TOKEN_TYPE_KEY =
  "ally_token_type";

function getBrowserStorage():
  | Storage
  | null {
  if (
    typeof window ===
    "undefined"
  ) {
    return null;
  }

  const localToken =
    window.localStorage.getItem(
      ACCESS_TOKEN_KEY,
    );

  if (localToken) {
    return window.localStorage;
  }

  const sessionToken =
    window.sessionStorage.getItem(
      ACCESS_TOKEN_KEY,
    );

  if (sessionToken) {
    return window.sessionStorage;
  }

  return null;
}

function getAccessToken():
  | string
  | null {
  const storage =
    getBrowserStorage();

  return (
    storage?.getItem(
      ACCESS_TOKEN_KEY,
    ) ?? null
  );
}

function getTokenType(): string {
  const storage =
    getBrowserStorage();

  return (
    storage
      ?.getItem(
        TOKEN_TYPE_KEY,
      )
      ?.trim() ||
    "Bearer"
  );
}

/* =========================================================
   Axios instance
========================================================= */

export const axiosClient =
  axios.create({
    baseURL:
      API_BASE_URL,

    timeout:
      15_000,

    headers: {
      Accept:
        "application/json",
    },
  });

/* =========================================================
   Authentication interceptor
========================================================= */

axiosClient.interceptors.request.use(
  (
    config:
      InternalAxiosRequestConfig,
  ) => {
    const accessToken =
      getAccessToken();

    if (!accessToken) {
      return config;
    }

    const tokenType =
      getTokenType();

    config.headers.set(
      "Authorization",
      `${tokenType} ${accessToken}`,
    );

    return config;
  },
  (error: unknown) =>
    Promise.reject(error),
);