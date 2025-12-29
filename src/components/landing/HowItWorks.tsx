import { UserPlus, CalendarCheck, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    number: "1",
    title: "Add your clients",
    description: "Create simple profiles for each client you work with.",
  },
  {
    icon: CalendarCheck,
    number: "2",
    title: "Log sessions & assessments",
    description: "Record sessions, notes, and psychological test results.",
  },
  {
    icon: TrendingUp,
    number: "3",
    title: "Track progress and earnings",
    description: "Monitor client progress and your practice income.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg">
            Get started in three simple steps.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="relative text-center">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-border" />
              )}
              
              <div className="relative z-10 w-24 h-24 rounded-full bg-sage-light flex items-center justify-center mx-auto mb-6">
                <step.icon className="w-10 h-10 text-primary" />
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                  {step.number}
                </span>
              </div>
              
              <h3 className="font-semibold text-xl text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
