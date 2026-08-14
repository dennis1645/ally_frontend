import {
  AlertCircle,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Map,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  changePasswordApi,
  type ChangePasswordPayload,
} from "../../api/securityApi";

import {
  InputField,
  PrimaryButton,
} from "../ui";

type PasswordFormState = {
  current_password: string;
  password: string;
  password_confirmation: string;
};

const initialPasswordForm: PasswordFormState =
  {
    current_password: "",
    password: "",
    password_confirmation: "",
  };

function PasswordVisibilityButton({
  visible,
  onToggle,
  label,
}: {
  visible: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onToggle}
      className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
    >
      {visible ? (
        <EyeOff size={18} />
      ) : (
        <Eye size={18} />
      )}
    </button>
  );
}

export default function SecuritySpread() {
  const [
    form,
    setForm,
  ] = useState<PasswordFormState>(
    initialPasswordForm,
  );

  const [
    showCurrent,
    setShowCurrent,
  ] = useState(false);

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmation,
    setShowConfirmation,
  ] = useState(false);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const [
    success,
    setSuccess,
  ] = useState<string | null>(
    null,
  );

  const requirements =
    useMemo(
      () => [
        {
          label:
            "At least 8 characters",
          met:
            form.password.length >= 8,
        },
        {
          label:
            "Contains an uppercase letter",
          met: /[A-Z]/.test(
            form.password,
          ),
        },
        {
          label:
            "Contains a lowercase letter",
          met: /[a-z]/.test(
            form.password,
          ),
        },
        {
          label:
            "Contains a number",
          met: /\d/.test(
            form.password,
          ),
        },
        {
          label:
            "Contains a symbol",
          met: /[^A-Za-z0-9]/.test(
            form.password,
          ),
        },
      ],
      [form.password],
    );

  const strength =
    requirements.filter(
      (requirement) =>
        requirement.met,
    ).length;

  function updateField(
    field: keyof PasswordFormState,
    value: string,
  ): void {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      }),
    );

    setError(null);
    setSuccess(null);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (
      !form.current_password
    ) {
      setError(
        "Enter your current password.",
      );

      return;
    }

    if (form.password.length < 8) {
      setError(
        "The new password must contain at least 8 characters.",
      );

      return;
    }

    if (
      form.password !==
      form.password_confirmation
    ) {
      setError(
        "Password confirmation does not match.",
      );

      return;
    }

    const payload: ChangePasswordPayload =
      {
        current_password:
          form.current_password,

        password:
          form.password,

        password_confirmation:
          form.password_confirmation,
      };

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response =
        await changePasswordApi(
          payload,
        );

      setForm(
        initialPasswordForm,
      );

      setSuccess(
        response.message ||
          "Your password has been changed successfully.",
      );

      setShowCurrent(false);
      setShowPassword(false);
      setShowConfirmation(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to change your password.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <section className="passport-paper passport-paper-left">
        <div className="passport-page-heading">
          <div>
            <p className="passport-page-kicker">
              Protected Route
            </p>

            <h2>Security</h2>
          </div>

          <span>PAGE 09</span>
        </div>

        <div className="mt-7">
          <div className="security-passport-stamp">
            <ShieldCheck size={46} />

            <strong>
              EXPEDITION PROTECTED
            </strong>

            <span>
              ALLY SECURITY OFFICE
            </span>
          </div>

          <div className="mt-8 space-y-4">
            <SecurityNote
              icon={
                <LockKeyhole
                  size={20}
                />
              }
              title="Secure your route"
              description="Use a password that is not shared with another account."
            />

            <SecurityNote
              icon={
                <KeyRound size={20} />
              }
              title="Keep it private"
              description="Never send your password through chat, email, or mentoring notes."
            />

            <SecurityNote
              icon={
                <Map size={20} />
              }
              title="Check your surroundings"
              description="Avoid changing sensitive account information on public devices."
            />
          </div>

          <div className="mt-8 rotate-[-1deg] rounded-2xl border-2 border-dashed border-[#c69c6e] bg-[#fff8e8] p-5">
            <h2 className="text-lg font-extrabold tracking-tight text-[#2c1607]">
              Guide&apos;s note
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              A strong key keeps every
              document, journal, and
              expedition record protected.
            </p>
          </div>
        </div>

        <ShieldCheck className="passport-compass-mark" />
      </section>

      <section className="passport-paper passport-paper-right">
        <div className="passport-page-heading">
          <div>
            <p className="passport-page-kicker">
              Account Access
            </p>

            <h2>Change Password</h2>
          </div>

          <span>PAGE 10</span>
        </div>

        <form
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
          className="mt-7 space-y-5"
        >
          <InputField
            id="security-current-password"
            label="Current Password"
            type={
              showCurrent
                ? "text"
                : "password"
            }
            value={
              form.current_password
            }
            required
            autoComplete="current-password"
            leftIcon={
              <LockKeyhole
                size={18}
              />
            }
            rightElement={
              <PasswordVisibilityButton
                visible={
                  showCurrent
                }
                label={
                  showCurrent
                    ? "Hide current password"
                    : "Show current password"
                }
                onToggle={() =>
                  setShowCurrent(
                    (current) =>
                      !current,
                  )
                }
              />
            }
            onChange={(event) =>
              updateField(
                "current_password",
                event.target.value,
              )
            }
          />

          <InputField
            id="security-new-password"
            label="New Password"
            type={
              showPassword
                ? "text"
                : "password"
            }
            value={form.password}
            required
            autoComplete="new-password"
            leftIcon={
              <KeyRound size={18} />
            }
            rightElement={
              <PasswordVisibilityButton
                visible={
                  showPassword
                }
                label={
                  showPassword
                    ? "Hide new password"
                    : "Show new password"
                }
                onToggle={() =>
                  setShowPassword(
                    (current) =>
                      !current,
                  )
                }
              />
            }
            onChange={(event) =>
              updateField(
                "password",
                event.target.value,
              )
            }
          />

          <div className="rounded-2xl border border-[#eaded5] bg-white/65 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold">
                Password strength
              </p>

              <span className="text-xs font-bold text-ally-primary">
                {strength}/5
              </span>
            </div>

            <div className="mt-3 grid grid-cols-5 gap-2">
              {Array.from({
                length: 5,
              }).map(
                (_, index) => (
                  <div
                    key={index}
                    className={[
                      "h-2 rounded-full transition",
                      index < strength
                        ? "bg-ally-primary"
                        : "bg-[#eaded5]",
                    ].join(" ")}
                  />
                ),
              )}
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {requirements.map(
                (requirement) => (
                  <div
                    key={
                      requirement.label
                    }
                    className={[
                      "flex items-center gap-2 text-xs",
                      requirement.met
                        ? "text-green-700"
                        : "text-slate-500",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "grid h-5 w-5 place-items-center rounded-full",
                        requirement.met
                          ? "bg-green-100"
                          : "bg-slate-100",
                      ].join(" ")}
                    >
                      <Check size={12} />
                    </span>

                    {
                      requirement.label
                    }
                  </div>
                ),
              )}
            </div>
          </div>

          <InputField
            id="security-password-confirmation"
            label="Confirm New Password"
            type={
              showConfirmation
                ? "text"
                : "password"
            }
            value={
              form.password_confirmation
            }
            required
            autoComplete="new-password"
            leftIcon={
              <ShieldCheck
                size={18}
              />
            }
            rightElement={
              <PasswordVisibilityButton
                visible={
                  showConfirmation
                }
                label={
                  showConfirmation
                    ? "Hide password confirmation"
                    : "Show password confirmation"
                }
                onToggle={() =>
                  setShowConfirmation(
                    (current) =>
                      !current,
                  )
                }
              />
            }
            onChange={(event) =>
              updateField(
                "password_confirmation",
                event.target.value,
              )
            }
          />

          {success && (
            <div
              role="status"
              className="flex gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
            >
              <CheckCircle2
                size={19}
                className="shrink-0"
              />

              {success}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <AlertCircle
                size={19}
                className="shrink-0"
              />

              {error}
            </div>
          )}

          <PrimaryButton
            type="submit"
            fullWidth
            isLoading={
              isSubmitting
            }
            loadingText="Changing password..."
            leftIcon={
              <KeyRound size={18} />
            }
          >
            Change Password
          </PrimaryButton>
        </form>

        <Sparkles className="passport-map-mark" />
      </section>
    </>
  );
}

type SecurityNoteProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

function SecurityNote({
  icon,
  title,
  description,
}: SecurityNoteProps) {
  return (
    <article className="flex gap-4 rounded-2xl border border-[#eaded5] bg-white/65 p-4">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-ally-primary">
        {icon}
      </div>

      <div>
        <h3 className="font-bold">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-relaxed text-slate-500">
          {description}
        </p>
      </div>
    </article>
  );
}