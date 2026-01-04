import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  useArchiveNote,
  useCreateNote,
  useNotes,
  useToggleNoteImportant,
  useUnarchiveNote,
  useUpdateNote,
  useClients,
  useSoapNotes,
  useCreateSoapNote,
  useUpdateSoapNote,
  useArchiveSoapNote,
  useUnarchiveSoapNote,
  useToggleSoapNoteImportant,
} from "@/hooks";
import type { NoteType } from "@/lib/supabase";
import type { NoteWithClient } from "@/services/notes.service";
import type { SoapNoteWithLinks } from "@/services/soap-notes.service";
import { NoteCard, NoteFormDialog, SoapCard, SoapFormDialog } from "@/components/notes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Notes = () => {
  const { therapist } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"notes" | "soap">("notes");

  // Notes tab state
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [noteTypeFilter, setNoteTypeFilter] = useState<NoteType | "all">("all");
  const [importantOnly, setImportantOnly] = useState(false);
  const [archivedFilter, setArchivedFilter] = useState<"active" | "archived" | "all">("active");

  // SOAP tab state
  const [soapSearchQuery, setSoapSearchQuery] = useState("");
  const [soapCurrentPage, setSoapCurrentPage] = useState(1);
  const [soapImportantOnly, setSoapImportantOnly] = useState(false);
  const [soapArchivedFilter, setSoapArchivedFilter] = useState<"active" | "archived" | "all">("active");

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<NoteWithClient | null>(null);
  const [prefillClientId, setPrefillClientId] = useState<string | undefined>();

  const [isCreateSoapDialogOpen, setIsCreateSoapDialogOpen] = useState(false);
  const [isEditSoapDialogOpen, setIsEditSoapDialogOpen] = useState(false);
  const [selectedSoap, setSelectedSoap] = useState<SoapNoteWithLinks | null>(null);

  // Deep link support: /dashboard/notes?new=1&clientId=...
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shouldOpenCreate = params.get("new") === "1";
    if (!shouldOpenCreate) return;

    const clientId = params.get("clientId") || undefined;
    setPrefillClientId(clientId);
    setIsCreateDialogOpen(true);

    params.delete("new");
    params.delete("clientId");
    const nextSearch = params.toString();
    navigate(
      { pathname: location.pathname, search: nextSearch ? `?${nextSearch}` : "" },
      { replace: true }
    );
  }, [location.pathname, location.search, navigate]);

  const notesQueryOptions = useMemo(() => {
    const isArchived =
      archivedFilter === "all" ? undefined : archivedFilter === "archived";
    return {
      pagination: { page: currentPage, pageSize: 12 },
      filters: {
        search: searchQuery || undefined,
        noteType: noteTypeFilter === "all" ? undefined : noteTypeFilter,
        isImportant: importantOnly ? true : undefined,
        isArchived,
      },
      sort: { column: "created_at", ascending: false },
    };
  }, [archivedFilter, currentPage, importantOnly, noteTypeFilter, searchQuery]);

  const { data: notesData, isLoading, error, refetch } = useNotes(
    therapist?.id,
    notesQueryOptions
  );

  const soapQueryOptions = useMemo(() => {
    const isArchived =
      soapArchivedFilter === "all" ? undefined : soapArchivedFilter === "archived";
    return {
      pagination: { page: soapCurrentPage, pageSize: 12 },
      filters: {
        search: soapSearchQuery || undefined,
        isImportant: soapImportantOnly ? true : undefined,
        isArchived,
      },
      sort: { column: "created_at", ascending: false },
    };
  }, [soapArchivedFilter, soapCurrentPage, soapImportantOnly, soapSearchQuery]);

  const {
    data: soapData,
    isLoading: isLoadingSoap,
    error: soapError,
    refetch: refetchSoap,
  } = useSoapNotes(therapist?.id, soapQueryOptions);

  const { data: clientsData } = useClients(therapist?.id, {
    pagination: { page: 1, pageSize: 500 },
    sort: { column: "full_name", ascending: true },
  });
  const clients = clientsData?.data ?? [];

  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const archiveNoteMutation = useArchiveNote();
  const unarchiveNoteMutation = useUnarchiveNote();
  const toggleImportantMutation = useToggleNoteImportant();

  const createSoapMutation = useCreateSoapNote();
  const updateSoapMutation = useUpdateSoapNote();
  const archiveSoapMutation = useArchiveSoapNote();
  const unarchiveSoapMutation = useUnarchiveSoapNote();
  const toggleSoapImportantMutation = useToggleSoapNoteImportant();

  const isSubmitting =
    createNoteMutation.isLoading ||
    updateNoteMutation.isLoading ||
    archiveNoteMutation.isLoading ||
    unarchiveNoteMutation.isLoading ||
    toggleImportantMutation.isLoading;

  const isSoapSubmitting =
    createSoapMutation.isLoading ||
    updateSoapMutation.isLoading ||
    archiveSoapMutation.isLoading ||
    unarchiveSoapMutation.isLoading ||
    toggleSoapImportantMutation.isLoading;

  const handleCreate = async (payload: Parameters<typeof createNoteMutation.mutate>[0]) => {
    const result = await createNoteMutation.mutate(payload);
    if (result) {
      toast({ title: "Note created" });
      setIsCreateDialogOpen(false);
      setPrefillClientId(undefined);
      await refetch();
    } else if (createNoteMutation.error) {
      toast({
        title: "Error",
        description: createNoteMutation.error.message || "Failed to create note",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (noteId: string, updates: Parameters<typeof updateNoteMutation.mutate>[0]["updates"]) => {
    const result = await updateNoteMutation.mutate({ noteId, updates });
    if (result) {
      toast({ title: "Note updated" });
      setIsEditDialogOpen(false);
      setSelectedNote(null);
      await refetch();
    } else if (updateNoteMutation.error) {
      toast({
        title: "Error",
        description: updateNoteMutation.error.message || "Failed to update note",
        variant: "destructive",
      });
    }
  };

  const handleArchiveToggle = async (noteId: string, nextArchived: boolean) => {
    const mutation = nextArchived ? archiveNoteMutation : unarchiveNoteMutation;
    const result = await mutation.mutate(noteId);
    if (result) {
      toast({ title: nextArchived ? "Note archived" : "Note unarchived" });
      await refetch();
    } else if (mutation.error) {
      toast({
        title: "Error",
        description: mutation.error.message || "Failed to update note",
        variant: "destructive",
      });
    }
  };

  const handleToggleImportant = async (note: NoteWithClient, next: boolean) => {
    const result = await toggleImportantMutation.mutate({
      noteId: note.id,
      isImportant: next,
    });
    if (result) {
      await refetch();
    } else if (toggleImportantMutation.error) {
      toast({
        title: "Error",
        description: toggleImportantMutation.error.message || "Failed to update note",
        variant: "destructive",
      });
    }
  };

  const handleOpenEdit = (note: NoteWithClient) => {
    setSelectedNote(note);
    setIsEditDialogOpen(true);
  };

  const handleCreateSoap = async (payload: Parameters<typeof createSoapMutation.mutate>[0]) => {
    const result = await createSoapMutation.mutate(payload);
    if (result) {
      toast({ title: "SOAP note created" });
      setIsCreateSoapDialogOpen(false);
      await refetchSoap();
    } else if (createSoapMutation.error) {
      toast({
        title: "Error",
        description: createSoapMutation.error.message || "Failed to create SOAP note",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSoap = async (
    id: string,
    updates: Parameters<typeof updateSoapMutation.mutate>[0]["updates"]
  ) => {
    const result = await updateSoapMutation.mutate({ id, updates });
    if (result) {
      toast({ title: "SOAP note updated" });
      setIsEditSoapDialogOpen(false);
      setSelectedSoap(null);
      await refetchSoap();
    } else if (updateSoapMutation.error) {
      toast({
        title: "Error",
        description: updateSoapMutation.error.message || "Failed to update SOAP note",
        variant: "destructive",
      });
    }
  };

  const handleArchiveToggleSoap = async (id: string, nextArchived: boolean) => {
    const mutation = nextArchived ? archiveSoapMutation : unarchiveSoapMutation;
    const result = await mutation.mutate(id);
    if (result) {
      toast({ title: nextArchived ? "SOAP note archived" : "SOAP note unarchived" });
      await refetchSoap();
    } else if (mutation.error) {
      toast({
        title: "Error",
        description: mutation.error.message || "Failed to update SOAP note",
        variant: "destructive",
      });
    }
  };

  const handleToggleImportantSoap = async (note: SoapNoteWithLinks, next: boolean) => {
    const result = await toggleSoapImportantMutation.mutate({ id: note.id, isImportant: next });
    if (result) {
      await refetchSoap();
    } else if (toggleSoapImportantMutation.error) {
      toast({
        title: "Error",
        description:
          toggleSoapImportantMutation.error.message || "Failed to update SOAP note",
        variant: "destructive",
      });
    }
  };

  const handleOpenEditSoap = (note: SoapNoteWithLinks) => {
    setSelectedSoap(note);
    setIsEditSoapDialogOpen(true);
  };

  const totalPages = notesData?.totalPages ?? 1;
  const soapTotalPages = soapData?.totalPages ?? 1;

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Notes & Observations
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Capture insights, clinical context, and reminders.
          </p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground flex gap-2 rounded-xl h-11"
              disabled={!therapist}
            >
              <Plus className="w-4 h-4" /> Create
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => {
                setIsCreateDialogOpen(true);
                setActiveTab("notes");
              }}
              className="cursor-pointer"
            >
              Create Note
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setIsCreateSoapDialogOpen(true);
                setActiveTab("soap");
              }}
              className="cursor-pointer"
            >
              Create SOAP
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "notes" | "soap")} className="mt-2">
        <TabsList>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="soap">SOAP</TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="mt-6 space-y-6">
          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center bg-card p-4 rounded-2xl shadow-sm border border-border/50">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search title or content..."
                className="pl-10 h-11 bg-background border-border/50 rounded-xl focus:ring-primary/20 transition-all"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <Select
                value={noteTypeFilter}
                onValueChange={(v) => {
                  setNoteTypeFilter(v as NoteType | "all");
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[180px] rounded-xl h-11">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="clinical">Clinical</SelectItem>
                  <SelectItem value="observation">Observation</SelectItem>
                  <SelectItem value="resource">Resource</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={archivedFilter}
                onValueChange={(v) => {
                  setArchivedFilter(v as typeof archivedFilter);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[160px] rounded-xl h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2 px-3 h-11 rounded-xl border border-border/50 bg-background">
                <Checkbox
                  id="important-only"
                  checked={importantOnly}
                  onCheckedChange={(v) => {
                    setImportantOnly(v === true);
                    setCurrentPage(1);
                  }}
                />
                <Label htmlFor="important-only" className="text-sm text-muted-foreground">
                  Important
                </Label>
              </div>
            </div>
          </div>

          {error ? (
            <div className="text-center py-12">
              <p className="text-destructive">Error loading notes: {error.message}</p>
              <Button onClick={() => refetch()} className="mt-4">
                Retry
              </Button>
            </div>
          ) : isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-[220px] rounded-2xl bg-card border border-border/50 shadow-sm animate-pulse"
                />
              ))}
            </div>
          ) : notesData?.data && notesData.data.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notesData.data.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onClick={handleOpenEdit}
                    onToggleImportant={handleToggleImportant}
                    onToggleArchived={(n, next) => handleArchiveToggle(n.id, next)}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4 text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Badge variant="secondary" className="mb-4">
                No notes found
              </Badge>
              <div className="text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search or filters."
                  : "Create your first note to get started."}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="soap" className="mt-6 space-y-6">
          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center bg-card p-4 rounded-2xl shadow-sm border border-border/50">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search SOAP title..."
                className="pl-10 h-11 bg-background border-border/50 rounded-xl focus:ring-primary/20 transition-all"
                value={soapSearchQuery}
                onChange={(e) => {
                  setSoapSearchQuery(e.target.value);
                  setSoapCurrentPage(1);
                }}
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <Select
                value={soapArchivedFilter}
                onValueChange={(v) => {
                  setSoapArchivedFilter(v as typeof soapArchivedFilter);
                  setSoapCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[160px] rounded-xl h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2 px-3 h-11 rounded-xl border border-border/50 bg-background">
                <Checkbox
                  id="soap-important-only"
                  checked={soapImportantOnly}
                  onCheckedChange={(v) => {
                    setSoapImportantOnly(v === true);
                    setSoapCurrentPage(1);
                  }}
                />
                <Label htmlFor="soap-important-only" className="text-sm text-muted-foreground">
                  Important
                </Label>
              </div>
            </div>
          </div>

          {soapError ? (
            <div className="text-center py-12">
              <p className="text-destructive">Error loading SOAP notes: {soapError.message}</p>
              <Button onClick={() => refetchSoap()} className="mt-4">
                Retry
              </Button>
            </div>
          ) : isLoadingSoap ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-[240px] rounded-2xl bg-card border border-border/50 shadow-sm animate-pulse"
                />
              ))}
            </div>
          ) : soapData?.data && soapData.data.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {soapData.data.map((n) => (
                  <SoapCard
                    key={n.id}
                    note={n}
                    onClick={handleOpenEditSoap}
                    onToggleImportant={handleToggleImportantSoap}
                    onToggleArchived={(note, next) => handleArchiveToggleSoap(note.id, next)}
                  />
                ))}
              </div>

              {soapTotalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    disabled={soapCurrentPage === 1}
                    onClick={() => setSoapCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4 text-sm text-muted-foreground">
                    Page {soapCurrentPage} of {soapTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={soapCurrentPage === soapTotalPages}
                    onClick={() => setSoapCurrentPage((p) => Math.min(soapTotalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Badge variant="secondary" className="mb-4">
                No SOAP notes found
              </Badge>
              <div className="text-muted-foreground">
                {soapSearchQuery
                  ? "Try adjusting your search or filters."
                  : "Create your first SOAP note to get started."}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {therapist && (
        <NoteFormDialog
          open={isCreateDialogOpen}
          onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) setPrefillClientId(undefined);
          }}
          therapistId={therapist.id}
          clients={clients}
          mode="create"
          prefillClientId={prefillClientId}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onArchiveToggle={handleArchiveToggle}
          isSubmitting={isSubmitting}
        />
      )}

      {therapist && selectedNote && (
        <NoteFormDialog
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) setSelectedNote(null);
          }}
          therapistId={therapist.id}
          clients={clients}
          mode="edit"
          note={selectedNote}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onArchiveToggle={handleArchiveToggle}
          isSubmitting={isSubmitting}
        />
      )}

      {therapist && (
        <SoapFormDialog
          open={isCreateSoapDialogOpen}
          onOpenChange={setIsCreateSoapDialogOpen}
          therapistId={therapist.id}
          clients={clients}
          mode="create"
          onCreate={handleCreateSoap}
          onUpdate={handleUpdateSoap}
          onArchiveToggle={handleArchiveToggleSoap}
          isSubmitting={isSoapSubmitting}
        />
      )}

      {therapist && selectedSoap && (
        <SoapFormDialog
          open={isEditSoapDialogOpen}
          onOpenChange={(open) => {
            setIsEditSoapDialogOpen(open);
            if (!open) setSelectedSoap(null);
          }}
          therapistId={therapist.id}
          clients={clients}
          mode="edit"
          note={selectedSoap}
          onCreate={handleCreateSoap}
          onUpdate={handleUpdateSoap}
          onArchiveToggle={handleArchiveToggleSoap}
          isSubmitting={isSoapSubmitting}
        />
      )}
    </DashboardLayout>
  );
};

export default Notes;

