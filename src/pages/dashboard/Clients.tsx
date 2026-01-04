import { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  Edit,
  Trash2,
  Archive,
  ArchiveRestore,
  FileText,
  StickyNote,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useClients,
  useClientCountByStatus,
  useCreateClient,
  useUpdateClient,
  useArchiveClient,
  useUnarchiveClient,
  useDeleteClient,
  useCreateNote,
} from "@/hooks";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ClientFormDialog, type ClientFormData } from "@/components/clients";
import type { ClientStatus, ClientInsert, Client, ClientUpdate, NoteInsert, NoteType } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Utility Functions
const generateClientId = (): string => {
  const prefix = "CL";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

const calculateAge = (dob: string): number | undefined => {
  if (!dob) return undefined;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const formatLastSession = (updatedAt: string | null): string => {
  if (!updatedAt) return "No sessions yet";
  const date = new Date(updatedAt);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};

// Transform form data to API format
const transformFormDataToClientInsert = (
  formData: ClientFormData,
  therapistId: string
): ClientInsert => ({
  client_id: generateClientId(),
  full_name: formData.full_name.trim(),
  therapist_id: therapistId,
  email: formData.email || null,
  phone: formData.phone || null,
  date_of_birth: formData.date_of_birth || null,
  age: formData.date_of_birth ? calculateAge(formData.date_of_birth) : null,
  gender: formData.gender || null,
  address: formData.address || null,
  concerns: formData.concerns.length > 0 ? formData.concerns : null,
  intake_notes: formData.intake_notes || null,
  intake_date: new Date().toISOString(),
  status: formData.status || "Active",
  emergency_contact_name: formData.emergency_contact_name || null,
  emergency_contact_phone: formData.emergency_contact_phone || null,
  emergency_contact_relationship: formData.emergency_contact_relationship || null,
});

const Clients = () => {
  const { therapist } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClientStatus | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isCreateNoteDialogOpen, setIsCreateNoteDialogOpen] = useState(false);
  const [noteClient, setNoteClient] = useState<Client | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteType, setNoteType] = useState<NoteType>("general");
  const [noteTagsText, setNoteTagsText] = useState("");
  const [noteImportant, setNoteImportant] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shouldOpenCreate = params.get("new") === "1";
    if (!shouldOpenCreate) return;

    setIsCreateDialogOpen(true);

    // remove flag so refresh doesn't keep reopening
    params.delete("new");
    const nextSearch = params.toString();
    navigate(
      {
        pathname: location.pathname,
        search: nextSearch ? `?${nextSearch}` : "",
      },
      { replace: true }
    );
  }, [location.pathname, location.search, navigate]);

  // Data fetching
  const {
    data: clientsData,
    isLoading,
    error,
    refetch,
  } = useClients(therapist?.id, {
    pagination: { page: currentPage, pageSize: 10 },
    filters: {
      status: statusFilter,
      search: searchQuery || undefined,
    },
    sort: { column: "created_at", ascending: false },
  });

  const { data: clientCounts, refetch: refetchClientCounts } =
    useClientCountByStatus(therapist?.id);
  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();
  const archiveClientMutation = useArchiveClient();
  const unarchiveClientMutation = useUnarchiveClient();
  const deleteClientMutation = useDeleteClient();
  const createNoteMutation = useCreateNote();

  // Computed values
  const totalClients = useMemo(() => {
    if (!clientCounts) return 0;
    return Object.values(clientCounts).reduce((sum, count) => sum + count, 0);
  }, [clientCounts]);

  // Handlers
  const handleCreateClient = async (formData: ClientFormData) => {
    if (!therapist?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create a client",
        variant: "destructive",
      });
      return;
    }

    const clientData = transformFormDataToClientInsert(formData, therapist.id);
    const result = await createClientMutation.mutate(clientData);

    if (result) {
      toast({
        title: "Success",
        description: `Client ${formData.full_name} has been added successfully`,
      });
      setIsCreateDialogOpen(false);
      refetch();
    } else if (createClientMutation.error) {
      toast({
        title: "Error",
        description: createClientMutation.error.message || "Failed to create client",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (client: Client) => {
    setSelectedClient(client);
    setIsEditDialogOpen(true);
  };

  const handleUpdateClient = async (formData: ClientFormData) => {
    if (!selectedClient) return;

    const updates: ClientUpdate = {
      full_name: formData.full_name.trim(),
      email: formData.email || null,
      phone: formData.phone || null,
      date_of_birth: formData.date_of_birth || null,
      age: formData.date_of_birth ? calculateAge(formData.date_of_birth) : null,
      gender: formData.gender || null,
      address: formData.address || null,
      concerns: formData.concerns.length > 0 ? formData.concerns : null,
      intake_notes: formData.intake_notes || null,
      status: formData.status || "Active",
      emergency_contact_name: formData.emergency_contact_name || null,
      emergency_contact_phone: formData.emergency_contact_phone || null,
      emergency_contact_relationship: formData.emergency_contact_relationship || null,
    };

    const result = await updateClientMutation.mutate({
      clientId: selectedClient.id,
      updates,
    });

    if (result) {
      toast({
        title: "Success",
        description: `Client ${formData.full_name} has been updated successfully`,
      });
      setIsEditDialogOpen(false);
      setSelectedClient(null);
      refetch();
    } else if (updateClientMutation.error) {
      toast({
        title: "Error",
        description: updateClientMutation.error.message || "Failed to update client",
        variant: "destructive",
      });
    }
  };

  const handleArchiveClient = async (client: Client) => {
    const result = await archiveClientMutation.mutate(client.id);

    if (result) {
      toast({
        title: "Success",
        description: `Client ${client.full_name} has been archived`,
      });
      refetch();
    } else if (archiveClientMutation.error) {
      toast({
        title: "Error",
        description: archiveClientMutation.error.message || "Failed to archive client",
        variant: "destructive",
      });
    }
  };

  const handleUnarchiveClient = async (client: Client) => {
    const result = await unarchiveClientMutation.mutate(client.id);

    if (result) {
      toast({
        title: "Success",
        description: `Client ${client.full_name} has been unarchived`,
      });
      refetch();
    } else if (unarchiveClientMutation.error) {
      toast({
        title: "Error",
        description: unarchiveClientMutation.error.message || "Failed to unarchive client",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (client: Client) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const handleQuickLogSession = (client: Client) => {
    navigate(`/dashboard/sessions?new=1&clientId=${encodeURIComponent(client.id)}`);
  };

  const handleQuickAssignResource = (client: Client) => {
    navigate(`/dashboard/resources?assignClientId=${encodeURIComponent(client.id)}`);
  };

  const handleQuickAddNote = (client: Client) => {
    setNoteClient(client);
    setNoteTitle("");
    setNoteContent("");
    setNoteType("general");
    setNoteTagsText("");
    setNoteImportant(false);
    setIsCreateNoteDialogOpen(true);
  };

  const parseTags = (raw: string): string[] => {
    return raw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  };

  const handleCreateNote = async () => {
    if (!therapist?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create a note",
        variant: "destructive",
      });
      return;
    }
    if (!noteClient) return;
    if (!noteTitle.trim() || !noteContent.trim()) {
      toast({
        title: "Missing information",
        description: "Please add a title and content for the note.",
        variant: "destructive",
      });
      return;
    }

    const tags = parseTags(noteTagsText);
    const payload: NoteInsert = {
      therapist_id: therapist.id,
      client_id: noteClient.id,
      title: noteTitle.trim(),
      content: noteContent.trim(),
      note_type: noteType,
      is_important: noteImportant,
      is_archived: false,
      tags: tags.length > 0 ? tags : null,
    };

    const result = await createNoteMutation.mutate(payload);
    if (result) {
      toast({
        title: "Success",
        description: `Note added for ${noteClient.full_name}`,
      });
      setIsCreateNoteDialogOpen(false);
      setNoteClient(null);
    } else if (createNoteMutation.error) {
      toast({
        title: "Error",
        description: createNoteMutation.error.message || "Failed to create note",
        variant: "destructive",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;

    const result = await deleteClientMutation.mutate(clientToDelete.id);

    if (result) {
      toast({
        title: "Success",
        description: `Client ${clientToDelete.full_name} has been permanently deleted`,
      });
      setDeleteDialogOpen(false);
      setClientToDelete(null);
      refetch();
      refetchClientCounts();
    } else if (deleteClientMutation.error) {
      toast({
        title: "Error",
        description: deleteClientMutation.error.message || "Failed to delete client",
        variant: "destructive",
      });
    }
  };

  const handleStatusFilterChange = (status: ClientStatus | undefined) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-destructive">Error loading clients: {error.message}</p>
          <Button onClick={() => refetch()} className="mt-4">
            Retry
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Add Client Button Component
  const AddClientButton = ({ className }: { className?: string }) => (
    <ClientFormDialog
      trigger={
        <Button
          className={cn(
            "bg-primary hover:bg-primary/90 text-primary-foreground flex gap-2 rounded-xl h-11 shadow-sm shadow-primary/20",
            className
          )}
        >
          <Plus className="w-4 h-4" /> Add New Client
        </Button>
      }
      open={isCreateDialogOpen}
      onOpenChange={setIsCreateDialogOpen}
      onSubmit={handleCreateClient}
      isSubmitting={createClientMutation.isLoading}
      mode="create"
    />
  );

  // Transform client data to form data for editing
  const transformClientToFormData = (client: Client): ClientFormData => ({
    full_name: client.full_name,
    email: client.email || "",
    phone: client.phone || "",
    date_of_birth: client.date_of_birth || "",
    gender: client.gender || "",
    address: client.address || "",
    concerns: client.concerns || [],
    intake_notes: client.intake_notes || "",
    status: client.status || "Active",
    emergency_contact_name: client.emergency_contact_name || "",
    emergency_contact_phone: client.emergency_contact_phone || "",
    emergency_contact_relationship: client.emergency_contact_relationship || "",
  });

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Client Records
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Your private database of clinical contacts.
          </p>
        </div>
        <AddClientButton />
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-2xl shadow-sm border border-border/50">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, or concern..."
            className="pl-10 h-11 bg-background border-border/50 rounded-xl focus:ring-primary/20 transition-all"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex gap-2 rounded-xl h-11 border-border shadow-sm flex-1 md:flex-none"
              >
                <Filter className="w-4 h-4" /> {statusFilter || "All"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleStatusFilterChange(undefined)}
                className={cn(!statusFilter && "bg-primary/10")}
              >
                All Clients
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusFilterChange("Active")}
                className={cn(statusFilter === "Active" && "bg-primary/10")}
              >
                Active
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusFilterChange("On-hold")}
                className={cn(statusFilter === "On-hold" && "bg-primary/10")}
              >
                On-hold
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusFilterChange("Closed")}
                className={cn(statusFilter === "Closed" && "bg-primary/10")}
              >
                Closed
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusFilterChange("Inactive")}
                className={cn(statusFilter === "Inactive" && "bg-primary/10")}
              >
                Inactive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary border-none flex items-center px-4 rounded-xl"
          >
            {totalClients} Total
          </Badge>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <ClientListSkeleton />
      ) : clientsData?.data && clientsData.data.length > 0 ? (
        <>
          <ClientList
            clients={clientsData.data}
            formatLastSession={formatLastSession}
            onEditClick={handleEditClick}
            onArchiveClick={handleArchiveClient}
            onUnarchiveClick={handleUnarchiveClient}
            onDeleteClick={handleDeleteClick}
        onLogSession={handleQuickLogSession}
        onAssignResource={handleQuickAssignResource}
        onAddNote={handleQuickAddNote}
          />
          
          {/* Pagination */}
          {clientsData.totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={clientsData.totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      ) : (
        <EmptyState
          searchQuery={searchQuery}
          addButton={<AddClientButton className="mt-6" />}
        />
      )}

      {/* Edit Client Dialog */}
      {selectedClient && (
        <ClientFormDialog
          trigger={<></>}
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) setSelectedClient(null);
          }}
          onSubmit={handleUpdateClient}
          isSubmitting={updateClientMutation.isLoading}
          initialData={transformClientToFormData(selectedClient)}
          mode="edit"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-semibold">{clientToDelete?.full_name}</span> and all
              associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteDialogOpen(false);
                setClientToDelete(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Note Dialog */}
      <Dialog
        open={isCreateNoteDialogOpen}
        onOpenChange={(open) => {
          setIsCreateNoteDialogOpen(open);
          if (!open) setNoteClient(null);
        }}
      >
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Create note</DialogTitle>
            <DialogDescription>
              {noteClient ? (
                <>
                  Add a quick note for{" "}
                  <span className="font-semibold">{noteClient.full_name}</span>.
                </>
              ) : (
                "Add a quick note."
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="note-title">Title</Label>
              <Input
                id="note-title"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="e.g. Key observation, homework, follow-up..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note-type">Type</Label>
              <Select
                value={noteType}
                onValueChange={(value) => setNoteType(value as NoteType)}
              >
                <SelectTrigger id="note-type">
                  <SelectValue placeholder="Select note type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="clinical">Clinical</SelectItem>
                  <SelectItem value="observation">Observation</SelectItem>
                  <SelectItem value="resource">Resource</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note-content">Content</Label>
              <Textarea
                id="note-content"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write your note..."
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note-tags">Tags (comma separated)</Label>
              <Input
                id="note-tags"
                value={noteTagsText}
                onChange={(e) => setNoteTagsText(e.target.value)}
                placeholder="e.g. anxiety, CBT, follow-up"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="note-important"
                checked={noteImportant}
                onCheckedChange={(v) => setNoteImportant(Boolean(v))}
              />
              <Label htmlFor="note-important">Mark as important</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateNoteDialogOpen(false)}
              disabled={createNoteMutation.isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateNote} disabled={createNoteMutation.isLoading}>
              {createNoteMutation.isLoading ? "Saving..." : "Save note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

// Sub-components for better organization

interface ClientListProps {
  clients: Client[];
  formatLastSession: (date: string | null) => string;
  onEditClick: (client: Client) => void;
  onArchiveClick: (client: Client) => void;
  onUnarchiveClick: (client: Client) => void;
  onDeleteClick: (client: Client) => void;
  onLogSession: (client: Client) => void;
  onAssignResource: (client: Client) => void;
  onAddNote: (client: Client) => void;
}

const ClientList = ({
  clients,
  formatLastSession,
  onEditClick,
  onArchiveClick,
  onUnarchiveClick,
  onDeleteClick,
  onLogSession,
  onAssignResource,
  onAddNote,
}: ClientListProps) => (
  <div className="grid gap-4">
    {clients.map((client) => (
      <Card
        key={client.id}
        className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden"
        onClick={() => onEditClick(client)}
      >
        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row lg:items-center">
            {/* Client Info */}
            <div className="flex-1 p-6 flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-sage-light/30 flex items-center justify-center text-primary font-bold text-lg shadow-inner shrink-0">
                {client.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg text-foreground truncate group-hover:text-primary transition-colors">
                    {client.full_name}
                  </h3>
                  <span className="text-[10px] font-mono font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded uppercase tracking-wider">
                    {client.client_id}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                  {client.age && (
                    <>
                      <span>{client.age} years</span>
                      <span className="opacity-30">•</span>
                    </>
                  )}
                  {client.gender && (
                    <>
                      <span>{client.gender}</span>
                      <span className="opacity-30">•</span>
                    </>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Last:{" "}
                    {formatLastSession(client.updated_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tags and Actions */}
            <div className="px-6 pb-6 lg:py-6 lg:border-l border-border/30 flex flex-col lg:flex-row lg:items-center gap-6 bg-muted/5 lg:bg-transparent">
              <div className="flex flex-wrap gap-2 lg:max-w-[240px] lg:justify-end">
                {client.concerns && client.concerns.length > 0 ? (
                  client.concerns.slice(0, 2).map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-sky-light/40 text-sky font-semibold border-none px-2 py-0.5 text-[11px] uppercase tracking-tighter"
                    >
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-muted text-muted-foreground border-none px-2 py-0.5 text-[11px]"
                  >
                    No concerns listed
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between lg:justify-end gap-6 w-full lg:w-auto">
                <Badge
                  className={cn(
                    "font-bold px-3 py-1 rounded-full border-none text-[10px] uppercase tracking-widest",
                    client.status === "Active"
                      ? "bg-sage-light text-primary"
                      : client.status === "Closed"
                      ? "bg-muted text-muted-foreground"
                      : "bg-amber-100 text-amber-700"
                  )}
                >
                  {client.status || "Active"}
                </Badge>

                <div className="flex items-center gap-1">
                  {/* Quick actions (desktop) */}
                  <div className="hidden md:flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-muted-foreground/10 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLogSession(client);
                      }}
                      title="Log session"
                    >
                      <Calendar className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-muted-foreground/10 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAssignResource(client);
                      }}
                      title="Assign resource"
                    >
                      <FileText className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-muted-foreground/10 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddNote(client);
                      }}
                      title="Add note"
                    >
                      <StickyNote className="w-4 h-4" />
                    </Button>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-muted-foreground/10 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onLogSession(client);
                        }}
                        className="cursor-pointer md:hidden"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Log Session
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onAssignResource(client);
                        }}
                        className="cursor-pointer md:hidden"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Assign Resource
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddNote(client);
                        }}
                        className="cursor-pointer md:hidden"
                      >
                        <StickyNote className="w-4 h-4 mr-2" />
                        Add Note
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="md:hidden" />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditClick(client);
                        }}
                        className="cursor-pointer"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Client
                      </DropdownMenuItem>
                      {client.status !== "Closed" ? (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onArchiveClick(client);
                          }}
                          className="cursor-pointer"
                        >
                          <Archive className="w-4 h-4 mr-2" />
                          Archive Client
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onUnarchiveClick(client);
                          }}
                          className="cursor-pointer"
                        >
                          <ArchiveRestore className="w-4 h-4 mr-2" />
                          Unarchive Client
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteClick(client);
                        }}
                        className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Permanently
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const ClientListSkeleton = () => (
  <div className="grid gap-4">
    {[1, 2, 3].map((i) => (
      <Card key={i} className="border-none shadow-sm">
        <CardContent className="p-6">
          <div className="animate-pulse flex gap-6">
            <div className="w-14 h-14 rounded-2xl bg-muted" />
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => (
  <div className="flex justify-center gap-2 mt-6">
    <Button
      variant="outline"
      disabled={currentPage === 1}
      onClick={() => onPageChange(currentPage - 1)}
    >
      Previous
    </Button>
    <span className="flex items-center px-4 text-sm text-muted-foreground">
      Page {currentPage} of {totalPages}
    </span>
    <Button
      variant="outline"
      disabled={currentPage === totalPages}
      onClick={() => onPageChange(currentPage + 1)}
    >
      Next
    </Button>
  </div>
);

interface EmptyStateProps {
  searchQuery: string;
  addButton: React.ReactNode;
}

const EmptyState = ({ searchQuery, addButton }: EmptyStateProps) => (
  <Card className="border-none shadow-sm">
    <CardContent className="p-12 text-center">
      <p className="text-muted-foreground text-lg">No clients found</p>
      <p className="text-sm text-muted-foreground mt-2">
        {searchQuery
          ? "Try adjusting your search"
          : "Get started by adding your first client"}
      </p>
      {addButton}
    </CardContent>
  </Card>
);

export default Clients;
