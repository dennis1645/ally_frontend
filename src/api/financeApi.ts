import { apiRequest, ApiError } from "./apiClient";

export type Transaction = {
  id: number;
  amount: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
};

export type FinanceSummary = {
  revenue?: number;
  revenue_change?: number;
  premium_users?: number;
  registered_users?: number;
  active_users?: number;
  data?: Record<string, unknown>;
};

export async function getTransactions(): Promise<Transaction[]> {
  try {
    const data = await apiRequest<unknown>("/api/transactions");

    if (Array.isArray(data)) {
      return data as Transaction[];
    }

    if (
      data &&
      typeof data === "object" &&
      "transactions" in data &&
      Array.isArray((data as { transactions: unknown }).transactions)
    ) {
      return (data as { transactions: Transaction[] }).transactions;
    }

    return [];
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw error;
  }
}

export async function getFinanceSummary(): Promise<FinanceSummary> {
  try {
    const data = await apiRequest<unknown>("/api/admin/finance-summary");

    if (data && typeof data === "object") {
      return data as FinanceSummary;
    }

    return {};
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    return {};
  }
}
