import { LucideIcon, LayoutDashboard, Users, Calendar, ClipboardCheck, StickyNote, FolderOpen, CreditCard, CheckSquare, BarChart3, Settings, LogOut, Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem = ({ icon: Icon, label, href, active, onClick }: NavItemProps) => (
  <Link
    to={href}
    onClick={onClick}
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
  const [isOpen, setIsOpen] = useState(false);
  
  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close sidebar when clicking outside (mobile)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      const hamburger = document.getElementById('hamburger-button');
      if (
        isOpen &&
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        hamburger &&
        !hamburger.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  const menuItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
    { icon: Users, label: "Clients", href: "/dashboard/clients" },
    { icon: Calendar, label: "Sessions", href: "/dashboard/sessions" },
    { icon: ClipboardCheck, label: "Assessments", href: "/dashboard/assessments" },
    { icon: StickyNote, label: "Notes", href: "/dashboard/notes" },
    { icon: FolderOpen, label: "Resources", href: "/dashboard/resources" },
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
    <>
      {/* Hamburger Button - Fixed position on mobile */}
      <button
        id="hamburger-button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border border-border shadow-lg transition-all duration-200",
          "lg:hidden",
          "hover:bg-accent",
          isOpen && "left-[260px]"
        )}
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-foreground" />
        ) : (
          <Menu className="w-6 h-6 text-foreground" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        id="sidebar"
        className={cn(
          "w-64 border-r border-border bg-card flex flex-col h-screen z-40 transition-transform duration-300 ease-in-out",
          "fixed lg:sticky top-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-6">
          <Link to="/" className="font-display text-2xl font-bold text-primary tracking-tight">
            PractoMind
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
              onClick={() => setIsOpen(false)}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-border mt-auto space-y-1">
          <NavItem 
            icon={Settings} 
            label="Settings" 
            href="/dashboard/settings" 
            active={location.pathname === "/dashboard/settings"}
            onClick={() => setIsOpen(false)}
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
    </>
  );
};

export default Sidebar;

