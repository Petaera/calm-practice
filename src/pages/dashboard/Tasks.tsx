import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Plus, Filter, Calendar as CalendarIcon, User, AlertCircle, MoreVertical } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const Tasks = () => {
  const tasks = [
    { id: 1, text: "Review intake form for New Client", client: "Sarah J.", due: "Today", priority: "High", category: "Clinical", completed: false },
    { id: 2, text: "Draft session report for C-1026", client: "Michael R.", due: "Today", priority: "High", category: "Admin", completed: false },
    { id: 3, text: "Score GAD-7 Assessment", client: "Emily K.", due: "Tomorrow", priority: "Medium", category: "Assessment", completed: false },
    { id: 4, text: "Send follow-up email regarding sleep diary", client: "David L.", due: "Oct 26", priority: "Medium", category: "Follow-up", completed: false },
    { id: 5, text: "Submit monthly summary for side-hustle", client: "N/A", due: "Oct 31", priority: "Low", category: "Admin", completed: false },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Tasks & Follow-ups</h1>
          <p className="text-muted-foreground mt-1 text-lg">Manage your clinical and administrative workflow.</p>
        </div>
        
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground flex gap-2 rounded-xl h-11 shadow-sm shadow-primary/20 font-semibold">
          <Plus className="w-4 h-4" /> Add New Task
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-border/30 pb-4">
            <div className="flex gap-6">
              <button className="text-sm font-bold text-primary border-b-2 border-primary pb-4 -mb-[18px]">ACTIVE TASKS</button>
              <button className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors pb-4 -mb-[18px]">COMPLETED</button>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted">
                <Filter className="w-3 h-3 mr-1.5" /> Filter
              </Button>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {tasks.map((task) => (
              <Card key={task.id} className={cn(
                "border-none shadow-sm transition-all hover:translate-x-1 group overflow-hidden relative",
                task.completed ? "opacity-60 bg-muted/30" : "bg-card border border-border/50"
              )}>
                <div className={cn(
                  "absolute left-0 top-0 bottom-0 w-1",
                  task.priority === 'High' ? "bg-destructive" : 
                  task.priority === 'Medium' ? "bg-sky-500" : "bg-sage"
                )} />
                <CardContent className="p-4 flex items-center gap-4">
                  <Checkbox 
                    id={`task-${task.id}`} 
                    checked={task.completed} 
                    className="w-5 h-5 rounded-md border-border/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-colors" 
                  />
                  <div className="flex-1 min-w-0">
                    <label 
                      htmlFor={`task-${task.id}`} 
                      className={cn(
                        "font-semibold text-foreground cursor-pointer block truncate text-sm transition-all group-hover:text-primary",
                        task.completed && "line-through text-muted-foreground"
                      )}
                    >
                      {task.text}
                    </label>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        <User className="w-3 h-3 text-primary" /> {task.client}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-widest">
                        <Clock className="w-3 h-3" /> {task.due}
                      </div>
                      <Badge variant="secondary" className="bg-muted text-[9px] font-black uppercase border-none h-4 px-1.5">
                        {task.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-destructive/5 border border-destructive/10 overflow-hidden relative">
            <div className="absolute right-[-10%] top-[-10%] w-32 h-32 bg-destructive/10 rounded-full blur-3xl" />
            <CardHeader className="pb-2 relative">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 text-destructive text-balance">
                <AlertCircle className="w-4 h-4" /> Focus Needed
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-sm text-foreground/80 mb-6 font-medium leading-relaxed">
                The following clients haven't been seen in over <span className="text-destructive font-bold underline decoration-2 text-balance">14 days</span>.
              </p>
              <div className="space-y-2">
                {[
                  { name: 'Michael Ross', days: 18 },
                  { name: 'David Lowen', days: 24 },
                  { name: 'Sarah Jenkins', days: 15 }
                ].map(item => (
                  <div key={item.name} className="flex justify-between items-center p-3 bg-white border border-border/30 rounded-xl hover:shadow-sm transition-all group cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-foreground block group-hover:text-primary">{item.name}</span>
                      <span className="text-[10px] text-muted-foreground">{item.days} days since last session</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] font-black text-primary hover:bg-primary/5 uppercase">Contact</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="pb-4 border-b border-border/30 bg-muted/10">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 text-muted-foreground">
                <CalendarIcon className="w-4 h-4 text-primary" /> Clinical Calendar
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['S','M','T','W','T','F','S'].map(d => (
                  <div key={d} className="text-center text-[10px] font-black text-muted-foreground/50">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 31 }).map((_, i) => (
                  <div key={i} className={cn(
                    "aspect-square flex items-center justify-center text-[10px] font-bold rounded-lg cursor-pointer transition-all",
                    i + 1 === 24 ? "bg-primary text-white shadow-sm shadow-primary/30" : "hover:bg-muted text-foreground"
                  )}>
                    {i + 1}
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 rounded-xl bg-sage-light/20 border border-sage-light/30">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Today's Load</p>
                <p className="text-sm font-semibold text-foreground italic">"6 sessions scheduled today. Take 5-minute breaks between sessions."</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Tasks;

