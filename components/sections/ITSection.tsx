export default function ITSection() {
  return (
    <section
      id="it"
      className="relative px-6 md:px-10 py-20 md:py-28 max-w-7xl mx-auto"
    >
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-2">
          <span className="tag-pill">
            <i className="fa-solid fa-server mr-1.5"></i> IT
          </span>
          <span className="text-xs text-white/20 font-mono">
            / infrastructure & networking
          </span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          IT <span className="gradient-text">Infrastructure</span>
        </h2>
        <div className="section-line"></div>
        <p className="mt-4 text-white/50 max-w-2xl text-lg">
          Custom Cat 6+ cabling, network setup, and maintenance for small to
          medium offices — built for speed and reliability.
        </p>
      </div>

      <div className="relative z-10 grid md:grid-cols-2 gap-6 mt-12">
        <div className="glass card-lift rounded-2xl p-7 shimmer-border flex flex-col service-card">
          <div className="icon-ring mb-5">
            <i className="fa-solid fa-network-wired"></i>
          </div>
          <h3 className="text-xl font-bold">Cat 6+ Cabling</h3>
          <p className="text-white/40 text-sm mt-1 leading-relaxed">
            High-speed structured cabling for small to medium offices.
            Future-proof your network with certified Cat 6 and Cat 6A
            installations.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/30">
            <li className="flex items-center gap-2">
              <i className="fa-regular fa-circle-check text-emerald-400/70"></i>{" "}
              Up to 10 Gbps throughput
            </li>
            <li className="flex items-center gap-2">
              <i className="fa-regular fa-circle-check text-emerald-400/70"></i>{" "}
              Shielded &amp; plenum-rated options
            </li>
            <li className="flex items-center gap-2">
              <i className="fa-regular fa-circle-check text-emerald-400/70"></i>{" "}
              Rack &amp; patch panel termination
            </li>
          </ul>
        </div>

        <div className="glass card-lift rounded-2xl p-7 shimmer-border flex flex-col service-card">
          <div className="icon-ring mb-5">
            <i className="fa-solid fa-wifi"></i>
          </div>
          <h3 className="text-xl font-bold">Network Setup &amp; Maintenance</h3>
          <p className="text-white/40 text-sm mt-1 leading-relaxed">
            Full network design, configuration, and ongoing maintenance. From
            routers and switches to firewalls and VPNs — we keep you connected.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/30">
            <li className="flex items-center gap-2">
              <i className="fa-regular fa-circle-check text-emerald-400/70"></i>{" "}
              Site survey &amp; topology design
            </li>
            <li className="flex items-center gap-2">
              <i className="fa-regular fa-circle-check text-emerald-400/70"></i>{" "}
              Firewall &amp; security configuration
            </li>
            <li className="flex items-center gap-2">
              <i className="fa-regular fa-circle-check text-emerald-400/70"></i>{" "}
              24/7 monitoring &amp; support
            </li>
          </ul>
        </div>

        <div className="md:col-span-2 glass-dark rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4 border border-white/5">
          <div className="flex items-center gap-4">
            <i className="fa-solid fa-bolt text-2xl text-yellow-400/60"></i>
            <span className="text-sm font-medium text-white/60">
              Typical deployment:
            </span>
            <span className="text-sm text-white/30">
              2 – 5 days · zero downtime
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-white/20">
              <i className="fa-regular fa-circle-check text-emerald-400/50 mr-1"></i>{" "}
              8+ offices deployed
            </span>
            <span className="text-xs font-mono text-white/20">
              <i className="fa-regular fa-star text-amber-400/50 mr-1"></i> 100%
              uptime SLA
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
