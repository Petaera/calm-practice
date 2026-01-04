import { supabase } from "@/lib/supabase/client";
import type { ApiResponse } from "@/lib/supabase/api-types";
import { toApiError } from "@/lib/supabase/api-types";
import type { Session } from "@/lib/supabase";

export interface FinancialStats {
  totalPaid: number;
  totalPending: number;
  totalUnpaid: number;
  averageSessionFee: number;
  pendingCount: number;
  unpaidCount: number;
  paidCount: number;
}

export interface MonthlyRevenue {
  month: string;
  year: number;
  amount: number;
  sessionCount: number;
}

export interface PaymentTransaction extends Session {
  client_name: string;
}

export interface DateFilter {
  startDate?: string;
  endDate?: string;
}

export type DateFilterPreset = "today" | "yesterday" | "last7days" | "last30days" | "customDate" | "customRange";

/**
 * Get date range for preset filters
 */
export function getDateRangeForPreset(preset: DateFilterPreset, customStart?: string, customEnd?: string): DateFilter {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  switch (preset) {
    case "today":
      return {
        startDate: today.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
      };
    
    case "yesterday":
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        startDate: yesterday.toISOString().split("T")[0],
        endDate: yesterday.toISOString().split("T")[0],
      };
    
    case "last7days":
      const last7 = new Date(today);
      last7.setDate(last7.getDate() - 7);
      return {
        startDate: last7.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
      };
    
    case "last30days":
      const last30 = new Date(today);
      last30.setDate(last30.getDate() - 30);
      return {
        startDate: last30.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
      };
    
    case "customDate":
      return {
        startDate: customStart,
        endDate: customStart, // Same date for single date filter
      };
    
    case "customRange":
      return {
        startDate: customStart,
        endDate: customEnd,
      };
    
    default:
      return {};
  }
}

/**
 * Get financial statistics for a therapist
 */
export async function getFinancialStats(
  therapistId: string,
  dateFilter?: DateFilter
): Promise<ApiResponse<FinancialStats>> {
  try {
    let query = supabase
      .from("sessions")
      .select("payment_amount, payment_status, session_date")
      .eq("therapist_id", therapistId)
      .not("payment_amount", "is", null);

    // Filter by date range if provided
    if (dateFilter?.startDate) {
      query = query.gte("session_date", dateFilter.startDate);
    }
    if (dateFilter?.endDate) {
      query = query.lte("session_date", dateFilter.endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    const stats: FinancialStats = {
      totalPaid: 0,
      totalPending: 0,
      totalUnpaid: 0,
      averageSessionFee: 0,
      pendingCount: 0,
      unpaidCount: 0,
      paidCount: 0,
    };

    if (!data || data.length === 0) {
      return { data: stats, error: null };
    }

    let totalAmount = 0;
    let sessionCount = 0;

    data.forEach((session: any) => {
      const amount = parseFloat(session.payment_amount) || 0;
      
      if (session.payment_status === "Paid") {
        stats.totalPaid += amount;
        stats.paidCount++;
      } else if (session.payment_status === "Pending") {
        stats.totalPending += amount;
        stats.pendingCount++;
      } else if (session.payment_status === "Unpaid") {
        stats.totalUnpaid += amount;
        stats.unpaidCount++;
      }

      totalAmount += amount;
      sessionCount++;
    });

    stats.averageSessionFee = sessionCount > 0 ? totalAmount / sessionCount : 0;

    return { data: stats, error: null };
  } catch (error: any) {
    return { data: null, error: toApiError(error) };
  }
}

/**
 * Get monthly revenue for the last N months
 */
export async function getMonthlyRevenue(
  therapistId: string,
  months: number = 6
): Promise<ApiResponse<MonthlyRevenue[]>> {
  try {
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months + 1);
    startDate.setDate(1);

    const { data, error } = await supabase
      .from("sessions")
      .select("payment_amount, payment_status, session_date")
      .eq("therapist_id", therapistId)
      .eq("payment_status", "Paid")
      .not("payment_amount", "is", null)
      .gte("session_date", startDate.toISOString().split("T")[0])
      .lte("session_date", endDate.toISOString().split("T")[0]);

    if (error) throw error;

    // Group by month
    const monthlyData: { [key: string]: MonthlyRevenue } = {};

    // Initialize all months
    for (let i = 0; i < months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const monthName = date.toLocaleString("default", { month: "short" });
      
      monthlyData[monthKey] = {
        month: monthName,
        year: date.getFullYear(),
        amount: 0,
        sessionCount: 0,
      };
    }

    // Aggregate data
    if (data) {
      data.forEach((session: any) => {
        const date = new Date(session.session_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].amount += parseFloat(session.payment_amount) || 0;
          monthlyData[monthKey].sessionCount++;
        }
      });
    }

    // Convert to array and sort by date (oldest first)
    const result = Object.values(monthlyData).reverse();

    return { data: result, error: null };
  } catch (error: any) {
    return { data: null, error: toApiError(error) };
  }
}

/**
 * Get recent payment transactions
 */
export async function getRecentTransactions(
  therapistId: string,
  dateFilter?: DateFilter,
  limit?: number
): Promise<ApiResponse<PaymentTransaction[]>> {
  try {
    let query = supabase
      .from("sessions")
      .select(`
        *,
        clients (
          full_name
        )
      `)
      .eq("therapist_id", therapistId)
      .not("payment_amount", "is", null);

    // Filter by date range if provided
    if (dateFilter?.startDate) {
      query = query.gte("session_date", dateFilter.startDate);
    }
    if (dateFilter?.endDate) {
      query = query.lte("session_date", dateFilter.endDate);
    }

    query = query
      .order("session_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    const transactions = (data || []).map((session: any) => ({
      ...session,
      client_name: session.clients?.full_name || "Unknown Client",
    }));

    return { data: transactions, error: null };
  } catch (error: any) {
    return { data: null, error: toApiError(error) };
  }
}

/**
 * Calculate growth percentage
 */
export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Export transactions to CSV
 */
export function exportTransactionsToCSV(
  transactions: PaymentTransaction[],
  currencySymbol: string = "$"
): void {
  if (!transactions || transactions.length === 0) {
    return;
  }

  // CSV headers
  const headers = [
    "Session ID",
    "Date",
    "Time",
    "Client Name",
    "Session Type",
    "Session Purpose",
    "Duration (min)",
    "Payment Amount",
    "Payment Status",
    "Status",
    "Location",
    "Notes",
  ];

  // Convert transactions to CSV rows
  const rows = transactions.map((t) => [
    t.session_id,
    t.session_date,
    t.session_time,
    t.client_name,
    t.session_type || "",
    t.session_purpose || "",
    t.duration_minutes || "",
    t.payment_amount ? `${currencySymbol}${t.payment_amount}` : "",
    t.payment_status || "",
    t.status || "",
    t.location || "",
    t.session_notes || "",
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => {
        // Escape cells that contain commas or quotes
        const cellStr = String(cell);
        if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n")) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(",")
    ),
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  const today = new Date().toISOString().split("T")[0];
  link.setAttribute("href", url);
  link.setAttribute("download", `payments_${today}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

