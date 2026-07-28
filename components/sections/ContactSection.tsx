export default function ContactSection() {
  return (
    <section
      id="contact"
      className="relative px-6 md:px-10 py-20 md:py-28 max-w-7xl mx-auto"
    >
      <div className="relative z-10 glass rounded-3xl p-8 md:p-14 border border-white/5 shadow-2xl shadow-purple-600/5">
        <div className="grid md:grid-cols-5 gap-10 items-center">
          <div className="md:col-span-3">
            <span className="tag-pill mb-3 inline-block">
              <i className="fa-regular fa-paper-plane mr-1.5"></i> Let's build
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Ready to create something{" "}
              <span className="gradient-text">award‑winning</span>?
            </h2>
            <p className="mt-3 text-white/50 max-w-xl text-lg">
              Whether it's a website, mobile app, or a full IT infrastructure —
              let's talk about your next project.
            </p>
            <div className="flex flex-wrap gap-4 mt-6">
              <a
                href="mailto:hi@sohosuccess.dev"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition"
              >
                <i className="fa-regular fa-envelope"></i> hi@sohosuccess.dev
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition"
              >
                <i className="fa-regular fa-calendar"></i> Book a call
              </a>
            </div>
          </div>
          <div className="md:col-span-2 flex flex-col gap-3 text-sm text-white/30">
            <div className="flex items-center gap-3 border-b border-white/5 pb-3">
              <i className="fa-regular fa-circle-check text-emerald-400/60"></i>
              <span>12+ web projects delivered</span>
            </div>
            <div className="flex items-center gap-3 border-b border-white/5 pb-3">
              <i className="fa-regular fa-circle-check text-emerald-400/60"></i>
              <span>8+ IT networks deployed</span>
            </div>
            <div className="flex items-center gap-3">
              <i className="fa-regular fa-circle-check text-emerald-400/60"></i>
              <span>4+ mobile apps in production</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
