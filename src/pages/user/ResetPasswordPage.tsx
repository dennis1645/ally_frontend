import { useState } from "react";

import {
  useForm,
  type SubmitHandler,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  useNavigate,
  useSearchParams,
} from "react-router";

import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "../../schemas/authSchemas";

import {
  resetPasswordApi,
} from "../../api/authApi";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] =
    useSearchParams();

  const [error, setError] =
    useState<string | null>(null);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(
      resetPasswordSchema,
    ),
    defaultValues: {
      email:
        searchParams.get("email") ?? "",
      token:
        searchParams.get("token") ?? "",
      password: "",
      password_confirmation: "",
    },
  });

  const handleSubmit: SubmitHandler<
    ResetPasswordValues
  > = async (values) => {
    setError(null);

    try {
      await resetPasswordApi(values);

      navigate("/auth", {
        replace: true,
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to reset the password.",
      );
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-ally-background p-6">
      <form
        onSubmit={form.handleSubmit(
          handleSubmit,
        )}
        className="w-full max-w-md rounded-3xl border border-ally-border bg-white p-8"
      >
        <h1 className="text-2xl font-semibold">
          Create a New Password
        </h1>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium">
              Email
            </span>

            <input
              type="email"
              className="mt-2 w-full rounded-xl border px-4 py-3"
              {...form.register("email")}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">
              Reset Token
            </span>

            <input
              type="text"
              className="mt-2 w-full rounded-xl border px-4 py-3"
              {...form.register("token")}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">
              New Password
            </span>

            <input
              type="password"
              className="mt-2 w-full rounded-xl border px-4 py-3"
              {...form.register("password")}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">
              Confirm New Password
            </span>

            <input
              type="password"
              className="mt-2 w-full rounded-xl border px-4 py-3"
              {...form.register(
                "password_confirmation",
              )}
            />
          </label>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-ally-error">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="mt-6 w-full rounded-xl bg-ally-blue px-4 py-3 font-medium text-white disabled:opacity-60"
        >
          {form.formState.isSubmitting
            ? "Updating..."
            : "Update Password"}
        </button>
      </form>
    </main>
  );
}