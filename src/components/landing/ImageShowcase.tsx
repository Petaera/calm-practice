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
    <section className="py-20 md:py-28 bg-cream/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Designed for Your Practice
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Whether you're in a private office or working from home, PractoMind adapts to how you work.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto">
          {images.map((image, index) => (
            <div 
              key={index}
              className="group relative overflow-hidden rounded-2xl aspect-[4/5] shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
              <img 
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-30">
                <p className="text-card text-base font-semibold drop-shadow-lg">{image.caption}</p>
              </div>
              <div className="absolute top-4 right-4 w-12 h-12 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImageShowcase;
