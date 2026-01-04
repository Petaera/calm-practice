import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Is PracMind only for licensed psychologists?",
    answer: "No! PracMind is designed for anyone in the mental health field — licensed psychologists, counselors, therapists, trainees, and interns. If you work with clients, it's built for you.",
  },
  {
    question: "Can my clients log in to PracMind?",
    answer: "No, PracMind is a professional tool for practitioners only. Your clients never need to create accounts or log in. This keeps things simple and ensures your notes remain private.",
  },
  {
    question: "How is my data protected?",
    answer: "Your data is encrypted and stored securely. You maintain full control over your information, and we never share or sell your data. Privacy is at the core of everything we build.",
  },
  {
    question: "Can I access PracMind on my phone?",
    answer: "Yes! PracMind works beautifully on desktop, tablet, and mobile. Log sessions between appointments or review notes on the go.",
  },
  {
    question: "Is there a free trial?",
    answer: "Absolutely. You can try PracMind free and experience how it simplifies your practice before committing.",
  },
  {
    question: "What if I need help getting started?",
    answer: "We offer simple onboarding guides and responsive support. Most users are up and running in less than 10 minutes.",
  },
];

const FAQ = () => {
  return (
    <section className="py-20 md:py-28 bg-cream">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to know about PracMind.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-sm"
              >
                <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
