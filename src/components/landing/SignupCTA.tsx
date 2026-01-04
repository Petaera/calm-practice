import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const SignupCTA = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate signup - replace with actual auth later
    setTimeout(() => {
      toast({
        title: "Welcome to PracMind!",
        description: "We'll be in touch soon to get you started.",
      });
      setEmail("");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <section id="signup" className="py-20 md:py-28 bg-sage-light">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Start Managing Your Practice, Simply
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Built for psychologists who value clarity and focus.
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input 
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 h-12 bg-card border-border"
            />
            <Button 
              type="submit"
              size="lg"
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8"
            >
              {isLoading ? "Creating..." : "Create Your Account"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignupCTA;
