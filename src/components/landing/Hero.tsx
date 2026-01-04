import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/counseling-session.png";

const Hero = () => {
  const navigate = useNavigate();
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground leading-tight text-balance">
              Everything a Psychologist Needs — In One Calm Workspace
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
              Manage clients, sessions, assessments, notes, and earnings without spreadsheets, notebooks, or cluttered tools.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                onClick={() => navigate("/login")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg"
              >
                Get Started
              </Button>
              <Button 
                variant="ghost"
                size="lg"
                onClick={() => scrollToSection("how-it-works")}
                className="text-muted-foreground hover:text-foreground px-8 py-6 text-lg"
              >
                See How It Works
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Designed for independent psychologists and counselors managing private or side practices.
            </p>
          </div>
          
          <div className="relative animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/10">
              <img 
                src={heroImage}
                alt="Psychologist in a calm therapy session"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
