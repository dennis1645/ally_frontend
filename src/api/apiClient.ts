const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL as
  | string
  | undefined;

/**
 * The API base URL must be declared in the project-root .env file:
 *
 * VITE_API_BASE_URL=https://all-api.my.id
 */
if (!rawApiBaseUrl) {
  throw new Error(
    "VITE_API_BASE_URL is missing. Add it to your .env file.",
  );
}

/**
 * Removes trailing slashes so:
 *
 * https://all-api.my.id/
 *
 * becomes:
 *
 * https://all-api.my.id
 */
export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, "");

/**
 * Browser-storage keys.
 */
const ACCESS_TOKEN_KEY = "ally_access_token";
const TOKEN_TYPE_KEY = "ally_token_type";

/**
 * Backend validation errors commonly returned by Laravel APIs.
 *
 * Example:
 * {
 *   "email": ["The email field is required."]
 * }
 */
export type ApiValidationErrors = Record<string, string[]>;

/**
 * Custom error returned by apiRequest().
 */
export class ApiError extends Error {
  readonly status: number;
  readonly errors?: ApiValidationErrors;
  readonly responseData?: unknown;

  constructor(
    message: string,
    status: number,
    errors?: ApiValidationErrors,
    responseData?: unknown,
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
    this.responseData = responseData;

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

type ApiErrorResponse = {
  message?: string;
  error?: string;
  errors?: ApiValidationErrors;
};

export type ApiRequestOptions = RequestInit & {
  /**
   * Automatically attach the Authorization header.
   *
   * Defaults to true.
   */
  authenticated?: boolean;

  /**
   * Maximum amount of time to wait for the server.
   *
   * Defaults to 15 seconds.
   */
  timeoutMs?: number;
};

/**
 * Return the storage containing the current token.
 *
 * localStorage is checked first because it represents
 * the "Remember Me" session.
 */
function getTokenStorage(): Storage | null {
  if (window.localStorage.getItem(ACCESS_TOKEN_KEY)) {
    return window.localStorage;
  }

  if (window.sessionStorage.getItem(ACCESS_TOKEN_KEY)) {
    return window.sessionStorage;
  }

  return null;
}

/**
 * Retrieve the stored access token.
 */
export function getAccessToken(): string | null {
  const storage = getTokenStorage();

  return storage?.getItem(ACCESS_TOKEN_KEY) ?? null;
}

/**
 * Retrieve the stored token type.
 *
 * The backend Postman collection uses Bearer authentication,
 * so Bearer is used as the fallback.
 */
export function getTokenType(): string {
  const storage = getTokenStorage();

  return (
    storage?.getItem(TOKEN_TYPE_KEY)?.trim() ||
    "Bearer"
  );
}

/**
 * Store both access_token and token_type.
 *
 * rememberMe = true:
 *   localStorage
 *
 * rememberMe = false:
 *   sessionStorage
 */
export function storeAuthToken(
  accessToken: string,
  tokenType = "Bearer",
  rememberMe = false,
): void {
  clearAuthToken();

  const normalizedAccessToken = accessToken.trim();
  const normalizedTokenType =
    tokenType.trim() || "Bearer";

  if (!normalizedAccessToken) {
    throw new Error(
      "Cannot store an empty access token.",
    );
  }

  const storage = rememberMe
    ? window.localStorage
    : window.sessionStorage;

  storage.setItem(
    ACCESS_TOKEN_KEY,
    normalizedAccessToken,
  );

  storage.setItem(
    TOKEN_TYPE_KEY,
    normalizedTokenType,
  );
}

/**
 * Delete authentication data from both storage locations.
 */
export function clearAuthToken(): void {
  window.localStorage.removeItem(
    ACCESS_TOKEN_KEY,
  );

  window.localStorage.removeItem(
    TOKEN_TYPE_KEY,
  );

  window.sessionStorage.removeItem(
    ACCESS_TOKEN_KEY,
  );

  window.sessionStorage.removeItem(
    TOKEN_TYPE_KEY,
  );
}

/**
 * Backwards-compatible helper.
 *
 * Existing authApi.ts code that still calls:
 *
 * storeAccessToken(token, rememberMe)
 *
 * will continue to work and will use Bearer as token_type.
 */
export function storeAccessToken(
  accessToken: string,
  rememberMe = false,
): void {
  storeAuthToken(
    accessToken,
    "Bearer",
    rememberMe,
  );
}

/**
 * Backwards-compatible alias.
 */
export function clearAccessToken(): void {
  clearAuthToken();
}

/**
 * Safely parse a backend response.
 */
async function parseResponse(
  response: Response,
): Promise<unknown> {
  if (
    response.status === 204 ||
    response.status === 205
  ) {
    return null;
  }

  const responseText = await response.text();

  if (!responseText.trim()) {
    return null;
  }

  const contentType =
    response.headers.get("content-type") ?? "";

  if (
    contentType.includes("application/json")
  ) {
    try {
      return JSON.parse(responseText) as unknown;
    } catch {
      throw new ApiError(
        "The server returned invalid JSON.",
        response.status,
        undefined,
        responseText,
      );
    }
  }

  try {
    return JSON.parse(responseText) as unknown;
  } catch {
    return responseText;
  }
}

/**
 * Extract a useful message from an unsuccessful response.
 */
function getErrorMessage(
  responseData: unknown,
  fallbackMessage: string,
): string {
  if (
    typeof responseData === "object" &&
    responseData !== null
  ) {
    const errorResponse =
      responseData as ApiErrorResponse;

    if (
      typeof errorResponse.message ===
        "string" &&
      errorResponse.message.trim()
    ) {
      return errorResponse.message;
    }

    if (
      typeof errorResponse.error ===
        "string" &&
      errorResponse.error.trim()
    ) {
      return errorResponse.error;
    }

    const firstValidationError =
      Object.values(
        errorResponse.errors ?? {},
      )
        .flat()
        .find(
          (message) =>
            typeof message === "string" &&
            message.trim(),
        );

    if (firstValidationError) {
      return firstValidationError;
    }
  }

  if (
    typeof responseData === "string" &&
    responseData.trim()
  ) {
    return responseData;
  }

  return fallbackMessage;
}

/**
 * Extract backend field-validation errors.
 */
function getValidationErrors(
  responseData: unknown,
): ApiValidationErrors | undefined {
  if (
    typeof responseData !== "object" ||
    responseData === null
  ) {
    return undefined;
  }

  const possibleErrors = (
    responseData as ApiErrorResponse
  ).errors;

  if (
    !possibleErrors ||
    typeof possibleErrors !== "object"
  ) {
    return undefined;
  }

  return possibleErrors;
}

/**
 * Convert the supplied path into a complete API URL.
 *
 * Example:
 *
 * API_BASE_URL:
 * https://all-api.my.id
 *
 * path:
 * /api/login
 *
 * result:
 * https://all-api.my.id/api/login
 */
function createRequestUrl(path: string): string {
  const normalizedPath = path.startsWith("/")
    ? path
    : `/${path}`;

  return `${API_BASE_URL}${normalizedPath}`;
}

/**
 * Central request helper for the Ally frontend.
 *
 * It:
 * - uses VITE_API_BASE_URL
 * - sends Accept: application/json
 * - sends JSON content type when appropriate
 * - automatically sends the Bearer token
 * - supports FormData
 * - handles timeouts
 * - parses backend validation errors
 * - clears invalid sessions after authenticated 401 responses
 */
export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    authenticated = true,
    timeoutMs = 15_000,
    headers: suppliedHeaders,
    ...requestOptions
  } = options;

  const abortController =
    new AbortController();

  const timeoutId = window.setTimeout(() => {
    abortController.abort();
  }, timeoutMs);

  const headers = new Headers(
    suppliedHeaders,
  );

  headers.set("Accept", "application/json");

  const isFormData =
    typeof FormData !== "undefined" &&
    requestOptions.body instanceof FormData;

  /**
   * Do not manually set multipart/form-data for FormData.
   * The browser must generate its boundary.
   */
  if (
    requestOptions.body !== undefined &&
    requestOptions.body !== null &&
    !isFormData &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  if (authenticated) {
    const accessToken = getAccessToken();

    if (accessToken) {
      const tokenType = getTokenType();

      headers.set(
        "Authorization",
        `${tokenType} ${accessToken}`,
      );
    }
  }

  try {
    const response = await fetch(
      createRequestUrl(path),
      {
        ...requestOptions,
        headers,
        signal: abortController.signal,
      },
    );

    const responseData =
      await parseResponse(response);

    if (!response.ok) {
      const fallbackMessage =
        response.status === 401
          ? "Your session is invalid or has expired. Please log in again."
          : `Request failed with status ${response.status}.`;

      const message = getErrorMessage(
        responseData,
        fallbackMessage,
      );

      const validationErrors =
        getValidationErrors(responseData);

      /**
       * Only clear the token for an authenticated request.
       *
       * A failed POST /api/login may also return 401,
       * but there is no existing session to remove.
       */
      if (
        authenticated &&
        response.status === 401
      ) {
        clearAuthToken();
      }

      throw new ApiError(
        message,
        response.status,
        validationErrors,
        responseData,
      );
    }

    return responseData as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (
      error instanceof DOMException &&
      error.name === "AbortError"
    ) {
      throw new ApiError(
        "The server took too long to respond. Please try again.",
        408,
      );
    }

    if (error instanceof TypeError) {
      throw new ApiError(
        "Unable to connect to the Ally server. Check your internet connection or the API CORS configuration.",
        503,
      );
    }

    throw new ApiError(
      error instanceof Error
        ? error.message
        : "An unexpected request error occurred.",
      500,
    );
  } finally {
    window.clearTimeout(timeoutId);
  }
}