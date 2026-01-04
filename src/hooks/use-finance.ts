import { useCallback } from "react";
import { useSupabaseQuery } from "./use-supabase-query";
import {
  getFinancialStats,
  getMonthlyRevenue,
  getRecentTransactions,
} from "@/services/finance.service";
import type {
  FinancialStats,
  MonthlyRevenue,
  PaymentTransaction,
  DateFilter,
} from "@/services/finance.service";

/**
 * Hook to fetch financial statistics
 */
export function useFinancialStats(
  therapistId: string | undefined,
  dateFilter?: DateFilter
) {
  const queryFn = useCallback(() => {
    if (!therapistId) {
      return Promise.resolve({ data: null, error: null });
    }
    return getFinancialStats(therapistId, dateFilter);
  }, [therapistId, dateFilter?.startDate, dateFilter?.endDate]);

  return useSupabaseQuery<FinancialStats>(
    queryFn,
    ["financial-stats", therapistId, dateFilter?.startDate, dateFilter?.endDate],
    { enabled: !!therapistId }
  );
}

/**
 * Hook to fetch monthly revenue data
 */
export function useMonthlyRevenue(
  therapistId: string | undefined,
  months: number = 6
) {
  const queryFn = useCallback(() => {
    if (!therapistId) {
      return Promise.resolve({ data: null, error: null });
    }
    return getMonthlyRevenue(therapistId, months);
  }, [therapistId, months]);

  return useSupabaseQuery<MonthlyRevenue[]>(
    queryFn,
    ["monthly-revenue", therapistId, months],
    { enabled: !!therapistId }
  );
}

/**
 * Hook to fetch recent transactions
 */
export function useRecentTransactions(
  therapistId: string | undefined,
  dateFilter?: DateFilter,
  limit?: number
) {
  const queryFn = useCallback(() => {
    if (!therapistId) {
      return Promise.resolve({ data: null, error: null });
    }
    return getRecentTransactions(therapistId, dateFilter, limit);
  }, [therapistId, dateFilter?.startDate, dateFilter?.endDate, limit]);

  return useSupabaseQuery<PaymentTransaction[]>(
    queryFn,
    ["recent-transactions", therapistId, dateFilter?.startDate, dateFilter?.endDate, limit],
    { enabled: !!therapistId }
  );
}

