import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, ClipboardCheck, BookOpen, Star, ArrowRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Assessments = () => {
  const templates = [
    { title: "PHQ-9 (Depression)", questions: 9, category: "Clinical", recent: true },
    { title: "GAD-7 (Anxiety)", questions: 7, category: "Clinical", recent: true },
    { title: "DASS-21", questions: 21, category: "Stress/Mood", recent: false },
    { title: "Self-Esteem Scale", questions: 10, category: "Personal", recent: false },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Assessments</h1>
          <p className="text-muted-foreground mt-1 text-lg">Manage templates and client evaluations.</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl h-11 border-border shadow-sm">
            Template Builder
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground flex gap-2 rounded-xl h-11">
            <Plus className="w-4 h-4" /> New Assessment
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="md:col-span-2 lg:col-span-2 border-none shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" /> Active Templates
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {templates.map((template, i) => (
                <div key={i} className="flex items-center justify-between p-6 hover:bg-muted/10 transition-colors group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-sage-light/30 flex items-center justify-center text-primary">
                      <ClipboardCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{template.title}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">{template.questions} Questions</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold text-muted-foreground py-0 border-border/50">{template.category}</Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground group-hover:text-primary">
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-primary/5 border border-primary/10">
            <CardHeader>
              <CardTitle className="text-base">Quick Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Conducted this month</span>
                <span className="font-bold text-primary text-lg">18</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Templates used</span>
                <span className="font-bold text-primary text-lg">4</span>
              </div>
              <Button className="w-full mt-2 bg-primary/10 hover:bg-primary/20 text-primary border-none shadow-none rounded-xl">
                View Reports
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Recent Results
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {[
                { name: "Alex M.", score: "14", test: "PHQ-9", date: "2h ago" },
                { name: "Sarah J.", score: "Moderate", test: "GAD-7", date: "Yesterday" },
              ].map((result, i) => (
                <div key={i} className="px-6 py-4 border-t border-border/50 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-semibold">{result.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{result.test}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">{result.score}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{result.date}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Assessments;

