import { z } from "zod";

const phoneNumberSchema = z
  .string()
  .trim()
  .min(8, "Phone number must contain at least 8 digits.")
  .max(20, "Phone number is too long.")
  .regex(
    /^\+?[0-9\s-]+$/,
    "Enter a valid phone number.",
  );

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),

  password: z
    .string()
    .min(1, "Password is required."),

  rememberMe: z.boolean(),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Enter your full name."),

    email: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .email("Enter a valid email address."),

    phone_number: phoneNumberSchema,

    password: z
      .string()
      .min(
        8,
        "Password must contain at least 8 characters.",
      ),

    password_confirmation: z
      .string()
      .min(1, "Confirm your password."),

    acceptTerms: z.boolean(),
  })
  .refine(
    (values) =>
      values.password ===
      values.password_confirmation,
    {
      message: "Passwords do not match.",
      path: ["password_confirmation"],
    },
  )
  .refine(
    (values) => values.acceptTerms,
    {
      message:
        "You must accept the Terms and Privacy Policy.",
      path: ["acceptTerms"],
    },
  );

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
});

export const resetPasswordSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email("Enter a valid email address."),

    token: z
      .string()
      .trim()
      .min(1, "Reset token is required."),

    password: z
      .string()
      .min(
        8,
        "Password must contain at least 8 characters.",
      ),

    password_confirmation: z.string(),
  })
  .refine(
    (values) =>
      values.password ===
      values.password_confirmation,
    {
      message: "Passwords do not match.",
      path: ["password_confirmation"],
    },
  );

export type LoginValues =
  z.infer<typeof loginSchema>;

export type RegisterValues =
  z.infer<typeof registerSchema>;

export type ForgotPasswordValues =
  z.infer<typeof forgotPasswordSchema>;

export type ResetPasswordValues =
  z.infer<typeof resetPasswordSchema>;