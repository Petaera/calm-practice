import { Quote } from "lucide-react";
import therapyImage2 from "@/assets/therapy-illustration-2.png";

const testimonials = [
  {
    quote: "I finally have a system that works the way my brain works. No more sticky notes everywhere.",
    author: "Dr. Sarah M.",
    role: "Clinical Psychologist",
  },
  {
    quote: "The simplicity is refreshing. I can log a session in under a minute and get back to my clients.",
    author: "James R.",
    role: "Licensed Counselor",
  },
  {
    quote: "Perfect for my weekend practice. I don't need enterprise software — I need something that just works.",
    author: "Elena K.",
    role: "Psychology Trainee",
  },
];

const Testimonials = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-6">
              Trusted by Professionals
            </h2>
            <p className="text-muted-foreground text-lg mb-10">
              Hear from psychologists and counselors who've simplified their practice with PracticeMind.
            </p>

            <div className="space-y-6">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index}
                  className="bg-card border border-border rounded-xl p-6 relative"
                >
                  <Quote className="w-8 h-8 text-sage-light absolute top-4 right-4" />
                  <p className="text-foreground mb-4 italic">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/10">
              <img 
                src={therapyImage2}
                alt="Mental health support illustration"
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-sage-light rounded-full blur-3xl opacity-50" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
