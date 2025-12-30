import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Overview from "./pages/dashboard/Overview";
import Clients from "./pages/dashboard/Clients";
import Sessions from "./pages/dashboard/Sessions";
import Assessments from "./pages/dashboard/Assessments";
import Notes from "./pages/dashboard/Notes";
import Finance from "./pages/dashboard/Finance";
import Tasks from "./pages/dashboard/Tasks";
import Reports from "./pages/dashboard/Reports";
import Settings from "./pages/dashboard/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Overview />} />
          <Route path="/dashboard/clients" element={<Clients />} />
          <Route path="/dashboard/sessions" element={<Sessions />} />
          <Route path="/dashboard/assessments" element={<Assessments />} />
          <Route path="/dashboard/notes" element={<Notes />} />
          <Route path="/dashboard/finance" element={<Finance />} />
          <Route path="/dashboard/tasks" element={<Tasks />} />
          <Route path="/dashboard/reports" element={<Reports />} />
          <Route path="/dashboard/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
