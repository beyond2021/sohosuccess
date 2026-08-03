export default function ServicesSection() {
  const services = [
    {
      icon: "fa-user",
      title: "Single Person Landing Pages",
      body: "One page, built to convert. For consultants, freelancers, and solo operators who need a real web presence — not a template.",
    },
    {
      icon: "fa-wrench",
      title: "Revive Your Old Broken Code",
      body: "That project you abandoned when it stopped building. We take it over, fix the dependencies, and get it shipping again.",
    },
  ];

  return (
    <section id="services" className="relative py-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto relative z-10">
        <h2 className="text-3xl md:text-5xl font-bold text-center text-white mb-4">
          Small jobs, done properly
        </h2>
        <p className="text-center text-slate-400 max-w-2xl mx-auto mb-16">
          Fixed scope, fixed price, no retainer.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {services.map((s) => (
            <div
              key={s.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-colors hover:border-purple-500/40"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600">
                <i className={`fa-solid ${s.icon} text-lg text-white`} aria-hidden="true" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-white">{s.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <a
            href="https://sohosuccess-invoice-jerry.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-10 py-4 font-semibold text-white shadow-lg shadow-purple-900/40 transition-opacity hover:opacity-90"
          >
            See pricing
            <i className="fa-solid fa-arrow-right text-sm" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}