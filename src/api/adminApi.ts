import { apiRequest, ApiError } from "./apiClient";

export type AdminUser = {
  id: number;
  name: string;
  email?: string;
  role?: string;
  created_at?: string;
};

export async function getUsers(): Promise<AdminUser[]> {
  try {
    const data = await apiRequest<unknown>(
      "/api/admin/get-users",
    );

    if (Array.isArray(data)) {
      return data as AdminUser[];
    }

    if (
      data &&
      typeof data === "object" &&
      "data" in data &&
      Array.isArray((data as { data: unknown }).data)
    ) {
      return (data as { data: AdminUser[] }).data;
    }

    if (
      data &&
      typeof data === "object" &&
      "users" in data &&
      Array.isArray((data as { users: unknown }).users)
    ) {
      return (data as { users: AdminUser[] }).users;
    }

    return [];
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw error;
  }
}

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
    isRecord(responseRecord.data) ? responseRecord.data.data : undefined,
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

export type University = {
  id: string | number;
  name: string;
  country?: string;
  region?: string;
  qsRanking?: number;
  linkedScholarshipsCount?: number;
  totalInterestedMentees?: number;
  isDeleted?: boolean;
  website?: string;
};

export async function getUniversities(): Promise<University[]> {
  try {
    const data = await apiRequest<unknown>("/api/universities");
    return extractList<University>(data);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw error;
  }
}

export type Scholarship = {
  id: string | number;
  name: string;
  provider?: string;
  coverageType?: "Full" | "Partial";
  targetDegree?: string;
  deadline?: string;
  status?: "Open" | "Upcoming" | "Closed";
  totalApplicants?: number;
  isDeleted?: boolean;
  website?: string;
};

export async function getScholarships(): Promise<Scholarship[]> {
  try {
    const data = await apiRequest<unknown>("/api/scholarships");
    return extractList<Scholarship>(data);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw error;
  }
}

export type DiagnosticQuestion = {
  id: string | number;
  questionText: string;
  category?: string;
  questionType?: string;
  weightScore?: number;
  optionsCount?: number;
  updatedAt?: string;
};

export async function getDiagnosticQuestions(): Promise<DiagnosticQuestion[]> {
  try {
    const data = await apiRequest<unknown>("/api/admin/diagnostic-questions");
    return extractList<DiagnosticQuestion>(data);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw error;
  }
}

export type ShopItem = {
  id: string | number;
  name: string;
  type?: "Item" | "Top Up";
  priceRupiah?: number;
  coinValue?: number;
  priceInCoins?: number;
  category?: string;
  totalPurchased?: number;
  status?: "Active" | "Inactive";
  updatedAt?: string;
};

export async function getShopItems(): Promise<ShopItem[]> {
  try {
    const data = await apiRequest<unknown>("/api/admin/shop-items");
    return extractList<ShopItem>(data);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw error;
  }
}

export type PracticeExamQuestion = {
  id: string | number;
  questionText: string;
  questionType: string;
  points: number;
};

export type PracticeExam = {
  id: string | number;
  title: string;
  category?: string;
  durationMinutes?: number;
  totalQuestions?: number;
  totalAttempts?: number;
  avgScore?: number;
  createdAt?: string;
  questions?: PracticeExamQuestion[];
};

export async function getPracticeExams(): Promise<PracticeExam[]> {
  try {
    const data = await apiRequest<unknown>("/api/admin/practice-exams");
    return extractList<PracticeExam>(data);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw error;
  }
}

export type BadgeItem = {
  id: string | number;
  name: string;
  description?: string;
  category?: string;
  rarity?: string;
  iconEmoji?: string;
  unlockedCount?: number;
  status?: "Active" | "Inactive";
  updatedAt?: string;
};

export async function getBadges(): Promise<BadgeItem[]> {
  try {
    const data = await apiRequest<unknown>("/api/admin/badges");
    return extractList<BadgeItem>(data);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw error;
  }
}
