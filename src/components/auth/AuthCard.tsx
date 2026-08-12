import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, Map, Globe } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";

import { ApiError } from "../../api/apiClient";
import { useAuth } from "../../context/AuthContext";
import {
  loginSchema,
  registerSchema,
  type LoginValues,
  type RegisterValues,
} from "../../schemas/authSchemas";
import { getHomePathForUser } from "../../utils/authRouting";
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
  const [searchParams, setSearchParams] = useSearchParams();

  const { login, register } = useAuth();

  const initialMode: AuthMode =
    searchParams.get("mode") === "register" ? "register" : "login";

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [transitionDirection, setTransitionDirection] = useState<"login" | "register">(initialMode);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [submissionState, setSubmissionState] = useState<SubmissionState>(initialSubmissionState);

  // State untuk Bahasa
  const [language, setLanguage] = useState<"en" | "id">("en");

  // Translasi
  const texts = {
    en: {
      tabLogin: "Login",
      tabRegister: "Register",
      loginTitle: "Welcome Back!",
      loginSub: "Continue your climb to the summit.",
      emailLabel: "Email Address",
      passwordLabel: "Password",
      rememberMe: "Remember Me",
      forgotPwd: "Forgot Password?",
      signInBtn: "Sign In",
      signingIn: "Signing in...",
      regTitle: "Start Your Expedition",
      regSub: "Create your Ally explorer account.",
      nameLabel: "Full Name",
      phoneLabel: "Phone Number",
      confirmPwdLabel: "Confirm Password",
      createBtn: "Create Account",
      creatingBtn: "Creating account...",
    },
    id: {
      tabLogin: "Masuk",
      tabRegister: "Daftar",
      loginTitle: "Selamat Datang Kembali!",
      loginSub: "Lanjutkan pendakianmu menuju puncak.",
      emailLabel: "Alamat Email",
      passwordLabel: "Kata Sandi",
      rememberMe: "Ingat Saya",
      forgotPwd: "Lupa Kata Sandi?",
      signInBtn: "Masuk",
      signingIn: "Sedang masuk...",
      regTitle: "Mulai Ekspedisimu",
      regSub: "Buat akun penjelajah Ally kamu.",
      nameLabel: "Nama Lengkap",
      phoneLabel: "Nomor Telepon",
      confirmPwdLabel: "Konfirmasi Kata Sandi",
      createBtn: "Buat Akun",
      creatingBtn: "Membuat akun...",
    },
  };
  const t = texts[language];

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone_number: "", // Dikosongkan, +62 hanya visual
      password: "",
      password_confirmation: "",
      acceptTerms: true,
    },
  });

  function changeMode(nextMode: AuthMode): void {
    setTransitionDirection(nextMode);
    setMode(nextMode);
    setSubmissionState(initialSubmissionState);

    setSearchParams(nextMode === "register" ? { mode: "register" } : {}, {
      replace: true,
    });

    loginForm.clearErrors();
    registerForm.clearErrors();

    setShowLoginPassword(false);
    setShowRegisterPassword(false);
    setShowRegisterConfirmPassword(false);
  }

  const handleLogin: SubmitHandler<LoginValues> = async (values) => {
    setSubmissionState({ isSubmitting: true, error: null });

    try {
      const user = await login(
        { email: values.email, password: values.password },
        values.rememberMe
      );
      navigate(getHomePathForUser(user), { replace: true });
    } catch (error) {
      setSubmissionState({
        isSubmitting: false,
        error: error instanceof Error ? error.message : "Login failed. Please try again.",
      });
    }
  };

  const handleRegister: SubmitHandler<RegisterValues> = async (values) => {
    setSubmissionState({ isSubmitting: true, error: null });

    try {
      await register({
        name: values.name,
        email: values.email,
        // Kita tempelkan +62 ke angka yang diinput user
        phone_number: `+62${values.phone_number}`,
        password: values.password,
        password_confirmation: values.password_confirmation,
      });

      navigate("/verify-email", { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.errors) {
        const fieldMap: Record<string, keyof RegisterValues> = {
          name: "name",
          email: "email",
          phone_number: "phone_number",
          password: "password",
          password_confirmation: "password_confirmation",
        };

        let hasFieldError = false;
        let shouldFocus = true;

        for (const [backendField, messages] of Object.entries(error.errors)) {
          const fieldName = fieldMap[backendField];
          const message = messages.find(
            (item) => typeof item === "string" && item.trim().length > 0
          );

          if (!fieldName || !message) continue;

          registerForm.setError(fieldName, { type: "server", message }, { shouldFocus });
          shouldFocus = false;
          hasFieldError = true;
        }

        setSubmissionState({
          isSubmitting: false,
          error: hasFieldError ? null : error.message,
        });
        return;
      }

      setSubmissionState({
        isSubmitting: false,
        error: error instanceof Error ? error.message : "Registration failed. Please try again.",
      });
    }
  };

  function toggleLanguage() {
    setLanguage((prev) => (prev === "en" ? "id" : "en"));
  }

  return (
    <>
      {/* 
        Tombol Bahasa ditempatkan menggunakan FIXED POSITION 
        agar statis nempel di layar pojok kanan atas, tidak peduli form besar/kecil.
      */}
      <div className="fixed top-6 right-6 z-50 sm:top-8 sm:right-8 lg:right-12">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-2.5 text-sm font-bold text-ally-primary shadow-md backdrop-blur-md transition-transform hover:scale-105 hover:bg-white"
        >
          <Globe size={18} />
          {language === "en" ? "EN" : "ID"}
        </button>
      </div>

      <div
        className={[
          "auth-card-container relative w-full max-w-md",
          mode === "register" ? "auth-card-container-register" : "",
        ].join(" ")}
      >
        <div
          className={[
            "auth-card rounded-[32px] border border-ally-border bg-ally-surface p-7 shadow-sm sm:p-8",
            transitionDirection === "register"
              ? "auth-card-transition-register"
              : "auth-card-transition-login",
          ].join(" ")}
        >
          <div className="mb-8 flex rounded-full bg-ally-surface-strong p-1">
            <button
              type="button"
              aria-pressed={mode === "login"}
              onClick={() => changeMode("login")}
              className={[
                "flex-1 rounded-full py-2.5 transition",
                mode === "login" ? "bg-white text-ally-primary shadow-sm" : "text-ally-muted",
              ].join(" ")}
            >
              {t.tabLogin}
            </button>

            <button
              type="button"
              aria-pressed={mode === "register"}
              onClick={() => changeMode("register")}
              className={[
                "flex-1 rounded-full py-2.5 transition",
                mode === "register" ? "bg-white text-ally-primary shadow-sm" : "text-ally-muted",
              ].join(" ")}
            >
              {t.tabRegister}
            </button>
          </div>

          {mode === "login" ? (
           <form onSubmit={loginForm.handleSubmit(handleLogin)} noValidate>
            <div className="mb-7 text-center">
              {/* Ini yang diubah: ganti font-medium jadi font-bold */}
              <h2 className="text-xl font-bold">{t.loginTitle}</h2>
              <p className="mt-1 text-ally-muted">{t.loginSub}</p>
            </div>

              <div className="space-y-5">
                <FormField
                  id="login-email"
                  label={t.emailLabel}
                  type="email"
                  autoComplete="email"
                  placeholder="explorer@ally.com"
                  error={loginForm.formState.errors.email?.message}
                  {...loginForm.register("email")}
                />

                <div>
                  <label htmlFor="login-password" className="mb-2 block text-sm font-medium">
                    {t.passwordLabel}
                  </label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showLoginPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="w-full rounded-xl border-2 border-ally-brown bg-white px-4 py-3 pr-12 outline-none focus:border-ally-blue focus:ring-4 focus:ring-blue-100"
                      {...loginForm.register("password")}
                    />
                    <button
                      type="button"
                      aria-label={showLoginPassword ? "Hide password" : "Show password"}
                      aria-pressed={showLoginPassword}
                      onClick={() => setShowLoginPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-ally-muted transition hover:bg-ally-surface-strong hover:text-ally-primary focus:outline-none focus:ring-2 focus:ring-ally-blue"
                    >
                      {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {loginForm.formState.errors.password?.message && (
                    <p className="mt-1 text-sm text-ally-error">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="my-5 flex items-center justify-between gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" {...loginForm.register("rememberMe")} />
                  <span>{t.rememberMe}</span>
                </label>

                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-ally-primary"
                >
                  {t.forgotPwd}
                </button>
              </div>

              {submissionState.error && (
                <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-ally-error">
                  {submissionState.error}
                </div>
              )}

              <button
                type="submit"
                disabled={submissionState.isSubmitting}
                className="squishy-button flex w-full items-center justify-center gap-2 rounded-xl bg-ally-blue py-4 font-medium text-white disabled:opacity-60"
              >
                {submissionState.isSubmitting ? t.signingIn : t.signInBtn}
                {!submissionState.isSubmitting && <ArrowRight size={20} />}
              </button>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(handleRegister)} noValidate>
              <div className="mb-7 text-center">
                <h2 className="text-xl font-bold">{t.regTitle}</h2>
                <p className="mt-1 text-ally-muted">{t.regSub}</p>
              </div>

              <div className="space-y-4">
                <FormField
                  id="register-name"
                  label={t.nameLabel}
                  type="text"
                  autoComplete="name"
                  placeholder="Budi Santoso"
                  error={registerForm.formState.errors.name?.message}
                  {...registerForm.register("name")}
                />

                <FormField
                  id="register-email"
                  label={t.emailLabel}
                  type="email"
                  autoComplete="email"
                  placeholder="budi@example.com"
                  error={registerForm.formState.errors.email?.message}
                  {...registerForm.register("email")}
                />

                <div>
                  <label htmlFor="register-phone" className="mb-2 block text-sm font-medium">
                    {t.phoneLabel}
                  </label>
                  
                  {/* Visual Prefix Box (+62) diletakkan di dalam input agar terlihat elegan */}
                  <div className="relative flex items-center">
                    <div className="absolute left-1.5 top-1.5 bottom-1.5 flex items-center justify-center rounded-lg bg-gray-50 px-3 border-r border-ally-border font-medium text-gray-500 z-10">
                      +62
                    </div>
                    <input
                      id="register-phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="812 3456 7891"
                      maxLength={13}
                      aria-invalid={Boolean(registerForm.formState.errors.phone_number)}
                      aria-describedby={
                        registerForm.formState.errors.phone_number ? "register-phone-error" : undefined
                      }
                      className={[
                        "w-full rounded-xl border-2 bg-white py-3 pl-[72px] pr-4 outline-none focus:ring-4 focus:ring-blue-100",
                        registerForm.formState.errors.phone_number
                          ? "border-red-400 focus:border-red-500"
                          : "border-ally-brown focus:border-ally-blue",
                      ].join(" ")}
                      onInput={(event) => {
                        const input = event.currentTarget;
                        let val = input.value.replace(/\D/g, ""); // Hanya mengizinkan angka
                        
                        // Fitur pintar UX: Kalau user ngetik awalan 0 atau 62, otomatis kita buang 
                        // karena di visualnya kan udah ada +62
                        if (val.startsWith("62")) val = val.substring(2);
                        if (val.startsWith("0")) val = val.substring(1);
                        
                        input.value = val;
                      }}
                      {...registerForm.register("phone_number")}
                    />
                  </div>

                  {registerForm.formState.errors.phone_number?.message && (
                    <p id="register-phone-error" role="alert" className="mt-1.5 text-sm text-ally-error">
                      {registerForm.formState.errors.phone_number.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="register-password" className="mb-2 block text-sm font-medium">
                    {t.passwordLabel}
                  </label>
                  <div className="relative">
                    <input
                      id="register-password"
                      type={showRegisterPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Minimum 8 characters"
                      aria-invalid={Boolean(registerForm.formState.errors.password)}
                      aria-describedby={
                        registerForm.formState.errors.password ? "register-password-error" : undefined
                      }
                      className={[
                        "w-full rounded-xl border-2 bg-white px-4 py-3 pr-12 outline-none focus:ring-4 focus:ring-blue-100",
                        registerForm.formState.errors.password
                          ? "border-red-400 focus:border-red-500"
                          : "border-ally-brown focus:border-ally-blue",
                      ].join(" ")}
                      {...registerForm.register("password")}
                    />
                    <button
                      type="button"
                      aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                      aria-pressed={showRegisterPassword}
                      onClick={() => setShowRegisterPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-ally-muted transition hover:bg-ally-surface-strong hover:text-ally-primary focus:outline-none focus:ring-2 focus:ring-ally-blue"
                    >
                      {showRegisterPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {registerForm.formState.errors.password?.message && (
                    <p id="register-password-error" role="alert" className="mt-1.5 text-sm text-ally-error">
                      {registerForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="register-confirm-password" className="mb-2 block text-sm font-medium">
                    {t.confirmPwdLabel}
                  </label>
                  <div className="relative">
                    <input
                      id="register-confirm-password"
                      type={showRegisterConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Repeat your password"
                      aria-invalid={Boolean(registerForm.formState.errors.password_confirmation)}
                      aria-describedby={
                        registerForm.formState.errors.password_confirmation
                          ? "register-confirm-password-error"
                          : undefined
                      }
                      className={[
                        "w-full rounded-xl border-2 bg-white px-4 py-3 pr-12 outline-none focus:ring-4 focus:ring-blue-100",
                        registerForm.formState.errors.password_confirmation
                          ? "border-red-400 focus:border-red-500"
                          : "border-ally-brown focus:border-ally-blue",
                      ].join(" ")}
                      {...registerForm.register("password_confirmation")}
                    />
                    <button
                      type="button"
                      aria-label={
                        showRegisterConfirmPassword ? "Hide confirmed password" : "Show confirmed password"
                      }
                      aria-pressed={showRegisterConfirmPassword}
                      onClick={() => setShowRegisterConfirmPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-ally-muted transition hover:bg-ally-surface-strong hover:text-ally-primary focus:outline-none focus:ring-2 focus:ring-ally-blue"
                    >
                      {showRegisterConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {registerForm.formState.errors.password_confirmation?.message && (
                    <p id="register-confirm-password-error" role="alert" className="mt-1.5 text-sm text-ally-error">
                      {registerForm.formState.errors.password_confirmation.message}
                    </p>
                  )}
                </div>
              </div>

              {submissionState.error && (
                <div role="alert" className="mb-4 mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-ally-error">
                  {submissionState.error}
                </div>
              )}

              {/* Tombol Diperbesar, Diberi Jarak, & Di-Bold */}
              <button
                type="submit"
                disabled={submissionState.isSubmitting}
                className="squishy-button mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-ally-blue py-4 text-lg font-bold text-white shadow-sm transition-colors hover:bg-blue-600 disabled:opacity-60 sm:py-5"
              >
                {submissionState.isSubmitting ? t.creatingBtn : t.createBtn}
                {!submissionState.isSubmitting && <Map size={22} />}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}