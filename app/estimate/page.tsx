import PortalPage from "@/components/portal/Page";
import EstimateCalculator from "@/components/portal/EstimateCalculator";

export const metadata = {
  title: "Get an estimate | SohoSuccess",
  description: "Pick what you need (Wi-Fi, cameras, a website or an app) and see a price range in seconds.",
};

export default function EstimatePage() {
  return (
    <PortalPage>
      <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
        Get an <span className="gradient-text">estimate</span>
      </h1>
      <p className="mb-8 mt-3 text-white/60">Pick what you need to see a price range. It&apos;s free, and there&apos;s no commitment.</p>
      <EstimateCalculator />
    </PortalPage>
  );
}
