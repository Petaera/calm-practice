import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateTask, useUpdateTask } from "@/hooks/use-tasks";
import { useClients } from "@/hooks/use-clients";
import { useToast } from "@/hooks/use-toast";
import type { TaskInsert, TaskUpdate, TaskPriority, TaskCategory, TaskStatus } from "@/lib/supabase/types";
import type { TaskWithClient } from "@/services/tasks.service";

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: TaskWithClient | null;
  onSuccess?: () => void;
}

export const AddTaskDialog = ({ open, onOpenChange, task, onSuccess }: AddTaskDialogProps) => {
  const { therapist } = useAuth();
  const { toast } = useToast();
  const { mutate: createTask, isLoading: isCreating } = useCreateTask();
  const { mutate: updateTask, isLoading: isUpdating } = useUpdateTask();
  const { data: clientsResponse } = useClients(therapist?.id);

  const [formData, setFormData] = useState<Partial<TaskInsert>>({
    therapist_id: therapist?.id || "",
    title: "",
    description: "",
    category: "Clinical",
    priority: "Medium",
    status: "pending",
    due_date: "",
    due_time: "",
    client_id: "",
    is_recurring: false,
    recurrence_pattern: null,
  });

  const [recurrenceFrequency, setRecurrenceFrequency] = useState<"daily" | "weekly" | "monthly" | "yearly">("weekly");

  useEffect(() => {
    if (task) {
      setFormData({
        therapist_id: task.therapist_id,
        title: task.title,
        description: task.description || "",
        category: task.category || "Clinical",
        priority: task.priority || "Medium",
        status: task.status || "pending",
        due_date: task.due_date || "",
        due_time: task.due_time || "",
        client_id: task.client_id || "",
        is_recurring: task.is_recurring || false,
        recurrence_pattern: task.recurrence_pattern,
      });
      
      // Load recurrence frequency from pattern if it exists
      if (task.recurrence_pattern && typeof task.recurrence_pattern === 'object') {
        const pattern = task.recurrence_pattern as any;
        if (pattern.frequency) {
          setRecurrenceFrequency(pattern.frequency);
        }
      }
    } else {
      setFormData({
        therapist_id: therapist?.id || "",
        title: "",
        description: "",
        category: "Clinical",
        priority: "Medium",
        status: "pending",
        due_date: "",
        due_time: "",
        client_id: "",
        is_recurring: false,
        recurrence_pattern: null,
      });
      setRecurrenceFrequency("weekly");
    }
  }, [task, therapist?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title?.trim()) {
      toast({
        title: "Error",
        description: "Task title is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      let result;
      
      if (task) {
        // Update existing task
        const recurrencePattern = formData.is_recurring
          ? { frequency: recurrenceFrequency, created_at: new Date().toISOString() }
          : null;
        
        const updates: TaskUpdate = {
          title: formData.title,
          description: formData.description || null,
          category: formData.category || null,
          priority: formData.priority || "Medium",
          status: formData.status || "pending",
          due_date: formData.due_date || null,
          due_time: formData.due_time || null,
          client_id: formData.client_id || null,
          is_recurring: formData.is_recurring || false,
          recurrence_pattern: recurrencePattern,
        };
        
        result = await updateTask({ taskId: task.id, updates });
        
        if (result) {
          toast({
            title: "Task updated",
            description: "Your task has been updated successfully.",
          });
        }
      } else {
        // Create new task
        const recurrencePattern = formData.is_recurring
          ? { frequency: recurrenceFrequency, created_at: new Date().toISOString() }
          : null;
        
        const newTask: TaskInsert = {
          therapist_id: therapist?.id || "",
          title: formData.title,
          description: formData.description || null,
          category: formData.category || null,
          priority: formData.priority || "Medium",
          status: formData.status || "pending",
          due_date: formData.due_date || null,
          due_time: formData.due_time || null,
          client_id: formData.client_id || null,
          is_recurring: formData.is_recurring || false,
          recurrence_pattern: recurrencePattern,
        };
        
        result = await createTask(newTask);
        
        if (result) {
          toast({
            title: "Task created",
            description: "Your task has been created successfully.",
          });
        }
      }

      if (result) {
        onOpenChange(false);
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save task.",
        variant: "destructive",
      });
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Add New Task"}</DialogTitle>
          <DialogDescription>
            {task ? "Update your task details below." : "Create a new task to track your workflow."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 overflow-y-auto px-1">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter task title"
              className="rounded-xl h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add task details..."
              className="rounded-xl min-h-24"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category || "Clinical"}
                onValueChange={(value) => setFormData({ ...formData, category: value as TaskCategory })}
              >
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Clinical">Clinical</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Assessment">Assessment</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                  <SelectItem value="Documentation">Documentation</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority || "Medium"}
                onValueChange={(value) => setFormData({ ...formData, priority: value as TaskPriority })}
              >
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date || ""}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="rounded-xl h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_time">Due Time</Label>
              <Input
                id="due_time"
                type="time"
                value={formData.due_time || ""}
                onChange={(e) => setFormData({ ...formData, due_time: e.target.value })}
                className="rounded-xl h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client_id">Assign to Client (Optional)</Label>
            <Select
              value={formData.client_id || "none"}
              onValueChange={(value) => setFormData({ ...formData, client_id: value === "none" ? "" : value })}
            >
              <SelectTrigger className="rounded-xl h-11">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No client</SelectItem>
                {clientsResponse?.data?.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!task && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || "pending"}
                onValueChange={(value) => setFormData({ ...formData, status: value as TaskStatus })}
              >
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
            <div className="space-y-0.5">
              <Label htmlFor="is_recurring">Recurring Task</Label>
              <p className="text-xs text-muted-foreground">Task repeats on a schedule</p>
            </div>
            <Switch
              id="is_recurring"
              checked={formData.is_recurring || false}
              onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked })}
            />
          </div>

          {formData.is_recurring && (
            <div className="space-y-2 pl-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <Label htmlFor="recurrence_frequency">Recurrence Frequency</Label>
              <Select
                value={recurrenceFrequency}
                onValueChange={(value) => setRecurrenceFrequency(value as "daily" | "weekly" | "monthly" | "yearly")}
              >
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This task will repeat {recurrenceFrequency === "daily" ? "every day" : 
                  recurrenceFrequency === "weekly" ? "every week" : 
                  recurrenceFrequency === "monthly" ? "every month" : "every year"}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
            >
              {isLoading ? "Saving..." : task ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

