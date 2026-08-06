import {
  apiRequest,
  clearAccessToken,
  storeAuthToken,
} from "./apiClient";

import type {
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from "../types/auth";

/* =========================================================
   Response types
========================================================= */

type AuthSessionPayload = {
  access_token?: string;
  token_type?: string;
  user?: AuthUser;
};

type AuthSessionResponse = {
  status?: string;
  message?: string;

  access_token?: string;
  token_type?: string;
  user?: AuthUser;

  data?: AuthSessionPayload;
};

type ProfileResponse = {
  status?: string;
  message?: string;

  user?: AuthUser;
  data?: AuthUser;
};

export type AuthSession = {
  accessToken: string;
  tokenType: string;
  user: AuthUser;
};

/* =========================================================
   Runtime helpers
========================================================= */

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

function isAuthUser(
  value: unknown,
): value is AuthUser {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "number" &&
    typeof value.name === "string" &&
    typeof value.email === "string" &&
    typeof value.role === "string"
  );
}

/**
 * Supports either:
 *
 * {
 *   access_token,
 *   token_type,
 *   user
 * }
 *
 * or:
 *
 * {
 *   data: {
 *     access_token,
 *     token_type,
 *     user
 *   }
 * }
 */
function extractAuthSession(
  response: AuthSessionResponse,
): AuthSession {
  const payload =
    response.data ?? response;

  const accessToken =
    payload.access_token?.trim();

  const tokenType =
    payload.token_type?.trim() ||
    "Bearer";

  const user =
    payload.user;

  if (!accessToken) {
    throw new Error(
      "The authentication response did not contain an access_token.",
    );
  }

  if (!isAuthUser(user)) {
    throw new Error(
      "The authentication response did not contain valid user data.",
    );
  }

  return {
    accessToken,
    tokenType,
    user,
  };
}

function extractProfile(
  response:
    | ProfileResponse
    | AuthUser,
): AuthUser {
  if (isAuthUser(response)) {
    return response;
  }

  if (
    isAuthUser(
      response.data,
    )
  ) {
    return response.data;
  }

  if (
    isAuthUser(
      response.user,
    )
  ) {
    return response.user;
  }

  throw new Error(
    "The profile response did not contain valid user data.",
  );
}

/* =========================================================
   Login
========================================================= */

export async function loginApi(
  payload: LoginPayload,
  rememberMe: boolean,
): Promise<AuthSession> {
  const response =
    await apiRequest<AuthSessionResponse>(
      "/api/login",
      {
        method: "POST",

        /**
         * Login happens before an access token exists.
         */
        authenticated: false,

        body: JSON.stringify({
          email:
            payload.email.trim(),

          password:
            payload.password,
        }),
      },
    );

  const session =
    extractAuthSession(
      response,
    );

  storeAuthToken(
    session.accessToken,
    session.tokenType,
    rememberMe,
  );

  return session;
}

/* =========================================================
   Registration
========================================================= */

export async function registerApi(
  payload: RegisterPayload,
): Promise<AuthSession> {
  const response =
    await apiRequest<AuthSessionResponse>(
      "/api/register",
      {
        method: "POST",

        /**
         * Registration also occurs before authentication.
         */
        authenticated: false,

        body: JSON.stringify({
          name:
            payload.name.trim(),

          email:
            payload.email.trim(),

          phone_number:
            payload.phone_number.trim(),

          password:
            payload.password,

          password_confirmation:
            payload.password_confirmation,
        }),
      },
    );

  const session =
    extractAuthSession(
      response,
    );

  /**
   * Your AuthContext register() does not currently
   * accept rememberMe, so registration uses
   * sessionStorage by default.
   */
  storeAuthToken(
    session.accessToken,
    session.tokenType,
    false,
  );

  return session;
}

/* =========================================================
   Current profile
========================================================= */

export async function getProfileApi(): Promise<AuthUser> {
  const response =
    await apiRequest<
      ProfileResponse | AuthUser
    >(
      "/api/profile",
      {
        method: "GET",

        /**
         * authenticated defaults to true.
         * apiRequest automatically attaches the token.
         */
      },
    );

  return extractProfile(
    response,
  );
}

/* =========================================================
   Logout
========================================================= */

export async function logoutApi(): Promise<void> {
  try {
    await apiRequest<unknown>(
      "/api/logout",
      {
        method: "POST",
      },
    );
  } finally {
    /**
     * Always clear browser authentication, including
     * when the logout endpoint itself fails.
     */
    clearAccessToken();
  }
}

/* =========================================================
   Forgot password
========================================================= */

export type ForgotPasswordPayload = {
  email: string;
};

export type ForgotPasswordResponse = {
  status?: string;
  message?: string;
  data?: unknown;
};

export async function forgotPasswordApi(
  payload: ForgotPasswordPayload,
): Promise<ForgotPasswordResponse> {
  const email =
    payload.email.trim();

  if (!email) {
    throw new Error(
      "Email address is required.",
    );
  }

  return apiRequest<ForgotPasswordResponse>(
    "/api/forgot-password",
    {
      method: "POST",

      /*
       * The user is not authenticated during
       * the forgot-password process.
       */
      authenticated: false,

      body: JSON.stringify({
        email,
      }),
    },
  );
}

/* =========================================================
   Reset password
========================================================= */

export type ResetPasswordPayload = {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
};

export type ResetPasswordResponse = {
  status?: string;
  message?: string;
  data?: unknown;
};

export async function resetPasswordApi(
  payload: ResetPasswordPayload,
): Promise<ResetPasswordResponse> {
  const email =
    payload.email.trim();

  const token =
    payload.token.trim();

  if (!email) {
    throw new Error(
      "Email address is required.",
    );
  }

  if (!token) {
    throw new Error(
      "Password reset token is required.",
    );
  }

  if (!payload.password) {
    throw new Error(
      "A new password is required.",
    );
  }

  if (
    payload.password !==
    payload.password_confirmation
  ) {
    throw new Error(
      "Password confirmation does not match.",
    );
  }

  return apiRequest<ResetPasswordResponse>(
    "/api/reset-password",
    {
      method: "POST",

      /*
       * Reset-password is also a public request.
       */
      authenticated: false,

      body: JSON.stringify({
        email,
        token,
        password:
          payload.password,

        password_confirmation:
          payload.password_confirmation,
      }),
    },
  );
}