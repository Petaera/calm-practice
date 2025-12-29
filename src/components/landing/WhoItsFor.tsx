const audiences = [
  "Independent psychologists",
  "Counselors & therapists",
  "Psychology trainees & interns",
  "Professionals running evening or weekend practice",
];

const WhoItsFor = () => {
  return (
    <section className="py-20 md:py-28 bg-cream">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Who It's For
          </h2>
          <p className="text-muted-foreground text-lg">
            Built for mental health professionals who value simplicity.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
          {audiences.map((audience) => (
            <span 
              key={audience}
              className="px-6 py-3 bg-card border border-border rounded-full text-foreground font-medium shadow-sm"
            >
              {audience}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhoItsFor;
