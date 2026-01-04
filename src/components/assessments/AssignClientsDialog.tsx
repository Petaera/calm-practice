import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Users,
  CalendarIcon,
  Check,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useClients } from "@/hooks/use-clients";
import { useAssignClients, useAssignedClients } from "@/hooks/use-assessments";
import { useToast } from "@/hooks/use-toast";
import type { Client } from "@/lib/supabase/types";

interface AssignClientsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  assessmentId: string;
  assessmentTitle: string;
  therapistId: string;
  onAssigned?: () => void;
}

/**
 * AssignClientsDialog - Dialog for assigning clients to an assessment
 * 
 * Features:
 * - Multi-select clients with search
 * - Optional due date
 * - Optional notes
 * - Shows already assigned clients
 */
export function AssignClientsDialog({
  isOpen,
  onClose,
  assessmentId,
  assessmentTitle,
  therapistId,
  onAssigned,
}: AssignClientsDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  // Fetch all clients
  const { data: clientsData, isLoading: isLoadingClients } = useClients(therapistId, {
    status: "Active",
  });

  // Fetch already assigned clients
  const { data: assignedClients, refetch: refetchAssignedClients } = useAssignedClients(assessmentId);

  const assignClientsMutation = useAssignClients();

  // Get list of already assigned client IDs
  const assignedClientIds = useMemo(() => {
    return assignedClients?.map((a) => a.client_id) ?? [];
  }, [assignedClients]);

  // Filter clients based on search and exclude already assigned
  const availableClients = useMemo(() => {
    if (!clientsData?.data) return [];
    
    const clients = clientsData.data.filter(
      (c) => !assignedClientIds.includes(c.id)
    );

    if (!searchTerm.trim()) return clients;

    const term = searchTerm.toLowerCase();
    return clients.filter(
      (c) =>
        c.full_name.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term)
    );
  }, [clientsData, assignedClientIds, searchTerm]);

  // Toggle client selection
  const toggleClient = (clientId: string) => {
    setSelectedClientIds((prev) =>
      prev.includes(clientId)
        ? prev.filter((id) => id !== clientId)
        : [...prev, clientId]
    );
  };

  // Select/deselect all visible clients
  const toggleSelectAll = () => {
    if (selectedClientIds.length === availableClients.length) {
      setSelectedClientIds([]);
    } else {
      setSelectedClientIds(availableClients.map((c) => c.id));
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (selectedClientIds.length === 0) {
      toast({
        title: "No Clients Selected",
        description: "Please select at least one client to assign.",
        variant: "destructive",
      });
      return;
    }

    const result = await assignClientsMutation.mutate({
      assessmentId,
      clientIds: selectedClientIds,
      therapistId,
      options: {
        dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : undefined,
        notes: notes.trim() || undefined,
      },
    });

    if (result) {
      toast({
        title: "Clients Assigned",
        description: `${selectedClientIds.length} client(s) have been assigned to "${assessmentTitle}".`,
      });
      // Refetch assigned clients to update the list immediately
      await refetchAssignedClients();
      // Call the parent callback to refetch assessments list
      onAssigned?.();
      handleClose();
    } else if (assignClientsMutation.error) {
      toast({
        title: "Error",
        description: assignClientsMutation.error.message,
        variant: "destructive",
      });
    }
  };

  // Reset and close
  const handleClose = () => {
    setSelectedClientIds([]);
    setDueDate(undefined);
    setNotes("");
    setSearchTerm("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assign Clients
          </DialogTitle>
          <DialogDescription>
            Assign clients to complete <strong>"{assessmentTitle}"</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Selection controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {selectedClientIds.length} selected
              </Badge>
              {assignedClientIds.length > 0 && (
                <Badge variant="outline" className="text-muted-foreground">
                  {assignedClientIds.length} already assigned
                </Badge>
              )}
            </div>
            {availableClients.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSelectAll}
                className="text-xs"
              >
                {selectedClientIds.length === availableClients.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            )}
          </div>

          {/* Client list */}
          <ScrollArea className="h-[200px] border rounded-lg">
            <div className="p-2 space-y-1">
              {isLoadingClients ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-1" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))
              ) : availableClients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  {searchTerm ? (
                    <p className="text-sm">No clients match your search</p>
                  ) : assignedClientIds.length > 0 ? (
                    <p className="text-sm">All clients are already assigned</p>
                  ) : (
                    <p className="text-sm">No active clients available</p>
                  )}
                </div>
              ) : (
                availableClients.map((client) => (
                  <ClientItem
                    key={client.id}
                    client={client}
                    isSelected={selectedClientIds.includes(client.id)}
                    onToggle={() => toggleClient(client.id)}
                  />
                ))
              )}
            </div>
          </ScrollArea>

          {/* Due date (optional) */}
          <div className="space-y-2">
            <Label>Due Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Set a due date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Notes (optional) */}
          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              placeholder="Add any notes or instructions for the clients..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedClientIds.length === 0 || assignClientsMutation.isLoading}
          >
            {assignClientsMutation.isLoading
              ? "Assigning..."
              : `Assign ${selectedClientIds.length} Client${selectedClientIds.length !== 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Individual client item in the selection list
 */
function ClientItem({
  client,
  isSelected,
  onToggle,
}: {
  client: Client;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <label
      className={cn(
        "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
        isSelected ? "bg-primary/10" : "hover:bg-muted"
      )}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={onToggle}
        className="shrink-0"
      />
      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-muted-foreground shrink-0">
        <User className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{client.full_name}</p>
        {client.email && (
          <p className="text-xs text-muted-foreground truncate">{client.email}</p>
        )}
      </div>
      {isSelected && (
        <Check className="h-4 w-4 text-primary shrink-0" />
      )}
    </label>
  );
}

export default AssignClientsDialog;

