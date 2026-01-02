import { useState, useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import {
  Plus,
  FolderOpen,
  Search,
  Filter,
  AlertCircle,
  Loader2,
  FileText,
  Video,
  Link as LinkIcon,
  StickyNote,
  Headphones,
  Image as ImageIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useModulesWithCounts,
  useCreateModule,
  useUpdateModule,
  useDeleteModule,
  useGenerateShareToken,
  useRevokeShareToken,
  useToggleModuleActive,
} from "@/hooks/use-modules";
import {
  useResourcesByModule,
  useUnorganizedResources,
  useCreateResource,
  useUpdateResource,
  useDeleteResource,
  useResourceTags,
  useResourceCountByType,
} from "@/hooks/use-resources";
import { useClients } from "@/hooks/use-clients";
import {
  useAssignedClients,
  useAssignClientsToModule,
} from "@/hooks/use-module-assignments";
import {
  ModuleCard,
  ModuleFormDialog,
  ResourceCard,
  ResourceUploadDialog,
  ShareModuleDialog,
  AssignModuleDialog,
} from "@/components/resources";
import type { Module, Resource, ModuleInsert, ModuleUpdate, ResourceInsert, ResourceUpdate } from "@/lib/supabase/types";
import { toast } from "@/hooks/use-toast";

const Resources = () => {
  const { therapist } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedResourceType, setSelectedResourceType] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Module state
  const [moduleFormOpen, setModuleFormOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [shareModuleDialogOpen, setShareModuleDialogOpen] = useState(false);
  const [sharingModule, setSharingModule] = useState<Module | null>(null);
  const [assignModuleDialogOpen, setAssignModuleDialogOpen] = useState(false);
  const [assigningModule, setAssigningModule] = useState<Module | null>(null);
  const [deleteModuleId, setDeleteModuleId] = useState<string | null>(null);

  // Resource state
  const [resourceFormOpen, setResourceFormOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [deleteResourceId, setDeleteResourceId] = useState<string | null>(null);

  // Fetch data
  const { data: modules = [], isLoading: isLoadingModules } = useModulesWithCounts();
  const { data: clientsData, isLoading: isLoadingClients } = useClients(therapist?.id);
  const clients = Array.isArray(clientsData) ? clientsData : (clientsData?.data || []);
  const { data: selectedModuleResources = [] } = useResourcesByModule(selectedModule || undefined);
  const { data: unorganizedResources = [] } = useUnorganizedResources();
  const { data: resourceTags = [] } = useResourceTags();
  const { data: resourceCountByType } = useResourceCountByType();
  const { data: assignedClients = [] } = useAssignedClients(assigningModule?.id);

  // Mutations
  const createModuleMutation = useCreateModule();
  const updateModuleMutation = useUpdateModule();
  const deleteModuleMutation = useDeleteModule();
  const generateShareTokenMutation = useGenerateShareToken();
  const revokeShareTokenMutation = useRevokeShareToken();
  const toggleModuleActiveMutation = useToggleModuleActive();
  
  const createResourceMutation = useCreateResource();
  const updateResourceMutation = useUpdateResource();
  const deleteResourceMutation = useDeleteResource();
  
  const assignClientsMutation = useAssignClientsToModule();

  // Get all resources for display
  const allResources = useMemo(() => {
    return selectedModule ? selectedModuleResources : [...selectedModuleResources, ...unorganizedResources];
  }, [selectedModule, selectedModuleResources, unorganizedResources]);

  // Filter and search resources
  const filteredResources = useMemo(() => {
    return allResources.filter((resource) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Type filter
      const matchesType =
        selectedResourceType === "all" ||
        resource.resource_type === selectedResourceType;

      // Tag filter
      const matchesTag =
        selectedTag === "all" ||
        (resource.tags && resource.tags.includes(selectedTag));

      return matchesSearch && matchesType && matchesTag;
    });
  }, [allResources, searchQuery, selectedResourceType, selectedTag]);

  // Handlers
  const handleCreateModule = async (data: ModuleInsert) => {
    await createModuleMutation.mutateAsync(data);
    toast({ title: "Module created successfully" });
  };

  const handleUpdateModule = async (data: ModuleUpdate) => {
    if (!editingModule) return;
    await updateModuleMutation.mutateAsync({
      moduleId: editingModule.id,
      updates: data,
    });
    toast({ title: "Module updated successfully" });
  };

  const handleDeleteModule = async () => {
    if (!deleteModuleId) return;
    await deleteModuleMutation.mutateAsync(deleteModuleId);
    setDeleteModuleId(null);
    toast({ title: "Module deleted successfully" });
  };

  const handleGenerateShareToken = async (moduleId: string) => {
    const result = await generateShareTokenMutation.mutateAsync(moduleId);
    return result.shareToken;
  };

  const handleRevokeShareToken = async (moduleId: string) => {
    await revokeShareTokenMutation.mutateAsync(moduleId);
  };

  const handleToggleModuleActive = async (module: Module, isActive: boolean) => {
    await toggleModuleActiveMutation.mutateAsync({
      moduleId: module.id,
      isActive,
    });
    toast({
      title: isActive ? "Module activated" : "Module deactivated",
    });
  };

  const handleCreateOrUpdateResource = async (data: ResourceInsert | ResourceUpdate) => {
    if (editingResource) {
      await updateResourceMutation.mutateAsync({
        resourceId: editingResource.id,
        updates: data as ResourceUpdate,
      });
      toast({ title: "Resource updated successfully" });
    } else {
      await createResourceMutation.mutateAsync(data as ResourceInsert);
      toast({ title: "Resource uploaded successfully" });
    }
  };

  const handleDeleteResource = async () => {
    if (!deleteResourceId) return;
    await deleteResourceMutation.mutateAsync(deleteResourceId);
    setDeleteResourceId(null);
    toast({ title: "Resource deleted successfully" });
  };

  const handleAssignClients = async (moduleId: string, clientIds: string[], notes?: string) => {
    await assignClientsMutation.mutateAsync({
      moduleId,
      clientIds,
      therapistNotes: notes,
    });
  };

  const assignedClientIds = useMemo(() => {
    return assignedClients.map((ac) => ac.client_id);
  }, [assignedClients]);

  if (!therapist) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Not authenticated</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground mb-2">
            Resources
          </h1>
          <p className="text-muted-foreground">
            Organize and share therapeutic resources with your clients
          </p>
        </div>

      {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Modules</CardDescription>
            <CardTitle className="text-3xl">{modules.length}</CardTitle>
          </CardHeader>
        </Card>
          <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Resources</CardDescription>
              <CardTitle className="text-3xl">{allResources.length}</CardTitle>
          </CardHeader>
        </Card>
          <Card>
          <CardHeader className="pb-3">
            <CardDescription>Documents</CardDescription>
            <CardTitle className="text-3xl">
                {resourceCountByType?.document || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Links</CardDescription>
              <CardTitle className="text-3xl">
                {resourceCountByType?.url || 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Modules Section */}
        <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Modules</CardTitle>
              <CardDescription>
                  Organize your resources into themed collections
              </CardDescription>
            </div>
              <Button
                onClick={() => {
                  setEditingModule(null);
                  setModuleFormOpen(true);
                }}
              >
                  <Plus className="w-4 h-4 mr-2" />
                  New Module
                </Button>
          </div>
        </CardHeader>
        <CardContent>
            {isLoadingModules ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : modules.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No modules yet. Create your first module to get started.</p>
              </div>
            ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((module) => (
                  <ModuleCard
                    key={module.id}
                    module={module}
                    onEdit={(m) => {
                      setEditingModule(m);
                      setModuleFormOpen(true);
                    }}
                    onDelete={(m) => setDeleteModuleId(m.id)}
                    onShare={(m) => {
                      setSharingModule(m);
                      setShareModuleDialogOpen(true);
                    }}
                    onAssign={(m) => {
                      setAssigningModule(m);
                      setAssignModuleDialogOpen(true);
                    }}
                    onToggleActive={handleToggleModuleActive}
                    onClick={(m) => setSelectedModule(m.id)}
                  />
            ))}
          </div>
            )}
        </CardContent>
      </Card>

      {/* Resources Section */}
        <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Resources</CardTitle>
              <CardDescription>
                  {selectedModule
                    ? `Viewing resources in ${modules.find((m) => m.id === selectedModule)?.name}`
                    : "All resources"}
              </CardDescription>
            </div>
              <div className="flex items-center gap-2">
                {selectedModule && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedModule(null)}
                  >
                    View All
                  </Button>
                )}
                <Button
                  onClick={() => {
                    setEditingResource(null);
                    setResourceFormOpen(true);
                  }}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Resource
                  </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={selectedResourceType} onValueChange={setSelectedResourceType}>
                <SelectTrigger className="w-full md:w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="document">
                            <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Documents
                            </div>
                          </SelectItem>
                          <SelectItem value="video">
                            <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Videos
                    </div>
                  </SelectItem>
                  <SelectItem value="audio">
                    <div className="flex items-center gap-2">
                      <Headphones className="h-4 w-4" />
                      Audio
                    </div>
                  </SelectItem>
                  <SelectItem value="image">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Images
                    </div>
                  </SelectItem>
                  <SelectItem value="url">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4" />
                      Links
                    </div>
                  </SelectItem>
                  <SelectItem value="note">
                    <div className="flex items-center gap-2">
                      <StickyNote className="h-4 w-4" />
                      Notes
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
              {resourceTags.length > 0 && (
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by tag" />
                        </SelectTrigger>
                        <SelectContent>
                    <SelectItem value="all">All Tags</SelectItem>
                    {resourceTags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
              )}
          </div>
        </CardHeader>
        <CardContent>
            {filteredResources.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No resources found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onEdit={(r) => {
                      setEditingResource(r);
                      setResourceFormOpen(true);
                    }}
                    onDelete={(r) => setDeleteResourceId(r.id)}
                    onMove={(r) => {
                      // TODO: Implement move functionality
                      toast({ title: "Move functionality coming soon" });
                    }}
                  />
                ))}
              </div>
            )}
                  </CardContent>
                </Card>

        {/* Dialogs */}
        <ModuleFormDialog
          open={moduleFormOpen}
          onOpenChange={setModuleFormOpen}
          module={editingModule}
          onSubmit={editingModule ? handleUpdateModule : handleCreateModule}
          therapistId={therapist.id}
        />

        <ResourceUploadDialog
          open={resourceFormOpen}
          onOpenChange={setResourceFormOpen}
          resource={editingResource}
          moduleId={selectedModule}
          onSubmit={handleCreateOrUpdateResource}
          therapistId={therapist.id}
        />

        <ShareModuleDialog
          open={shareModuleDialogOpen}
          onOpenChange={setShareModuleDialogOpen}
          module={sharingModule}
          onGenerateToken={handleGenerateShareToken}
          onRevokeToken={handleRevokeShareToken}
        />

        <AssignModuleDialog
          open={assignModuleDialogOpen}
          onOpenChange={setAssignModuleDialogOpen}
          module={assigningModule}
          clients={clients}
          assignedClientIds={assignedClientIds}
          isLoadingClients={isLoadingClients}
          onAssign={handleAssignClients}
        />

        {/* Delete Confirmations */}
        <AlertDialog open={!!deleteModuleId} onOpenChange={() => setDeleteModuleId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Module?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the module and all its resources. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteModule} className="bg-destructive hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!deleteResourceId} onOpenChange={() => setDeleteResourceId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Resource?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the resource. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteResource} className="bg-destructive hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default Resources;
