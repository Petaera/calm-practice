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
import { useClientCountByStatus, useUpcomingSessions, usePendingTasks } from "@/hooks";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";

const StatCard = ({ title, value, icon: Icon, description, isLoading }: { title: string, value: number, icon: React.ElementType, description: string, isLoading: boolean }) => (
  <Card className="border-none shadow-sm bg-card transition-all hover:shadow-md">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className="p-2 bg-sage-light/30 rounded-lg">
        <Icon className="w-4 h-4 text-primary" />
      </div>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-8 w-16 bg-muted rounded" />
        </div>
      ) : (
        <>
          <div className="text-2xl font-bold text-foreground">{value}</div>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </>
      )}
    </CardContent>
  </Card>
);

const Overview = () => {
  const { therapist } = useAuth();
  const { data: clientCounts, isLoading: clientsLoading } = useClientCountByStatus(therapist?.id);
  const { data: upcomingSessions, isLoading: sessionsLoading } = useUpcomingSessions(therapist?.id, 5);
  const { data: pendingTasks, isLoading: tasksLoading } = usePendingTasks(therapist?.id, 5);

  const activeClients = useMemo(() => {
    if (!clientCounts) return 0;
    return clientCounts.Active || 0;
  }, [clientCounts]);

  const todaysSessions = useMemo(() => {
    if (!upcomingSessions) return { count: 0, inPerson: 0, online: 0 };
    
    const today = new Date().toISOString().split('T')[0];
    const todaySessions = upcomingSessions.filter(s => s.session_date === today);
    
    return {
      count: todaySessions.length,
      inPerson: todaySessions.filter(s => s.session_type === 'In-person').length,
      online: todaySessions.filter(s => s.session_type === 'Online').length,
    };
  }, [upcomingSessions]);

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Good Morning, {therapist?.full_name || 'Doctor'}
          </h1>
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
          value={activeClients} 
          icon={Users} 
          description="Total active internal records" 
          isLoading={clientsLoading}
        />
        <StatCard 
          title="Sessions Today" 
          value={todaysSessions.count} 
          icon={Calendar} 
          description={`${todaysSessions.inPerson} in-person, ${todaysSessions.online} online`}
          isLoading={sessionsLoading}
        />
        <StatCard 
          title="Monthly Income" 
          value={4250} 
          icon={CreditCard} 
          description="+12% from last month" 
          isLoading={false}
        />
        <StatCard 
          title="Pending Tasks" 
          value={pendingTasks?.length || 0} 
          icon={ClipboardCheck} 
          description="Tasks requiring attention" 
          isLoading={tasksLoading}
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
            {sessionsLoading ? (
              <div className="px-6 py-8 text-center text-muted-foreground">
                Loading sessions...
              </div>
            ) : upcomingSessions && upcomingSessions.length > 0 ? (
              <div className="space-y-1">
                {upcomingSessions.slice(0, 3).map((session) => (
                  <div key={session.id} className="flex items-center justify-between px-6 py-4 hover:bg-sage-light/10 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-primary w-20">
                        {formatTime(session.session_time)}
                      </span>
                      <div>
                        <h4 className="font-medium text-foreground">
                          {session.clients?.full_name || 'Unknown Client'}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {session.session_type} • {session.duration_minutes || 50}m
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      Log Notes
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-8 text-center text-muted-foreground">
                No sessions scheduled today
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" /> Upcoming Follow-ups
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {tasksLoading ? (
              <div className="py-8 text-center text-muted-foreground">
                Loading tasks...
              </div>
            ) : pendingTasks && pendingTasks.length > 0 ? (
              <div className="space-y-6">
                {pendingTasks.slice(0, 2).map((task) => (
                  <div key={task.id} className="flex gap-4 items-start">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                    <div>
                      <h4 className="font-medium text-foreground">
                        {task.clients?.full_name || 'General Task'}
                      </h4>
                      <p className="text-sm text-muted-foreground">{task.title}</p>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-primary/70 mt-1 block">
                        {task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', { weekday: 'long' }) : 'No due date'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No pending follow-ups
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Overview;
