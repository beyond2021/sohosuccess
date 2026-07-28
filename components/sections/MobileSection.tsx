export default function MobileSection() {
  return (
    <section
      id="mobile"
      className="relative px-6 md:px-10 py-20 md:py-28 max-w-7xl mx-auto"
    >
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-2">
          <span className="tag-pill">
            <i className="fa-solid fa-mobile-screen-button mr-1.5"></i> Mobile
          </span>
          <span className="text-xs text-white/20 font-mono">
            / apps for iOS & Android
          </span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          Mobile <span className="gradient-text">Applications</span>
        </h2>
        <div className="section-line"></div>
        <p className="mt-4 text-white/50 max-w-2xl text-lg">
          Native and cross-platform apps built with React Native, Flutter, and
          Swift — designed to delight users and drive engagement.
        </p>
      </div>

      <div className="relative z-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        <div className="glass card-lift rounded-2xl p-6 shimmer-border">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📱</span>
            <span className="text-xs font-mono text-white/20">
              React Native
            </span>
          </div>
          <h3 className="text-xl font-bold">FitTrack</h3>
          <p className="text-white/40 text-sm mt-1">
            Health &amp; fitness companion
          </p>
          <div className="flex flex-wrap gap-1.5 mt-4">
            <span className="text-[10px] font-mono bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
              iOS
            </span>
            <span className="text-[10px] font-mono bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
              Android
            </span>
            <span className="text-[10px] font-mono bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
              Expo
            </span>
          </div>
          <a
            href="#"
            className="inline-block mt-5 text-sm text-white/40 hover:text-white transition"
          >
            <i className="fa-regular fa-arrow-right"></i> Learn more
          </a>
        </div>

        <div className="glass card-lift rounded-2xl p-6 shimmer-border">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">💬</span>
            <span className="text-xs font-mono text-white/20">Flutter</span>
          </div>
          <h3 className="text-xl font-bold">TalkSpace</h3>
          <p className="text-white/40 text-sm mt-1">
            Real-time messaging &amp; voice
          </p>
          <div className="flex flex-wrap gap-1.5 mt-4">
            <span className="text-[10px] font-mono bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
              iOS
            </span>
            <span className="text-[10px] font-mono bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
              Android
            </span>
            <span className="text-[10px] font-mono bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
              WebRTC
            </span>
          </div>
          <a
            href="#"
            className="inline-block mt-5 text-sm text-white/40 hover:text-white transition"
          >
            <i className="fa-regular fa-arrow-right"></i> Learn more
          </a>
        </div>

        <div className="glass card-lift rounded-2xl p-6 shimmer-border sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🛍️</span>
            <span className="text-xs font-mono text-white/20">SwiftUI</span>
          </div>
          <h3 className="text-xl font-bold">ShopLocal</h3>
          <p className="text-white/40 text-sm mt-1">
            Marketplace for local vendors
          </p>
          <div className="flex flex-wrap gap-1.5 mt-4">
            <span className="text-[10px] font-mono bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
              iOS
            </span>
            <span className="text-[10px] font-mono bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
              SwiftUI
            </span>
            <span className="text-[10px] font-mono bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
              Stripe
            </span>
          </div>
          <a
            href="#"
            className="inline-block mt-5 text-sm text-white/40 hover:text-white transition"
          >
            <i className="fa-regular fa-arrow-right"></i> Learn more
          </a>
        </div>
      </div>
    </section>
  );
}
