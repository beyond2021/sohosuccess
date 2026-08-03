export default function ServicesSection() {
  return (
    <section
      id="services"
      className="relative px-6 md:px-10 py-20 md:py-28 max-w-7xl mx-auto"
    >
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-2">
          <span className="tag-pill">
            <i className="fa-solid fa-bolt mr-1.5"></i> Services
          </span>
          <span className="text-xs text-white/20 font-mono">
            / fixed scope, fixed price
          </span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          Small jobs, <span className="gradient-text">done properly</span>
        </h2>
        <div className="section-line"></div>
        <p className="mt-4 text-white/50 max-w-2xl text-lg">
          Two things we do quickly and well — no retainer, no discovery phase,
          no six-week timeline.
        </p>
      </div>

      <div className="relative z-10 grid md:grid-cols-2 gap-6 mt-12">
        <div className="glass card-lift rounded-2xl p-7 shimmer-border flex flex-col service-card">
          <div className="icon-ring mb-5">
            <i className="fa-solid fa-user"></i>
          </div>
          <h3 className="text-xl font-bold">Single Person Landing Pages</h3>
          <p className="text-white/40 text-sm mt-1 leading-relaxed">
            One page, built to convert. For consultants, freelancers, and solo
            operators who need a real web presence — not a template with your
            name dropped into it.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/30">
            <li className="flex items-center gap-2">
              <i className="fa-regular fa-circle-check text-emerald-400/70"></i>{" "}
              Custom design, not a theme
            </li>
            <li className="flex items-center gap-2">
              <i className="fa-regular fa-circle-check text-emerald-400/70"></i>{" "}
              Mobile-first &amp; fast by default
            </li>
            <li className="flex items-center gap-2">
              <i className="fa-regular fa-circle-check text-emerald-400/70"></i>{" "}
              Live in under a week
            </li>
          </ul>
        </div>

        <div className="glass card-lift rounded-2xl p-7 shimmer-border flex flex-col service-card">
          <div className="icon-ring mb-5">
            <i className="fa-solid fa-wrench"></i>
          </div>
          <h3 className="text-xl font-bold">Revive Your Old Broken Code</h3>
          <p className="text-white/40 text-sm mt-1 leading-relaxed">
            That project you abandoned when it stopped building. We take it
            over, fix the dependencies, and get it shipping again — without
            starting from scratch.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/30">
            <li className="flex items-center gap-2">
              <i className="fa-regular fa-circle-check text-emerald-400/70"></i>{" "}
              Dependency &amp; build repair
            </li>
            <li className="flex items-center gap-2">
              <i className="fa-regular fa-circle-check text-emerald-400/70"></i>{" "}
              Framework version upgrades
            </li>
            <li className="flex items-center gap-2">
              <i className="fa-regular fa-circle-check text-emerald-400/70"></i>{" "}
              Deployed &amp; documented
            </li>
          </ul>
        </div>

        <div className="md:col-span-2 glass-dark rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4 border border-white/5">
          <div className="flex items-center gap-4">
            <i className="fa-solid fa-tag text-2xl text-yellow-400/60"></i>
            <span className="text-sm font-medium text-white/60">
              Transparent pricing:
            </span>
            <span className="text-sm text-white/30">
              quoted up front · no hourly billing
            </span>
          </div>
          <a
            href="https://sohosuccess-invoice-jerry.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="tag-pill hover:text-white transition"
          >
            See pricing <i className="fa-solid fa-arrow-right ml-1.5"></i>
          </a>
        </div>
      </div>
    </section>
  );
}