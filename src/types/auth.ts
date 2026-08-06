export type UserRole =
  | "user"
  | "mentor"
  | "admin"
  | string;

export type UserRoleObject = {
  name?: string;
  slug?: string;
};

export type AuthUser = {
  id: number | string;
  name: string;
  email: string;

  phone_number?: string | null;
  gender?: string | null;
  headline?: string | null;
  bio?: string | null;
  linkedin_id?: string | null;
  profile_picture?: string | null;
  profile_picture_url?: string | null;


  is_premium?: boolean;
  role?: UserRole | UserRoleObject;

  /*
   * These fields are optional because they may be added
   * through onboarding or later backend development.
   */
  institution_name?: string | null;
  education_level?: string | null;
  gpa?: string | number | null;

  target_degree?: string | null;
  target_major?: string | null;
  target_country?: string | null;
  target_scholarship?: string | null;

  language_test_name?: string | null;
  language_test_score?: string | number | null;

  expedition_level?: string | number | null;
  readiness_score?: number | null;

  [key: string]: unknown;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  phone_number: string;
  password: string;
  password_confirmation: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};