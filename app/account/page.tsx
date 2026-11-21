import PortalPage from "@/components/portal/Page";
import AccountApp from "@/components/portal/AccountApp";

export const metadata = {
  title: "Client login | SohoSuccess",
  description: "SohoSuccess clients: see your services, accept estimates and pay invoices.",
  robots: { index: false },
};

export default function AccountPage() {
  return (
    <PortalPage>
      <AccountApp />
    </PortalPage>
  );
}
