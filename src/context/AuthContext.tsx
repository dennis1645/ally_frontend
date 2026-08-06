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

type AuthStatus =
  | "loading"
  | "authenticated"
  | "guest";

type AuthContextValue = {
  user: AuthUser | null;

  status: AuthStatus;

  isAuthenticated: boolean;

  login: (
    payload: LoginPayload,
    rememberMe: boolean,
  ) => Promise<AuthUser>;

  register: (
    payload: RegisterPayload,
  ) => Promise<AuthUser>;

  logout: () => Promise<void>;

  refreshProfile: () => Promise<AuthUser>;
};

const AuthContext =
  createContext<AuthContextValue | null>(
    null,
  );

type AuthProviderProps = {
  children: ReactNode;
};

function getStoredDiagnosticGuestToken():
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

function removeStoredDiagnosticGuestToken():
  void {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.removeItem(
    DIAGNOSTIC_GUEST_TOKEN_STORAGE_KEY,
  );
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [
    user,
    setUser,
  ] =
    useState<AuthUser | null>(
      null,
    );

  const [
    status,
    setStatus,
  ] =
    useState<AuthStatus>(
      "loading",
    );

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

  useEffect(() => {
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
  }, []);

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

        setUser(
          session.user,
        );

        setStatus(
          "authenticated",
        );

        return session.user;
      },
      [],
    );

  const register =
    useCallback(
      async (
        payload:
          RegisterPayload,
      ): Promise<AuthUser> => {
        /*
         * Retrieve the token created for the anonymous
         * diagnostic assessment.
         */
        const guestToken =
          getStoredDiagnosticGuestToken();

        /*
         * Include guest_token in POST /api/register.
         *
         * When no assessment was completed, the property
         * is omitted from the request.
         */
        const registrationPayload:
          RegisterPayload = {
          ...payload,

          ...(guestToken
            ? {
                guest_token:
                  guestToken,
              }
            : {}),
        };

        /*
         * registerApi must send registrationPayload directly
         * to POST /api/register.
         *
         * It must also save the returned access token before
         * this promise resolves.
         */
        const session =
          await registerApi(
            registrationPayload,
          );

        /*
         * Registration succeeded. The backend should now
         * have linked the anonymous diagnostic result to the
         * newly created user.
         */
        if (
          guestToken
        ) {
          removeStoredDiagnosticGuestToken();
        }

        /*
         * Use the user returned during registration as a
         * fallback.
         */
        let authenticatedUser =
          session.user;

        /*
         * Reload the profile so readiness_score reflects
         * the result linked during registration.
         *
         * This requires registerApi to save the access token
         * before returning.
         */
        try {
          authenticatedUser =
            await getProfileApi();
        } catch (
          profileError
        ) {
          /*
           * Registration was still successful. Retain the
           * registration response when profile refreshing
           * temporarily fails.
           */
          if (
            import.meta.env.DEV
          ) {
            console.warn(
              "[Auth] Account created, but the profile could not be refreshed.",
              profileError,
            );
          }
        }

        setUser(
          authenticatedUser,
        );

        setStatus(
          "authenticated",
        );

        return authenticatedUser;
      },
      [],
    );

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