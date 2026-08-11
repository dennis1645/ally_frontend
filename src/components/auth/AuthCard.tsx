import { useState } from "react";

import {
  useForm,
  type SubmitHandler,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  ArrowRight,
  Eye,
  EyeOff,
  Map,
} from "lucide-react";

import {
  useNavigate,
  useSearchParams,
} from "react-router";

import { ApiError } from "../../api/apiClient";
import { useAuth } from "../../context/AuthContext";

import {
  loginSchema,
  registerSchema,
  type LoginValues,
  type RegisterValues,
} from "../../schemas/authSchemas";

import {
  getHomePathForUser,
} from "../../utils/authRouting";

import FormField from "./FormField";

type AuthMode = "login" | "register";

type SubmissionState = {
  isSubmitting: boolean;
  error: string | null;
};

const initialSubmissionState: SubmissionState = {
  isSubmitting: false,
  error: null,
};

export default function AuthCard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] =
    useSearchParams();

  const {
    login,
    register,
  } = useAuth();

  const initialMode: AuthMode =
    searchParams.get("mode") === "register"
      ? "register"
      : "login";

  const [mode, setMode] =
    useState<AuthMode>(initialMode);

  const [
    showLoginPassword,
    setShowLoginPassword,
  ] = useState(false);

  const [
    showRegisterPassword,
    setShowRegisterPassword,
  ] = useState(false);

  const [
    showRegisterConfirmPassword,
    setShowRegisterConfirmPassword,
  ] = useState(false);

  const [
    submissionState,
    setSubmissionState,
  ] = useState<SubmissionState>(
    initialSubmissionState,
  );

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const registerForm =
    useForm<RegisterValues>({
      resolver: zodResolver(registerSchema),
      defaultValues: {
        name: "",
        email: "",
        phone_number: "",
        password: "",
        password_confirmation: "",
        acceptTerms: false,
      },
    });

  function changeMode(
    nextMode: AuthMode,
  ): void {
    setMode(nextMode);
    setSubmissionState(
      initialSubmissionState,
    );

    setSearchParams(
      nextMode === "register"
        ? { mode: "register" }
        : {},
      {
        replace: true,
      },
    );

    loginForm.clearErrors();
    registerForm.clearErrors();

    setShowLoginPassword(false);
    setShowRegisterPassword(false);
    setShowRegisterConfirmPassword(false);
  }

  const handleLogin: SubmitHandler<
    LoginValues
  > = async (values) => {
    setSubmissionState({
      isSubmitting: true,
      error: null,
    });

    try {
      const user = await login(
        {
          email: values.email,
          password: values.password,
        },
        values.rememberMe,
      );

      navigate(
        getHomePathForUser(user),
        {
          replace: true,
        },
      );
    } catch (error) {
      setSubmissionState({
        isSubmitting: false,
        error:
          error instanceof Error
            ? error.message
            : "Login failed. Please try again.",
      });
    }
  };

  const handleRegister: SubmitHandler<
    RegisterValues
  > = async (values) => {
    setSubmissionState({
      isSubmitting: true,
      error: null,
    });

    try {
      await register({
        name: values.name,
        email: values.email,
        phone_number:
          values.phone_number,
        password: values.password,
        password_confirmation:
          values.password_confirmation,
      });

      navigate(
        "/verify-email",
        {
          replace: true,
        },
      );
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.errors
      ) {
        const fieldMap: Record<
          string,
          keyof RegisterValues
        > = {
          name: "name",
          email: "email",
          phone_number: "phone_number",
          password: "password",
          password_confirmation:
            "password_confirmation",
        };

        let hasFieldError = false;
        let shouldFocus = true;

        for (const [
          backendField,
          messages,
        ] of Object.entries(error.errors)) {
          const fieldName =
            fieldMap[backendField];

          const message =
            messages.find(
              (item) =>
                typeof item === "string" &&
                item.trim().length > 0,
            );

          if (!fieldName || !message) {
            continue;
          }

          registerForm.setError(
            fieldName,
            {
              type: "server",
              message,
            },
            {
              shouldFocus,
            },
          );

          shouldFocus = false;
          hasFieldError = true;
        }

        setSubmissionState({
          isSubmitting: false,
          error: hasFieldError
            ? null
            : error.message,
        });

        return;
      }

      setSubmissionState({
        isSubmitting: false,
        error:
          error instanceof Error
            ? error.message
            : "Registration failed. Please try again.",
      });
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-[32px] border border-ally-border bg-ally-surface p-7 shadow-sm sm:p-8">
        <div className="mb-8 flex rounded-full bg-ally-surface-strong p-1">
          <button
            type="button"
            aria-pressed={mode === "login"}
            onClick={() =>
              changeMode("login")
            }
            className={[
              "flex-1 rounded-full py-2.5 transition",
              mode === "login"
                ? "bg-white text-ally-primary shadow-sm"
                : "text-ally-muted",
            ].join(" ")}
          >
            Login
          </button>

          <button
            type="button"
            aria-pressed={
              mode === "register"
            }
            onClick={() =>
              changeMode("register")
            }
            className={[
              "flex-1 rounded-full py-2.5 transition",
              mode === "register"
                ? "bg-white text-ally-primary shadow-sm"
                : "text-ally-muted",
            ].join(" ")}
          >
            Register
          </button>
        </div>

        {mode === "login" ? (
          <form
            onSubmit={loginForm.handleSubmit(
              handleLogin,
            )}
            noValidate
          >
            <div className="mb-7 text-center">
              <h2 className="text-xl font-medium">
                Welcome Back
              </h2>

              <p className="mt-1 text-ally-muted">
                Continue your climb to the
                summit.
              </p>
            </div>

            <div className="space-y-5">
              <FormField
                id="login-email"
                label="Email Address"
                type="email"
                autoComplete="email"
                placeholder="explorer@ally.com"
                error={
                  loginForm.formState
                    .errors.email?.message
                }
                {...loginForm.register(
                  "email",
                )}
              />

              <div>
                <label
                  htmlFor="login-password"
                  className="mb-2 block text-sm font-medium"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="login-password"
                    type={
                      showLoginPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full rounded-xl border-2 border-ally-brown bg-white px-4 py-3 pr-12 outline-none focus:border-ally-blue focus:ring-4 focus:ring-blue-100"
                    {...loginForm.register(
                      "password",
                    )}
                  />

                  <button
                    type="button"
                    aria-label={
                      showLoginPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    aria-pressed={
                      showLoginPassword
                    }
                    onClick={() =>
                      setShowLoginPassword(
                        (current) =>
                          !current,
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-ally-muted transition hover:bg-ally-surface-strong hover:text-ally-primary focus:outline-none focus:ring-2 focus:ring-ally-blue"
                  >
                    {showLoginPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>

                {loginForm.formState.errors
                  .password?.message && (
                  <p className="mt-1 text-sm text-ally-error">
                    {
                      loginForm.formState
                        .errors.password.message
                    }
                  </p>
                )}
              </div>
            </div>

            <div className="my-5 flex items-center justify-between gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...loginForm.register(
                    "rememberMe",
                  )}
                />

                <span>Remember Me</span>
              </label>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/forgot-password",
                  )
                }
                className="text-ally-primary"
              >
                Forgot Password?
              </button>
            </div>

            {submissionState.error && (
              <div
                role="alert"
                className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-ally-error"
              >
                {submissionState.error}
              </div>
            )}

            <button
              type="submit"
              disabled={
                submissionState.isSubmitting
              }
              className="squishy-button flex w-full items-center justify-center gap-2 rounded-xl bg-ally-blue py-4 font-medium text-white disabled:opacity-60"
            >
              {submissionState.isSubmitting
                ? "Signing in..."
                : "Sign In"}

              {!submissionState.isSubmitting && (
                <ArrowRight size={20} />
              )}
            </button>
          </form>
        ) : (
          <form
            onSubmit={registerForm.handleSubmit(
              handleRegister,
            )}
            noValidate
          >
            <div className="mb-7 text-center">
              <h2 className="text-xl font-medium">
                Start Your Expedition
              </h2>

              <p className="mt-1 text-ally-muted">
                Create your Ally explorer
                account.
              </p>
            </div>

            <div className="space-y-4">
              <FormField
                id="register-name"
                label="Full Name"
                type="text"
                autoComplete="name"
                placeholder="Budi Santoso"
                error={
                  registerForm.formState
                    .errors.name?.message
                }
                {...registerForm.register(
                  "name",
                )}
              />

              <FormField
                id="register-email"
                label="Email Address"
                type="email"
                autoComplete="email"
                placeholder="budi@example.com"
                error={
                  registerForm.formState
                    .errors.email?.message
                }
                {...registerForm.register(
                  "email",
                )}
              />

              <div>
                <label
                  htmlFor="register-phone"
                  className="mb-2 block text-sm font-medium"
                >
                  Phone Number
                </label>

                <input
                  id="register-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="081234567891"
                  maxLength={12}
                  pattern="[0-9]*"
                  aria-invalid={
                    Boolean(
                      registerForm.formState
                        .errors.phone_number,
                    )
                  }
                  aria-describedby={
                    registerForm.formState
                      .errors.phone_number
                      ? "register-phone-error"
                      : undefined
                  }
                  className={[
                    "w-full rounded-xl border-2 bg-white px-4 py-3 outline-none focus:ring-4 focus:ring-blue-100",
                    registerForm.formState
                      .errors.phone_number
                      ? "border-red-400 focus:border-red-500"
                      : "border-ally-brown focus:border-ally-blue",
                  ].join(" ")}
                  onInput={(event) => {
                    const input =
                      event.currentTarget;

                    input.value = input.value
                      .replace(/\D/g, "")
                      .slice(0, 12);
                  }}
                  {...registerForm.register(
                    "phone_number",
                  )}
                />

                {registerForm.formState.errors
                  .phone_number?.message && (
                  <p
                    id="register-phone-error"
                    role="alert"
                    className="mt-1.5 text-sm text-ally-error"
                  >
                    {
                      registerForm.formState
                        .errors.phone_number
                        .message
                    }
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="register-password"
                  className="mb-2 block text-sm font-medium"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="register-password"
                    type={
                      showRegisterPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    placeholder="Minimum 8 characters"
                    aria-invalid={
                      Boolean(
                        registerForm.formState
                          .errors.password,
                      )
                    }
                    aria-describedby={
                      registerForm.formState
                        .errors.password
                        ? "register-password-error"
                        : undefined
                    }
                    className={[
                      "w-full rounded-xl border-2 bg-white px-4 py-3 pr-12 outline-none focus:ring-4 focus:ring-blue-100",
                      registerForm.formState
                        .errors.password
                        ? "border-red-400 focus:border-red-500"
                        : "border-ally-brown focus:border-ally-blue",
                    ].join(" ")}
                    {...registerForm.register(
                      "password",
                    )}
                  />

                  <button
                    type="button"
                    aria-label={
                      showRegisterPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    aria-pressed={
                      showRegisterPassword
                    }
                    onClick={() =>
                      setShowRegisterPassword(
                        (current) =>
                          !current,
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-ally-muted transition hover:bg-ally-surface-strong hover:text-ally-primary focus:outline-none focus:ring-2 focus:ring-ally-blue"
                  >
                    {showRegisterPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>

                {registerForm.formState.errors
                  .password?.message && (
                  <p
                    id="register-password-error"
                    role="alert"
                    className="mt-1.5 text-sm text-ally-error"
                  >
                    {
                      registerForm.formState
                        .errors.password.message
                    }
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="register-confirm-password"
                  className="mb-2 block text-sm font-medium"
                >
                  Confirm Password
                </label>

                <div className="relative">
                  <input
                    id="register-confirm-password"
                    type={
                      showRegisterConfirmPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    aria-invalid={
                      Boolean(
                        registerForm.formState
                          .errors
                          .password_confirmation,
                      )
                    }
                    aria-describedby={
                      registerForm.formState
                        .errors
                        .password_confirmation
                        ? "register-confirm-password-error"
                        : undefined
                    }
                    className={[
                      "w-full rounded-xl border-2 bg-white px-4 py-3 pr-12 outline-none focus:ring-4 focus:ring-blue-100",
                      registerForm.formState
                        .errors
                        .password_confirmation
                        ? "border-red-400 focus:border-red-500"
                        : "border-ally-brown focus:border-ally-blue",
                    ].join(" ")}
                    {...registerForm.register(
                      "password_confirmation",
                    )}
                  />

                  <button
                    type="button"
                    aria-label={
                      showRegisterConfirmPassword
                        ? "Hide confirmed password"
                        : "Show confirmed password"
                    }
                    aria-pressed={
                      showRegisterConfirmPassword
                    }
                    onClick={() =>
                      setShowRegisterConfirmPassword(
                        (current) =>
                          !current,
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-ally-muted transition hover:bg-ally-surface-strong hover:text-ally-primary focus:outline-none focus:ring-2 focus:ring-ally-blue"
                  >
                    {
                      showRegisterConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )
                    }
                  </button>
                </div>

                {registerForm.formState.errors
                  .password_confirmation
                  ?.message && (
                  <p
                    id="register-confirm-password-error"
                    role="alert"
                    className="mt-1.5 text-sm text-ally-error"
                  >
                    {
                      registerForm.formState
                        .errors
                        .password_confirmation
                        .message
                    }
                  </p>
                )}
              </div>
            </div>

            <label className="my-5 flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                {...registerForm.register(
                  "acceptTerms",
                )}
              />

              <span>
                I agree to the Terms and
                Privacy Policy.
              </span>
            </label>

            {registerForm.formState.errors
              .acceptTerms?.message && (
              <p className="-mt-3 mb-4 text-sm text-ally-error">
                {
                  registerForm.formState
                    .errors.acceptTerms
                    .message
                }
              </p>
            )}

            {submissionState.error && (
              <div
                role="alert"
                className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-ally-error"
              >
                {submissionState.error}
              </div>
            )}

            <button
              type="submit"
              disabled={
                submissionState.isSubmitting
              }
              className="squishy-button flex w-full items-center justify-center gap-2 rounded-xl bg-ally-blue py-4 font-medium text-white disabled:opacity-60"
            >
              {submissionState.isSubmitting
                ? "Creating account..."
                : "Create Account"}

              {!submissionState.isSubmitting && (
                <Map size={20} />
              )}
            </button>
          </form>
        )}

        <div className="my-8 flex items-center gap-4 text-sm text-ally-muted">
          <span className="h-px flex-1 bg-ally-border" />
          <span>or continue with</span>
          <span className="h-px flex-1 bg-ally-border" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            disabled
            className="rounded-xl border-2 border-ally-brown bg-white px-4 py-3 opacity-50"
          >
            Google
          </button>

          <button
            type="button"
            disabled
            className="rounded-xl border-2 border-ally-brown bg-white px-4 py-3 opacity-50"
          >
            Microsoft
          </button>
        </div>

        <p className="mt-3 text-center text-xs text-ally-muted">
          OAuth endpoints are not defined in
          the provided Postman collection.
        </p>
      </div>
    </div>
  );
}