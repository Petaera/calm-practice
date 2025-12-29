const stats = [
  { value: "2 min", label: "Average session logging time" },
  { value: "100%", label: "Your data, your control" },
  { value: "Zero", label: "Learning curve" },
  { value: "24/7", label: "Access from anywhere" },
];

const Stats = () => {
  return (
    <section className="py-16 bg-primary">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-3xl md:text-4xl font-semibold text-primary-foreground mb-2">
                {stat.value}
              </p>
              <p className="text-primary-foreground/80 text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
