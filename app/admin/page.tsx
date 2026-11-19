import PortalPage from "@/components/portal/Page";
import AdminApp from "@/components/portal/AdminApp";

export const metadata = {
  title: "Staff | SohoSuccess",
  description: "SohoSuccess staff: price and send estimates.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <PortalPage wide>
      <AdminApp />
    </PortalPage>
  );
}
