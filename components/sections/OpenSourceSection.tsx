const contributions = [
  {
    repo: "universal-tooltip",
    title: "Fixed Expo SDK 54 compile failure",
    blurb:
      "Unbuildable since October 2025. Traced to React headers no longer resolving through ExpoModulesCore.",
    href: "https://github.com/alantoa/universal-tooltip/pull/26",
    status: "PR open",
  },
];

export default function OpenSourceSection() {
  return (
    <section id="open-source" className="py-20">
      <div className="px-6 md:px-10 max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Open source
        </h2>
        <p className="mt-2 text-sm text-white/40">
          Fixes contributed to libraries other developers depend on.
        </p>
      </div>

      <div className="mt-8 overflow-x-auto">
        <div className="flex gap-4 px-6 md:px-10 max-w-7xl mx-auto pb-4 snap-x snap-mandatory">
          {contributions.map((c) => (
            <a
              key={c.href}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex-none w-[300px] snap-start rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-colors hover:border-white/10 hover:bg-white/[0.04]"
            >
              <div className="flex items-center gap-2 text-[11px] text-white/40 mb-4">
                <i className="fa-brands fa-github text-sm" aria-hidden="true" />
                <span className="font-mono">{c.repo}</span>
                <span className="ml-auto rounded-full border border-white/10 px-2 py-0.5">
                  {c.status}
                </span>
              </div>
              <h3 className="text-[15px] font-semibold text-white/90 group-hover:text-white">
                {c.title}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-white/40">
                {c.blurb}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}