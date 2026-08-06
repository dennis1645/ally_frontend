export type MockUser = {
  id: string;
  name: string;
  email: string;
};

export type MockAuthResponse = {
  user: MockUser;
};

export type MockLoginPayload = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export type MockRegisterPayload = {
  name: string;
  email: string;
  password: string;
};

const SESSION_KEY = "ally_mock_session";

function wait(milliseconds = 900): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function createMockId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `mock-user-${Date.now()}`;
}

function createNameFromEmail(email: string): string {
  const emailName = email.split("@")[0] ?? "Explorer";

  return emailName
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => {
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

function clearStoredSession(): void {
  window.localStorage.removeItem(SESSION_KEY);
  window.sessionStorage.removeItem(SESSION_KEY);
}

function saveSession(user: MockUser, rememberMe: boolean): void {
  clearStoredSession();

  const selectedStorage = rememberMe
    ? window.localStorage
    : window.sessionStorage;

  selectedStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

/**
 * Frontend-only mock login.
 *
 * Any valid email and password of at least 8 characters succeeds.
 * Use error@ally.com to demonstrate an authentication error.
 */
export async function mockLogin(
  payload: MockLoginPayload,
): Promise<MockAuthResponse> {
  await wait();

  const normalizedEmail = payload.email.trim().toLowerCase();

  if (normalizedEmail === "error@ally.com") {
    throw new Error(
      "Mock login failed. Use another email address to continue.",
    );
  }

  const user: MockUser = {
    id: createMockId(),
    name: createNameFromEmail(normalizedEmail) || "Explorer",
    email: normalizedEmail,
  };

  saveSession(user, payload.rememberMe);

  return { user };
}

/**
 * Frontend-only mock registration.
 *
 * The password is not stored.
 */
export async function mockRegister(
  payload: MockRegisterPayload,
): Promise<MockAuthResponse> {
  await wait();

  const normalizedEmail = payload.email.trim().toLowerCase();

  if (normalizedEmail === "error@ally.com") {
    throw new Error(
      "Mock registration failed. Use another email address.",
    );
  }

  const user: MockUser = {
    id: createMockId(),
    name: payload.name.trim(),
    email: normalizedEmail,
  };

  saveSession(user, false);

  return { user };
}

export function getMockCurrentUser(): MockUser | null {
  const storedSession =
    window.localStorage.getItem(SESSION_KEY) ??
    window.sessionStorage.getItem(SESSION_KEY);

  if (!storedSession) {
    return null;
  }

  try {
    return JSON.parse(storedSession) as MockUser;
  } catch {
    clearStoredSession();
    return null;
  }
}

export function clearMockSession(): void {
  clearStoredSession();
}