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
                    onClick={() =>
                      setShowLoginPassword(
                        (current) =>
                          !current,
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ally-muted"
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

              <FormField
                id="register-phone"
                label="Phone Number"
                type="tel"
                autoComplete="tel"
                placeholder="081234567891"
                error={
                  registerForm.formState
                    .errors.phone_number
                    ?.message
                }
                {...registerForm.register(
                  "phone_number",
                )}
              />

              <FormField
                id="register-password"
                label="Password"
                type="password"
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
                error={
                  registerForm.formState
                    .errors.password?.message
                }
                {...registerForm.register(
                  "password",
                )}
              />

              <FormField
                id="register-confirm-password"
                label="Confirm Password"
                type="password"
                autoComplete="new-password"
                placeholder="Repeat your password"
                error={
                  registerForm.formState
                    .errors
                    .password_confirmation
                    ?.message
                }
                {...registerForm.register(
                  "password_confirmation",
                )}
              />
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