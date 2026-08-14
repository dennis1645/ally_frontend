import {
  CalendarDays,
  Compass,
  Edit3,
  Globe2,
  Link as Linkedin,
  LockKeyhole,
  Mail,
  MapPinned,
  Phone,
  ShieldCheck,
  Star,
  Target,
  User,
  type LucideIcon,
} from "lucide-react";

import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router";

import {
  API_BASE_URL,
} from "../../api/apiClient";

import UserLayout from "../../components/layout/UserLayout";

import JourneyLogSpread from "../../components/profile/JourneyLogSpread";
import SecuritySpread from "../../components/profile/SecuritySpread";

import {
  useAuth,
} from "../../context/AuthContext";

import type {
  AuthUser,
  UserRoleObject,
} from "../../types/auth";

/* =========================================================
   Types
========================================================= */

type BookSection =
  | "profile"
  | "journey"
  | "security";

type TurnDirection =
  | "next"
  | "previous";

type Bookmark = {
  id: BookSection;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  color: string;
  activeColor: string;
};

type InformationItemProps = {
  icon: ReactNode;
  label: string;
  value: ReactNode;
};

/* =========================================================
   Passport navigation
========================================================= */

const sectionOrder: BookSection[] = [
  "profile",
  "journey",
  "security",
];

const sectionPathMap: Record<
  BookSection,
  string
> = {
  profile: "/profile",
  journey: "/profile/journey-log",
  security: "/profile/security",
};

function getSectionFromPath(
  pathname: string,
): BookSection {
  if (
    pathname.startsWith(
      "/profile/journey-log",
    )
  ) {
    return "journey";
  }

  if (
    pathname.startsWith(
      "/profile/security",
    )
  ) {
    return "security";
  }

  return "profile";
}

const bookmarks: Bookmark[] = [
  {
    id: "profile",
    label: "Profile",
    shortLabel: "Profile",
    icon: Compass,
    color: "#6ba8e6",
    activeColor: "#16629b",
  },
  {
    id: "journey",
    label: "Journey Log",
    shortLabel: "Journal",
    icon: CalendarDays,
    color: "#c7a8f5",
    activeColor: "#7047a8",
  },
  {
    id: "security",
    label: "Security",
    shortLabel: "Security",
    icon: LockKeyhole,
    color: "#ff9f9f",
    activeColor: "#a83f3f",
  },
];

/* =========================================================
   Reusable information card
========================================================= */

function InformationItem({
  icon,
  label,
  value,
}: InformationItemProps) {
  return (
    <div className="rounded-2xl border border-[#eaded5] bg-white/70 p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-ally-primary">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#7a582f]">
            {label}
          </p>

          {typeof value === "string" ? (
            <p className="mt-1 break-words font-semibold text-slate-800">
              {value}
            </p>
          ) : (
            value
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Formatting helpers
========================================================= */

function formatText(
  value:
    | string
    | null
    | undefined,
): string {
  if (!value?.trim()) {
    return "Not provided";
  }

  return value
    .trim()
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    );
}

function formatOptionalValue(
  value:
    | string
    | number
    | null
    | undefined,
): string {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return "Not provided";
  }

  return String(value);
}

function getRoleName(
  role: AuthUser["role"],
): string {
  if (typeof role === "string") {
    return formatText(role);
  }

  if (
    role &&
    typeof role === "object"
  ) {
    const roleObject =
      role as UserRoleObject;

    return formatText(
      roleObject.name ??
        roleObject.slug,
    );
  }

  return "Explorer";
}

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

function getProfilePictureUrl(
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

function getLinkedInUrl(
  linkedinId:
    | string
    | null
    | undefined,
): string | null {
  if (!linkedinId?.trim()) {
    return null;
  }

  const value =
    linkedinId.trim();

  if (
    value.startsWith("https://") ||
    value.startsWith("http://")
  ) {
    return value;
  }

  return `https://www.linkedin.com/in/${value}`;
}

/* =========================================================
   Backend compatibility helpers

   The newest backend collection documents GET /api/profile
   as the canonical profile source, but it does not include a
   sample response body. These helpers therefore prefer the
   newest documented/canonical fields while keeping safe
   fallbacks for older profile payloads.
========================================================= */

type BackendRecord =
  Record<string, unknown>;

function isBackendRecord(
  value: unknown,
): value is BackendRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function getNonEmptyString(
  value: unknown,
): string | null {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const normalized =
    value.trim();

  return normalized || null;
}

function getNestedString(
  value: unknown,
  keys: string[],
): string | null {
  if (!isBackendRecord(value)) {
    return null;
  }

  for (const key of keys) {
    const candidate =
      getNonEmptyString(
        value[key],
      );

    if (candidate) {
      return candidate;
    }
  }

  return null;
}

function getProfilePictureValue(
  user: AuthUser,
): string | null {
  return (
    getNonEmptyString(
      user.profile_picture_url,
    ) ??
    getNonEmptyString(
      user.profile_picture,
    )
  );
}

function getScholarshipDisplayName(
  user: AuthUser,
): string {
  const userRecord =
    user as BackendRecord;

  const canonicalScholarshipData =
    userRecord.target_scholarship_data;

  const nestedName =
    getNestedString(
      canonicalScholarshipData,
      [
        "name",
        "title",
      ],
    );

  if (nestedName) {
    return nestedName;
  }

  const primaryTarget =
    getNonEmptyString(
      userRecord.primary_scholarship_target,
    );

  if (primaryTarget) {
    return primaryTarget;
  }

  const legacyTarget =
    getNonEmptyString(
      userRecord.target_scholarship,
    );

  return (
    legacyTarget ??
    "Not provided"
  );
}

function getTargetDegreeDisplay(
  user: AuthUser,
): string {
  const userRecord =
    user as BackendRecord;

  const directTargetDegree =
    getNonEmptyString(
      userRecord.target_degree,
    );

  if (directTargetDegree) {
    return formatText(
      directTargetDegree,
    );
  }

  const scholarshipDegree =
    getNestedString(
      userRecord.target_scholarship_data,
      [
        "degree_level",
        "degree",
        "target_degree",
      ],
    );

  return scholarshipDegree
    ? formatText(
        scholarshipDegree,
      )
    : "Not provided";
}

function getTargetCountryDisplay(
  user: AuthUser,
): string {
  const userRecord =
    user as BackendRecord;

  const directTargetCountry =
    getNonEmptyString(
      userRecord.target_country,
    );

  if (directTargetCountry) {
    return directTargetCountry;
  }

  const scholarshipCountry =
    getNestedString(
      userRecord.target_scholarship_data,
      [
        "provider_country",
        "country",
        "target_country",
      ],
    );

  return (
    scholarshipCountry ??
    "Not provided"
  );
}

function normalizeReadinessScore(
  value: unknown,
): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(0, parsed),
  );
}

/* =========================================================
   Main page
========================================================= */

export default function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    user,
    status,
  } = useAuth();

  const [
    activeSection,
    setActiveSection,
  ] = useState<BookSection>(() =>
    getSectionFromPath(
      location.pathname,
    ),
  );

  const [
    turnDirection,
    setTurnDirection,
  ] = useState<TurnDirection>(
    "next",
  );

  const [
    imageFailed,
    setImageFailed,
  ] = useState(false);

  useEffect(() => {
    setActiveSection(
      getSectionFromPath(
        location.pathname,
      ),
    );
  }, [location.pathname]);

  useEffect(() => {
    setImageFailed(false);
  }, [
    user?.profile_picture_url,
    user?.profile_picture,
  ]);

  if (status === "loading") {
    return (
      <main className="grid min-h-screen place-items-center bg-ally-background">
        <div
          aria-live="polite"
          className="text-center"
        >
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-blue-100 border-t-ally-primary" />

          <p className="mt-4 text-ally-muted">
            Opening your explorer
            passport...
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

  const currentUser: AuthUser = user;

  const profilePictureUrl =
    getProfilePictureUrl(
      getProfilePictureValue(
        currentUser,
      ),
    );

  const linkedInUrl =
    getLinkedInUrl(
      currentUser.linkedin_id,
    );

  const roleName =
    getRoleName(
      currentUser.role,
    );

  const readinessScore =
    normalizeReadinessScore(
      currentUser.readiness_score,
    );

  // Formatting Phone Number to display with +62
  let rawPhone = currentUser.phone_number?.trim() || "";
  let phoneDisplayStr = rawPhone;
  let hasPhone = false;

  if (rawPhone) {
    hasPhone = true;
    if (rawPhone.startsWith("+62")) {
      phoneDisplayStr = rawPhone.substring(3);
    } else if (rawPhone.startsWith("62")) {
      phoneDisplayStr = rawPhone.substring(2);
    } else if (rawPhone.startsWith("0")) {
      phoneDisplayStr = rawPhone.substring(1);
    }
  }

  function changeSection(
    nextSection: BookSection,
  ): void {
    if (
      nextSection === activeSection
    ) {
      const expectedPath =
        sectionPathMap[nextSection];

      if (
        location.pathname !==
        expectedPath
      ) {
        navigate(expectedPath);
      }

      return;
    }

    const currentIndex =
      sectionOrder.indexOf(
        activeSection,
      );

    const nextIndex =
      sectionOrder.indexOf(
        nextSection,
      );

    setTurnDirection(
      nextIndex > currentIndex
        ? "next"
        : "previous",
    );

    setActiveSection(nextSection);

    navigate(
      sectionPathMap[nextSection],
    );
  }

  /* =======================================================
     Profile spread — Pages 01 and 02
  ======================================================= */

  function renderProfileSection() {
    return (
      <>
        {/* Left page */}
        <section className="passport-paper passport-paper-left">
          <div className="passport-page-heading">
            <div>
              <p className="passport-page-kicker">
                Explorer Identity
              </p>

              <h2>Profile</h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Edit profile"
                title="Edit profile"
                onClick={() =>
                  navigate(
                    "/profile/edit",
                  )
                }
                className="profile-edit-pencil"
              >
                <Edit3 size={18} />
              </button>

              <span className="passport-page-kicker">
                PAGE 01
              </span>
            </div>
          </div>

          <div className="relative mt-7">
            <div className="grid gap-6 sm:grid-cols-[150px_minmax(0,1fr)]">
              {/* WADAH FOTO DIKUNCI LEBARNYA AGAR STEMPEL TIDAK GESER */}
              <div className="relative mx-auto w-[140px] sm:mx-0">
                <div className="-rotate-2 overflow-hidden rounded-xl border-4 border-[#ffe3d2] bg-white p-1 shadow-md">
                  <div className="h-44 w-full overflow-hidden rounded-lg bg-blue-50">
                    {profilePictureUrl &&
                    !imageFailed ? (
                      <img
                        src={
                          profilePictureUrl
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
                      <div className="grid h-full w-full place-items-center text-4xl font-extrabold text-ally-primary">
                        {getInitials(
                          currentUser.name,
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* POSISI STEMPEL DIMASUKKAN LEBIH KE KIRI AGAR AMAN */}
                <div className="passport-valid-stamp absolute -bottom-1 -right-1 z-10 rotate-12">
                  <ShieldCheck
                    size={27}
                  />

                  <span>VALID</span>
                </div>
              </div>

              <div>
                <p className="passport-field-label">
                  Full Name
                </p>

                <h3 className="border-b border-[#ffdcc6] pb-3 text-2xl font-extrabold text-[#2c1607]">
                  {currentUser.name}
                </h3>

                <div className="mt-5 space-y-4">
                  <div>
                    <p className="passport-field-label">
                      Explorer ID
                    </p>

                    <p className="font-mono font-semibold text-ally-primary">
                      ALLY-
                      {currentUser.id}
                    </p>
                  </div>

                  <div>
                    <p className="passport-field-label">
                      Role
                    </p>

                    <p className="font-semibold">
                      {roleName}
                    </p>
                  </div>

                  <div>
                    <p className="passport-field-label">
                      Headline
                    </p>

                    <p className="text-sm leading-relaxed text-slate-600">
                      {currentUser.headline?.trim() ||
                        "No explorer headline has been added yet."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-9 grid gap-3 sm:grid-cols-2">
              <InformationItem
                icon={
                  <Mail size={18} />
                }
                label="Email"
                value={
                  currentUser.email
                }
              />

              <InformationItem
                icon={
                  <Phone size={18} />
                }
                label="Phone"
                value={
                  hasPhone ? (
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded bg-slate-200 px-1.5 py-0.5 text-xs font-bold text-slate-700">
                        🇮🇩 +62
                      </span>
                      <span className="font-semibold text-slate-800">
                        {phoneDisplayStr}
                      </span>
                    </div>
                  ) : (
                    <span className="mt-1 block font-semibold text-slate-800">
                      Not provided
                    </span>
                  )
                }
              />

              <InformationItem
                icon={
                  <User size={18} />
                }
                label="Gender"
                value={formatText(
                  currentUser.gender,
                )}
              />

              <InformationItem
                icon={
                  <Linkedin
                    size={18}
                  />
                }
                label="LinkedIn"
                value={
                  currentUser.linkedin_id?.trim() ||
                  "Not provided"
                }
              />
            </div>

            {linkedInUrl && (
              <a
                href={linkedInUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-ally-primary hover:underline"
              >
                <Linkedin size={17} />

                Open LinkedIn profile
              </a>
            )}
          </div>

          <Compass className="passport-compass-mark" />
        </section>

        {/* Right page */}
        <section className="passport-paper passport-paper-right">
          <div className="passport-page-heading">
            <div>
              <p className="passport-page-kicker">
                Journey Record
              </p>

              <h2>Expedition</h2>
            </div>

            <span>PAGE 02</span>
          </div>

          <div className="mt-7">
            <div className="rounded-2xl border border-[#ffdcc6] bg-white/75 p-5 shadow-[0_4px_0_#e7cab2]">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="passport-field-label">
                    Current Level
                  </p>

                  <h3 className="mt-1 flex items-center gap-2 text-xl font-bold">
                    <Star
                      size={21}
                      className="text-[#d58a18]"
                    />

                    {currentUser.expedition_level !==
                      null &&
                    currentUser.expedition_level !==
                      undefined
                      ? `Level ${currentUser.expedition_level} Explorer`
                      : "Not calculated yet"}
                  </h3>
                </div>

                <span className="font-bold text-ally-primary">
                  {readinessScore}%
                </span>
              </div>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#ffdcc6]">
                <div
                  className="h-full rounded-full bg-ally-primary transition-all"
                  style={{
                    width: `${readinessScore}%`,
                  }}
                />
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Scholarship readiness
                progress
              </p>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <InformationItem
                icon={
                  <Target size={18} />
                }
                label="Target Degree"
                value={
                  getTargetDegreeDisplay(
                    currentUser,
                  )
                }
              />

              <InformationItem
                icon={
                  <MapPinned
                    size={18}
                  />
                }
                label="Target Major"
                value={formatOptionalValue(
                  currentUser.target_major,
                )}
              />

              <InformationItem
                icon={
                  <Globe2 size={18} />
                }
                label="Target Country"
                value={
                  getTargetCountryDisplay(
                    currentUser,
                  )
                }
              />

              <InformationItem
                icon={
                  <Compass size={18} />
                }
                label="Scholarship"
                value={
                  getScholarshipDisplayName(
                    currentUser,
                  )
                }
              />
            </div>

            <div className="mt-7 rotate-[-1deg] rounded-2xl border-2 border-dashed border-[#c69c6e] bg-[#fff8e8] p-5">
              <h2 className="text-lg font-bold tracking-tight text-[#2c1607]">
                Explorer's note
              </h2>

              <p className="mt-2 leading-relaxed text-slate-600">
                {currentUser.bio?.trim() ||
                  "Your personal story will grow here as your scholarship journey develops."}
              </p>
            </div>
          </div>

          <Target className="passport-map-mark" />
        </section>
      </>
    );
  }

  /* =======================================================
     Render active passport section
  ======================================================= */

  function renderCurrentSection() {
    switch (activeSection) {
      case "journey":
        return (
          <JourneyLogSpread />
        );

      case "security":
        return (
          <SecuritySpread />
        );

      case "profile":
      default:
        return renderProfileSection();
    }
  }

  /* =======================================================
     Main layout
  ======================================================= */

  return (
    <UserLayout
      title="Explorer Passport"
      subtitle="Personal Explorer Journal"
      topbarProps={{
        showSearch: false,
      }}
    >
      <section className="relative min-h-[calc(100vh-80px)] bg-ally-background">
        <div className="passport-book-stage">
          <div className="passport-book-shell">
            <div className="passport-book">
              <div className="passport-book-fold" />

              <div
                key={activeSection}
                className={[
                  "passport-book-spread",
                  turnDirection === "next"
                    ? "book-page-turn-next"
                    : "book-page-turn-previous",
                ].join(" ")}
              >
                {renderCurrentSection()}
              </div>
            </div>

            {/* Desktop bookmarks */}
            <nav
              aria-label="Passport sections"
              className="passport-bookmark-rail"
            >
              {bookmarks.map(
                (bookmark) => {
                  const Icon =
                    bookmark.icon;

                  const isActive =
                    activeSection ===
                    bookmark.id;

                  return (
                    <button
                      key={bookmark.id}
                      type="button"
                      aria-current={
                        isActive
                          ? "page"
                          : undefined
                      }
                      onClick={() =>
                        changeSection(
                          bookmark.id,
                        )
                      }
                      className={[
                        "passport-bookmark-tab",
                        isActive
                          ? "is-active"
                          : "",
                      ].join(" ")}
                      style={{
                        backgroundColor:
                          isActive
                            ? bookmark.activeColor
                            : bookmark.color,
                      }}
                    >
                      <Icon size={19} />

                      <span>
                        {bookmark.label}
                      </span>
                    </button>
                  );
                },
              )}
            </nav>
          </div>
        </div>

        {/* Mobile bookmarks */}
        <nav
          aria-label="Passport sections"
          className="passport-mobile-tabs"
        >
          {bookmarks.map(
            (bookmark) => {
              const Icon =
                bookmark.icon;

              const isActive =
                activeSection ===
                bookmark.id;

              return (
                <button
                  key={bookmark.id}
                  type="button"
                  aria-current={
                    isActive
                      ? "page"
                      : undefined
                  }
                  onClick={() =>
                    changeSection(
                      bookmark.id,
                    )
                  }
                  className={
                    isActive
                      ? "is-active"
                      : ""
                  }
                >
                  <span
                    className="passport-mobile-tab-icon"
                    style={{
                      backgroundColor:
                        isActive
                          ? bookmark.activeColor
                          : "transparent",
                    }}
                  >
                    <Icon size={20} />
                  </span>

                  <span>
                    {bookmark.shortLabel}
                  </span>
                </button>
              );
            },
          )}
        </nav>
      </section>
    </UserLayout>
  );
}