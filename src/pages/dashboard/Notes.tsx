import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Plus, StickyNote, Star, Tag, SearchIcon, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const Notes = () => {
  const [search, setSearch] = useState("");

  const notes = [
    { 
      id: 1, 
      title: "Observation on CBT techniques", 
      content: "Patient showing positive response to cognitive reframing regarding social anxiety triggers...", 
      date: "Oct 23, 2025", 
      tags: ["CBT", "Anxiety"],
      important: true 
    },
    { 
      id: 2, 
      title: "Self-care strategy ideas", 
      content: "Brainstorming new mindfulness exercises for group sessions. Needs to be simplified for beginners.", 
      date: "Oct 21, 2025", 
      tags: ["Resource", "Mindfulness"],
      important: false 
    },
    { 
      id: 3, 
      title: "Book recommendation", 
      content: "'The Body Keeps the Score' - relevant for trauma-informed care focus next month.", 
      date: "Oct 20, 2025", 
      tags: ["Reading", "Trauma"],
      important: false 
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Notes & Observations</h1>
          <p className="text-muted-foreground mt-1 text-lg">Quick notes and professional insights.</p>
        </div>
        
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground flex gap-2 rounded-xl h-11">
          <Plus className="w-4 h-4" /> Create Quick Note
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Global search across all notes..." 
          className="pl-10 h-11 bg-card border-border/50 rounded-xl shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note) => (
          <Card key={note.id} className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col group relative">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-sage-light/30 rounded-lg text-primary">
                  <StickyNote className="w-4 h-4" />
                </div>
                {note.important && (
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                )}
              </div>
              
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-1">{note.title}</h3>
              <p className="text-sm text-muted-foreground mb-6 line-clamp-3 flex-1">{note.content}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {note.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="bg-muted text-[10px] text-muted-foreground uppercase border-none px-2 py-0">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{note.date}</span>
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Notes;

