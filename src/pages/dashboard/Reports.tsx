import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const Reports = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Reports & Insights</h1>
          <p className="text-muted-foreground mt-1 text-lg">Visual overview of your practice metrics.</p>
        </div>
        
        <Button variant="outline" className="rounded-xl h-11 border-border shadow-sm flex gap-2">
          <Download className="w-4 h-4" /> Download Annual Report
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-primary">
              <TrendingUp className="w-5 h-5" /> Session Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex flex-col justify-end gap-2 pt-8">
              <div className="flex items-end justify-between gap-2 flex-1">
                {[45, 62, 58, 75, 90, 82, 95].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div 
                      className="w-full bg-sage-light/50 group-hover:bg-primary transition-all duration-300 rounded-t-lg" 
                      style={{ height: `${val}%` }} 
                    />
                    <span className="text-[10px] text-muted-foreground font-bold uppercase">M{i+1}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">Average: 68 sessions per month</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-sky">
              <Users className="w-5 h-5" /> Client Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex flex-col justify-end pt-8">
              <div className="relative flex-1">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path 
                    d="M 0 80 Q 25 70, 50 40 T 100 20" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    className="text-sky"
                  />
                  <path 
                    d="M 0 80 Q 25 70, 50 40 T 100 20 L 100 100 L 0 100 Z" 
                    fill="currentColor" 
                    className="text-sky/10"
                  />
                </svg>
              </div>
              <div className="flex justify-between mt-4">
                <span className="text-[10px] text-muted-foreground font-bold">JAN</span>
                <span className="text-[10px] text-muted-foreground font-bold">MAR</span>
                <span className="text-[10px] text-muted-foreground font-bold">MAY</span>
                <span className="text-[10px] text-muted-foreground font-bold">JUL</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm col-span-full">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Most Used Assessment</p>
                <p className="text-lg font-semibold text-foreground">PHQ-9 (Depression)</p>
                <p className="text-xs text-primary font-medium mt-1">42% of total assessments</p>
              </div>
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Retention Rate</p>
                <p className="text-lg font-semibold text-foreground">92.4%</p>
                <p className="text-xs text-primary font-medium mt-1">+2.1% from last quarter</p>
              </div>
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Avg Session Length</p>
                <p className="text-lg font-semibold text-foreground">54 Minutes</p>
                <p className="text-xs text-muted-foreground font-medium mt-1">Standard clinical hour</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Reports;

