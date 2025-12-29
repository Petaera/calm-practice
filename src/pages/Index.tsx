import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Stats from "@/components/landing/Stats";
import Features from "@/components/landing/Features";
import ImageShowcase from "@/components/landing/ImageShowcase";
import HowItWorks from "@/components/landing/HowItWorks";
import Benefits from "@/components/landing/Benefits";
import WhoItsFor from "@/components/landing/WhoItsFor";
import Testimonials from "@/components/landing/Testimonials";
import Trust from "@/components/landing/Trust";
import FAQ from "@/components/landing/FAQ";
import SignupCTA from "@/components/landing/SignupCTA";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Stats />
        <Features />
        <ImageShowcase />
        <HowItWorks />
        <Benefits />
        <WhoItsFor />
        <Testimonials />
        <Trust />
        <FAQ />
        <SignupCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
