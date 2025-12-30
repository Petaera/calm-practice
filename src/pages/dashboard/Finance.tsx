import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CreditCard, Download, TrendingUp, DollarSign, ArrowUpRight, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const Finance = () => {
  const payments = [
    { id: "P-501", client: "Alex Morgan", amount: "$150", date: "Oct 24, 2025", status: "Paid", method: "Bank Transfer", category: "Therapy" },
    { id: "P-502", client: "Sarah Jenkins", amount: "$225", date: "Oct 24, 2025", status: "Pending", method: "Cash", category: "Assessment" },
    { id: "P-503", client: "Michael Ross", amount: "$225", date: "Oct 22, 2025", status: "Paid", method: "Bank Transfer", category: "Family" },
    { id: "P-504", client: "Emily King", amount: "$150", date: "Oct 19, 2025", status: "Paid", method: "Bank Transfer", category: "Therapy" },
    { id: "P-505", client: "David Lowen", amount: "$150", date: "Oct 18, 2025", status: "Overdue", method: "Credit Card", category: "Therapy" },
  ];

  const monthlyData = [
    { month: "May", amount: 3200 },
    { month: "Jun", amount: 3800 },
    { month: "Jul", amount: 3400 },
    { month: "Aug", amount: 4100 },
    { month: "Sep", amount: 3900 },
    { month: "Oct", amount: 4250 },
  ];

  const maxAmount = Math.max(...monthlyData.map(d => d.amount));

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Income & Payments</h1>
          <p className="text-muted-foreground mt-1 text-lg">Detailed tracking of your clinical revenue.</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl h-11 border-border shadow-sm flex gap-2 font-semibold">
            <Download className="w-4 h-4 text-primary" /> Export CSV
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground flex gap-2 rounded-xl h-11 shadow-sm shadow-primary/20 font-semibold">
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
                <p className="text-primary-foreground/70 text-[10px] font-bold uppercase tracking-widest">This Month</p>
                <p className="text-3xl font-bold mt-1">$4,250</p>
                <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold bg-white/10 w-fit px-2 py-0.5 rounded-full">
                  <ArrowUpRight className="w-3 h-3" /> 12% GROWTH
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white border border-border/50">
              <CardContent className="p-6">
                <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Pending Income</p>
                <p className="text-3xl font-bold mt-1 text-foreground">$450</p>
                <p className="text-[10px] text-amber-600 font-bold mt-4">2 INVOICES PENDING</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white border border-border/50">
              <CardContent className="p-6">
                <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Avg. per Session</p>
                <p className="text-3xl font-bold mt-1 text-foreground">$165</p>
                <p className="text-[10px] text-primary font-bold mt-4">STABLE TREND</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-border/30">
              <div>
                <CardTitle className="text-lg font-semibold">Monthly Performance</CardTitle>
                <CardDescription className="text-xs">Clinical income trends over the last 6 months</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-sage-light/30 text-primary border-none">USD</Badge>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="h-48 flex items-end justify-between gap-2 px-2">
                {monthlyData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                    <div className="relative w-full flex justify-center">
                      <div 
                        className="w-12 bg-sage-light/40 group-hover:bg-primary transition-all duration-500 rounded-t-lg relative"
                        style={{ height: `${(d.amount / maxAmount) * 100}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          ${d.amount}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{d.month}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4 border-b border-border/30">
              <CardTitle className="text-lg font-semibold flex items-center justify-between">
                Transactions
                <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-wider text-primary px-2 hover:bg-primary/5">
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/30">
                {payments.map((p) => (
                  <div key={p.id} className="p-4 flex items-center justify-between hover:bg-muted/5 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sage-light/20 flex items-center justify-center text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{p.client}</p>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">{p.category} • {p.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">{p.amount}</p>
                      <Badge className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-1.5 py-0 border-none h-4",
                        p.status === 'Paid' ? "bg-sage-light text-primary" : 
                        p.status === 'Overdue' ? "bg-destructive/10 text-destructive" : 
                        "bg-amber-100 text-amber-700"
                      )}>
                        {p.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
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
                "Assessments contributed to 15% of your income this month. Consider streamlining your template billing."
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Finance;

