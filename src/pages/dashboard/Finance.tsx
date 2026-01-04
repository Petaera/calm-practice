import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CreditCard, Download, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight, Plus, Calendar as CalendarIcon, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useTherapistSettings } from "@/hooks/use-therapist-settings";
import { useFinancialStats, useMonthlyRevenue, useRecentTransactions } from "@/hooks/use-finance";
import { formatCurrency, getCurrencySymbol } from "@/utils/currency";
import { calculateGrowth, getDateRangeForPreset, exportTransactionsToCSV } from "@/services/finance.service";
import type { DateFilterPreset } from "@/services/finance.service";
import { useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Finance = () => {
  const { therapist } = useAuth();
  const { toast } = useToast();
  const { data: settings } = useTherapistSettings(therapist?.id);
  const currency = settings?.currency || "USD";

  // Date filter state
  const [filterPreset, setFilterPreset] = useState<DateFilterPreset>("last30days");
  const [customDate, setCustomDate] = useState<string>("");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [showCustomRangePicker, setShowCustomRangePicker] = useState(false);

  // Get date range based on filter
  const dateFilter = useMemo(() => {
    if (filterPreset === "customDate") {
      return getDateRangeForPreset(filterPreset, customDate);
    }
    return getDateRangeForPreset(filterPreset, customStartDate, customEndDate);
  }, [filterPreset, customDate, customStartDate, customEndDate]);

  // Use filtered stats for the main cards
  const { data: currentStats, isLoading: statsLoading } = useFinancialStats(
    therapist?.id,
    dateFilter
  );

  // Get previous period stats for growth calculation
  const previousPeriodFilter = useMemo(() => {
    if (!dateFilter.startDate || !dateFilter.endDate) return undefined;

    const start = new Date(dateFilter.startDate);
    const end = new Date(dateFilter.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Calculate previous period of same length
    const prevEnd = new Date(start);
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - diffDays);

    return {
      startDate: prevStart.toISOString().split("T")[0],
      endDate: prevEnd.toISOString().split("T")[0],
    };
  }, [dateFilter]);

  const { data: previousStats } = useFinancialStats(
    therapist?.id,
    previousPeriodFilter
  );

  const { data: monthlyRevenue, isLoading: revenueLoading } = useMonthlyRevenue(
    therapist?.id,
    6
  );

  // Use filtered transactions
  const { data: transactions, isLoading: transactionsLoading } = useRecentTransactions(
    therapist?.id,
    dateFilter,
    filterPreset === "customRange" || filterPreset === "customDate" ? undefined : 10
  );

  // Calculate growth
  const growth = useMemo(() => {
    if (!currentStats || !previousStats) return 0;
    return calculateGrowth(currentStats.totalPaid, previousStats.totalPaid);
  }, [currentStats, previousStats]);

  const maxAmount = useMemo(() => {
    if (!monthlyRevenue || monthlyRevenue.length === 0) return 1;
    return Math.max(...monthlyRevenue.map((d) => d.amount));
  }, [monthlyRevenue]);

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-sage-light text-primary";
      case "Pending":
        return "bg-amber-100 text-amber-700";
      case "Unpaid":
        return "bg-destructive/10 text-destructive";
      case "Insurance":
        return "bg-sky-light text-sky";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Handle CSV export
  const handleExportCSV = () => {
    if (!transactions || transactions.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no transactions in the selected date range.",
        variant: "destructive",
      });
      return;
    }

    const currencySymbol = getCurrencySymbol(currency);
    exportTransactionsToCSV(transactions, currencySymbol);
    
    toast({
      title: "Export successful",
      description: `Exported ${transactions.length} transaction${transactions.length !== 1 ? "s" : ""} to CSV.`,
    });
  };

  // Get filter label
  const getFilterLabel = () => {
    switch (filterPreset) {
      case "today":
        return "Today";
      case "yesterday":
        return "Yesterday";
      case "last7days":
        return "Last 7 Days";
      case "last30days":
        return "Last 30 Days";
      case "customDate":
        return "Custom Date";
      case "customRange":
        return "Custom Range";
      default:
        return "Select Filter";
    }
  };

  // Get period label for cards
  const getPeriodLabel = () => {
    switch (filterPreset) {
      case "today":
        return "Today";
      case "yesterday":
        return "Yesterday";
      case "last7days":
        return "Last 7 Days";
      case "last30days":
        return "Last 30 Days";
      case "customDate":
        return customDate ? new Date(customDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Custom Date";
      case "customRange":
        if (customStartDate && customEndDate) {
          const start = new Date(customStartDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
          const end = new Date(customEndDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
          return `${start} - ${end}`;
        }
        return "Custom Range";
      default:
        return "Period";
    }
  };

  if (statsLoading || revenueLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading financial data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const totalPending = (currentStats?.totalPending || 0) + (currentStats?.totalUnpaid || 0);
  const pendingCount = (currentStats?.pendingCount || 0) + (currentStats?.unpaidCount || 0);

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Income & Payments</h1>
          <p className="text-muted-foreground mt-1 text-lg">Detailed tracking of your clinical revenue.</p>
        </div>

        <div className="flex gap-3">
          <Select value={filterPreset} onValueChange={(value) => {
            setFilterPreset(value as DateFilterPreset);
            setShowCustomDatePicker(false);
            setShowCustomRangePicker(false);
            if (value === "customDate") {
              setShowCustomDatePicker(true);
            } else if (value === "customRange") {
              setShowCustomRangePicker(true);
            }
          }}>
            <SelectTrigger className="w-[180px] rounded-xl h-11">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <SelectValue>{getFilterLabel()}</SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="last7days">Last 7 Days</SelectItem>
              <SelectItem value="last30days">Last 30 Days</SelectItem>
              <SelectItem value="customDate">Custom Date</SelectItem>
              <SelectItem value="customRange">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          {showCustomDatePicker && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="rounded-xl h-11 flex gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  {customDate || "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4" align="end">
                <div className="space-y-2">
                  <Label>Select Date</Label>
                  <Input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </PopoverContent>
            </Popover>
          )}

          {showCustomRangePicker && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="rounded-xl h-11 flex gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  {customStartDate && customEndDate
                    ? `${customStartDate} to ${customEndDate}`
                    : "Select dates"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4" align="end">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}

          <Button
            variant="outline"
            className="rounded-xl h-11 border-border shadow-sm flex gap-2 font-semibold"
            onClick={handleExportCSV}
            disabled={transactionsLoading || !transactions || transactions.length === 0}
          >
            <Download className="w-4 h-4 text-primary" /> Export CSV
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground flex gap-2 rounded-xl h-11 shadow-sm shadow-primary/20 font-semibold"
          >
            <Plus className="w-4 h-4" /> Log Payment
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="border-none shadow-sm bg-sage text-primary-foreground relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
              <CardContent className="p-6 relative">
                <p className="text-primary-foreground/70 text-[10px] font-bold uppercase tracking-widest">
                  Total Paid - {getPeriodLabel()}
                </p>
                <p className="text-3xl font-bold mt-1">
                  {formatCurrency(currentStats?.totalPaid || 0, currency)}
                </p>
                <div
                  className={cn(
                    "mt-4 flex items-center gap-1.5 text-[10px] font-bold w-fit px-2 py-0.5 rounded-full",
                    growth >= 0 ? "bg-white/10" : "bg-white/10"
                  )}
                >
                  {growth >= 0 ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {Math.abs(growth).toFixed(1)}% vs previous period
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-card border border-border/50">
              <CardContent className="p-6">
                <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                  To Be Collected - {getPeriodLabel()}
                </p>
                <p className="text-3xl font-bold mt-1 text-foreground">
                  {formatCurrency(totalPending, currency)}
                </p>
                <p className="text-[10px] text-amber-600 font-bold mt-4">
                  {pendingCount} INVOICE{pendingCount !== 1 ? "S" : ""} PENDING
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-card border border-border/50">
              <CardContent className="p-6">
                <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                  Avg. per Session - {getPeriodLabel()}
                </p>
                <p className="text-3xl font-bold mt-1 text-foreground">
                  {formatCurrency(currentStats?.averageSessionFee || 0, currency)}
                </p>
                <p className="text-[10px] text-primary font-bold mt-4">
                  {currentStats?.paidCount || 0} SESSIONS PAID
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-border/30">
              <div>
                <CardTitle className="text-lg font-semibold">Monthly Performance</CardTitle>
                <CardDescription className="text-xs">
                  Clinical income trends over the last 6 months
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-sage-light/30 text-primary border-none">
                {currency}
              </Badge>
            </CardHeader>
            <CardContent className="pt-8">
              {monthlyRevenue && monthlyRevenue.length > 0 ? (
                <div className="h-48 flex items-end justify-between gap-2 px-2">
                  {monthlyRevenue.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                      <div className="relative w-full flex justify-center">
                        <div
                          className="w-12 bg-sage-light/40 group-hover:bg-primary transition-all duration-500 rounded-t-lg relative"
                          style={{ height: `${maxAmount > 0 ? (d.amount / maxAmount) * 100 : 0}%`, minHeight: d.amount > 0 ? "20px" : "0px" }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                            {formatCurrency(d.amount, currency, false)}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">
                        {d.month}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">No revenue data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4 border-b border-border/30">
              <CardTitle className="text-lg font-semibold flex items-center justify-between">
                Transactions
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[10px] font-bold uppercase tracking-wider text-primary px-2 hover:bg-primary/5"
                >
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {transactionsLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-xs text-muted-foreground">Loading transactions...</p>
                </div>
              ) : transactions && transactions.length > 0 ? (
                <div className="divide-y divide-border/30">
                  {transactions.map((t) => (
                    <div
                      key={t.id}
                      className="p-4 flex items-center justify-between hover:bg-muted/5 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sage-light/20 flex items-center justify-center text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                          <DollarSign className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                            {t.client_name}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                            {t.session_purpose || t.session_type || "Session"} •{" "}
                            {formatDate(t.session_date)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">
                          {formatCurrency(t.payment_amount || 0, currency)}
                        </p>
                        <Badge
                          className={cn(
                            "text-[9px] font-black uppercase tracking-widest px-1.5 py-0 border-none h-4",
                            getStatusColor(t.payment_status || "Pending")
                          )}
                        >
                          {t.payment_status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-sm text-muted-foreground">No transactions yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Payments will appear here once sessions have payment amounts
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-sky-light/10 border border-sky-light/20 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-sky-light/50 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-sky" />
                </div>
                <h4 className="font-semibold text-sky text-sm uppercase tracking-wider">Insight</h4>
              </div>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed italic">
                {growth >= 10
                  ? `Great progress! Your income increased by ${growth.toFixed(1)}% this month. Keep up the excellent work.`
                  : growth >= 0
                  ? `Your income is ${growth > 0 ? `up ${growth.toFixed(1)}%` : "stable"} this month. Consider booking more sessions to increase revenue.`
                  : `Your income decreased by ${Math.abs(growth).toFixed(1)}% this month. Review your scheduling to identify opportunities for growth.`}
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-primary/5 border border-primary/20 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CreditCard className="w-4 h-4 text-primary" />
                </div>
                <h4 className="font-semibold text-primary text-sm uppercase tracking-wider">
                  Currency: {currency}
                </h4>
              </div>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                All amounts are displayed in <strong>{currency}</strong> ({getCurrencySymbol(currency)}).
                You can change your preferred currency in Settings.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Finance;
