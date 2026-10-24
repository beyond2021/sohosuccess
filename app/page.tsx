import { getAllProjects } from "@/lib/content";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/sections/Hero";
import WebSection from "@/components/sections/WebSection";
import ITSection from "@/components/sections/ITSection";
import MobileSection from "@/components/sections/MobileSection";
import ContactSection from "@/components/sections/ContactSection";
import ServicesSection from "@/components/sections/ServicesSection";
import OpenSourceSection from "@/components/sections/OpenSourceSection";

// Removed revalidate because filesystem reads are static by default
export default async function Home() {
  const allProjects = getAllProjects();
  const webProjects = allProjects.filter((p) => p.category === "web");

  return (
    <>
      <div 
        aria-hidden="true" 
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="orb w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-purple-600/30 top-[-10%] left-[-10%]" />
        <div className="orb w-[320px] h-[320px] md:w-[600px] md:h-[600px] bg-blue-600/20 bottom-[-20%] right-[-10%]" />
        <div className="orb w-[200px] h-[200px] md:w-[300px] md:h-[300px] bg-emerald-500/20 top-[40%] left-[50%] -translate-x-1/2" />
      </div>

      <Header />
      
      <main className="relative">
        <Hero projectCount={webProjects.length} />
        <WebSection projects={webProjects} />
        <OpenSourceSection />
        <ITSection />
        <MobileSection />
        <ServicesSection />
        <ContactSection />
      </main>
      
      <Footer />
    </>
  );
}