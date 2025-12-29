import { Users, ClipboardCheck, FileText, DollarSign, LayoutDashboard, Shield } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Client Records",
    description: "Maintain simple client profiles and session history.",
  },
  {
    icon: ClipboardCheck,
    title: "Psychological Tests & Assessments",
    description: "Create, manage, and record assessment results with flexible scoring.",
  },
  {
    icon: FileText,
    title: "Session Logs & Notes",
    description: "Log sessions, add private notes, and track follow-ups.",
  },
  {
    icon: DollarSign,
    title: "Income Tracking",
    description: "Track session fees and monthly earnings effortlessly.",
  },
  {
    icon: LayoutDashboard,
    title: "Practice Dashboard",
    description: "Get a clear overview of sessions, clients, and activity.",
  },
  {
    icon: Shield,
    title: "Privacy-First Design",
    description: "Built for professional use with data control and security in mind.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 md:py-28 bg-cream">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Everything You Need, Nothing You Don't
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Simple, focused tools designed specifically for psychology professionals.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border border-border"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-lg bg-sage-light flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
