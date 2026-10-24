import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = { title: "Privacy Policy | SohoSuccess" };

export default function Privacy() {
  return (
    <main className="relative">
      <Header />
      <section className="mx-auto max-w-3xl space-y-6 px-6 py-32 text-gray-300">
        <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
        <p>Last updated: October 24, 2026</p>
        <p>
          SohoSuccess provides IT, networking, website and mobile app services
          to local businesses. This policy explains what information the
          SohoSuccess website and mobile app collect and how it is used.
        </p>

        <h2 className="text-2xl font-semibold text-white">
          Information we collect
        </h2>
        <p>
          We collect only the information you choose to send us through the
          contact form or by email: your name, your email address and the
          message you write. We do not collect your location, contacts, photos
          or device identifiers, and we do not require an account.
        </p>

        <h2 className="text-2xl font-semibold text-white">How we use it</h2>
        <p>
          We use this information only to reply to your enquiry and to provide
          the services you ask about. We do not sell your information, share it
          for advertising, or use it to track you across other apps or websites.
        </p>

        <h2 className="text-2xl font-semibold text-white">
          Storage and service providers
        </h2>
        <p>
          Messages may be stored with the hosting, database and email providers
          we use to run our business. They process the information only on our
          behalf.
        </p>

        <h2 className="text-2xl font-semibold text-white">
          Retention and your choices
        </h2>
        <p>
          We keep enquiries only as long as needed to respond and to keep
          business records. You can ask us at any time to see or delete the
          information you sent us by emailing hello@sohosuccess.fyi.
        </p>

        <h2 className="text-2xl font-semibold text-white">Children</h2>
        <p>Our services are for businesses and are not directed at children.</p>

        <h2 className="text-2xl font-semibold text-white">Changes</h2>
        <p>If we change this policy we will update the date above.</p>

        <h2 className="text-2xl font-semibold text-white">Contact</h2>
        <p>Questions about this policy: hello@sohosuccess.fyi</p>
      </section>
      <Footer />
    </main>
  );
}
