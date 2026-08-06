import { useState } from "react";

import {
  useForm,
  type SubmitHandler,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { Link } from "react-router";

import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "../schemas/authSchemas";

import {
  forgotPasswordApi,
} from "../api/authApi";

export default function ForgotPasswordPage() {
  const [message, setMessage] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(
      forgotPasswordSchema,
    ),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit: SubmitHandler<
    ForgotPasswordValues
  > = async (values) => {
    setMessage(null);
    setError(null);

    try {
      await forgotPasswordApi(values);

      setMessage(
        "Password reset instructions have been requested. Check your email.",
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to request a password reset.",
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
          Forgot Password
        </h1>

        <p className="mt-2 text-ally-muted">
          Enter the email address connected
          to your Ally account.
        </p>

        <label className="mt-6 block">
          <span className="text-sm font-medium">
            Email Address
          </span>

          <input
            type="email"
            className="mt-2 w-full rounded-xl border px-4 py-3"
            {...form.register("email")}
          />
        </label>

        {form.formState.errors.email
          ?.message && (
          <p className="mt-1 text-sm text-ally-error">
            {
              form.formState.errors.email
                .message
            }
          </p>
        )}

        {message && (
          <div className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">
            {message}
          </div>
        )}

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
            ? "Sending..."
            : "Send Reset Instructions"}
        </button>

        <Link
          to="/auth"
          className="mt-5 block text-center text-sm text-ally-primary"
        >
          Back to Login
        </Link>
      </form>
    </main>
  );
}