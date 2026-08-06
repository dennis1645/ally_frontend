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
  createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [status, setStatus] =
    useState<AuthStatus>("loading");

  const refreshProfile =
    useCallback(async (): Promise<AuthUser> => {
      const profile = await getProfileApi();

      setUser(profile);
      setStatus("authenticated");

      return profile;
    }, []);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession(): Promise<void> {
      const token = getAccessToken();

      if (!token) {
        if (!cancelled) {
          setUser(null);
          setStatus("guest");
        }

        return;
      }

      try {
        const profile = await getProfileApi();

        if (!cancelled) {
          setUser(profile);
          setStatus("authenticated");
        }
      } catch {
        clearAccessToken();

        if (!cancelled) {
          setUser(null);
          setStatus("guest");
        }
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (
      payload: LoginPayload,
      rememberMe: boolean,
    ): Promise<AuthUser> => {
      const session = await loginApi(
        payload,
        rememberMe,
      );

      setUser(session.user);
      setStatus("authenticated");

      return session.user;
    },
    [],
  );

  const register = useCallback(
    async (
      payload: RegisterPayload,
    ): Promise<AuthUser> => {
      const session = await registerApi(payload);

      setUser(session.user);
      setStatus("authenticated");

      return session.user;
    },
    [],
  );

  const logout = useCallback(
    async (): Promise<void> => {
      try {
        await logoutApi();
      } finally {
        setUser(null);
        setStatus("guest");
      }
    },
    [],
  );

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isAuthenticated:
        status === "authenticated",
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
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider.",
    );
  }

  return context;
}