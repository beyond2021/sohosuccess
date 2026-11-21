import PortalPage from "@/components/portal/Page";
import PaidMessage from "@/components/portal/PaidMessage";

export const metadata = { title: "Payment | SohoSuccess", robots: { index: false } };

export default function PaidPage() {
  return (
    <PortalPage>
      <PaidMessage />
    </PortalPage>
  );
}
