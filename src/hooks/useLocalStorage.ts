import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  Dispatch,
  SetStateAction,
} from "react";

export type LocalStorageOptions<T> = {
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
  onError?: (error: unknown) => void;
};

export type UseLocalStorageReturn<T> = {
  value: T;
  setValue: Dispatch<SetStateAction<T>>;
  removeValue: () => void;
};

function resolveInitialValue<T>(
  initialValue: T | (() => T),
): T {
  return typeof initialValue === "function"
    ? (initialValue as () => T)()
    : initialValue;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T),
  options: LocalStorageOptions<T> = {},
): UseLocalStorageReturn<T> {
  const initialValueRef = useRef<T>(
    resolveInitialValue(initialValue),
  );

  const serialize =
    options.serialize ??
    ((value: T): string =>
      JSON.stringify(value));

  const deserialize =
    options.deserialize ??
    ((value: string): T =>
      JSON.parse(value) as T);

  const onErrorRef = useRef<
    ((error: unknown) => void) | undefined
  >(options.onError);

  useEffect(() => {
    onErrorRef.current =
      options.onError;
  }, [options.onError]);

  const readStoredValue =
    useCallback((): T => {
      if (
        typeof window ===
        "undefined"
      ) {
        return initialValueRef.current;
      }

      try {
        const storedValue =
          window.localStorage.getItem(
            key,
          );

        if (
          storedValue === null
        ) {
          return initialValueRef.current;
        }

        return deserialize(
          storedValue,
        );
      } catch (error: unknown) {
        onErrorRef.current?.(
          error,
        );

        return initialValueRef.current;
      }
    }, [
      key,
      deserialize,
    ]);

  const [
    storedValue,
    setStoredValue,
  ] = useState<T>(
    readStoredValue,
  );

  const setValue =
    useCallback<
      Dispatch<SetStateAction<T>>
    >(
      (
        valueOrUpdater,
      ): void => {
        setStoredValue(
          (
            currentValue,
          ): T => {
            const nextValue =
              typeof valueOrUpdater ===
              "function"
                ? (
                    valueOrUpdater as (
                      previousValue: T,
                    ) => T
                  )(
                    currentValue,
                  )
                : valueOrUpdater;

            try {
              window.localStorage.setItem(
                key,
                serialize(
                  nextValue,
                ),
              );
            } catch (error: unknown) {
              onErrorRef.current?.(
                error,
              );
            }

            return nextValue;
          },
        );
      },
      [
        key,
        serialize,
      ],
    );

  const removeValue =
    useCallback((): void => {
      try {
        window.localStorage.removeItem(
          key,
        );
      } catch (error: unknown) {
        onErrorRef.current?.(
          error,
        );
      }

      setStoredValue(
        initialValueRef.current,
      );
    }, [key]);

  useEffect(() => {
    function handleStorageChange(
      event: StorageEvent,
    ): void {
      if (
        event.storageArea !==
          window.localStorage ||
        event.key !== key
      ) {
        return;
      }

      setStoredValue(
        readStoredValue(),
      );
    }

    window.addEventListener(
      "storage",
      handleStorageChange,
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange,
      );
    };
  }, [
    key,
    readStoredValue,
  ]);

  return {
    value: storedValue,
    setValue,
    removeValue,
  };
}