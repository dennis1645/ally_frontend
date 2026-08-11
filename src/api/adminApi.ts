import { API_BASE_URL, apiRequest, ApiError } from "./apiClient";

/* =========================================================
   Admin Users
========================================================= */

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  phoneNumber: string | null;
  emailVerifiedAt: string | null;
  gender: string | null;
  role: string;
  assignedMentorId: number | string | null;
  isPremium: boolean;
  status: string;
  readinessScore: number | null;
  gpa: number | string | null;
  undergraduateMajor: string | null;
  targetMajor: string | null;
  primaryScholarshipTarget: string | null;
  tokenBalance: number;
  premiumUntil: string | null;
  profilePictureUrl: string | null;
  headline: string | null;
  bio: string | null;
  linkedinId: string | null;
  xpPoints: number;
  currentStreak: number;
  isStreakFrozen: boolean;
  longestStreak: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  level: number;
};

export type CreateAdminUserPayload = {
  name: string;
  email: string;
  phone_number: string;
  gender: string | null;
  role: string;
  password: string;
  is_premium: boolean;
};

export type UpdateAdminUserPayload = Partial<{
  name: string;
  email: string;
  phone_number: string;
  gender: string | null;
  role: string;
  assigned_mentor_id: number | string | null;
  is_premium: boolean;
  status: string;
  headline: string | null;
  bio: string | null;
}>;

export type UpdateAdminUserPasswordPayload = {
  password: string;
  password_confirmation: string;
};

function normalizeAdminUser(value: unknown): AdminUser | null {
  if (!isRecord(value)) {
    return null;
  }

  const rawId = value.id;
  const rawName = value.name;
  const rawEmail = value.email;

  if (
    typeof rawId !== "number" ||
    typeof rawName !== "string" ||
    typeof rawEmail !== "string"
  ) {
    return null;
  }

  const numberOrNull = (input: unknown): number | null => {
    if (input === null || input === undefined || input === "") {
      return null;
    }

    const parsed = Number(input);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const stringOrNull = (input: unknown): string | null => {
    if (typeof input !== "string") {
      return null;
    }

    const trimmed = input.trim();
    return trimmed ? trimmed : null;
  };

  const rawAssignedMentorId =
    value.assignedMentorId ?? value.assigned_mentor_id;

  const assignedMentorId =
    typeof rawAssignedMentorId === "string" ||
    typeof rawAssignedMentorId === "number"
      ? rawAssignedMentorId
      : null;

  const rawIsPremium = value.isPremium ?? value.is_premium;
  const rawStreakFrozen =
    value.isStreakFrozen ?? value.is_streak_frozen;

  return {
    id: rawId,
    name: rawName.trim(),
    email: rawEmail.trim(),
    phoneNumber: stringOrNull(value.phoneNumber ?? value.phone_number),
    emailVerifiedAt: stringOrNull(
      value.emailVerifiedAt ?? value.email_verified_at,
    ),
    gender: stringOrNull(value.gender),
    role:
      typeof value.role === "string" && value.role.trim()
        ? value.role.trim().toLowerCase()
        : "user",
    assignedMentorId,
    isPremium:
      rawIsPremium === true || rawIsPremium === 1 || rawIsPremium === "1",
    status:
      typeof value.status === "string" && value.status.trim()
        ? value.status.trim().toLowerCase()
        : "active",
    readinessScore: numberOrNull(
      value.readinessScore ?? value.readiness_score,
    ),
    gpa:
      typeof value.gpa === "string" || typeof value.gpa === "number"
        ? value.gpa
        : null,
    undergraduateMajor: stringOrNull(
      value.undergraduateMajor ?? value.undergraduate_major,
    ),
    targetMajor: stringOrNull(value.targetMajor ?? value.target_major),
    primaryScholarshipTarget: stringOrNull(
      value.primaryScholarshipTarget ?? value.primary_scholarship_target,
    ),
    tokenBalance:
      numberOrNull(value.tokenBalance ?? value.token_balance) ?? 0,
    premiumUntil: stringOrNull(value.premiumUntil ?? value.premium_until),
    profilePictureUrl: resolveAssetUrl(
      value.profilePictureUrl ??
        value.profile_picture_url ??
        value.profile_picture,
    ),
    headline: stringOrNull(value.headline),
    bio: stringOrNull(value.bio),
    linkedinId: stringOrNull(value.linkedinId ?? value.linkedin_id),
    xpPoints: numberOrNull(value.xpPoints ?? value.xp_points) ?? 0,
    currentStreak:
      numberOrNull(value.currentStreak ?? value.current_streak) ?? 0,
    isStreakFrozen:
      rawStreakFrozen === true ||
      rawStreakFrozen === 1 ||
      rawStreakFrozen === "1",
    longestStreak:
      numberOrNull(value.longestStreak ?? value.longest_streak) ?? 0,
    createdAt:
      stringOrNull(value.createdAt ?? value.created_at) ?? "",
    updatedAt:
      stringOrNull(value.updatedAt ?? value.updated_at) ?? "",
    deletedAt: stringOrNull(value.deletedAt ?? value.deleted_at),
    level: numberOrNull(value.level) ?? 1,
  };
}

function extractAdminUserList(response: unknown): unknown[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (!isRecord(response)) {
    return [];
  }

  const outerData = response.data;

  // Laravel paginator response:
  // { status, data: { current_page, data: [...] } }
  if (isRecord(outerData) && Array.isArray(outerData.data)) {
    return outerData.data;
  }

  if (Array.isArray(outerData)) {
    return outerData;
  }

  if (Array.isArray(response.users)) {
    return response.users;
  }

  return [];
}

/**
 * GET /api/admin/get-users
 */
export async function getUsers(): Promise<AdminUser[]> {
  const response = await apiRequest<unknown>("/api/admin/get-users");

  return extractAdminUserList(response)
    .map(normalizeAdminUser)
    .filter((user): user is AdminUser => user !== null);
}

/**
 * GET /api/admin/get-user-detail/{id}
 */
export async function getUserDetail(
  id: string | number,
): Promise<AdminUser> {
  const response = await apiRequest<unknown>(
    `/api/admin/get-user-detail/${encodeURIComponent(String(id))}`,
  );

  const rawUser =
    isRecord(response) && isRecord(response.data)
      ? response.data
      : response;

  const user = normalizeAdminUser(rawUser);

  if (!user) {
    throw new Error("Invalid user detail response from the server.");
  }

  return user;
}

/**
 * POST /api/admin/create-user
 */
export async function createUser(
  payload: CreateAdminUserPayload,
): Promise<unknown> {
  return apiRequest<unknown>("/api/admin/create-user", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * PUT /api/admin/update-user/{id}
 */
export async function updateUser(
  id: string | number,
  payload: UpdateAdminUserPayload,
): Promise<unknown> {
  return apiRequest<unknown>(
    `/api/admin/update-user/${encodeURIComponent(String(id))}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

/**
 * PUT /api/admin/update-user-password/{id}
 */
export async function updateUserPassword(
  id: string | number,
  payload: UpdateAdminUserPasswordPayload,
): Promise<unknown> {
  return apiRequest<unknown>(
    `/api/admin/update-user-password/${encodeURIComponent(String(id))}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

/**
 * PUT /api/admin/toggle-user-status/{id}
 */
export async function toggleUserStatus(
  id: string | number,
): Promise<unknown> {
  return apiRequest<unknown>(
    `/api/admin/toggle-user-status/${encodeURIComponent(String(id))}`,
    {
      method: "PUT",
    },
  );
}

/**
 * DELETE /api/admin/delete-user/{id}
 */
export async function deleteUser(
  id: string | number,
): Promise<unknown> {
  return apiRequest<unknown>(
    `/api/admin/delete-user/${encodeURIComponent(String(id))}`,
    {
      method: "DELETE",
    },
  );
}

/**
 * POST /api/admin/restore-user/{id}
 */
export async function restoreUser(
  id: string | number,
): Promise<unknown> {
  return apiRequest<unknown>(
    `/api/admin/restore-user/${encodeURIComponent(String(id))}`,
    {
      method: "POST",
    },
  );
}

/* =========================================================
   Helpers
========================================================= */

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function extractList<T>(response: unknown): T[] {
  if (Array.isArray(response)) {
    return response as T[];
  }

  if (!isRecord(response)) {
    return [];
  }

  const responseRecord = response;

  const candidates: unknown[] = [
    responseRecord.data,
    responseRecord.items,
    responseRecord.results,
    responseRecord.universities,
    responseRecord.scholarships,
    responseRecord.questions,
    responseRecord.shop_items,
    responseRecord.shopItems,
    responseRecord.exams,
    responseRecord.practice_exams,
    responseRecord.badges,

    isRecord(responseRecord.data)
      ? responseRecord.data.data
      : undefined,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate as T[];
    }
  }

  if (isRecord(responseRecord.data)) {
    for (const key of Object.keys(responseRecord.data)) {
      const candidate = responseRecord.data[key];

      if (Array.isArray(candidate)) {
        return candidate as T[];
      }
    }
  }

  return [];
}

function resolveAssetUrl(value: unknown): string | null {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return null;
  }

  const normalized = value.trim();

  if (
    normalized.startsWith("http://") ||
    normalized.startsWith("https://") ||
    normalized.startsWith("blob:") ||
    normalized.startsWith("data:")
  ) {
    return normalized;
  }

  try {
    const apiOrigin = new URL(API_BASE_URL).origin;

    return `${apiOrigin}/${normalized.replace(
      /^\/+/,
      "",
    )}`;
  } catch {
    return normalized;
  }
}

/* =========================================================
   Universities
========================================================= */

export type University = {
  id: string | number;

  name: string;

  country: string;

  city: string;

  description: string;

  admissionProcess: string;

  admissionRequirements: string;

  officialWebsite: string;

  imageUrl: string | null;

  linkedScholarshipsCount: number;

  totalInterestedMentees: number;

  deletedAt: string | null;

  isDeleted: boolean;
};

export type UniversityFormPayload = {
  name: string;

  country?: string;

  city?: string;

  description?: string;

  admission_process?: string;

  admission_requirements?: string;

  official_website?: string;

  image?: File | null;
};

function normalizeUniversity(
  value: unknown,
): University | null {
  if (!isRecord(value)) {
    return null;
  }

  const rawId = value.id;

  const rawName =
    value.name ??
    value.university_name;

  if (
    (
      typeof rawId !== "string" &&
      typeof rawId !== "number"
    ) ||
    typeof rawName !== "string" ||
    !rawName.trim()
  ) {
    return null;
  }

  const rawCountry =
    value.country;

  const rawCity =
    value.city;

  const rawDescription =
    value.description;

  const rawAdmissionProcess =
    value.admissionProcess ??
    value.admission_process;

  const rawAdmissionRequirements =
    value.admissionRequirements ??
    value.admission_requirements;

  const rawWebsite =
    value.officialWebsite ??
    value.official_website ??
    value.website;

  const rawImage =
    value.imageUrl ??
    value.image_url ??
    value.image ??
    value.image_path;

  const rawDeletedAt =
    value.deletedAt ??
    value.deleted_at;

  const rawLinkedScholarships =
    value.linkedScholarshipsCount ??
    value.linked_scholarships_count ??
    value.scholarships_count ??
    (
      Array.isArray(value.scholarships)
        ? value.scholarships.length
        : 0
    );

  const rawInterestedMentees =
    value.totalInterestedMentees ??
    value.total_interested_mentees ??
    value.interested_mentees_count ??
    0;

  return {
    id: rawId,

    name: rawName.trim(),

    country:
      typeof rawCountry === "string"
        ? rawCountry.trim()
        : "",

    city:
      typeof rawCity === "string"
        ? rawCity.trim()
        : "",

    description:
      typeof rawDescription === "string"
        ? rawDescription.trim()
        : "",

    admissionProcess:
      typeof rawAdmissionProcess === "string"
        ? rawAdmissionProcess.trim()
        : "",

    admissionRequirements:
      typeof rawAdmissionRequirements === "string"
        ? rawAdmissionRequirements.trim()
        : "",

    officialWebsite:
      typeof rawWebsite === "string"
        ? rawWebsite.trim()
        : "",

    imageUrl:
      resolveAssetUrl(rawImage),

    linkedScholarshipsCount:
      Number.isFinite(
        Number(rawLinkedScholarships),
      )
        ? Number(rawLinkedScholarships)
        : 0,

    totalInterestedMentees:
      Number.isFinite(
        Number(rawInterestedMentees),
      )
        ? Number(rawInterestedMentees)
        : 0,

    deletedAt:
      typeof rawDeletedAt === "string" &&
      rawDeletedAt.trim()
        ? rawDeletedAt
        : null,

    isDeleted: Boolean(
      value.isDeleted ??
      value.is_deleted ??
      (
        typeof rawDeletedAt === "string" &&
        rawDeletedAt.trim()
      ),
    ),
  };
}

/**
 * GET
 * /api/universities
 */
export async function getUniversities(): Promise<
  University[]
> {
  const data = await apiRequest<unknown>(
    "/api/universities",
  );

  return extractList<unknown>(data)
    .map(normalizeUniversity)
    .filter(
      (
        university,
      ): university is University =>
        university !== null,
    );
}

function buildUniversityFormData(
  payload: UniversityFormPayload,

  options: {
    partial?: boolean;
  } = {},
): FormData {
  const formData = new FormData();

  const partial =
    options.partial ?? false;

  const appendText = (
    key: string,
    value: string | undefined,
  ) => {
    const normalized =
      value?.trim() ?? "";

    /*
     * CREATE:
     * Send all text fields.
     *
     * UPDATE:
     * Only send non-empty fields.
     */
    if (
      !partial ||
      normalized
    ) {
      formData.append(
        key,
        normalized,
      );
    }
  };

  appendText(
    "name",
    payload.name,
  );

  appendText(
    "country",
    payload.country,
  );

  appendText(
    "city",
    payload.city,
  );

  appendText(
    "description",
    payload.description,
  );

  appendText(
    "admission_process",
    payload.admission_process,
  );

  appendText(
    "admission_requirements",
    payload.admission_requirements,
  );

  appendText(
    "official_website",
    payload.official_website,
  );

  if (payload.image) {
    formData.append(
      "image",
      payload.image,
    );
  }

  return formData;
}

/**
 * POST
 * /api/admin/create-university
 */
export async function createUniversity(
  payload: UniversityFormPayload,
): Promise<unknown> {
  return apiRequest<unknown>(
    "/api/admin/create-university",
    {
      method: "POST",

      body: buildUniversityFormData(
        payload,
      ),
    },
  );
}

/**
 * POST
 * /api/admin/update-university/{id}
 */
export async function updateUniversity(
  id: string | number,

  payload: UniversityFormPayload,
): Promise<unknown> {
  return apiRequest<unknown>(
    `/api/admin/update-university/${encodeURIComponent(
      String(id),
    )}`,
    {
      method: "POST",

      body: buildUniversityFormData(
        payload,
        {
          partial: true,
        },
      ),
    },
  );
}

/**
 * DELETE
 * /api/admin/delete-university/{id}
 */
export async function deleteUniversity(
  id: string | number,
): Promise<unknown> {
  return apiRequest<unknown>(
    `/api/admin/delete-university/${encodeURIComponent(
      String(id),
    )}`,
    {
      method: "DELETE",
    },
  );
}

/**
 * POST
 * /api/admin/restore-university/{id}
 */
export async function restoreUniversity(
  id: string | number,
): Promise<unknown> {
  return apiRequest<unknown>(
    `/api/admin/restore-university/${encodeURIComponent(
      String(id),
    )}`,
    {
      method: "POST",
    },
  );
}

/* =========================================================
   Scholarships
========================================================= */

export type ScholarshipFundingType =
  | "fully_funded"
  | "partial_funded"
  | "self_funded"
  | string;

export type ScholarshipApplicationStatus =
  | "Open"
  | "Upcoming"
  | "Closed";

export type Scholarship = {
  id: string | number;

  name: string;

  providerCountry: string;

  description: string;

  fundingType: ScholarshipFundingType;

  degreeLevel: string;

  startDate: string;

  deadlineDate: string;

  officialWebsite: string;

  publicationStatus: string;

  imageUrl: string | null;

  universityIds: Array<
    string | number
  >;

  universityNames: string[];

  totalApplicants: number;

  deletedAt: string | null;

  isDeleted: boolean;

  applicationStatus:
    ScholarshipApplicationStatus;
};

export type ScholarshipFormPayload = {
  name: string;

  provider_country: string;

  description: string;

  funding_type: string;

  degree_level: string;

  start_date: string;

  deadline_date: string;

  official_website: string;

  status: string;

  image?: File | null;

  university_ids: Array<
    string | number
  >;
};

function normalizeDateString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function getApplicationStatus(
  startDate: string,
  deadlineDate: string,
): ScholarshipApplicationStatus {
  const today = new Date();

  today.setHours(
    0,
    0,
    0,
    0,
  );

  const start =
    startDate
      ? new Date(
          `${startDate}T00:00:00`,
        )
      : null;

  const deadline =
    deadlineDate
      ? new Date(
          `${deadlineDate}T23:59:59`,
        )
      : null;

  if (
    start &&
    !Number.isNaN(
      start.getTime(),
    ) &&
    today < start
  ) {
    return "Upcoming";
  }

  if (
    deadline &&
    !Number.isNaN(
      deadline.getTime(),
    ) &&
    today > deadline
  ) {
    return "Closed";
  }

  return "Open";
}

function normalizeScholarship(
  value: unknown,
): Scholarship | null {
  if (!isRecord(value)) {
    return null;
  }

  const rawId = value.id;

  const rawName = value.name;

  if (
    (
      typeof rawId !== "string" &&
      typeof rawId !== "number"
    ) ||
    typeof rawName !== "string" ||
    !rawName.trim()
  ) {
    return null;
  }

  const startDate =
    normalizeDateString(
      value.startDate ??
      value.start_date,
    );

  const deadlineDate =
    normalizeDateString(
      value.deadlineDate ??
      value.deadline_date ??
      value.deadline,
    );

  /*
   * Scholarship API may return
   * university relationships.
   */
  const rawUniversities =
    Array.isArray(
      value.universities,
    )
      ? value.universities
      : [];

  const universityIdsFromRelations =
    rawUniversities
      .map(
        (
          university,
        ) => {
          if (
            !isRecord(
              university,
            )
          ) {
            return null;
          }

          const id =
            university.id ??
            university.university_id;

          return (
            typeof id === "string" ||
            typeof id === "number"
          )
            ? id
            : null;
        },
      )
      .filter(
        (
          id,
        ): id is string | number =>
          id !== null,
      );

  const universityNames =
    rawUniversities
      .map(
        (
          university,
        ) => {
          if (
            !isRecord(
              university,
            )
          ) {
            return null;
          }

          const name =
            university.name ??
            university.university_name;

          return (
            typeof name === "string" &&
            name.trim()
          )
            ? name.trim()
            : null;
        },
      )
      .filter(
        (
          name,
        ): name is string =>
          name !== null,
      );

  const rawUniversityIds =
    value.universityIds ??
    value.university_ids;

  const universityIds =
    Array.isArray(
      rawUniversityIds,
    )
      ? rawUniversityIds.filter(
          (
            id,
          ): id is string | number =>
            typeof id === "string" ||
            typeof id === "number",
        )
      : universityIdsFromRelations;

  const rawDeletedAt =
    value.deletedAt ??
    value.deleted_at;

  const deletedAt =
    typeof rawDeletedAt === "string" &&
    rawDeletedAt.trim()
      ? rawDeletedAt
      : null;

  const rawProviderCountry =
    value.providerCountry ??
    value.provider_country ??
    value.provider;

  const rawDescription =
    value.description;

  const rawFundingType =
    value.fundingType ??
    value.funding_type ??
    value.coverageType;

  const rawDegreeLevel =
    value.degreeLevel ??
    value.degree_level ??
    value.targetDegree;

  const rawWebsite =
    value.officialWebsite ??
    value.official_website ??
    value.website;

  const rawPublicationStatus =
    value.publicationStatus ??
    value.status;

  const rawImage =
    value.imageUrl ??
    value.image_url ??
    value.image ??
    value.image_path;

  const totalApplicantsValue =
    Number(
      value.totalApplicants ??
      value.total_applicants ??
      value.interested_mentees_count ??
      value.applicants_count ??
      0,
    );

  const explicitDeleted =
    value.isDeleted ??
    value.is_deleted ??
    value.deleted;

  return {
    id: rawId,

    name:
      rawName.trim(),

    providerCountry:
      typeof rawProviderCountry ===
      "string"
        ? rawProviderCountry.trim()
        : "",

    description:
      typeof rawDescription ===
      "string"
        ? rawDescription.trim()
        : "",

    fundingType:
      typeof rawFundingType ===
        "string" &&
      rawFundingType.trim()
        ? rawFundingType.trim()
        : "fully_funded",

    degreeLevel:
      typeof rawDegreeLevel ===
        "string" &&
      rawDegreeLevel.trim()
        ? rawDegreeLevel.trim()
        : "master",

    startDate,

    deadlineDate,

    officialWebsite:
      typeof rawWebsite ===
      "string"
        ? rawWebsite.trim()
        : "",

    publicationStatus:
      typeof rawPublicationStatus ===
        "string" &&
      rawPublicationStatus.trim()
        ? rawPublicationStatus.trim()
        : "published",

    imageUrl:
      resolveAssetUrl(
        rawImage,
      ),

    universityIds,

    universityNames,

    totalApplicants:
      Number.isFinite(
        totalApplicantsValue,
      )
        ? totalApplicantsValue
        : 0,

    deletedAt,

    isDeleted:
      deletedAt !== null ||
      explicitDeleted === true ||
      explicitDeleted === 1 ||
      explicitDeleted === "1",

    applicationStatus:
      getApplicationStatus(
        startDate,
        deadlineDate,
      ),
  };
}

function scholarshipPayloadToFormData(
  payload:
    ScholarshipFormPayload,
): FormData {
  const formData =
    new FormData();

  formData.append(
    "name",
    payload.name.trim(),
  );

  formData.append(
    "provider_country",
    payload.provider_country.trim(),
  );

  formData.append(
    "description",
    payload.description.trim(),
  );

  formData.append(
    "funding_type",
    payload.funding_type,
  );

  formData.append(
    "degree_level",
    payload.degree_level,
  );

  formData.append(
    "start_date",
    payload.start_date,
  );

  formData.append(
    "deadline_date",
    payload.deadline_date,
  );

  formData.append(
    "official_website",
    payload.official_website.trim(),
  );

  formData.append(
    "status",
    payload.status,
  );

  if (payload.image) {
    formData.append(
      "image",
      payload.image,
    );
  }

  payload.university_ids.forEach(
    (
      universityId,
      index,
    ) => {
      formData.append(
        `university_ids[${index}]`,
        String(
          universityId,
        ),
      );
    },
  );

  return formData;
}

/**
 * GET
 * /api/scholarships
 */
export async function getScholarships(): Promise<
  Scholarship[]
> {
  try {
    const data =
      await apiRequest<unknown>(
        "/api/scholarships",
      );

    return extractList<unknown>(
      data,
    )
      .map(
        normalizeScholarship,
      )
      .filter(
        (
          scholarship,
        ): scholarship is Scholarship =>
          scholarship !== null,
      );
  } catch (error) {
    if (
      error instanceof
      ApiError
    ) {
      throw error;
    }

    throw error;
  }
}

/**
 * POST
 * /api/admin/create-scholarship
 */
export async function createScholarship(
  payload:
    ScholarshipFormPayload,
): Promise<unknown> {
  return apiRequest<unknown>(
    "/api/admin/create-scholarship",
    {
      method: "POST",

      body:
        scholarshipPayloadToFormData(
          payload,
        ),
    },
  );
}

/**
 * POST
 * /api/admin/update-scholarship/{id}
 */
export async function updateScholarship(
  id: string | number,

  payload:
    ScholarshipFormPayload,
): Promise<unknown> {
  return apiRequest<unknown>(
    `/api/admin/update-scholarship/${encodeURIComponent(
      String(id),
    )}`,
    {
      method: "POST",

      body:
        scholarshipPayloadToFormData(
          payload,
        ),
    },
  );
}

/**
 * DELETE
 * /api/admin/delete-scholarship/{id}
 */
export async function deleteScholarship(
  id: string | number,
): Promise<unknown> {
  return apiRequest<unknown>(
    `/api/admin/delete-scholarship/${encodeURIComponent(
      String(id),
    )}`,
    {
      method: "DELETE",
    },
  );
}

/**
 * POST
 * /api/admin/restore-scholarship/{id}
 */
export async function restoreScholarship(
  id: string | number,
): Promise<unknown> {
  return apiRequest<unknown>(
    `/api/admin/restore-scholarship/${encodeURIComponent(
      String(id),
    )}`,
    {
      method: "POST",
    },
  );
}

/* =========================================================
   Diagnostic Questions
========================================================= */

export type DiagnosticOption = {
  id?: string | number;

  diagnosticQuestionId?:
    string | number;

  optionText: string;

  scoreWeight: number;

  weaknessTag: string | null;

  strengthTag: string | null;

  createdAt?: string;

  updatedAt?: string;
};

export type DiagnosticQuestion = {
  id: string | number;

  assessmentType: string;

  questionText: string;

  category: string;

  isActive: boolean;

  orderNumber: number;

  createdAt: string;

  updatedAt: string;

  options: DiagnosticOption[];

  /*
   * Derived display fields
   * for InitialAssessmentAdmin.
   */
  questionType: string;

  weightScore: number;

  optionsCount: number;
};

export type DiagnosticOptionPayload = {
  option_text: string;

  score_weight: number;

  weakness_tag:
    string | null;

  strength_tag:
    string | null;
};

export type DiagnosticQuestionPayload = {
  question_text: string;

  category: string;

  order_number: number;

  options:
    DiagnosticOptionPayload[];
};

function toFiniteNumber(
  value: unknown,

  fallback = 0,
): number {
  const parsed =
    Number(value);

  return Number.isFinite(
    parsed,
  )
    ? parsed
    : fallback;
}

function toNullableString(
  value: unknown,
): string | null {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const trimmed =
    value.trim();

  return trimmed
    ? trimmed
    : null;
}

function normalizeDiagnosticOption(
  value: unknown,
): DiagnosticOption | null {
  if (!isRecord(value)) {
    return null;
  }

  const rawOptionText =
    value.optionText ??
    value.option_text;

  const optionText =
    typeof rawOptionText ===
    "string"
      ? rawOptionText.trim()
      : "";

  if (!optionText) {
    return null;
  }

  const rawId =
    value.id;

  const rawDiagnosticQuestionId =
    value.diagnosticQuestionId ??
    value.diagnostic_question_id;

  return {
    id:
      typeof rawId === "string" ||
      typeof rawId === "number"
        ? rawId
        : undefined,

    diagnosticQuestionId:
      typeof rawDiagnosticQuestionId ===
        "string" ||
      typeof rawDiagnosticQuestionId ===
        "number"
        ? rawDiagnosticQuestionId
        : undefined,

    optionText,

    scoreWeight:
      toFiniteNumber(
        value.scoreWeight ??
        value.score_weight,
      ),

    weaknessTag:
      toNullableString(
        value.weaknessTag ??
        value.weakness_tag,
      ),

    strengthTag:
      toNullableString(
        value.strengthTag ??
        value.strength_tag,
      ),

    createdAt:
      typeof (
        value.createdAt ??
        value.created_at
      ) === "string"
        ? String(
            value.createdAt ??
            value.created_at,
          )
        : undefined,

    updatedAt:
      typeof (
        value.updatedAt ??
        value.updated_at
      ) === "string"
        ? String(
            value.updatedAt ??
            value.updated_at,
          )
        : undefined,
  };
}

function normalizeDiagnosticQuestion(
  value: unknown,
): DiagnosticQuestion | null {
  if (!isRecord(value)) {
    return null;
  }

  const rawId =
    value.id;

  if (
    typeof rawId !==
      "string" &&
    typeof rawId !==
      "number"
  ) {
    return null;
  }

  const rawQuestionText =
    value.questionText ??
    value.question_text;

  const questionText =
    typeof rawQuestionText ===
    "string"
      ? rawQuestionText.trim()
      : "";

  if (!questionText) {
    return null;
  }

  const rawCategory =
    value.category;

  const category =
    typeof rawCategory ===
      "string" &&
    rawCategory.trim()
      ? rawCategory
          .trim()
          .toLowerCase()
      : "uncategorized";

  const rawOptions =
    Array.isArray(
      value.options,
    )
      ? value.options
      : [];

  const options =
    rawOptions
      .map(
        normalizeDiagnosticOption,
      )
      .filter(
        (
          option,
        ): option is DiagnosticOption =>
          option !== null,
      );

  const weightScore =
    options.length > 0
      ? Math.max(
          ...options.map(
            (
              option,
            ) =>
              option.scoreWeight,
          ),
        )
      : 0;

  const rawAssessmentType =
    value.assessmentType ??
    value.assessment_type;

  const rawCreatedAt =
    value.createdAt ??
    value.created_at;

  const rawUpdatedAt =
    value.updatedAt ??
    value.updated_at;

  const rawIsActive =
    value.isActive ??
    value.is_active;

  return {
    id: rawId,

    assessmentType:
      typeof rawAssessmentType ===
      "string"
        ? rawAssessmentType
        : "initial_diagnostic",

    questionText,

    category,

    isActive:
      rawIsActive === true ||
      rawIsActive === 1 ||
      rawIsActive === "1",

    orderNumber:
      toFiniteNumber(
        value.orderNumber ??
        value.order_number,
        0,
      ),

    createdAt:
      typeof rawCreatedAt ===
      "string"
        ? rawCreatedAt
        : "",

    updatedAt:
      typeof rawUpdatedAt ===
      "string"
        ? rawUpdatedAt
        : "",

    options,

    questionType:
      "Multiple Choice",

    weightScore,

    optionsCount:
      options.length,
  };
}

/**
 * GET
 * /api/admin/diagnostic-questions
 */
export async function getDiagnosticQuestions(): Promise<
  DiagnosticQuestion[]
> {
  const data =
    await apiRequest<unknown>(
      "/api/admin/diagnostic-questions",
    );

  return extractList<unknown>(
    data,
  )
    .map(
      normalizeDiagnosticQuestion,
    )
    .filter(
      (
        question,
      ): question is DiagnosticQuestion =>
        question !== null,
    )
    .sort(
      (
        a,
        b,
      ) => {
        if (
          a.orderNumber !==
          b.orderNumber
        ) {
          return (
            a.orderNumber -
            b.orderNumber
          );
        }

        return (
          Number(a.id) -
          Number(b.id)
        );
      },
    );
}

/**
 * POST
 * /api/admin/diagnostic-questions/import
 *
 * Bulk import diagnostic questions from a CSV file.
 * The backend expects multipart/form-data with the file under `file`.
 */
export async function importDiagnosticQuestionsCsv(
  file: File,
): Promise<unknown> {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest<unknown>(
    "/api/admin/diagnostic-questions/import",
    {
      method: "POST",
      body: formData,
    },
  );
}

/**
 * POST
 * /api/admin/diagnostic-questions
 */
export async function createDiagnosticQuestion(
  payload:
    DiagnosticQuestionPayload,
): Promise<unknown> {
  return apiRequest<unknown>(
    "/api/admin/diagnostic-questions",
    {
      method: "POST",

      body:
        JSON.stringify(
          payload,
        ),
    },
  );
}

/**
 * PUT
 * /api/admin/diagnostic-questions/{id}
 */
export async function updateDiagnosticQuestion(
  id: string | number,

  payload:
    DiagnosticQuestionPayload,
): Promise<unknown> {
  return apiRequest<unknown>(
    `/api/admin/diagnostic-questions/${encodeURIComponent(
      String(id),
    )}`,
    {
      method: "PUT",

      body:
        JSON.stringify(
          payload,
        ),
    },
  );
}

/**
 * DELETE
 * /api/admin/diagnostic-questions/{id}
 */
export async function deleteDiagnosticQuestion(
  id: string | number,
): Promise<unknown> {
  return apiRequest<unknown>(
    `/api/admin/diagnostic-questions/${encodeURIComponent(
      String(id),
    )}`,
    {
      method: "DELETE",
    },
  );
}

/**
 * DELETE
 * /api/admin/diagnostic-questions/clear-all
 */
export async function clearAllDiagnosticQuestions(): Promise<
  unknown
> {
  return apiRequest<unknown>(
    "/api/admin/diagnostic-questions/clear-all",
    {
      method: "DELETE",
    },
  );
}

/* =========================================================
   Shop Items
========================================================= */

export type ShopItemType =
  | "subscription"
  | "token_package"
  | string;

export type ShopItem = {
  id: string | number;

  name: string;

  itemType: ShopItemType;

  description: string;

  priceRupiah: number;

  priceXp: number;

  tokenReward: number;

  durationDays: number | null;

  stockQuantity: number;

  imageUrl: string | null;

  isActive: boolean;

  createdAt: string;

  updatedAt: string;
};

export type ShopItemPayload = {
  name: string;

  item_type: string;

  description: string;

  price_rupiah: number;

  price_xp: number;

  token_reward: number;

  duration_days: number | null;

  stock_quantity: number;

  image_url?: string | null;

  is_active: boolean;
};

export type UpdateShopItemPayload =
  Partial<ShopItemPayload>;

function normalizeShopItem(
  value: unknown,
): ShopItem | null {
  if (!isRecord(value)) {
    return null;
  }

  const rawId = value.id;
  const rawName = value.name;

  if (
    (
      typeof rawId !== "string" &&
      typeof rawId !== "number"
    ) ||
    typeof rawName !== "string" ||
    !rawName.trim()
  ) {
    return null;
  }

  const rawItemType =
    value.itemType ??
    value.item_type;

  const rawDescription =
    value.description;

  const rawPriceRupiah =
    value.priceRupiah ??
    value.price_rupiah;

  const rawPriceXp =
    value.priceXp ??
    value.price_xp;

  const rawTokenReward =
    value.tokenReward ??
    value.token_reward;

  const rawDurationDays =
    value.durationDays ??
    value.duration_days;

  const rawStockQuantity =
    value.stockQuantity ??
    value.stock_quantity;

  const rawImageUrl =
    value.imageUrl ??
    value.image_url;

  const rawIsActive =
    value.isActive ??
    value.is_active;

  const rawCreatedAt =
    value.createdAt ??
    value.created_at;

  const rawUpdatedAt =
    value.updatedAt ??
    value.updated_at;

  return {
    id: rawId,

    name: rawName.trim(),

    itemType:
      typeof rawItemType === "string" &&
      rawItemType.trim()
        ? rawItemType.trim()
        : "token_package",

    description:
      typeof rawDescription === "string"
        ? rawDescription.trim()
        : "",

    priceRupiah:
      toFiniteNumber(
        rawPriceRupiah,
        0,
      ),

    priceXp:
      toFiniteNumber(
        rawPriceXp,
        0,
      ),

    tokenReward:
      toFiniteNumber(
        rawTokenReward,
        0,
      ),

    durationDays:
      rawDurationDays === null ||
      rawDurationDays === undefined ||
      rawDurationDays === ""
        ? null
        : toFiniteNumber(
            rawDurationDays,
            0,
          ),

    stockQuantity:
      toFiniteNumber(
        rawStockQuantity,
        0,
      ),

    imageUrl:
      typeof rawImageUrl === "string" &&
      rawImageUrl.trim()
        ? rawImageUrl.trim()
        : null,

    isActive:
      rawIsActive === true ||
      rawIsActive === 1 ||
      rawIsActive === "1",

    createdAt:
      typeof rawCreatedAt === "string"
        ? rawCreatedAt
        : "",

    updatedAt:
      typeof rawUpdatedAt === "string"
        ? rawUpdatedAt
        : "",
  };
}

function extractSingleRecord(
  response: unknown,
): unknown {
  if (!isRecord(response)) {
    return response;
  }

  if (isRecord(response.data)) {
    return response.data;
  }

  if (isRecord(response.item)) {
    return response.item;
  }

  if (isRecord(response.shop_item)) {
    return response.shop_item;
  }

  if (isRecord(response.shopItem)) {
    return response.shopItem;
  }

  return response;
}

/**
 * GET
 * /api/admin/shop-items
 */
export async function getShopItems(): Promise<
  ShopItem[]
> {
  const data =
    await apiRequest<unknown>(
      "/api/admin/shop-items",
    );

  return extractList<unknown>(
    data,
  )
    .map(
      normalizeShopItem,
    )
    .filter(
      (
        item,
      ): item is ShopItem =>
        item !== null,
    );
}

/**
 * GET
 * /api/admin/shop-items/{id}
 */
export async function getShopItem(
  id: string | number,
): Promise<ShopItem> {
  const data =
    await apiRequest<unknown>(
      `/api/admin/shop-items/${encodeURIComponent(
        String(id),
      )}`,
    );

  const item =
    normalizeShopItem(
      extractSingleRecord(data),
    );

  if (!item) {
    throw new Error(
      "Invalid shop item response from server.",
    );
  }

  return item;
}

/**
 * POST
 * /api/admin/shop-items
 */
export async function createShopItem(
  payload: ShopItemPayload,
): Promise<unknown> {
  return apiRequest<unknown>(
    "/api/admin/shop-items",
    {
      method: "POST",

      body:
        JSON.stringify(
          payload,
        ),
    },
  );
}

/**
 * PUT
 * /api/admin/shop-items/{id}
 *
 * The backend supports partial updates,
 * so only fields included in payload are sent.
 */
export async function updateShopItem(
  id: string | number,

  payload: UpdateShopItemPayload,
): Promise<unknown> {
  return apiRequest<unknown>(
    `/api/admin/shop-items/${encodeURIComponent(
      String(id),
    )}`,
    {
      method: "PUT",

      body:
        JSON.stringify(
          payload,
        ),
    },
  );
}

/**
 * DELETE
 * /api/admin/shop-items/{id}
 */
export async function deleteShopItem(
  id: string | number,
): Promise<unknown> {
  return apiRequest<unknown>(
    `/api/admin/shop-items/${encodeURIComponent(
      String(id),
    )}`,
    {
      method: "DELETE",
    },
  );
}

/* =========================================================
   Practice Exams & Questions
========================================================= */

export type PracticeExamQuestion = {
  id: string | number;
  practiceExamId: string | number | null;
  section: string;
  audioUrl: string | null;
  questionText: string;
  questionType: string;
  scoreWeight: number;
  createdAt: string;
  updatedAt: string;
};

export type PracticeExam = {
  id: string | number;
  title: string;
  category: string;
  durationMinutes: number;
  totalQuestions: number;
  totalAttempts: number;
  avgScore: number;
  createdAt: string;
  updatedAt: string;
  questions: PracticeExamQuestion[];
};

export type UpdatePracticeQuestionPayload = {
  section: string;
  audio_url: string | null;
  question_text: string;
  question_type: string;
  score_weight: number;
};

function normalizePracticeQuestion(
  value: unknown,
): PracticeExamQuestion | null {
  if (!isRecord(value)) {
    return null;
  }

  const rawId = value.id;

  if (
    typeof rawId !== "string" &&
    typeof rawId !== "number"
  ) {
    return null;
  }

  const rawPracticeExamId =
    value.practiceExamId ??
    value.practice_exam_id ??
    value.exam_id;

  const rawQuestionText =
    value.questionText ??
    value.question_text;

  const rawQuestionType =
    value.questionType ??
    value.question_type;

  const rawScoreWeight =
    value.scoreWeight ??
    value.score_weight ??
    value.points;

  const rawSection = value.section;

  const rawAudioUrl =
    value.audioUrl ??
    value.audio_url;

  const rawCreatedAt =
    value.createdAt ??
    value.created_at;

  const rawUpdatedAt =
    value.updatedAt ??
    value.updated_at;

  return {
    id: rawId,

    practiceExamId:
      typeof rawPracticeExamId === "string" ||
      typeof rawPracticeExamId === "number"
        ? rawPracticeExamId
        : null,

    section:
      typeof rawSection === "string"
        ? rawSection.trim()
        : "",

    audioUrl:
      typeof rawAudioUrl === "string" &&
      rawAudioUrl.trim()
        ? rawAudioUrl.trim()
        : null,

    questionText:
      typeof rawQuestionText === "string"
        ? rawQuestionText.trim()
        : "",

    questionType:
      typeof rawQuestionType === "string" &&
      rawQuestionType.trim()
        ? rawQuestionType.trim()
        : "multiple_choice",

    scoreWeight:
      toFiniteNumber(rawScoreWeight, 0),

    createdAt:
      typeof rawCreatedAt === "string"
        ? rawCreatedAt
        : "",

    updatedAt:
      typeof rawUpdatedAt === "string"
        ? rawUpdatedAt
        : "",
  };
}

function normalizePracticeExam(
  value: unknown,
): PracticeExam | null {
  if (!isRecord(value)) {
    return null;
  }

  const rawId = value.id;

  if (
    typeof rawId !== "string" &&
    typeof rawId !== "number"
  ) {
    return null;
  }

  const rawQuestions = Array.isArray(value.questions)
    ? value.questions
    : Array.isArray(value.practice_questions)
      ? value.practice_questions
      : [];

  const questions = rawQuestions
    .map(normalizePracticeQuestion)
    .filter(
      (
        question,
      ): question is PracticeExamQuestion =>
        question !== null,
    );

  const rawTitle =
    value.title ??
    value.name ??
    value.exam_title ??
    value.exam_name;

  const rawCategory =
    value.category ??
    value.exam_type ??
    value.test_type;

  const rawDuration =
    value.durationMinutes ??
    value.duration_minutes ??
    value.duration;

  const rawTotalQuestions =
    value.totalQuestions ??
    value.total_questions ??
    value.question_count;

  const rawTotalAttempts =
    value.totalAttempts ??
    value.total_attempts ??
    value.attempts_count;

  const rawAvgScore =
    value.avgScore ??
    value.avg_score ??
    value.average_score;

  const rawCreatedAt =
    value.createdAt ??
    value.created_at;

  const rawUpdatedAt =
    value.updatedAt ??
    value.updated_at;

  return {
    id: rawId,

    title:
      typeof rawTitle === "string" &&
      rawTitle.trim()
        ? rawTitle.trim()
        : `Practice Exam #${String(rawId)}`,

    category:
      typeof rawCategory === "string" &&
      rawCategory.trim()
        ? rawCategory.trim()
        : "Uncategorized",

    durationMinutes:
      toFiniteNumber(rawDuration, 0),

    totalQuestions:
      rawTotalQuestions === undefined ||
      rawTotalQuestions === null
        ? questions.length
        : toFiniteNumber(
            rawTotalQuestions,
            questions.length,
          ),

    totalAttempts:
      toFiniteNumber(rawTotalAttempts, 0),

    avgScore:
      toFiniteNumber(rawAvgScore, 0),

    createdAt:
      typeof rawCreatedAt === "string"
        ? rawCreatedAt
        : "",

    updatedAt:
      typeof rawUpdatedAt === "string"
        ? rawUpdatedAt
        : "",

    questions,
  };
}

function extractPracticeExamRecord(
  response: unknown,
): unknown {
  if (!isRecord(response)) {
    return response;
  }

  if (isRecord(response.data)) {
    return response.data;
  }

  if (isRecord(response.exam)) {
    return response.exam;
  }

  if (isRecord(response.practice_exam)) {
    return response.practice_exam;
  }

  return response;
}

/**
 * GET
 * /api/admin/practice-exams
 */
export async function getPracticeExams(): Promise<
  PracticeExam[]
> {
  const response =
    await apiRequest<unknown>(
      "/api/admin/practice-exams",
    );

  return extractList<unknown>(response)
    .map(normalizePracticeExam)
    .filter(
      (
        exam,
      ): exam is PracticeExam =>
        exam !== null,
    );
}

/**
 * GET
 * /api/admin/practice-exams/{id}
 */
export async function getPracticeExam(
  id: string | number,
): Promise<PracticeExam> {
  const response =
    await apiRequest<unknown>(
      `/api/admin/practice-exams/${encodeURIComponent(
        String(id),
      )}`,
    );

  const exam = normalizePracticeExam(
    extractPracticeExamRecord(response),
  );

  if (!exam) {
    throw new Error(
      "Invalid practice exam detail response from the server.",
    );
  }

  return exam;
}

/**
 * POST multipart/form-data
 * /api/admin/practice-exams/import
 *
 * Backend field: file (.csv)
 */
export async function importPracticeExamsCsv(
  file: File,
): Promise<unknown> {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest<unknown>(
    "/api/admin/practice-exams/import",
    {
      method: "POST",
      body: formData,
    },
  );
}

/**
 * PUT JSON
 * /api/admin/practice-questions/{id}
 */
export async function updatePracticeQuestion(
  id: string | number,
  payload: UpdatePracticeQuestionPayload,
): Promise<unknown> {
  return apiRequest<unknown>(
    `/api/admin/practice-questions/${encodeURIComponent(
      String(id),
    )}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

/**
 * DELETE
 * /api/admin/practice-questions/{id}
 */
export async function deletePracticeQuestion(
  id: string | number,
): Promise<unknown> {
  return apiRequest<unknown>(
    `/api/admin/practice-questions/${encodeURIComponent(
      String(id),
    )}`,
    {
      method: "DELETE",
    },
  );
}

/**
 * DELETE
 * /api/admin/practice-exams/{id}
 * Deletes the exam together with its contents.
 */
export async function deletePracticeExam(
  id: string | number,
): Promise<unknown> {
  return apiRequest<unknown>(
    `/api/admin/practice-exams/${encodeURIComponent(
      String(id),
    )}`,
    {
      method: "DELETE",
    },
  );
}

/**
 * DELETE
 * /api/admin/practice-exams/clear-all
 */
export async function clearAllPracticeExams(): Promise<
  unknown
> {
  return apiRequest<unknown>(
    "/api/admin/practice-exams/clear-all",
    {
      method: "DELETE",
    },
  );
}


/* =========================================================
   Badges
========================================================= */

export type BadgeItem = {
  id: string | number;

  name: string;

  description: string;

  iconUrl: string | null;

  requiredXp: number;

  createdAt: string;

  updatedAt: string;
};

export type BadgePayload = {
  name: string;

  description: string;

  icon_url: string;

  required_xp: number;
};

function normalizeBadge(
  value: unknown,
): BadgeItem | null {
  if (!isRecord(value)) {
    return null;
  }

  const rawId = value.id;
  const rawName = value.name;

  if (
    (
      typeof rawId !== "string" &&
      typeof rawId !== "number"
    ) ||
    typeof rawName !== "string" ||
    !rawName.trim()
  ) {
    return null;
  }

  const rawDescription =
    value.description;

  const rawIconUrl =
    value.iconUrl ??
    value.icon_url;

  const rawRequiredXp =
    value.requiredXp ??
    value.required_xp;

  const rawCreatedAt =
    value.createdAt ??
    value.created_at;

  const rawUpdatedAt =
    value.updatedAt ??
    value.updated_at;

  return {
    id: rawId,

    name: rawName.trim(),

    description:
      typeof rawDescription === "string"
        ? rawDescription.trim()
        : "",

    iconUrl:
      typeof rawIconUrl === "string" &&
      rawIconUrl.trim()
        ? rawIconUrl.trim()
        : null,

    requiredXp:
      toFiniteNumber(
        rawRequiredXp,
        0,
      ),

    createdAt:
      typeof rawCreatedAt === "string"
        ? rawCreatedAt
        : "",

    updatedAt:
      typeof rawUpdatedAt === "string"
        ? rawUpdatedAt
        : "",
  };
}

function extractBadgeRecord(
  response: unknown,
): unknown {
  if (!isRecord(response)) {
    return response;
  }

  if (isRecord(response.data)) {
    return response.data;
  }

  if (isRecord(response.badge)) {
    return response.badge;
  }

  return response;
}

/**
 * GET
 * /api/admin/badges
 */
export async function getBadges(): Promise<
  BadgeItem[]
> {
  const data =
    await apiRequest<unknown>(
      "/api/admin/badges",
    );

  return extractList<unknown>(
    data,
  )
    .map(
      normalizeBadge,
    )
    .filter(
      (
        badge,
      ): badge is BadgeItem =>
        badge !== null,
    )
    .sort(
      (
        a,
        b,
      ) =>
        a.requiredXp -
        b.requiredXp,
    );
}

/**
 * GET
 * /api/admin/badges/{id}
 */
export async function getBadge(
  id: string | number,
): Promise<BadgeItem> {
  const data =
    await apiRequest<unknown>(
      `/api/admin/badges/${encodeURIComponent(
        String(id),
      )}`,
    );

  const badge =
    normalizeBadge(
      extractBadgeRecord(data),
    );

  if (!badge) {
    throw new Error(
      "Invalid badge response from server.",
    );
  }

  return badge;
}

/**
 * POST
 * /api/admin/badges
 */
export async function createBadge(
  payload: BadgePayload,
): Promise<unknown> {
  return apiRequest<unknown>(
    "/api/admin/badges",
    {
      method: "POST",

      body:
        JSON.stringify(
          payload,
        ),
    },
  );
}

/**
 * PUT
 * /api/admin/badges/{id}
 */
export async function updateBadge(
  id: string | number,

  payload: BadgePayload,
): Promise<unknown> {
  return apiRequest<unknown>(
    `/api/admin/badges/${encodeURIComponent(
      String(id),
    )}`,
    {
      method: "PUT",

      body:
        JSON.stringify(
          payload,
        ),
    },
  );
}

/**
 * DELETE
 * /api/admin/badges/{id}
 */
export async function deleteBadge(
  id: string | number,
): Promise<unknown> {
  return apiRequest<unknown>(
    `/api/admin/badges/${encodeURIComponent(
      String(id),
    )}`,
    {
      method: "DELETE",
    },
  );
}

/* =========================================================
   Admin Dashboard
========================================================= */

export type AdminDashboardRecentUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
};

export type AdminDashboardStats = {
  overview: {
    totalUsers: number;
    activeMentors: number;
    openScholarships: number;
    pendingPayments: number;
    recentUsers: AdminDashboardRecentUser[];
  };

  userManagement: {
    totalUsers: number;
    activeUsers: number;
    suspendedUsers: number;
  };

  finance: {
    monthlyRevenue: number;
    premiumUsers: number;
    registeredUsers: number;
    transactionCount: number;
  };

  university: {
    totalUniversities: number;
    countriesCovered: number;
    archivedUniversities: number;
  };

  scholarship: {
    totalActivePrograms: number;
    openApplications: number;
    fullyFundedRatio: number;
    fullyFundedCount: number;
  };

  assessment: {
    totalDiagnosticQuestions: number;
  };

  shop: {
    totalActiveCatalog: number;
    topUpPackages: number;
    totalPurchased: number;
  };

  practice: {
    totalPracticeExams: number;
    questionBankSize: number;
    totalTestAttempts: number;
  };

  gamification: {
    totalActiveBadges: number;
    badgesUnlocked: number;
  };
};

function dashboardNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function dashboardString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeDashboardRecentUser(
  value: unknown,
): AdminDashboardRecentUser | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = dashboardNumber(value.id);
  const name = dashboardString(value.name);
  const email = dashboardString(value.email);

  if (!id || !name || !email) {
    return null;
  }

  return {
    id,
    name,
    email,
    role: dashboardString(value.role) || "user",
    status: dashboardString(value.status) || "active",
    createdAt: dashboardString(value.created_at ?? value.createdAt),
  };
}

function dashboardSection(
  source: Record<string, unknown>,
  key: string,
): Record<string, unknown> {
  const value = source[key];
  return isRecord(value) ? value : {};
}

function normalizeAdminDashboardStats(
  response: unknown,
): AdminDashboardStats {
  if (!isRecord(response)) {
    throw new Error("Invalid admin dashboard response from the server.");
  }

  const rawData = isRecord(response.data) ? response.data : response;

  const overview = dashboardSection(rawData, "overview");
  const userManagement = dashboardSection(rawData, "user_management");
  const finance = dashboardSection(rawData, "finance");
  const university = dashboardSection(rawData, "university");
  const scholarship = dashboardSection(rawData, "scholarship");
  const assessment = dashboardSection(rawData, "assessment");
  const shop = dashboardSection(rawData, "shop");
  const practice = dashboardSection(rawData, "practice");
  const gamification = dashboardSection(rawData, "gamification");

  const recentUsers = Array.isArray(overview.recent_users)
    ? overview.recent_users
        .map(normalizeDashboardRecentUser)
        .filter(
          (user): user is AdminDashboardRecentUser => user !== null,
        )
    : [];

  return {
    overview: {
      totalUsers: dashboardNumber(overview.total_users),
      activeMentors: dashboardNumber(overview.active_mentors),
      openScholarships: dashboardNumber(overview.open_scholarships),
      pendingPayments: dashboardNumber(overview.pending_payments),
      recentUsers,
    },

    userManagement: {
      totalUsers: dashboardNumber(userManagement.total_users),
      activeUsers: dashboardNumber(userManagement.active_users),
      suspendedUsers: dashboardNumber(userManagement.suspended_users),
    },

    finance: {
      monthlyRevenue: dashboardNumber(finance.monthly_revenue),
      premiumUsers: dashboardNumber(finance.premium_users),
      registeredUsers: dashboardNumber(finance.registered_users),
      transactionCount: dashboardNumber(finance.transaction_count),
    },

    university: {
      totalUniversities: dashboardNumber(university.total_universities),
      countriesCovered: dashboardNumber(university.countries_covered),
      archivedUniversities: dashboardNumber(
        university.archived_universities,
      ),
    },

    scholarship: {
      totalActivePrograms: dashboardNumber(
        scholarship.total_active_programs,
      ),
      openApplications: dashboardNumber(scholarship.open_applications),
      fullyFundedRatio: dashboardNumber(scholarship.fully_funded_ratio),
      fullyFundedCount: dashboardNumber(scholarship.fully_funded_count),
    },

    assessment: {
      totalDiagnosticQuestions: dashboardNumber(
        assessment.total_diagnostic_questions,
      ),
    },

    shop: {
      totalActiveCatalog: dashboardNumber(shop.total_active_catalog),
      topUpPackages: dashboardNumber(shop.top_up_packages),
      totalPurchased: dashboardNumber(shop.total_purchased),
    },

    practice: {
      totalPracticeExams: dashboardNumber(practice.total_practice_exams),
      questionBankSize: dashboardNumber(practice.question_bank_size),
      totalTestAttempts: dashboardNumber(practice.total_test_attempts),
    },

    gamification: {
      totalActiveBadges: dashboardNumber(gamification.total_active_badges),
      badgesUnlocked: dashboardNumber(gamification.badges_unlocked),
    },
  };
}

/**
 * GET
 * /api/admin/dashboard/stats
 */
export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const response = await apiRequest<unknown>("/api/admin/dashboard/stats");
  return normalizeAdminDashboardStats(response);
}