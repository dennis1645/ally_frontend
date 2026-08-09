import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  getProfileApi,
  loginApi,
  logoutApi,
  registerApi,
} from "../api/authApi";

import {
  clearAccessToken,
  getAccessToken,
} from "../api/apiClient";

import {
  DIAGNOSTIC_GUEST_TOKEN_STORAGE_KEY,
} from "../utils/constants";

import type {
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from "../types/auth";

/* =========================================================
   Auth status
========================================================= */

type AuthStatus =
  | "loading"
  | "authenticated"
  | "guest";

/* =========================================================
   Auth context type
========================================================= */

type AuthContextValue = {
  user:
    AuthUser | null;

  status:
    AuthStatus;

  isAuthenticated:
    boolean;

  login: (
    payload:
      LoginPayload,
    rememberMe:
      boolean,
  ) => Promise<AuthUser>;

  register: (
    payload:
      RegisterPayload,
  ) => Promise<AuthUser>;

  logout:
    () => Promise<void>;

  refreshProfile:
    () => Promise<AuthUser>;
};

/* =========================================================
   Context
========================================================= */

const AuthContext =
  createContext<
    AuthContextValue | null
  >(
    null,
  );

type AuthProviderProps = {
  children:
    ReactNode;
};

/* =========================================================
   Diagnostic guest-token helpers
========================================================= */

function getStoredDiagnosticGuestToken():
  string | null {
  try {
    const storedToken =
      window.localStorage.getItem(
        DIAGNOSTIC_GUEST_TOKEN_STORAGE_KEY,
      );

    const normalizedToken =
      storedToken?.trim() ??
      "";

    return normalizedToken ||
      null;
  } catch {
    return null;
  }
}

function clearStoredDiagnosticGuestToken():
  void {
  try {
    window.localStorage.removeItem(
      DIAGNOSTIC_GUEST_TOKEN_STORAGE_KEY,
    );
  } catch {
    /*
     * Storage cleanup is non-critical.
     */
  }
}

/* =========================================================
   Provider
========================================================= */

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [
    user,
    setUser,
  ] =
    useState<
      AuthUser | null
    >(
      null,
    );

  const [
    status,
    setStatus,
  ] =
    useState<AuthStatus>(
      "loading",
    );

  /* =======================================================
     Refresh profile
  ======================================================= */

  const refreshProfile =
    useCallback(
      async (): Promise<AuthUser> => {
        const profile =
          await getProfileApi();

        setUser(
          profile,
        );

        setStatus(
          "authenticated",
        );

        return profile;
      },
      [],
    );

  /* =======================================================
     Restore existing session
  ======================================================= */

  useEffect(
    () => {
      let cancelled =
        false;

      async function restoreSession():
        Promise<void> {
        const token =
          getAccessToken();

        if (
          !token
        ) {
          if (
            !cancelled
          ) {
            setUser(
              null,
            );

            setStatus(
              "guest",
            );
          }

          return;
        }

        try {
          const profile =
            await getProfileApi();

          if (
            !cancelled
          ) {
            setUser(
              profile,
            );

            setStatus(
              "authenticated",
            );
          }
        } catch {
          clearAccessToken();

          if (
            !cancelled
          ) {
            setUser(
              null,
            );

            setStatus(
              "guest",
            );
          }
        }
      }

      void restoreSession();

      return () => {
        cancelled =
          true;
      };
    },
    [],
  );

  /* =======================================================
     Login
  ======================================================= */

  const login =
    useCallback(
      async (
        payload:
          LoginPayload,

        rememberMe:
          boolean,
      ): Promise<AuthUser> => {
        const session =
          await loginApi(
            payload,
            rememberMe,
          );

        /*
         * loginApi already stores the access token.
         *
         * Fetch the profile separately so AuthContext always
         * uses the canonical /api/profile representation.
         */
        try {
          const profile =
            await getProfileApi();

          setUser(
            profile,
          );

          setStatus(
            "authenticated",
          );

          return profile;
        } catch {
          /*
           * Fall back to the user returned by /api/login
           * if profile loading temporarily fails.
           */
          setUser(
            session.user,
          );

          setStatus(
            "authenticated",
          );

          return session.user;
        }
      },
      [],
    );

  /* =======================================================
     Registration
  ======================================================= */

  const register =
    useCallback(
      async (
        payload:
          RegisterPayload,
      ): Promise<AuthUser> => {
        /*
         * IMPORTANT:
         *
         * The registration form itself does not need to know
         * about diagnostic guest-token storage.
         *
         * AuthContext owns the bridge between the anonymous
         * assessment and authenticated account.
         */
        const storedGuestToken =
          getStoredDiagnosticGuestToken();

        /*
         * Prefer an explicitly supplied guest_token, but fall
         * back to the token stored during the anonymous
         * diagnostic assessment.
         */
        const guestToken =
          payload.guest_token
            ?.trim() ||
          storedGuestToken;

        const registrationPayload:
          RegisterPayload = {
          ...payload,

          /*
           * Only include guest_token when one really exists.
           */
          ...(guestToken
            ? {
                guest_token:
                  guestToken,
              }
            : {}),
        };

        if (
          import.meta.env.DEV
        ) {
          console.info(
            "[Auth] Registering user:",
            {
              email:
                registrationPayload
                  .email,

              has_guest_token:
                Boolean(
                  guestToken,
                ),

              guest_token:
                guestToken,
            },
          );
        }

        /*
         * POST /api/register
         *
         * authApi.ts sends:
         *
         * {
         *   name,
         *   email,
         *   phone_number,
         *   password,
         *   password_confirmation,
         *   guest_token
         * }
         */
        const session =
          await registerApi(
            registrationPayload,
          );

        /*
         * registerApi() stores the access token before
         * returning, therefore /api/profile is now
         * authenticated.
         *
         * Do NOT rely only on session.user here because the
         * backend may link the diagnostic after creating the
         * account.
         *
         * Fetch the profile again immediately.
         */
        let profile:
          AuthUser;

        try {
          profile =
            await getProfileApi();
        } catch (
          profileError:
            unknown
        ) {
          /*
           * Registration itself succeeded, so preserve the
           * authenticated user even if the profile refresh
           * temporarily fails.
           */
          if (
            import.meta.env.DEV
          ) {
            console.error(
              "[Auth] Registration succeeded but profile refresh failed:",
              profileError,
            );
          }

          profile =
            session.user;
        }

        setUser(
          profile,
        );

        setStatus(
          "authenticated",
        );

        /*
         * IMPORTANT:
         *
         * Only delete the anonymous guest token when we have
         * evidence that the diagnostic result was actually
         * attached to the account.
         *
         * While debugging the backend linking process,
         * preserving it is safer than deleting it
         * immediately after registration.
         */
        const diagnosticWasLinked =
          typeof profile.readiness_score ===
            "number";

        if (
          diagnosticWasLinked
        ) {
          clearStoredDiagnosticGuestToken();

          if (
            import.meta.env.DEV
          ) {
            console.info(
              "[Auth] Diagnostic linked successfully. Guest token cleared.",
            );
          }
        } else if (
          guestToken &&
          import.meta.env.DEV
        ) {
          console.warn(
            "[Auth] Registration included a guest token, but /api/profile still returned no readiness_score.",
            {
              guest_token:
                guestToken,

              readiness_score:
                profile.readiness_score,
            },
          );
        }

        return profile;
      },
      [],
    );

  /* =======================================================
     Logout
  ======================================================= */

  const logout =
    useCallback(
      async (): Promise<void> => {
        try {
          await logoutApi();
        } finally {
          setUser(
            null,
          );

          setStatus(
            "guest",
          );
        }
      },
      [],
    );

  /* =======================================================
     Context value
  ======================================================= */

  const contextValue =
    useMemo<AuthContextValue>(
      () => ({
        user,

        status,

        isAuthenticated:
          status ===
          "authenticated",

        login,

        register,

        logout,

        refreshProfile,
      }),
      [
        user,
        status,
        login,
        register,
        logout,
        refreshProfile,
      ],
    );

  return (
    <AuthContext.Provider
      value={
        contextValue
      }
    >
      {children}
    </AuthContext.Provider>
  );
}

/* =========================================================
   Hook
========================================================= */

export function useAuth():
  AuthContextValue {
  const context =
    useContext(
      AuthContext,
    );

  if (
    !context
  ) {
    throw new Error(
      "useAuth must be used inside AuthProvider.",
    );
  }

  return context;
}