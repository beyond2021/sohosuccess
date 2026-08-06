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

export default async function Home() {
  const webProjects = getAllProjects().filter((p) => p.category === "web");

  return (
    <main className="relative">
      <div className="orb w-[500px] h-[500px] bg-purple-600/30 top-[-10%] left-[-10%] fixed"></div>
      <div className="orb w-[600px] h-[600px] bg-blue-600/20 bottom-[-20%] right-[-10%] fixed"></div>
      <div className="orb w-[300px] h-[300px] bg-emerald-500/20 top-[40%] left-[50%] -translate-x-1/2 fixed"></div>

      <Header />
      <Hero projectCount={webProjects.length} />
      <WebSection projects={webProjects} />
      <OpenSourceSection />
      <ITSection />
      <MobileSection />
      <ServicesSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
