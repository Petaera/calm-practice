import therapyImage1 from "@/assets/therapy-illustration-1.png";
import counselingSession from "@/assets/counseling-session.png";
import therapyImage2 from "@/assets/therapy-illustration-2.png";
import psychologistWorking from "@/assets/psychologist-working.png";

const images = [
  {
    src: therapyImage1,
    alt: "Therapy session illustration",
    caption: "Build meaningful client relationships",
  },
  {
    src: counselingSession,
    alt: "Counseling session in progress",
    caption: "Track every session with care",
  },
  {
    src: therapyImage2,
    alt: "Mental health support illustration",
    caption: "Support your clients' journey",
  },
  {
    src: psychologistWorking,
    alt: "Psychologist at work",
    caption: "Focus on what matters most",
  },
];

const ImageShowcase = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Designed for Your Practice
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Whether you're in a private office or working from home, PracticeMind adapts to how you work.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {images.map((image, index) => (
            <div 
              key={index}
              className="group relative overflow-hidden rounded-xl aspect-[4/5]"
            >
              <img 
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-card text-sm font-medium">{image.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImageShowcase;
