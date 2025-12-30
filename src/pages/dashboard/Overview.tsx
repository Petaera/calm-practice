import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Users, 
  Calendar, 
  CreditCard, 
  ClipboardCheck, 
  Clock,
  ArrowRight
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const StatCard = ({ title, value, icon: Icon, description }: any) => (
  <Card className="border-none shadow-sm bg-card transition-all hover:shadow-md">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className="p-2 bg-sage-light/30 rounded-lg">
        <Icon className="w-4 h-4 text-primary" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </CardContent>
  </Card>
);

const Overview = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Good Morning, Dr. Sarah</h1>
          <p className="text-muted-foreground mt-1 text-lg">Here is what's happening today.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground flex gap-2 rounded-xl h-11">
            <Plus className="w-4 h-4" /> Add Session
          </Button>
          <Button variant="outline" className="flex gap-2 rounded-xl h-11 border-border shadow-sm">
            <Plus className="w-4 h-4" /> Add Client
          </Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Clients" 
          value="24" 
          icon={Users} 
          description="Total active internal records" 
        />
        <StatCard 
          title="Sessions Today" 
          value="6" 
          icon={Calendar} 
          description="3 in-person, 3 online" 
        />
        <StatCard 
          title="Monthly Income" 
          value="$4,250" 
          icon={CreditCard} 
          description="+12% from last month" 
        />
        <StatCard 
          title="Tests Done" 
          value="18" 
          icon={ClipboardCheck} 
          description="Assessments this month" 
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mt-8">
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> Today's Sessions
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 flex gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="pt-4 px-0">
            <div className="space-y-1">
              {[
                { time: "09:00 AM", client: "Alex M.", type: "In-person", duration: "50m" },
                { time: "11:30 AM", client: "Sarah J.", type: "Online", duration: "50m" },
                { time: "02:00 PM", client: "Michael R.", type: "In-person", duration: "90m" },
              ].map((session, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-sage-light/10 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-primary w-20">{session.time}</span>
                    <div>
                      <h4 className="font-medium text-foreground">{session.client}</h4>
                      <p className="text-xs text-muted-foreground">{session.type} • {session.duration}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    Log Notes
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" /> Upcoming Follow-ups
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {[
                { client: "Emily K.", task: "PHQ-9 Assessment review", due: "Tomorrow" },
                { client: "David L.", task: "Check in on sleep diary", due: "Wednesday" },
              ].map((followup, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                  <div>
                    <h4 className="font-medium text-foreground">{followup.client}</h4>
                    <p className="text-sm text-muted-foreground">{followup.task}</p>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-primary/70 mt-1 block">
                      {followup.due}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Overview;

