import { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Search, Plus, FileText, MoreVertical, Video, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useSessions,
  useCreateSession,
  useUpdateSession,
  useDeleteSession,
  useCompleteSession,
  useCancelSession,
  useClients,
} from "@/hooks";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { SessionFormDialog, type SessionFormData } from "@/components/sessions";
import type { SessionStatus, SessionInsert, SessionUpdate, PaymentStatus, SessionType } from "@/lib/supabase";
import type { SessionWithClient } from "@/services/sessions.service";
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

// Utility function to generate session ID
const generateSessionId = (): string => {
  const prefix = "SS";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

const Sessions = () => {
  const { therapist } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
  // UI State
  const [statusFilter, setStatusFilter] = useState<SessionStatus | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [prefillClientId, setPrefillClientId] = useState<string | undefined>();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionWithClient | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<SessionWithClient | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shouldOpenCreate = params.get("new") === "1";
    if (!shouldOpenCreate) return;

    const clientId = params.get("clientId") || undefined;
    setPrefillClientId(clientId);
    setIsCreateDialogOpen(true);

    // remove flag so refresh doesn't keep reopening
    params.delete("new");
    params.delete("clientId");
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
    data: sessionsData,
    isLoading,
    error,
    refetch,
  } = useSessions(therapist?.id, {
    pagination: { page: currentPage, pageSize: 10 },
    filters: {
      status: statusFilter,
    },
    sort: { column: "session_date", ascending: false },
  });

  // Fetch clients for the dropdown
  const { data: clientsData } = useClients(therapist?.id, {
    filters: { status: "Active" },
  });

  // Mutations
  const createSessionMutation = useCreateSession();
  const updateSessionMutation = useUpdateSession();
  const deleteSessionMutation = useDeleteSession();
  const completeSessionMutation = useCompleteSession();
  const cancelSessionMutation = useCancelSession();

  // Calculate stats
  const stats = useMemo(() => {
    if (!sessionsData?.data) return { total: 0, thisMonth: 0, avgDuration: 0 };
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const thisMonthSessions = sessionsData.data.filter(s => {
      const sessionDate = new Date(s.session_date);
      return sessionDate >= startOfMonth;
    });
    
    const avgDuration = thisMonthSessions.reduce((sum, s) => sum + (s.duration_minutes || 50), 0) / (thisMonthSessions.length || 1);
    const totalHours = thisMonthSessions.reduce((sum, s) => sum + (s.duration_minutes || 50), 0) / 60;
    
    return {
      total: 142, // Mock total - would need separate query
      thisMonth: totalHours.toFixed(1),
      avgDuration: Math.round(avgDuration),
    };
  }, [sessionsData]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Handlers
  const handleCreateSession = async (formData: SessionFormData) => {
    if (!therapist?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create a session",
        variant: "destructive",
      });
      return;
    }

    const sessionData: SessionInsert = {
      session_id: generateSessionId(),
      therapist_id: therapist.id,
      client_id: formData.client_id,
      session_date: formData.session_date,
      session_time: formData.session_time,
      duration_minutes: formData.duration_minutes,
      session_type: formData.session_type,
      session_purpose: formData.session_purpose || null,
      status: formData.status,
      payment_status: formData.payment_status,
      payment_amount: formData.payment_amount ? parseFloat(formData.payment_amount) : null,
      location: formData.location || null,
      meeting_link: formData.meeting_link || null,
      session_notes: formData.session_notes || null,
    };

    const result = await createSessionMutation.mutate(sessionData);

    if (result) {
      toast({
        title: "Success",
        description: "Session has been created successfully",
      });
      setIsCreateDialogOpen(false);
      refetch();
    } else if (createSessionMutation.error) {
      toast({
        title: "Error",
        description: createSessionMutation.error.message || "Failed to create session",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (session: SessionWithClient) => {
    setSelectedSession(session);
    setIsEditDialogOpen(true);
  };

  const handleUpdateSession = async (formData: SessionFormData) => {
    if (!selectedSession) return;

    const updates: SessionUpdate = {
      session_date: formData.session_date,
      session_time: formData.session_time,
      duration_minutes: formData.duration_minutes,
      session_type: formData.session_type,
      session_purpose: formData.session_purpose || null,
      status: formData.status,
      payment_status: formData.payment_status,
      payment_amount: formData.payment_amount ? parseFloat(formData.payment_amount) : null,
      location: formData.location || null,
      meeting_link: formData.meeting_link || null,
      session_notes: formData.session_notes || null,
    };

    const result = await updateSessionMutation.mutate({
      sessionId: selectedSession.id,
      updates,
    });

    if (result) {
      toast({
        title: "Success",
        description: "Session has been updated successfully",
      });
      setIsEditDialogOpen(false);
      setSelectedSession(null);
      refetch();
    } else if (updateSessionMutation.error) {
      toast({
        title: "Error",
        description: updateSessionMutation.error.message || "Failed to update session",
        variant: "destructive",
      });
    }
  };

  const handleCompleteSession = async (session: SessionWithClient) => {
    const result = await completeSessionMutation.mutate({
      sessionId: session.id,
    });

    if (result) {
      toast({
        title: "Success",
        description: "Session marked as completed",
      });
      refetch();
    } else if (completeSessionMutation.error) {
      toast({
        title: "Error",
        description: completeSessionMutation.error.message || "Failed to complete session",
        variant: "destructive",
      });
    }
  };

  const handleCancelSession = async (session: SessionWithClient) => {
    const result = await cancelSessionMutation.mutate(session.id);

    if (result) {
      toast({
        title: "Success",
        description: "Session has been cancelled",
      });
      refetch();
    } else if (cancelSessionMutation.error) {
      toast({
        title: "Error",
        description: cancelSessionMutation.error.message || "Failed to cancel session",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (session: SessionWithClient) => {
    setSessionToDelete(session);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!sessionToDelete) return;

    const result = await deleteSessionMutation.mutate(sessionToDelete.id);

    if (result !== null) {
      toast({
        title: "Success",
        description: "Session has been permanently deleted",
      });
      setDeleteDialogOpen(false);
      setSessionToDelete(null);
      refetch();
    } else if (deleteSessionMutation.error) {
      toast({
        title: "Error",
        description: deleteSessionMutation.error.message || "Failed to delete session",
        variant: "destructive",
      });
    }
  };

  // Filter sessions by search query
  const filteredSessions = useMemo(() => {
    if (!sessionsData?.data || !searchQuery) return sessionsData?.data || [];
    
    return sessionsData.data.filter(session => 
      session.clients?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.session_id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sessionsData, searchQuery]);

  // Transform session to form data for editing
  const transformSessionToFormData = (session: SessionWithClient): SessionFormData => ({
    client_id: session.client_id,
    session_date: session.session_date,
    session_time: session.session_time,
    duration_minutes: session.duration_minutes || 50,
    session_type: session.session_type as SessionType || "In-person",
    session_purpose: session.session_purpose || "",
    status: session.status as SessionStatus || "Scheduled",
    payment_status: session.payment_status as PaymentStatus || "Pending",
    payment_amount: session.payment_amount?.toString() || "",
    location: session.location || "",
    meeting_link: session.meeting_link || "",
    session_notes: session.session_notes || "",
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Session Log</h1>
          <p className="text-muted-foreground mt-1 text-lg">Detailed history of all client encounters.</p>
        </div>
        
        <SessionFormDialog
          trigger={
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground flex gap-2 rounded-xl h-11 shadow-sm shadow-primary/20">
              <Plus className="w-4 h-4" /> Log New Session
            </Button>
          }
          open={isCreateDialogOpen}
          onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) setPrefillClientId(undefined);
          }}
          onSubmit={handleCreateSession}
          isSubmitting={createSessionMutation.isLoading}
          mode="create"
          clients={clientsData?.data.map(c => ({ id: c.id, full_name: c.full_name })) || []}
          initialData={prefillClientId ? { client_id: prefillClientId } : undefined}
        />
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
                <p className="text-2xl font-bold">{stats.total}</p>
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
                <p className="text-2xl font-bold">{stats.thisMonth}</p>
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
                <p className="text-2xl font-bold">{stats.avgDuration} min</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex gap-2">
              <Badge 
                variant={!statusFilter ? "default" : "outline"}
                className={cn(
                  "rounded-lg px-3 py-1 text-[11px] font-bold cursor-pointer transition-colors",
                  !statusFilter ? "bg-primary/10 text-primary border-none" : "text-muted-foreground hover:bg-muted"
                )}
                onClick={() => setStatusFilter(undefined)}
              >
                ALL SESSIONS
              </Badge>
              <Badge 
                variant={statusFilter === 'Upcoming' ? "default" : "outline"}
                className={cn(
                  "rounded-lg px-3 py-1 text-[11px] font-bold cursor-pointer transition-colors",
                  statusFilter === 'Upcoming' ? "bg-primary/10 text-primary border-none" : "text-muted-foreground hover:bg-muted"
                )}
                onClick={() => setStatusFilter('Upcoming')}
              >
                UPCOMING
              </Badge>
              <Badge 
                variant={statusFilter === 'Completed' ? "default" : "outline"}
                className={cn(
                  "rounded-lg px-3 py-1 text-[11px] font-bold cursor-pointer transition-colors",
                  statusFilter === 'Completed' ? "bg-primary/10 text-primary border-none" : "text-muted-foreground hover:bg-muted"
                )}
                onClick={() => setStatusFilter('Completed')}
              >
                PAST
              </Badge>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input 
                placeholder="Search client..." 
                className="pl-9 h-9 text-xs rounded-xl bg-muted/30 border-none" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading sessions...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-destructive">
              Error loading sessions: {error.message}
            </div>
          ) : filteredSessions && filteredSessions.length > 0 ? (
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
                  {filteredSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-muted/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {session.clients?.full_name || 'Unknown Client'}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono font-bold">{session.session_id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-foreground">{formatDate(session.session_date)}</div>
                        <div className="text-xs text-muted-foreground">{formatTime(session.session_time)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="rounded-lg font-bold text-[10px] bg-background border-border/50 shadow-sm flex items-center gap-1.5 w-fit uppercase tracking-tighter">
                            {session.session_type === 'In-person' ? (
                              <><MapPin className="w-3 h-3 text-primary" /> In-person</>
                            ) : session.session_type === 'Online' ? (
                              <><Video className="w-3 h-3 text-sky" /> Online</>
                            ) : (
                              <><Clock className="w-3 h-3 text-amber-500" /> Phone</>
                            )}
                          </Badge>
                          {session.session_purpose && (
                            <span className="text-[11px] font-medium text-muted-foreground italic px-1">{session.session_purpose}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center gap-1">
                          <Badge className={cn(
                            "w-fit font-bold rounded-full border-none px-3 py-0.5 text-[10px] uppercase tracking-widest",
                            session.status === 'Completed' ? "bg-sage-light text-primary" : 
                            session.status === 'Upcoming' || session.status === 'Scheduled' ? "bg-sky-light/50 text-sky" :
                            "bg-amber-100 text-amber-700"
                          )}>
                            {session.status}
                          </Badge>
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest",
                            session.payment_status === 'Paid' ? "text-primary/60" : "text-destructive/60"
                          )}>
                            {session.payment_status || 'Pending'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted"
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
                                  handleEditClick(session);
                                }}
                                className="cursor-pointer"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Session
                              </DropdownMenuItem>
                              {session.status !== "Completed" && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCompleteSession(session);
                                  }}
                                  className="cursor-pointer"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Mark Completed
                                </DropdownMenuItem>
                              )}
                              {session.status !== "Cancelled" && session.status !== "Completed" && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelSession(session);
                                  }}
                                  className="cursor-pointer"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Cancel Session
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(session);
                                }}
                                className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Permanently
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              No sessions found
            </div>
          )}
        </div>
      </div>

      {/* Edit Session Dialog */}
      {selectedSession && (
        <SessionFormDialog
          trigger={<></>}
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) setSelectedSession(null);
          }}
          onSubmit={handleUpdateSession}
          isSubmitting={updateSessionMutation.isLoading}
          initialData={transformSessionToFormData(selectedSession)}
          mode="edit"
          clients={clientsData?.data.map(c => ({ id: c.id, full_name: c.full_name })) || []}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this session with{" "}
              <span className="font-semibold">{sessionToDelete?.clients?.full_name}</span>{" "}
              on {sessionToDelete?.session_date}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteDialogOpen(false);
                setSessionToDelete(null);
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
    </DashboardLayout>
  );
};

export default Sessions;
