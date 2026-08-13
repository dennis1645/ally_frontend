/* =========================================================
   User roles
========================================================= */

export type UserRole =
  | "user"
  | "mentor"
  | "admin"
  | string;

export type UserRoleObject = {
  name?: string;
  slug?: string;
};

/* =========================================================
   Badge types
========================================================= */

export type AuthBadgePivot = {
  user_id:
    | number
    | string;

  badge_id:
    | number
    | string;

  earned_at:
    string;
};

export type AuthBadge = {
  id:
    | number
    | string;

  name:
    string;

  description:
    string;

  icon_url:
    | string
    | null;

  required_xp:
    number;

  created_at?:
    string;

  updated_at?:
    string;

  pivot?:
    AuthBadgePivot;
};

/* =========================================================
   Authenticated user
========================================================= */

export type AuthTargetScholarshipData = {
  id: number;
  name: string;
  provider_country?: string | null;
  description?: string | null;
  funding_type?: string | null;
  degree_level?: string | null;
  start_date?: string | null;
  eligibility_criteria?: string | null;
  application_process?: string | null;
  benefits?: string | null;
  official_website?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  application_link?: string | null;
  deadline_date?: string | null;
  status?: string | null;
  notes?: string | null;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  pivot?: {
    user_id?: number | string;
    scholarship_id?: number | string;
    [key: string]: unknown;
  } | null;
  [key: string]: unknown;
};

export type AuthUser = {
  id:
    | number
    | string;

  name:
    string;

  email:
    string;

  phone_number?:
    | string
    | null;

  email_verified_at?:
    | string
    | null;

  gender?:
    | string
    | null;

  role?:
    | UserRole
    | UserRoleObject;

  status?:
    | string
    | null;

  assigned_mentor_id?:
    | number
    | string
    | null;

  is_premium?:
    boolean;

  premium_until?:
    | string
    | null;

  token_balance?:
    number;

  /* =======================================================
     Profile
  ======================================================= */

  profile_picture?:
    | string
    | null;

  profile_picture_url?:
    | string
    | null;

  headline?:
    | string
    | null;

  bio?:
    | string
    | null;

  linkedin_id?:
    | string
    | null;

  /* =======================================================
     Academic information
  ======================================================= */

  institution_name?:
    | string
    | null;

  education_level?:
    | string
    | null;

  gpa?:
    | string
    | number
    | null;

  undergraduate_major?:
    | string
    | null;

  /* =======================================================
     Scholarship target
  ======================================================= */

  target_degree?:
    | string
    | null;

  target_major?:
    | string
    | null;

  target_country?:
    | string
    | null;

  target_scholarship?:
    | string
    | null;

  primary_scholarship_target?:
    | string
    | null;

  /*
   * Canonical selected scholarship returned by GET /api/profile.
   *
   * Use target_scholarship_id for API calls.
   * Use target_scholarship_data / primary_scholarship_target for display.
   */
  target_scholarship_id?:
    | number
    | string
    | null;

  target_scholarship_data?:
    | AuthTargetScholarshipData
    | null;

  /* =======================================================
     Language
  ======================================================= */

  language_test_name?:
    | string
    | null;

  language_test_score?:
    | string
    | number
    | null;

  /* =======================================================
     Diagnostic readiness
  ======================================================= */

  readiness_score?:
    | number
    | null;

  /* =======================================================
     Expedition / gamification
  ======================================================= */

  expedition_level?:
    | string
    | number
    | null;

  xp_points?:
    number;

  level?:
    number;

  current_streak?:
    number;

  longest_streak?:
    number;

  badges?:
    AuthBadge[];

  /* =======================================================
     Timestamps
  ======================================================= */

  created_at?:
    string;

  updated_at?:
    string;

  deleted_at?:
    | string
    | null;

  /*
   * Allows additional backend fields without breaking
   * the frontend while the profile API continues evolving.
   */
  [key: string]:
    unknown;
};

/* =========================================================
   Login
========================================================= */

export type LoginPayload = {
  email:
    string;

  password:
    string;
};

/* =========================================================
   Registration
========================================================= */

export type RegisterPayload = {
  name:
    string;

  email:
    string;

  phone_number:
    string;

  password:
    string;

  password_confirmation:
    string;

  /*
   * Anonymous diagnostic token.
   *
   * When present, the backend can link the diagnostic result
   * completed before registration to the newly created user.
   */
  guest_token?:
    | string
    | null;
};

/* =========================================================
   Forgot password
========================================================= */

export type ForgotPasswordPayload = {
  email:
    string;
};

/* =========================================================
   Reset password
========================================================= */

export type ResetPasswordPayload = {
  email:
    string;

  token:
    string;

  password:
    string;

  password_confirmation:
    string;
};

/* =========================================================
   Auth session
========================================================= */

export type AuthSession = {
  token:
    string;

  user:
    AuthUser;
};