import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  FolderOpen,
  FileText,
  Video,
  Edit,
  Trash2,
  Download,
  Share2,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Resource {
  id: string;
  type: "document" | "video";
  title: string;
  description: string;
  url: string;
  moduleId: string;
  fileName?: string;
  fileSize?: string;
  createdAt: Date;
}

interface Module {
  id: string;
  name: string;
  description: string;
  color: string;
  resourceCount: number;
}

const Resources = () => {
  const { toast } = useToast();
  const [modules, setModules] = useState<Module[]>([
    {
      id: "1",
      name: "Anxiety Management",
      description: "Resources for managing anxiety and stress",
      color: "bg-blue-100 text-blue-800",
      resourceCount: 5,
    },
    {
      id: "2",
      name: "Mindfulness Practices",
      description: "Meditation and mindfulness exercises",
      color: "bg-green-100 text-green-800",
      resourceCount: 3,
    },
    {
      id: "3",
      name: "Sleep Hygiene",
      description: "Tips and resources for better sleep",
      color: "bg-purple-100 text-purple-800",
      resourceCount: 4,
    },
  ]);

  const [resources, setResources] = useState<Resource[]>([
    {
      id: "1",
      type: "document",
      title: "Breathing Exercises Guide",
      description: "A comprehensive guide to various breathing techniques",
      url: "#",
      moduleId: "1",
      fileName: "breathing-exercises.pdf",
      fileSize: "2.4 MB",
      createdAt: new Date("2024-01-15"),
    },
    {
      id: "2",
      type: "video",
      title: "Introduction to Mindfulness",
      description: "10-minute guided mindfulness meditation",
      url: "https://www.youtube.com/watch?v=example",
      moduleId: "2",
      createdAt: new Date("2024-01-20"),
    },
    {
      id: "3",
      type: "document",
      title: "Sleep Diary Template",
      description: "Track your sleep patterns with this helpful template",
      url: "#",
      moduleId: "3",
      fileName: "sleep-diary.pdf",
      fileSize: "1.2 MB",
      createdAt: new Date("2024-01-25"),
    },
  ]);

  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [newModule, setNewModule] = useState({ name: "", description: "" });
  const [newResource, setNewResource] = useState({
    type: "document" as "document" | "video",
    title: "",
    description: "",
    url: "",
    moduleId: "",
  });

  const handleCreateModule = () => {
    if (!newModule.name) {
      toast({
        title: "Error",
        description: "Please enter a module name",
        variant: "destructive",
      });
      return;
    }

    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-purple-100 text-purple-800",
      "bg-orange-100 text-orange-800",
      "bg-pink-100 text-pink-800",
    ];

    const module: Module = {
      id: Date.now().toString(),
      name: newModule.name,
      description: newModule.description,
      color: colors[Math.floor(Math.random() * colors.length)],
      resourceCount: 0,
    };

    setModules([...modules, module]);
    setNewModule({ name: "", description: "" });
    setIsModuleDialogOpen(false);
    toast({
      title: "Module created",
      description: `"${module.name}" has been created successfully.`,
    });
  };

  const handleCreateResource = () => {
    if (!newResource.title || !newResource.moduleId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const resource: Resource = {
      id: Date.now().toString(),
      ...newResource,
      createdAt: new Date(),
    };

    setResources([...resources, resource]);
    setNewResource({
      type: "document",
      title: "",
      description: "",
      url: "",
      moduleId: "",
    });
    setIsResourceDialogOpen(false);

    // Update module resource count
    setModules(
      modules.map((m) =>
        m.id === resource.moduleId
          ? { ...m, resourceCount: m.resourceCount + 1 }
          : m
      )
    );

    toast({
      title: "Resource added",
      description: `"${resource.title}" has been added successfully.`,
    });
  };

  const handleDeleteResource = (resourceId: string) => {
    const resource = resources.find((r) => r.id === resourceId);
    if (!resource) return;

    setResources(resources.filter((r) => r.id !== resourceId));
    setModules(
      modules.map((m) =>
        m.id === resource.moduleId
          ? { ...m, resourceCount: Math.max(0, m.resourceCount - 1) }
          : m
      )
    );

    toast({
      title: "Resource deleted",
      description: "The resource has been removed.",
    });
  };

  const handleDeleteModule = (moduleId: string) => {
    const module = modules.find((m) => m.id === moduleId);
    if (!module) return;

    if (module.resourceCount > 0) {
      toast({
        title: "Cannot delete module",
        description: "Please remove all resources from this module first.",
        variant: "destructive",
      });
      return;
    }

    setModules(modules.filter((m) => m.id !== moduleId));
    toast({
      title: "Module deleted",
      description: `"${module.name}" has been deleted.`,
    });
  };

  const filteredResources =
    selectedModule === "all"
      ? resources
      : resources.filter((r) => r.moduleId === selectedModule);

  const getModuleName = (moduleId: string) => {
    return modules.find((m) => m.id === moduleId)?.name || "Unknown";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground mb-2">
            Resources
          </h1>
          <p className="text-muted-foreground">
            Manage documents and videos organized into modules for your clients
          </p>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardDescription>Total Modules</CardDescription>
            <CardTitle className="text-3xl">{modules.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardDescription>Total Resources</CardDescription>
            <CardTitle className="text-3xl">{resources.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardDescription>Documents</CardDescription>
            <CardTitle className="text-3xl">
              {resources.filter((r) => r.type === "document").length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Modules Section */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Modules</CardTitle>
              <CardDescription>
                Organize your resources into themed modules
              </CardDescription>
            </div>
            <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  New Module
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Module</DialogTitle>
                  <DialogDescription>
                    Create a themed module to organize your resources
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="module-name">Module Name *</Label>
                    <Input
                      id="module-name"
                      placeholder="e.g., Anxiety Management"
                      value={newModule.name}
                      onChange={(e) =>
                        setNewModule({ ...newModule, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="module-description">Description</Label>
                    <Textarea
                      id="module-description"
                      placeholder="Brief description of this module"
                      value={newModule.description}
                      onChange={(e) =>
                        setNewModule({ ...newModule, description: e.target.value })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsModuleDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateModule}>Create Module</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((module) => (
              <Card key={module.id} className="border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg">{module.name}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteModule(module.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardDescription className="text-xs">
                    {module.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge className={module.color}>
                    {module.resourceCount} resources
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resources Section */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Resources</CardTitle>
              <CardDescription>
                Documents and videos for your clients
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  {modules.map((module) => (
                    <SelectItem key={module.id} value={module.id}>
                      {module.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Dialog
                open={isResourceDialogOpen}
                onOpenChange={setIsResourceDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Resource
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Resource</DialogTitle>
                    <DialogDescription>
                      Add a document or video link to a module
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="resource-type">Resource Type *</Label>
                      <Select
                        value={newResource.type}
                        onValueChange={(value: "document" | "video") =>
                          setNewResource({ ...newResource, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="document">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              Document
                            </div>
                          </SelectItem>
                          <SelectItem value="video">
                            <div className="flex items-center gap-2">
                              <Video className="w-4 h-4" />
                              YouTube Video
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="resource-module">Module *</Label>
                      <Select
                        value={newResource.moduleId}
                        onValueChange={(value) =>
                          setNewResource({ ...newResource, moduleId: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a module" />
                        </SelectTrigger>
                        <SelectContent>
                          {modules.map((module) => (
                            <SelectItem key={module.id} value={module.id}>
                              {module.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="resource-title">Title *</Label>
                      <Input
                        id="resource-title"
                        placeholder="Resource title"
                        value={newResource.title}
                        onChange={(e) =>
                          setNewResource({ ...newResource, title: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="resource-url">
                        {newResource.type === "video" ? "YouTube URL" : "Document URL"} *
                      </Label>
                      <Input
                        id="resource-url"
                        placeholder={
                          newResource.type === "video"
                            ? "https://www.youtube.com/watch?v=..."
                            : "Upload or paste document URL"
                        }
                        value={newResource.url}
                        onChange={(e) =>
                          setNewResource({ ...newResource, url: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="resource-description">Description</Label>
                      <Textarea
                        id="resource-description"
                        placeholder="Brief description of this resource"
                        value={newResource.description}
                        onChange={(e) =>
                          setNewResource({
                            ...newResource,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsResourceDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreateResource}>Add Resource</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="grid" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>
            <TabsContent value="grid" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResources.map((resource) => (
                  <Card key={resource.id} className="border-border/50 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {resource.type === "document" ? (
                            <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                          ) : (
                            <Video className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                          )}
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base truncate">
                              {resource.title}
                            </CardTitle>
                            <Badge className="mt-1 text-xs" variant="outline">
                              {getModuleName(resource.moduleId)}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive flex-shrink-0"
                          onClick={() => handleDeleteResource(resource.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {resource.description}
                      </p>
                      {resource.type === "document" && resource.fileName && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{resource.fileName}</span>
                          <span>•</span>
                          <span>{resource.fileSize}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="flex-1" asChild>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Open
                          </a>
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {filteredResources.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No resources found in this module</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="list" className="space-y-2">
              {filteredResources.map((resource) => (
                <Card key={resource.id} className="border-border/50">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {resource.type === "document" ? (
                          <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                        ) : (
                          <Video className="w-5 h-5 text-red-500 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{resource.title}</h4>
                          <p className="text-sm text-muted-foreground truncate">
                            {resource.description}
                          </p>
                        </div>
                        <Badge variant="outline" className="flex-shrink-0">
                          {getModuleName(resource.moduleId)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button size="sm" variant="outline" asChild>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteResource(resource.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredResources.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No resources found in this module</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  );
};

export default Resources;

