import { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Plus, Filter, Calendar as CalendarIcon, User, AlertCircle, MoreVertical, Edit, Trash2, X, ArrowLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTasks, useCompleteTask, useTaskCountByStatus, useDeleteTask, useUpdateTask } from "@/hooks";
import { useAuth } from "@/contexts/AuthContext";
import { AddTaskDialog } from "@/components/tasks/AddTaskDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { TaskPriority, TaskCategory, TaskStatus } from "@/lib/supabase/types";
import type { TaskWithClient } from "@/services/tasks.service";

const Tasks = () => {
  const { therapist } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithClient | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | "all">("all");
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<{ day: number; tasks: TaskWithClient[] } | null>(null);
  const [isCalendarAnimating, setIsCalendarAnimating] = useState(false);

  // Don't filter by status in the query for active tab, we'll filter client-side
  const queryFilters = activeTab === "completed" 
    ? { status: "completed" as TaskStatus }
    : undefined;

  const { data: tasksData, isLoading, refetch: refetchTasks } = useTasks(
    therapist?.id,
    {
      pagination: { page: 1, pageSize: 100 },
      filters: queryFilters,
      sort: { column: "due_date", ascending: true },
    }
  );

  const { data: taskCounts, refetch: refetchCounts } = useTaskCountByStatus(therapist?.id);
  const { mutate: completeTask } = useCompleteTask();
  const { mutate: updateTaskStatus } = useUpdateTask();
  const { mutate: deleteTask } = useDeleteTask();

  // Helper to refresh all data
  const refreshAllData = () => {
    refetchTasks();
    refetchCounts();
  };

  // Refetch when active tab changes
  useEffect(() => {
    refreshAllData();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    try {
      if (currentStatus === "completed") {
        // Uncomplete the task
        await updateTaskStatus({
          taskId,
          updates: { status: "pending", completed_at: null },
        });
      } else {
        // Complete the task
        await completeTask(taskId);
      }
      refreshAllData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task status.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string, taskTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${taskTitle}"?`)) {
      return;
    }

    try {
      await deleteTask(taskId);
      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully.",
      });
      refreshAllData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task.",
        variant: "destructive",
      });
    }
  };

  const handleEditTask = (task: TaskWithClient) => {
    setEditingTask(task);
    setIsAddDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setEditingTask(null);
  };

  const handleTaskSuccess = () => {
    refreshAllData();
  };

  const handleDateClick = (day: number, tasks: TaskWithClient[]) => {
    if (tasks.length === 0) return;
    
    setIsCalendarAnimating(true);
    // Wait for calendar to fade out
    setTimeout(() => {
      setSelectedCalendarDate({ day, tasks });
      // Wait a bit for React to update, then fade in the new view
      setTimeout(() => {
        setIsCalendarAnimating(false);
      }, 50);
    }, 500);
  };

  const handleBackToCalendar = () => {
    setIsCalendarAnimating(true);
    // Wait for tasks view to fade out
    setTimeout(() => {
      setSelectedCalendarDate(null);
      // Wait a bit for React to update, then fade in calendar
      setTimeout(() => {
        setIsCalendarAnimating(false);
      }, 50);
    }, 500);
  };

  const formatDueDate = (dueDateStr: string | null) => {
    if (!dueDateStr) return "No due date";
    
    const dueDate = new Date(dueDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays < 7) return `In ${diffDays} days`;
    
    return dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isOverdue = (dueDateStr: string | null) => {
    if (!dueDateStr) return false;
    const dueDate = new Date(dueDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-600';
      case 'High': return 'bg-orange-500';
      case 'Medium': return 'bg-sky-500';
      case 'Low': return 'bg-sage';
      default: return 'bg-muted';
    }
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    if (!tasksData?.data) return [];
    
    let filtered = tasksData.data;
    
    // Filter by status for active tab (exclude completed and cancelled)
    if (activeTab === "active") {
      filtered = filtered.filter((task) => 
        task.status !== "completed" && task.status !== "cancelled"
      );
    }
    
    if (priorityFilter !== "all") {
      filtered = filtered.filter((task) => task.priority === priorityFilter);
    }
    
    if (categoryFilter !== "all") {
      filtered = filtered.filter((task) => task.category === categoryFilter);
    }
    
    return filtered;
  }, [tasksData?.data, activeTab, priorityFilter, categoryFilter]);

  // Count overdue tasks
  const overdueTasks = useMemo(() => {
    if (!tasksData?.data) return [];
    return tasksData.data.filter((task) => 
      task.status !== "completed" && isOverdue(task.due_date)
    );
  }, [tasksData?.data]);

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Tasks & Follow-ups</h1>
          <p className="text-muted-foreground mt-1 text-lg">Manage your clinical and administrative workflow.</p>
        </div>
        
        <Button 
          onClick={() => {
            setEditingTask(null);
            setIsAddDialogOpen(true);
          }}
          className="bg-primary hover:bg-primary/90 text-primary-foreground flex gap-2 rounded-xl h-11 shadow-sm shadow-primary/20 font-semibold"
        >
          <Plus className="w-4 h-4" /> Add New Task
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/30 pb-4">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab("active")}
                className={cn(
                  "text-sm font-bold pb-4 -mb-[18px] transition-colors",
                  activeTab === "active"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                ACTIVE TASKS ({(taskCounts?.pending || 0) + (taskCounts?.in_progress || 0)})
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={cn(
                  "text-sm font-bold pb-4 -mb-[18px] transition-colors",
                  activeTab === "completed"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                COMPLETED ({taskCounts?.completed || 0})
              </button>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {(priorityFilter !== "all" || categoryFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPriorityFilter("all");
                    setCategoryFilter("all");
                  }}
                  className="h-8 text-xs"
                >
                  <X className="w-3 h-3 mr-1" /> Clear Filters
                </Button>
              )}
              
              <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as TaskPriority | "all")}>
                <SelectTrigger className="h-8 w-[130px] text-xs">
                  <Filter className="w-3 h-3 mr-1.5" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as TaskCategory | "all")}>
                <SelectTrigger className="h-8 w-[140px] text-xs">
                  <Filter className="w-3 h-3 mr-1.5" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Clinical">Clinical</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Assessment">Assessment</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                  <SelectItem value="Documentation">Documentation</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Task List */}
          {isLoading ? (
            <div className="space-y-3 pt-2">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-none shadow-sm">
                  <CardContent className="p-4">
                    <div className="animate-pulse flex gap-4">
                      <div className="w-5 h-5 rounded bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredTasks.length > 0 ? (
            <div className="space-y-3 pt-2">
              {filteredTasks.map((task) => (
                <Card key={task.id} className={cn(
                  "border-none shadow-sm transition-all hover:translate-x-1 group overflow-hidden relative",
                  task.status === 'completed' ? "opacity-60 bg-muted/30" : "bg-card border border-border/50"
                )}>
                  <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-1",
                    getPriorityColor(task.priority)
                  )} />
                  <CardContent className="p-4 flex items-center gap-3">
                    <Checkbox 
                      id={`task-${task.id}`} 
                      checked={task.status === 'completed'} 
                      onCheckedChange={() => handleToggleTask(task.id, task.status || 'pending')}
                      className="w-5 h-5 rounded-md border-border/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-colors" 
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditTask(task)}
                      className="h-7 w-7 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <div className="flex-1 min-w-0">
                      <label 
                        htmlFor={`task-${task.id}`} 
                        className={cn(
                          "font-semibold text-foreground cursor-pointer block truncate text-sm transition-all group-hover:text-primary",
                          task.status === 'completed' && "line-through text-muted-foreground"
                        )}
                      >
                        {task.title}
                        {isOverdue(task.due_date) && task.status !== 'completed' && (
                          <Badge variant="destructive" className="ml-2 text-[9px] font-black uppercase">
                            OVERDUE
                          </Badge>
                        )}
                      </label>
                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-1.5">
                        {task.clients && (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            <User className="w-3 h-3 text-primary" /> {task.clients.full_name}
                          </div>
                        )}
                        {task.due_date && (
                          <div className={cn(
                            "flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest",
                            isOverdue(task.due_date) && task.status !== 'completed' ? "text-destructive" : "text-primary"
                          )}>
                            <Clock className="w-3 h-3" /> {formatDueDate(task.due_date)}
                          </div>
                        )}
                        {task.category && (
                          <Badge variant="secondary" className="bg-muted text-[9px] font-black uppercase border-none h-4 px-1.5">
                            {task.category}
                          </Badge>
                        )}
                        {task.priority && (
                          <Badge 
                            className={cn(
                              "text-[9px] font-black uppercase border-none h-4 px-1.5 text-white",
                              getPriorityColor(task.priority)
                            )}
                          >
                            {task.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditTask(task)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Task
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteTask(task.id, task.title)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Task
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-none shadow-sm">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">
                  {activeTab === "active" ? "No active tasks" : "No completed tasks"}
                </p>
                {activeTab === "active" && (
                  <Button 
                    className="mt-4"
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Your First Task
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {overdueTasks.length > 0 && (
            <Card className="border-none shadow-sm bg-destructive/5 border border-destructive/10 overflow-hidden relative">
              <div className="absolute right-[-10%] top-[-10%] w-32 h-32 bg-destructive/10 rounded-full blur-3xl" />
              <CardHeader className="pb-2 relative">
                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 text-destructive text-balance">
                  <AlertCircle className="w-4 h-4" /> Overdue Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-sm text-foreground/80 mb-4 font-medium leading-relaxed">
                  You have <span className="text-destructive font-bold underline decoration-2">{overdueTasks.length}</span> overdue {overdueTasks.length === 1 ? "task" : "tasks"}.
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {overdueTasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="text-xs p-2 bg-background/50 rounded-lg">
                      <p className="font-semibold text-foreground truncate">{task.title}</p>
                      <p className="text-[10px] text-destructive font-bold mt-0.5">
                        {formatDueDate(task.due_date)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="pb-4 border-b border-border/30 bg-muted/10">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 text-muted-foreground">
                <CalendarIcon className="w-4 h-4 text-primary" /> Clinical Calendar
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 relative overflow-hidden min-h-[400px]">
              {(() => {
                const today = new Date();
                const currentMonth = today.getMonth();
                const currentYear = today.getFullYear();
                const currentDay = today.getDate();
                
                // Get first day of month and number of days
                const firstDay = new Date(currentYear, currentMonth, 1).getDay();
                const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                
                // Get tasks by date for current month
                const tasksByDate: Record<number, TaskWithClient[]> = {};
                if (tasksData?.data) {
                  tasksData.data
                    .filter(task => task.status !== 'completed' && task.status !== 'cancelled' && task.due_date)
                    .forEach((task) => {
                      const taskDate = new Date(task.due_date!);
                      if (taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear) {
                        const day = taskDate.getDate();
                        if (!tasksByDate[day]) tasksByDate[day] = [];
                        tasksByDate[day].push(task);
                      }
                    });
                }
                
                const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                
                return (
                  <>
                    {/* Calendar View */}
                    <div 
                      className={cn(
                        "transition-all duration-500 ease-in-out transform",
                        selectedCalendarDate ? "opacity-0 scale-95 pointer-events-none absolute inset-0" : "opacity-100 scale-100",
                        "[will-change:transform,opacity]"
                      )}
                    >
                      <div className="text-center mb-4">
                        <p className="text-sm font-bold text-foreground">{monthName}</p>
                      </div>
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {['S','M','T','W','T','F','S'].map(d => (
                          <div key={d} className="text-center text-[10px] font-black text-muted-foreground/50">{d}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: firstDay }).map((_, i) => (
                          <div key={`empty-${i}`} className="aspect-square" />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                          const day = i + 1;
                          const hasTasks = tasksByDate[day]?.length > 0;
                          const isToday = day === currentDay;
                          
                          return (
                            <button
                              key={day}
                              onClick={() => hasTasks && handleDateClick(day, tasksByDate[day])}
                              className={cn(
                                "aspect-square flex flex-col items-center justify-center text-[10px] font-bold rounded-lg transition-all relative gap-0.5",
                                isToday ? "bg-primary text-white shadow-sm shadow-primary/30" : 
                                hasTasks ? "bg-sage/20 text-foreground hover:bg-sage/30 cursor-pointer hover:scale-105" :
                                "hover:bg-muted text-foreground cursor-default"
                              )}
                              title={hasTasks ? `${tasksByDate[day].length} task(s) - Click to view` : undefined}
                              disabled={!hasTasks}
                            >
                              <span className="text-[11px]">{day}</span>
                              {hasTasks && (
                                <span className={cn(
                                  "text-[8px] font-black px-1 rounded",
                                  isToday ? "bg-white/20 text-white" : "bg-primary/80 text-white"
                                )}>
                                  {tasksByDate[day].length}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      {Object.keys(tasksByDate).length > 0 && (
                        <div className="mt-4 p-3 rounded-xl bg-sage-light/20 border border-sage-light/30">
                          <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Upcoming Tasks</p>
                          <div className="space-y-1.5 max-h-32 overflow-y-auto">
                            {Object.entries(tasksByDate)
                              .sort(([a], [b]) => parseInt(a) - parseInt(b))
                              .slice(0, 5)
                              .map(([day, tasks]) => (
                                <button
                                  key={day}
                                  onClick={() => handleDateClick(parseInt(day), tasks)}
                                  className="text-xs w-full text-left hover:bg-background/50 rounded p-1 transition-colors"
                                >
                                  <p className="font-bold text-foreground">{monthName.split(' ')[0]} {day}</p>
                                  {tasks.slice(0, 2).map(task => (
                                    <p key={task.id} className="text-[10px] text-muted-foreground truncate pl-2">
                                      • {task.title}
                                    </p>
                                  ))}
                                  {tasks.length > 2 && (
                                    <p className="text-[10px] text-muted-foreground pl-2">
                                      +{tasks.length - 2} more
                                    </p>
                                  )}
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Date Tasks View */}
                    {selectedCalendarDate && (
                      <div 
                        className={cn(
                          "transition-all duration-500 ease-in-out transform",
                          !isCalendarAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95",
                          "[will-change:transform,opacity]"
                        )}
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-bold text-foreground">
                                {monthName.split(' ')[0]} {selectedCalendarDate.day}, {currentYear}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {selectedCalendarDate.tasks.length} {selectedCalendarDate.tasks.length === 1 ? 'task' : 'tasks'}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleBackToCalendar}
                              className="h-8 text-xs gap-1 hover:bg-primary/10"
                            >
                              <ArrowLeft className="w-3 h-3" />
                              Back
                            </Button>
                          </div>

                          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                            {selectedCalendarDate.tasks.map((task) => (
                              <div
                                key={task.id}
                                className="p-3 bg-background rounded-lg border border-border/50 hover:border-primary/50 transition-colors group"
                              >
                                <div className="flex items-start gap-2">
                                  <Checkbox
                                    checked={task.status === 'completed'}
                                    onCheckedChange={() => handleToggleTask(task.id, task.status || 'pending')}
                                    className="mt-0.5 w-4 h-4"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className={cn(
                                      "text-sm font-semibold text-foreground truncate",
                                      task.status === 'completed' && "line-through text-muted-foreground"
                                    )}>
                                      {task.title}
                                    </p>
                                    {task.description && (
                                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {task.description}
                                      </p>
                                    )}
                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                      {task.clients && (
                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                          <User className="w-3 h-3" />
                                          {task.clients.full_name}
                                        </div>
                                      )}
                                      {task.due_time && (
                                        <div className="flex items-center gap-1 text-[10px] text-primary font-bold">
                                          <Clock className="w-3 h-3" />
                                          {task.due_time.slice(0, 5)}
                                        </div>
                                      )}
                                      {task.category && (
                                        <Badge variant="secondary" className="text-[9px] h-4">
                                          {task.category}
                                        </Badge>
                                      )}
                                      {task.priority && (
                                        <Badge 
                                          className={cn(
                                            "text-[9px] h-4 text-white",
                                            getPriorityColor(task.priority)
                                          )}
                                        >
                                          {task.priority}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditTask(task)}
                                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="pb-4 border-b border-border/30 bg-muted/10">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 text-muted-foreground">
                <CalendarIcon className="w-4 h-4 text-primary" /> Task Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending</span>
                <span className="text-lg font-bold text-foreground">{taskCounts?.pending || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">In Progress</span>
                <span className="text-lg font-bold text-primary">{taskCounts?.in_progress || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Completed</span>
                <span className="text-lg font-bold text-sage">{taskCounts?.completed || 0}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/30">
                <span className="text-sm font-semibold text-foreground">Total Active</span>
                <span className="text-xl font-black text-primary">
                  {(taskCounts?.pending || 0) + (taskCounts?.in_progress || 0)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AddTaskDialog
        open={isAddDialogOpen}
        onOpenChange={handleDialogClose}
        task={editingTask}
        onSuccess={handleTaskSuccess}
      />
    </DashboardLayout>
  );
};

export default Tasks;
