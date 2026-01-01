import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <a href="/" className="font-display text-2xl font-semibold text-foreground">
          PractoMind
        </a>
        
        <nav className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => scrollToSection("features")}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </button>
          <button 
            onClick={() => scrollToSection("how-it-works")}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            How It Works
          </button>
          <Button 
            onClick={() => navigate("/login")}
            className="bg-primary hover:bg-primary/90"
          >
            Get Started
          </Button>
        </nav>

        <Button 
          onClick={() => navigate("/login")}
          className="md:hidden bg-primary hover:bg-primary/90"
          size="sm"
        >
          Get Started
        </Button>
      </div>
    </header>
  );
};

export default Header;
