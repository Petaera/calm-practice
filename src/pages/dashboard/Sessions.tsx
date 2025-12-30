import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Search, Plus, Filter, FileText, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const Sessions = () => {
  const sessions = [
    { 
      id: "S-882", 
      clientName: "Alex Morgan", 
      date: "Oct 24, 2025", 
      time: "09:00 AM", 
      type: "In-person", 
      purpose: "Regular Therapy",
      status: "Completed",
      payment: "Paid"
    },
    { 
      id: "S-883", 
      clientName: "Sarah Jenkins", 
      date: "Oct 24, 2025", 
      time: "11:30 AM", 
      type: "Online", 
      purpose: "Intake Assessment",
      status: "Upcoming",
      payment: "Pending"
    },
    { 
      id: "S-884", 
      clientName: "Emily King", 
      date: "Oct 24, 2025", 
      time: "04:00 PM", 
      type: "In-person", 
      purpose: "Follow-up",
      status: "Upcoming",
      payment: "Paid"
    },
    { 
      id: "S-881", 
      clientName: "Michael Ross", 
      date: "Oct 22, 2025", 
      time: "02:00 PM", 
      type: "In-person", 
      purpose: "Family Session",
      status: "Completed",
      payment: "Paid"
    },
    { 
      id: "S-880", 
      clientName: "David Lowen", 
      date: "Oct 20, 2025", 
      time: "10:00 AM", 
      type: "Online", 
      purpose: "Termination",
      status: "Completed",
      payment: "Paid"
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Session Log</h1>
          <p className="text-muted-foreground mt-1 text-lg">Detailed history of all client encounters.</p>
        </div>
        
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground flex gap-2 rounded-xl h-11 shadow-sm shadow-primary/20">
          <Plus className="w-4 h-4" /> Log New Session
        </Button>
      </div>

      <div className="grid gap-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="border-none shadow-sm p-4 bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Total Sessions</p>
                <p className="text-2xl font-bold">142</p>
              </div>
            </div>
          </Card>
          <Card className="border-none shadow-sm p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-sage-light/50 rounded-2xl">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Hours This Month</p>
                <p className="text-2xl font-bold">48.5</p>
              </div>
            </div>
          </Card>
          <Card className="border-none shadow-sm p-4 hidden lg:block">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-sky-light/50 rounded-2xl">
                <Search className="w-6 h-6 text-sky" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Avg Duration</p>
                <p className="text-2xl font-bold">54 min</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex gap-2">
              <Badge variant="secondary" className="rounded-lg px-3 py-1 bg-primary/10 text-primary border-none text-[11px] font-bold">ALL SESSIONS</Badge>
              <Badge variant="ghost" className="rounded-lg px-3 py-1 text-muted-foreground hover:bg-muted text-[11px] font-bold transition-colors cursor-pointer">UPCOMING</Badge>
              <Badge variant="ghost" className="rounded-lg px-3 py-1 text-muted-foreground hover:bg-muted text-[11px] font-bold transition-colors cursor-pointer">PAST</Badge>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input placeholder="Search client..." className="pl-9 h-9 text-xs rounded-xl bg-muted/30 border-none" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/10 border-b border-border/50">
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Client</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Date & Time</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Details</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-muted/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground group-hover:text-primary transition-colors">{session.clientName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono font-bold">{session.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-foreground">{session.date}</div>
                      <div className="text-xs text-muted-foreground">{session.time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="rounded-lg font-bold text-[10px] bg-background border-border/50 shadow-sm flex items-center gap-1.5 w-fit uppercase tracking-tighter">
                          {session.type === 'In-person' ? <MapPin className="w-3 h-3 text-primary" /> : <Clock className="w-3 h-3 text-sky" />}
                          {session.type}
                        </Badge>
                        <span className="text-[11px] font-medium text-muted-foreground italic px-1">{session.purpose}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center gap-1">
                        <Badge className={cn(
                          "w-fit font-bold rounded-full border-none px-3 py-0.5 text-[10px] uppercase tracking-widest",
                          session.status === 'Completed' ? "bg-sage-light text-primary" : "bg-sky-light/50 text-sky"
                        )}>
                          {session.status}
                        </Badge>
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-widest",
                          session.payment === 'Paid' ? "text-primary/60" : "text-destructive/60"
                        )}>
                          {session.payment}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-primary hover:bg-primary/10">
                          <FileText className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Sessions;

