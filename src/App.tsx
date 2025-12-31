import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
import PublicAssessment from "./pages/PublicAssessment";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute><Overview /></ProtectedRoute>} />
            <Route path="/dashboard/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
            <Route path="/dashboard/sessions" element={<ProtectedRoute><Sessions /></ProtectedRoute>} />
            <Route path="/dashboard/assessments" element={<ProtectedRoute><Assessments /></ProtectedRoute>} />
            <Route path="/dashboard/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
            <Route path="/dashboard/finance" element={<ProtectedRoute><Finance /></ProtectedRoute>} />
            <Route path="/dashboard/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
            <Route path="/dashboard/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/dashboard/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            {/* Public assessment route - no authentication required */}
            <Route path="/assessment/:token" element={<PublicAssessment />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
