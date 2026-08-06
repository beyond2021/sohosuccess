const socials = [
  { icon: "fa-github",      label: "GitHub",   href: "https://github.com/beyond2021" },
  { icon: "fa-x-twitter",   label: "X",        href: "https://x.com/beyond2021" },
  { icon: "fa-linkedin-in", label: "LinkedIn", href: "https://linkedin.com/in/ioskeevinmitcell" },
  { icon: "fa-dribbble",    label: "Dribbble", href: "https://dribbble.com/beyond2021" },
];

const columns = [
  {
    title: "Services",
    links: [
      { label: "Web Development", href: "/#web" },
      { label: "IT Infrastructure", href: "/#it" },
      { label: "Mobile Apps", href: "/#mobile" },
      { label: "Landing Pages", href: "/#services" },
      { label: "Code Revival", href: "/#services" },
    ],
  },
  {
    title: "Work",
    links: [
      { label: "Case Studies", href: "/#web" },
      { label: "Projects", href: "/#web" },
      { label: "Process", href: "/#contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/#contact" },
      { label: "Contact", href: "/#contact" },
      { label: "Pricing", href: "https://sohosuccess-invoice.netlify.app" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Acceptable Use", href: "/acceptable-use" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[420px]"
        style={{
          background:
            "radial-gradient(ellipse 70% 100% at 50% 100%, rgba(124,58,237,0.55) 0%, rgba(88,28,235,0.28) 35%, rgba(37,99,235,0.10) 60%, transparent 80%)",
          filter: "blur(40px)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[260px] opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 45% 100% at 50% 110%, rgba(167,139,250,0.5) 0%, transparent 70%)",
          filter: "blur(30px)",
        }}
      />

      <div className="relative z-10 px-6 md:px-10 pt-24 pb-16 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.1]">
            Technical &amp; professional.
            <br />
            Built for your business.
            <br />
            <span className="gradient-text">Available now.</span>
          </h2>
          <div className="md:pt-2">
            <p className="text-white/50 text-base md:text-lg max-w-md">
              Skip the agency runaround. Web, mobile, and IT infrastructure from
              one team that actually ships.
            </p>
            <a
              href="/#contact"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#080b14] transition-transform hover:-translate-y-0.5"
            >
              Get in touch
              <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      <div className="relative z-10 border-t border-white/5">
        <div className="px-6 md:px-10 py-14 max-w-7xl mx-auto grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <div className="flex items-center gap-2 text-sm text-white/50">
              <i className="fa-solid fa-code text-purple-400/70" aria-hidden="true" />
              <span>Soho Success — build websites, faster, better, visually.</span>
            </div>
            <div className="mt-5 flex items-center gap-4">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="text-white/30 hover:text-white transition-colors"
                >
                  <i className={`fa-brands ${s.icon}`} aria-hidden="true" />
                </a>
              ))}
            </div>
            <p className="mt-6 text-xs text-white/20">
              © 2026 Soho Success. All rights reserved.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-4">
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label + l.href}>
                    <a
                      href={l.href}
                      className="text-sm text-white/30 hover:text-white/70 transition-colors"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}