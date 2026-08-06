import {
  useCallback,
} from "react";

import {
  DIAGNOSTIC_GUEST_TOKEN_STORAGE_KEY,
} from "../utils/constants";

function generateGuestToken(): string {
  if (
    typeof globalThis.crypto
      ?.randomUUID !== "function"
  ) {
    throw new Error(
      "Secure guest-token generation is not supported by this browser.",
    );
  }

  return `guest_${globalThis.crypto.randomUUID()}`;
}

export function useDiagnosticGuestToken() {
  const getGuestToken =
    useCallback((): string | null => {
      if (
        typeof window ===
        "undefined"
      ) {
        return null;
      }

      return window.localStorage.getItem(
        DIAGNOSTIC_GUEST_TOKEN_STORAGE_KEY,
      );
    }, []);

  const createNewGuestToken =
    useCallback((): string => {
      const token =
        generateGuestToken();

      window.localStorage.setItem(
        DIAGNOSTIC_GUEST_TOKEN_STORAGE_KEY,
        token,
      );

      return token;
    }, []);

  const getOrCreateGuestToken =
    useCallback((): string => {
      const existingToken =
        window.localStorage.getItem(
          DIAGNOSTIC_GUEST_TOKEN_STORAGE_KEY,
        );

      if (existingToken) {
        return existingToken;
      }

      const token =
        generateGuestToken();

      window.localStorage.setItem(
        DIAGNOSTIC_GUEST_TOKEN_STORAGE_KEY,
        token,
      );

      return token;
    }, []);

  const clearGuestToken =
    useCallback((): void => {
      window.localStorage.removeItem(
        DIAGNOSTIC_GUEST_TOKEN_STORAGE_KEY,
      );
    }, []);

  return {
    getGuestToken,
    createNewGuestToken,
    getOrCreateGuestToken,
    clearGuestToken,
  };
}