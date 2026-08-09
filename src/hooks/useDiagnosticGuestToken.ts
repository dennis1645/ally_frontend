import {
  useCallback,
} from "react";

import {
  DIAGNOSTIC_GUEST_TOKEN_STORAGE_KEY,
} from "../utils/constants";

function generateGuestToken():
  string {
  if (
    typeof crypto !==
      "undefined" &&
    typeof crypto.randomUUID ===
      "function"
  ) {
    return `guest_${crypto.randomUUID()}`;
  }

  const randomValues =
    new Uint32Array(4);

  crypto.getRandomValues(
    randomValues,
  );

  return [
    "guest",
    Date.now().toString(36),
    ...Array.from(
      randomValues,
    ).map(
      (value) =>
        value.toString(36),
    ),
  ].join("_");
}

export function useDiagnosticGuestToken() {
  const getGuestToken =
    useCallback(
      (): string | null => {
        const token =
          window.localStorage.getItem(
            DIAGNOSTIC_GUEST_TOKEN_STORAGE_KEY,
          );

        return token?.trim() ||
          null;
      },
      [],
    );

  const createNewGuestToken =
    useCallback(
      (): string => {
        const token =
          generateGuestToken();

        window.localStorage.setItem(
          DIAGNOSTIC_GUEST_TOKEN_STORAGE_KEY,
          token,
        );

        return token;
      },
      [],
    );

  const getOrCreateGuestToken =
    useCallback(
      (): string => {
        return (
          getGuestToken() ??
          createNewGuestToken()
        );
      },
      [
        createNewGuestToken,
        getGuestToken,
      ],
    );

  const clearGuestToken =
    useCallback(
      (): void => {
        window.localStorage.removeItem(
          DIAGNOSTIC_GUEST_TOKEN_STORAGE_KEY,
        );
      },
      [],
    );

  return {
    getGuestToken,
    createNewGuestToken,
    getOrCreateGuestToken,
    clearGuestToken,
  };
}