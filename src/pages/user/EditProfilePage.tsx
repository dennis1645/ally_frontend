import {
  AlertCircle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  Compass,
  ImagePlus,
  Link as Linkedin,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  Navigate,
  useNavigate,
} from "react-router";

import {
  API_BASE_URL,
  ApiError,
} from "../../api/apiClient";

import {
  updateProfileApi,
  type UpdateProfilePayload,
} from "../../api/profileApi";

import UserLayout from "../../components/layout/UserLayout";

import {
  InputField,
  PrimaryButton,
  SecondaryButton,
} from "../../components/ui";

import {
  useAuth,
} from "../../context/AuthContext";

import type {
  AuthUser,
} from "../../types/auth";

/* =========================================================
   Types
========================================================= */

type ProfileFormState = {
  name: string;
  phone_number: string;
  gender: string;
  headline: string;
  bio: string;
  linkedin_id: string;

  /*
   * Local File selected by the user.
   * Sent to POST /api/update-profile
   * using the field name profile_picture.
   */
  profile_picture: File | null;
};

type FieldErrors =
  Record<string, string | undefined>;

/* =========================================================
   Constants
========================================================= */

const MAX_PROFILE_PICTURE_SIZE =
  2 * 1024 * 1024;

const supportedImageTypes = [
  "image/jpeg",
  "image/png",
];

/* =========================================================
   Image helpers
========================================================= */

function getInitials(
  name: string,
): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase(),
    )
    .join("");

  return initials || "EX";
}

/*
 * GET /api/profile returns:
 *
 * profile_picture_url: string | null
 *
 * This helper converts that returned value into
 * a URL that can be used inside <img src="...">.
 */
function resolveProfilePictureUrl(
  profilePictureUrl:
    | string
    | null
    | undefined,
): string | null {
  if (!profilePictureUrl?.trim()) {
    return null;
  }

  const value =
    profilePictureUrl.trim();

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("blob:") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  try {
    const apiOrigin = new URL(
      API_BASE_URL,
    ).origin;

    return `${apiOrigin}/${value.replace(
      /^\/+/,
      "",
    )}`;
  } catch {
    return value;
  }
}

function formatFileSize(
  size: number,
): string {
  if (size < 1024) {
    return `${size} bytes`;
  }

  if (size < 1024 * 1024) {
    return `${(
      size / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    size /
    (1024 * 1024)
  ).toFixed(2)} MB`;
}

/* =========================================================
   API validation errors
========================================================= */

function getApiFieldErrors(
  error: unknown,
): FieldErrors {
  if (
    !(error instanceof ApiError) ||
    !error.errors
  ) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(
      error.errors,
    ).map(
      ([field, messages]) => {
        if (Array.isArray(messages)) {
          return [
            field,
            messages[0],
          ];
        }

        if (
          typeof messages === "string"
        ) {
          return [
            field,
            messages,
          ];
        }

        return [
          field,
          undefined,
        ];
      },
    ),
  );
}

/* =========================================================
   Page
========================================================= */

export default function EditProfilePage() {
  const navigate = useNavigate();

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const {
    user,
    status,
    refreshProfile,
  } = useAuth();

  const [
    profileForm,
    setProfileForm,
  ] = useState<ProfileFormState>({
    name: "",
    phone_number: "",
    gender: "",
    headline: "",
    bio: "",
    linkedin_id: "",
    profile_picture: null,
  });

  const [
    profileFieldErrors,
    setProfileFieldErrors,
  ] = useState<FieldErrors>({});

  const [
    profileError,
    setProfileError,
  ] = useState<string | null>(
    null,
  );

  const [
    profileSuccess,
    setProfileSuccess,
  ] = useState<string | null>(
    null,
  );

  const [
    isSavingProfile,
    setIsSavingProfile,
  ] = useState(false);

  const [
    imageFailed,
    setImageFailed,
  ] = useState(false);

  /* =======================================================
     Populate form from AuthContext
  ======================================================= */

  useEffect(() => {
    if (!user) {
      return;
    }

    setProfileForm({
      name:
        user.name ?? "",

      phone_number:
        user.phone_number ?? "",

      gender:
        user.gender ?? "",

      headline:
        user.headline ?? "",

      bio:
        user.bio ?? "",

      linkedin_id:
        user.linkedin_id ?? "",

      /*
       * Never place profile_picture_url here.
       *
       * profile_picture represents a local File
       * selected through the file input.
       */
      profile_picture: null,
    });
  }, [user]);

  /* =======================================================
     Local preview for selected upload
  ======================================================= */

  const selectedImagePreview =
    useMemo(() => {
      if (
        !profileForm.profile_picture
      ) {
        return null;
      }

      return URL.createObjectURL(
        profileForm.profile_picture,
      );
    }, [
      profileForm.profile_picture,
    ]);

  useEffect(() => {
    return () => {
      if (selectedImagePreview) {
        URL.revokeObjectURL(
          selectedImagePreview,
        );
      }
    };
  }, [selectedImagePreview]);

  /*
   * Retry image rendering when either:
   * - GET /api/profile returns a new profile_picture_url; or
   * - the user selects a new local File.
   */
  useEffect(() => {
    setImageFailed(false);
  }, [
    user?.profile_picture_url,
    selectedImagePreview,
  ]);

  /* =======================================================
     Auth loading and guard
  ======================================================= */

  if (status === "loading") {
    return (
      <main className="grid min-h-screen place-items-center bg-ally-background">
        <div
          aria-live="polite"
          className="text-center"
        >
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-blue-100 border-t-ally-primary" />

          <p className="mt-4 text-ally-muted">
            Opening your passport
            insert...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/auth"
        replace
      />
    );
  }

  const currentUser: AuthUser =
    user;

  /*
   * Existing stored image:
   *
   * GET /api/profile
   * → profile_picture_url
   */
  const existingProfilePictureUrl =
    resolveProfilePictureUrl(
      currentUser.profile_picture_url,
    );

  /*
   * Display priority:
   *
   * 1. Newly selected local image preview.
   * 2. Existing profile_picture_url.
   * 3. Initials fallback.
   */
  const displayedProfilePicture =
    selectedImagePreview ??
    existingProfilePictureUrl;

  /* =======================================================
     Field updates
  ======================================================= */

  function updateProfileField(
    field: keyof Omit<
      ProfileFormState,
      "profile_picture"
    >,
    value: string,
  ): void {
    setProfileForm(
      (current) => ({
        ...current,
        [field]: value,
      }),
    );

    setProfileFieldErrors(
      (current) => ({
        ...current,
        [field]: undefined,
      }),
    );

    setProfileError(null);
    setProfileSuccess(null);
  }

  /* =======================================================
     Image selection
  ======================================================= */

  function handleProfilePictureChange(
    event:
      ChangeEvent<HTMLInputElement>,
  ): void {
    const file =
      event.target.files?.[0] ??
      null;

    setProfileError(null);
    setProfileSuccess(null);

    if (!file) {
      return;
    }

    if (
      !supportedImageTypes.includes(
        file.type,
      )
    ) {
      setProfileFieldErrors(
        (current) => ({
          ...current,

          profile_picture:
            "Choose a JPG or PNG image.",
        }),
      );

      setProfileError(
        "Profile picture must be a JPG or PNG image.",
      );

      event.target.value = "";

      return;
    }

    if (
      file.size >
      MAX_PROFILE_PICTURE_SIZE
    ) {
      setProfileFieldErrors(
        (current) => ({
          ...current,

          profile_picture:
            "The selected image must be smaller than 2 MB.",
        }),
      );

      setProfileError(
        "Profile picture must be smaller than 2 MB.",
      );

      event.target.value = "";

      return;
    }

    setProfileForm(
      (current) => ({
        ...current,

        /*
         * This File is sent as:
         *
         * FormData:
         * profile_picture = File
         */
        profile_picture: file,
      }),
    );

    setProfileFieldErrors(
      (current) => ({
        ...current,
        profile_picture: undefined,
      }),
    );

    setImageFailed(false);
  }

  /*
   * This removes only the newly selected local File.
   *
   * It does not delete the existing image stored
   * by the backend. The preview returns to the
   * current profile_picture_url.
   */
  function removeSelectedImage(): void {
    setProfileForm(
      (current) => ({
        ...current,
        profile_picture: null,
      }),
    );

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setProfileFieldErrors(
      (current) => ({
        ...current,
        profile_picture: undefined,
      }),
    );

    setProfileError(null);
    setProfileSuccess(null);
    setImageFailed(false);
  }

  /* =======================================================
     Submit update
  ======================================================= */

  async function handleProfileSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    const nextErrors: FieldErrors =
      {};

    if (!profileForm.name.trim()) {
      nextErrors.name =
        "Full name is required.";
    }

    if (
      profileForm.phone_number.trim() &&
      profileForm.phone_number
        .trim()
        .length < 8
    ) {
      nextErrors.phone_number =
        "Enter a valid phone number.";
    }

    if (
      Object.keys(nextErrors)
        .length > 0
    ) {
      setProfileFieldErrors(
        nextErrors,
      );

      setProfileError(
        "Check the marked passport fields and try again.",
      );

      return;
    }

    const payload: UpdateProfilePayload =
      {
        name:
          profileForm.name.trim(),

        phone_number:
          profileForm.phone_number.trim(),

        gender:
          profileForm.gender,

        headline:
          profileForm.headline.trim(),

        bio:
          profileForm.bio.trim(),

        linkedin_id:
          profileForm.linkedin_id.trim(),

        /*
         * POST /api/update-profile:
         *
         * profile_picture is File | null.
         * profile_picture_url is never sent.
         */
        profile_picture:
          profileForm.profile_picture,
      };

    setIsSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(null);
    setProfileFieldErrors({});

    try {
      await updateProfileApi(
        payload,
      );

      /*
       * Fetch the profile again so the
       * AuthContext receives the latest:
       *
       * profile_picture_url
       */
      await refreshProfile();

      setProfileForm(
        (current) => ({
          ...current,
          profile_picture: null,
        }),
      );

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }

      setImageFailed(false);

      setProfileSuccess(
        "Your Explorer Passport has been updated successfully.",
      );
    } catch (error) {
      setProfileFieldErrors(
        getApiFieldErrors(error),
      );

      setProfileError(
        error instanceof Error
          ? error.message
          : "Unable to update your Explorer Passport.",
      );
    } finally {
      setIsSavingProfile(false);
    }
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <UserLayout
      title="Explorer Passport"
      subtitle="Personal Explorer Journal"
      topbarProps={{
        showSearch: false,

        actions: (
          <SecondaryButton
            size="sm"
            leftIcon={
              <ArrowLeft
                size={17}
              />
            }
            onClick={() =>
              navigate("/profile")
            }
          >
            Return to Passport
          </SecondaryButton>
        ),
      }}
    >
      <section className="relative min-h-[calc(100vh-80px)] bg-ally-background">
        <div className="passport-book-stage">
          <div className="passport-book-shell">
            <div className="passport-book">
              <div className="passport-book-fold" />

              <div className="passport-book-spread book-page-turn-next">
                <form
                  onSubmit={(event) => {
                    void handleProfileSubmit(
                      event,
                    );
                  }}
                  className="contents"
                >
                  {/* =======================================
                      Left page — Identity
                  ======================================= */}

                  <section className="passport-paper passport-paper-left">
                    <div className="passport-page-heading">
                      <div>
                        <p className="passport-page-kicker">
                          Personal Information
                        </p>

                        <h2>
                          Edit Profile
                        </h2>
                      </div>

                      <span>
                        PAGE 03
                      </span>
                    </div>

                    <div className="mt-7">
                      <div className="passport-edit-photo-card">
                        <div className="relative mx-auto w-fit">
                          <div className="passport-edit-photo-frame">
                            {displayedProfilePicture &&
                            !imageFailed ? (
                              <img
                                src={
                                  displayedProfilePicture
                                }
                                alt={`${currentUser.name}'s profile`}
                                className="h-full w-full object-cover"
                                onError={() =>
                                  setImageFailed(
                                    true,
                                  )
                                }
                              />
                            ) : (
                              <div className="grid h-full w-full place-items-center bg-blue-50 text-4xl font-extrabold text-ally-primary">
                                {getInitials(
                                  currentUser.name,
                                )}
                              </div>
                            )}
                          </div>

                          <div className="passport-edit-camera-badge">
                            <Camera
                              size={19}
                            />
                          </div>

                          <div className="passport-edit-verified-stamp">
                            <ShieldCheck
                              size={22}
                            />

                            <span>
                              EXPLORER
                            </span>
                          </div>
                        </div>

                        <label
                          htmlFor="profile-picture"
                          className="passport-profile-upload"
                        >
                          <ImagePlus
                            size={18}
                          />

                          <span>
                            Choose New
                            Picture
                          </span>
                        </label>

                        <input
                          ref={
                            fileInputRef
                          }
                          id="profile-picture"
                          type="file"
                          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                          className="sr-only"
                          onChange={
                            handleProfilePictureChange
                          }
                        />

                        {profileFieldErrors.profile_picture && (
                          <p className="mt-2 text-center text-xs text-red-600">
                            {
                              profileFieldErrors.profile_picture
                            }
                          </p>
                        )}

                        {profileForm.profile_picture ? (
                          <div className="passport-selected-file">
                            <div className="min-w-0">
                              <p className="break-all text-xs font-bold text-slate-700">
                                {
                                  profileForm
                                    .profile_picture
                                    .name
                                }
                              </p>

                              <p className="mt-1 text-[11px] text-slate-500">
                                {formatFileSize(
                                  profileForm
                                    .profile_picture
                                    .size,
                                )}{" "}
                                · New photo
                                selected
                              </p>
                            </div>

                            <button
                              type="button"
                              aria-label="Remove selected image"
                              title="Remove selected image"
                              onClick={
                                removeSelectedImage
                              }
                              className="passport-remove-file"
                            >
                              <X
                                size={15}
                              />
                            </button>
                          </div>
                        ) : (
                          <p className="mt-3 text-center text-xs leading-relaxed text-slate-500">
                            JPG or PNG,
                            maximum 2 MB.
                          </p>
                        )}
                      </div>

                      <div className="mt-7 space-y-5">
                        <InputField
                          id="profile-name"
                          label="Full Name"
                          value={
                            profileForm.name
                          }
                          required
                          error={
                            profileFieldErrors.name
                          }
                          leftIcon={
                            <User
                              size={18}
                            />
                          }
                          onChange={(event) =>
                            updateProfileField(
                              "name",
                              event.target
                                .value,
                            )
                          }
                        />

                        <InputField
                          id="profile-email"
                          label="Email Address"
                          type="email"
                          value={
                            currentUser.email
                          }
                          disabled
                          leftIcon={
                            <Mail
                              size={18}
                            />
                          }
                          helperText="Email changes require account verification."
                        />

                        <InputField
                          id="profile-phone"
                          label="Phone Number"
                          type="tel"
                          value={
                            profileForm.phone_number
                          }
                          error={
                            profileFieldErrors.phone_number
                          }
                          leftIcon={
                            <Phone
                              size={18}
                            />
                          }
                          placeholder="081234567890"
                          onChange={(event) =>
                            updateProfileField(
                              "phone_number",
                              event.target
                                .value,
                            )
                          }
                        />

                        <div>
                          <label
                            htmlFor="profile-gender"
                            className="passport-field-label"
                          >
                            Gender
                          </label>

                          <select
                            id="profile-gender"
                            value={
                              profileForm.gender
                            }
                            aria-invalid={Boolean(
                              profileFieldErrors.gender,
                            )}
                            onChange={(event) =>
                              updateProfileField(
                                "gender",
                                event
                                  .target
                                  .value,
                              )
                            }
                            className={[
                              "passport-form-control mt-2",

                              profileFieldErrors.gender
                                ? "border-red-400"
                                : "",
                            ].join(" ")}
                          >
                            <option value="">
                              Select
                              gender
                            </option>

                            <option value="male">
                              Male
                            </option>

                            <option value="female">
                              Female
                            </option>

                            <option value="other">
                              Prefer not
                              to say
                            </option>
                          </select>

                          {profileFieldErrors.gender && (
                            <p className="mt-1.5 text-sm text-red-600">
                              {
                                profileFieldErrors.gender
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <Compass className="passport-compass-mark" />
                  </section>

                  {/* =======================================
                      Right page — Explorer story
                  ======================================= */}

                  <section className="passport-paper passport-paper-right">
                    <div className="passport-page-heading">
                      <div>
                        <p className="passport-page-kicker">
                          More about you
                        </p>

                        <h2>
                          Explorer Notes
                        </h2>
                      </div>

                      <span>
                        PAGE 04
                      </span>
                    </div>

                    <div className="mt-7 space-y-5">
                      <div className="passport-edit-note">
                        <div className="passport-edit-note-icon">
                          <Compass
                            size={21}
                          />
                        </div>

                        <div>
                          <p className="passport-handwritten">
                            Guide&apos;s
                            note
                          </p>

                          <p className="mt-1 text-sm leading-relaxed text-slate-600">
                            Keep your
                            explorer identity
                            accurate so Ally
                            can guide your
                            scholarship route
                            more effectively.
                          </p>
                        </div>
                      </div>

                      <InputField
                        id="profile-headline"
                        label="Professional Headline"
                        value={
                          profileForm.headline
                        }
                        error={
                          profileFieldErrors.headline
                        }
                        placeholder="Aspiring frontend developer"
                        onChange={(event) =>
                          updateProfileField(
                            "headline",
                            event.target
                              .value,
                          )
                        }
                      />

                      <InputField
                        id="profile-linkedin"
                        label="LinkedIn ID or URL"
                        value={
                          profileForm.linkedin_id
                        }
                        error={
                          profileFieldErrors.linkedin_id
                        }
                        leftIcon={
                          <Linkedin
                            size={18}
                          />
                        }
                        placeholder="your-linkedin-id"
                        helperText="Enter your LinkedIn username or complete profile URL."
                        onChange={(event) =>
                          updateProfileField(
                            "linkedin_id",
                            event.target
                              .value,
                          )
                        }
                      />

                      <div>
                        <label
                          htmlFor="profile-bio"
                          className="passport-field-label"
                        >
                          Explorer
                          Biography
                        </label>

                        <textarea
                          id="profile-bio"
                          rows={9}
                          value={
                            profileForm.bio
                          }
                          aria-invalid={Boolean(
                            profileFieldErrors.bio,
                          )}
                          placeholder="Write about your background, interests, and scholarship goals."
                          onChange={(event) =>
                            updateProfileField(
                              "bio",
                              event.target
                                .value,
                            )
                          }
                          className={[
                            "passport-form-control passport-journal-lines mt-2 resize-y leading-8",

                            profileFieldErrors.bio
                              ? "border-red-400"
                              : "",
                          ].join(" ")}
                        />

                        {profileFieldErrors.bio && (
                          <p className="mt-1.5 text-sm text-red-600">
                            {
                              profileFieldErrors.bio
                            }
                          </p>
                        )}
                      </div>

                      {profileSuccess && (
                        <div
                          role="status"
                          className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
                        >
                          <CheckCircle2
                            size={19}
                            className="mt-0.5 shrink-0"
                          />

                          <span>
                            {
                              profileSuccess
                            }
                          </span>
                        </div>
                      )}

                      {profileError && (
                        <div
                          role="alert"
                          className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                        >
                          <AlertCircle
                            size={19}
                            className="mt-0.5 shrink-0"
                          />

                          <span>
                            {profileError}
                          </span>
                        </div>
                      )}

                      <div className="passport-edit-actions">
                        <SecondaryButton
                          type="button"
                          disabled={
                            isSavingProfile
                          }
                          leftIcon={
                            <ArrowLeft
                              size={17}
                            />
                          }
                          onClick={() =>
                            navigate(
                              "/profile",
                            )
                          }
                        >
                          Cancel
                        </SecondaryButton>

                        <PrimaryButton
                          type="submit"
                          isLoading={
                            isSavingProfile
                          }
                          loadingText="Stamping changes..."
                          leftIcon={
                            <Save
                              size={18}
                            />
                          }
                        >
                          Save Passport
                        </PrimaryButton>
                      </div>

                      <div className="passport-edit-footer-note">
                        <ShieldCheck
                          size={17}
                        />

                        <p>
                          Your saved
                          information will
                          appear immediately
                          in the Profile
                          section of your
                          Explorer Passport.
                        </p>
                      </div>
                    </div>

                    <Sparkles className="passport-map-mark" />
                  </section>
                </form>
              </div>
            </div>

            <div className="passport-edit-insert-tab">
              <User size={18} />

              <span>
                Edit Profile
              </span>
            </div>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}