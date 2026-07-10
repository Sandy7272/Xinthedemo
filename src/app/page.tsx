import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { FeatureCards } from "@/components/FeatureCards";
import { DemoSection } from "@/components/DemoSection";
import { VirtualTryOn } from "@/components/VirtualTryOn";
import { PortfolioShowcase } from "@/components/PortfolioShowcase";
import { WhyItMatters } from "@/components/WhyItMatters";
import { TechnicalSkills } from "@/components/TechnicalSkills";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="overflow-x-clip">
        <Hero />
        <FeatureCards />
        <DemoSection />
        <VirtualTryOn />
        <PortfolioShowcase />
        <WhyItMatters />
        <TechnicalSkills />
      </main>
      <Footer />
    </>
  );
}
