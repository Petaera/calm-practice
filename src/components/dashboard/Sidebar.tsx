import { LucideIcon, LayoutDashboard, Users, Calendar, ClipboardCheck, StickyNote, CreditCard, CheckSquare, BarChart3, Settings, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  active?: boolean;
}

const NavItem = ({ icon: Icon, label, href, active }: NavItemProps) => (
  <Link
    to={href}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
        : "text-muted-foreground hover:bg-sage-light/50 hover:text-foreground"
    )}
  >
    <Icon className={cn("w-5 h-5", active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
    <span className="font-medium">{label}</span>
  </Link>
);

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, therapist } = useAuth();
  const { toast } = useToast();
  
  const menuItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
    { icon: Users, label: "Clients", href: "/dashboard/clients" },
    { icon: Calendar, label: "Sessions", href: "/dashboard/sessions" },
    { icon: ClipboardCheck, label: "Assessments", href: "/dashboard/assessments" },
    { icon: StickyNote, label: "Notes", href: "/dashboard/notes" },
    { icon: CreditCard, label: "Finance", href: "/dashboard/finance" },
    { icon: CheckSquare, label: "Tasks", href: "/dashboard/tasks" },
    { icon: BarChart3, label: "Reports", href: "/dashboard/reports" },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <Link to="/" className="font-display text-2xl font-bold text-primary tracking-tight">
          Calm Practice
        </Link>
        {therapist && (
          <p className="text-xs text-muted-foreground mt-2 truncate">
            {therapist.full_name}
          </p>
        )}
      </div>
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavItem 
            key={item.href} 
            {...item} 
            active={location.pathname === item.href} 
          />
        ))}
      </nav>

      <div className="p-4 border-t border-border mt-auto space-y-1">
        <NavItem 
          icon={Settings} 
          label="Settings" 
          href="/dashboard/settings" 
          active={location.pathname === "/dashboard/settings"} 
        />
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-destructive/5 hover:text-destructive transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

