import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Users, CheckCircle2, AlertCircle } from "lucide-react";
import type { Resource } from "@/lib/supabase/types";
import type { Client } from "@/lib/supabase/types";
import { toast } from "@/hooks/use-toast";

interface AssignResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: Resource | null;
  clients: Client[];
  assignedClientIds: string[];
  isLoadingClients: boolean;
  onAssign: (resourceId: string, clientIds: string[], notes?: string) => Promise<void>;
}

export function AssignResourceDialog({
  open,
  onOpenChange,
  resource,
  clients,
  assignedClientIds,
  isLoadingClients,
  onAssign,
}: AssignResourceDialogProps) {
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize selected clients when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedClientIds(assignedClientIds);
      setNotes("");
    }
  }, [open, assignedClientIds]);

  if (!resource) return null;

  const handleToggleClient = (clientId: string) => {
    setSelectedClientIds((prev) =>
      prev.includes(clientId)
        ? prev.filter((id) => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSelectAll = () => {
    if (selectedClientIds.length === clients.length) {
      setSelectedClientIds([]);
    } else {
      setSelectedClientIds(clients.map((c) => c.id));
    }
  };

  const handleSubmit = async () => {
    if (selectedClientIds.length === 0) {
      toast({
        title: "No clients selected",
        description: "Please select at least one client to assign.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onAssign(resource.id, selectedClientIds, notes || undefined);
      toast({
        title: "Resource assigned",
        description: `Successfully assigned "${resource.title}" to ${selectedClientIds.length} client(s).`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign resource to clients.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const newlySelected = selectedClientIds.filter(
    (id) => !assignedClientIds.includes(id)
  );
  const removedClients = assignedClientIds.filter(
    (id) => !selectedClientIds.includes(id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assign Resource to Clients
          </DialogTitle>
          <DialogDescription>
            Select clients to give them access to "{resource.title}".
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden">
          {isLoadingClients ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : clients.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No clients found. Create clients first to assign resources.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Summary */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {selectedClientIds.length} of {clients.length} selected
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedClientIds.length === clients.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              </div>

              {/* Client List */}
              <ScrollArea className="h-[300px] border rounded-lg">
                <div className="p-4 space-y-2">
                  {clients.map((client) => {
                    const isSelected = selectedClientIds.includes(client.id);
                    const wasAssigned = assignedClientIds.includes(client.id);
                    const isNew = isSelected && !wasAssigned;
                    const isRemoved = !isSelected && wasAssigned;

                    return (
                      <div
                        key={client.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50 ${
                          isSelected ? "bg-muted border-primary" : ""
                        }`}
                        onClick={() => handleToggleClient(client.id)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleClient(client.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">
                              {client.full_name}
                            </p>
                            {wasAssigned && isSelected && (
                              <Badge variant="secondary" className="text-xs">
                                Already assigned
                              </Badge>
                            )}
                            {isNew && (
                              <Badge variant="default" className="text-xs">
                                New
                              </Badge>
                            )}
                            {isRemoved && (
                              <Badge variant="destructive" className="text-xs">
                                Will be removed
                              </Badge>
                            )}
                          </div>
                          {client.email && (
                            <p className="text-sm text-muted-foreground truncate">
                              {client.email}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* Change Summary */}
              {(newlySelected.length > 0 || removedClients.length > 0) && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    {newlySelected.length > 0 && (
                      <div>
                        <strong>{newlySelected.length}</strong> new assignment(s)
                      </div>
                    )}
                    {removedClients.length > 0 && (
                      <div className="text-destructive">
                        <strong>{removedClients.length}</strong> will be removed
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add instructions or context for clients..."
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || selectedClientIds.length === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              `Assign to ${selectedClientIds.length} Client${selectedClientIds.length !== 1 ? "s" : ""}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

