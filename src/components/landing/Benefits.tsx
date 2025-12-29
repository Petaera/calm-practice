import { Clock, Brain, Heart, Sparkles } from "lucide-react";
import psychologistWorking from "@/assets/psychologist-working.png";

const benefits = [
  {
    icon: Clock,
    title: "Save Hours Weekly",
    description: "Stop juggling spreadsheets, notebooks, and scattered notes. Everything lives in one place.",
  },
  {
    icon: Brain,
    title: "Stay Focused",
    description: "A clean, distraction-free interface helps you concentrate on your clients, not your tools.",
  },
  {
    icon: Heart,
    title: "Reduce Burnout",
    description: "Simplify admin tasks so you can dedicate more energy to the work you love.",
  },
  {
    icon: Sparkles,
    title: "Professional Growth",
    description: "Track patterns, monitor progress, and gain insights into your practice over time.",
  },
];

const Benefits = () => {
  return (
    <section className="py-20 md:py-28 bg-cream overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/10">
              <img 
                src={psychologistWorking}
                alt="Psychologist working peacefully"
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-sage-light rounded-full blur-3xl opacity-60" />
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-sky-light rounded-full blur-2xl opacity-60" />
          </div>

          <div className="order-1 lg:order-2">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-6">
              Why Psychologists Love PracticeMind
            </h2>
            <p className="text-muted-foreground text-lg mb-10">
              Built by people who understand the unique demands of running a private practice.
            </p>

            <div className="space-y-6">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-sage-light flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{benefit.title}</h3>
                    <p className="text-muted-foreground text-sm">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
