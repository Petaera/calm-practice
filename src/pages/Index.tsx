import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import WhoItsFor from "@/components/landing/WhoItsFor";
import Trust from "@/components/landing/Trust";
import SignupCTA from "@/components/landing/SignupCTA";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <WhoItsFor />
        <Trust />
        <SignupCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
