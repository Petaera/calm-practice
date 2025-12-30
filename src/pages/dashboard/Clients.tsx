import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Filter, MoreVertical, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const Clients = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const clients = [
    { 
      id: "C-1024", 
      name: "Alex Morgan", 
      age: 28, 
      gender: "Non-binary", 
      concern: ["Generalized Anxiety", "Sleep Hygiene"], 
      status: "Active",
      lastSession: "2 days ago",
      totalSessions: 12
    },
    { 
      id: "C-1025", 
      name: "Sarah Jenkins", 
      age: 34, 
      gender: "Female", 
      concern: ["Workplace Burnout", "Life Transition"], 
      status: "Active",
      lastSession: "Yesterday",
      totalSessions: 4
    },
    { 
      id: "C-1026", 
      name: "Michael Ross", 
      age: 45, 
      gender: "Male", 
      concern: ["Grief", "Depressive Symptoms"], 
      status: "On-hold",
      lastSession: "3 weeks ago",
      totalSessions: 24
    },
    { 
      id: "C-1027", 
      name: "Emily King", 
      age: 22, 
      gender: "Female", 
      concern: ["Academic Stress", "Social Anxiety"], 
      status: "Active",
      lastSession: "Today",
      totalSessions: 8
    },
    { 
      id: "C-1028", 
      name: "David Lowen", 
      age: 51, 
      gender: "Male", 
      concern: ["Relationship Conflict"], 
      status: "Closed",
      lastSession: "2 months ago",
      totalSessions: 16
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Client Records</h1>
          <p className="text-muted-foreground mt-1 text-lg">Your private database of clinical contacts.</p>
        </div>
        
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground flex gap-2 rounded-xl h-11 shadow-sm shadow-primary/20">
          <Plus className="w-4 h-4" /> Add New Client
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-2xl shadow-sm border border-border/50">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, ID, or concern..." 
            className="pl-10 h-11 bg-background border-border/50 rounded-xl focus:ring-primary/20 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="flex gap-2 rounded-xl h-11 border-border shadow-sm flex-1 md:flex-none">
            <Filter className="w-4 h-4" /> Filter
          </Button>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-none flex items-center px-4 rounded-xl">
            {clients.length} Total
          </Badge>
        </div>
      </div>

      <div className="grid gap-4">
        {clients.map((client) => (
          <Card key={client.id} className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col lg:flex-row lg:items-center">
                <div className="flex-1 p-6 flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-sage-light/30 flex items-center justify-center text-primary font-bold text-lg shadow-inner shrink-0">
                    {client.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg text-foreground truncate group-hover:text-primary transition-colors">
                        {client.name}
                      </h3>
                      <span className="text-[10px] font-mono font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded uppercase tracking-wider">
                        {client.id}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                      <span>{client.age} years</span>
                      <span className="opacity-30">•</span>
                      <span>{client.gender}</span>
                      <span className="opacity-30">•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Last: {client.lastSession}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 lg:py-6 lg:border-l border-border/30 flex flex-col lg:flex-row lg:items-center gap-6 bg-muted/5 lg:bg-transparent">
                  <div className="flex flex-wrap gap-2 lg:max-w-[240px] lg:justify-end">
                    {client.concern.map(tag => (
                      <Badge key={tag} variant="secondary" className="bg-sky-light/40 text-sky font-semibold border-none px-2 py-0.5 text-[11px] uppercase tracking-tighter">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between lg:justify-end gap-6 w-full lg:w-auto">
                    <div className="flex flex-col items-end">
                      <Badge className={cn(
                        "font-bold px-3 py-1 rounded-full border-none text-[10px] uppercase tracking-widest",
                        client.status === 'Active' ? "bg-sage-light text-primary" : 
                        client.status === 'Closed' ? "bg-muted text-muted-foreground" : 
                        "bg-amber-100 text-amber-700"
                      )}>
                        {client.status}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground mt-1 font-medium">{client.totalSessions} total sessions</span>
                    </div>

                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-muted-foreground/10 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Clients;

