interface HeroProps {
  projectCount: number;
}

export default function Hero({ projectCount }: HeroProps) {
  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 px-6 md:px-10 max-w-7xl mx-auto">
      <div className="relative z-10 max-w-4xl">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs font-medium text-white/50 mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Award-winning design · Next.js 13
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight text-white/90">
          Building digital <span className="gradient-text">experiences</span>{" "}
          that win awards.
        </h1>
        <p className="mt-6 text-lg md:text-xl text-white/50 max-w-2xl leading-relaxed">
          From high-performance websites and mobile apps to enterprise-grade IT
          infrastructure — we engineer success for modern businesses.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-2xl shadow-purple-600/30 hover:shadow-purple-600/50 transition"
          >
            <i className="fa-regular fa-message"></i> Start your project
          </a>
          <a
            href="#web"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-white/10 text-white/70 hover:bg-white/5 hover:text-white transition"
          >
            <i className="fa-regular fa-eye"></i> View work
          </a>
        </div>
        <div className="mt-14 flex flex-wrap gap-8 md:gap-12 text-white/40">
          <div>
            <span className="block text-2xl font-bold text-white">
              {projectCount}+
            </span>
            <span className="text-sm">Web projects</span>
          </div>
          <div>
            <span className="block text-2xl font-bold text-white">8+</span>
            <span className="text-sm">IT deployments</span>
          </div>
          <div>
            <span className="block text-2xl font-bold text-white">4+</span>
            <span className="text-sm">Mobile apps</span>
          </div>
          <div>
            <span className="block text-2xl font-bold text-white">100%</span>
            <span className="text-sm">Client satisfaction</span>
          </div>
        </div>
      </div>
    </section>
  );
}
