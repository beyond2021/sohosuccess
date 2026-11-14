import type { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/** Page frame for the estimate, account and payment pages: same look as the home page. */
export default function PortalPage({ children }: { children: ReactNode }) {
  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="orb w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-purple-600/30 top-[-10%] left-[-10%]" />
        <div className="orb w-[320px] h-[320px] md:w-[600px] md:h-[600px] bg-blue-600/20 bottom-[-20%] right-[-10%]" />
      </div>
      <Header />
      <main className="relative mx-auto max-w-3xl px-6 pb-24 pt-28 md:pt-32">{children}</main>
      <Footer />
    </>
  );
}

export const card = "glass rounded-2xl p-5 md:p-6";
export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition hover:shadow-purple-600/40 disabled:cursor-not-allowed disabled:opacity-50";
export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50";
export const input =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/30";
export const label = "mb-1.5 block text-sm font-semibold text-white/70";
