import { Check } from "lucide-react";

const trustPoints = [
  "No client login required",
  "No unnecessary complexity",
  "Designed for daily use",
  "Clean, distraction-free interface",
];

const Trust = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-8">
            Simple by Design
          </h2>
          
          <div className="grid sm:grid-cols-2 gap-4">
            {trustPoints.map((point) => (
              <div 
                key={point}
                className="flex items-center gap-3 bg-sage-light rounded-lg px-5 py-4"
              >
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-foreground font-medium">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Trust;
