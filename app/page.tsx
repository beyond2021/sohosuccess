import { getAllProjects } from '@/lib/content';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default async function Home() {
  const webProjects = getAllProjects().filter(p => p.category === 'web');

  return (
    <main className="relative">
      {/* Orbs */}
      <div className="orb w-[500px] h-[500px] bg-purple-600/30 top-[-10%] left-[-10%] fixed"></div>
      <div className="orb w-[600px] h-[600px] bg-blue-600/20 bottom-[-20%] right-[-10%] fixed"></div>
      <div className="orb w-[300px] h-[300px] bg-emerald-500/20 top-[40%] left-[50%] -translate-x-1/2 fixed"></div>

      <Header />

      {/* HERO */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 px-6 md:px-10 max-w-7xl mx-auto">
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs font-medium text-white/50 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Award-winning design · Next.js 13
          </div>
          <h1 className="hero-title text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.08] tracking-tight">
            Building digital
            <br />
            <span className="gradient-text">experiences</span> that
            <br className="hidden sm:block" />
            <span className="text-white/90">win awards.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/50 max-w-2xl leading-relaxed">
            From high-performance websites and mobile apps to enterprise-grade
            IT infrastructure — we engineer success for modern businesses.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a href="#contact" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-2xl shadow-purple-600/30 hover:shadow-purple-600/50 transition">
              <i className="fa-regular fa-message"></i> Start your project
            </a>
            <a href="#web" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-white/10 text-white/70 hover:bg-white/5 hover:text-white transition">
              <i className="fa-regular fa-eye"></i> View work
            </a>
          </div>
          <div className="mt-14 flex flex-wrap gap-8 md:gap-12 text-white/40">
            <div>
              <span className="block text-2xl font-bold text-white">{webProjects.length}+</span>
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

      {/* WEB SECTION */}
      <section id="web" className="relative px-6 md:px-10 py-20 md:py-28 max-w-7xl mx-auto">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-2">
            <span className="tag-pill"><i className="fa-solid fa-code mr-1.5"></i> Web</span>
            <span className="text-xs text-white/20 font-mono">/ websites & landing pages</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Websites &amp; <span className="gradient-text">Landing Pages</span>
          </h2>
          <div className="section-line"></div>
          <p className="mt-4 text-white/50 max-w-2xl text-lg">
            High-conversion, award-winning designs built with Next.js 13, Tailwind,
            and modern motion — tailored to your brand.
          </p>
        </div>

        <div className="relative z-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {webProjects.map(({ slug, frontmatter }) => (
            <Link
              key={slug}
              href={`/web/${slug}`}
              className="glass card-lift rounded-2xl p-6 shimmer-border hover:no-underline"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">✨</span>
                <span className="text-xs font-mono text-white/20">{frontmatter.year}</span>
              </div>
              <h3 className="text-xl font-bold">{frontmatter.title}</h3>
              <p className="text-white/40 text-sm mt-1">{frontmatter.description}</p>
              <div className="flex flex-wrap gap-1.5 mt-4">
                {frontmatter.tech.slice(0, 3).map((tech: string) => (
                  <span key={tech} className="text-[10px] font-mono bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                    {tech}
                  </span>
                ))}
              </div>
              <span className="inline-block mt-5 text-sm text-white/40 hover:text-white transition">
                <i className="fa-regular fa-arrow-right"></i> Case study
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* IT SECTION (static) */}
      <section id="it" className="relative px-6 md:px-10 py-20 md:py-28 max-w-7xl mx-auto">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-2">
            <span className="tag-pill"><i className="fa-solid fa-server mr-1.5"></i> IT</span>
            <span className="text-xs text-white/20 font-mono">/ infrastructure & networking</span>
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
            <div className="icon-ring mb-5"><i className="fa-solid fa-network-wired"></i></div>
            <h3 className="text-xl font-bold">Cat 6+ Cabling</h3>
            <p className="text-white/40 text-sm mt-1 leading-relaxed">
              High-speed structured cabling for small to medium offices.
              Future-proof your network with certified Cat 6 and Cat 6A installations.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-white/30">
              <li className="flex items-center gap-2"><i className="fa-regular fa-circle-check text-emerald-400/70"></i> Up to 10 Gbps throughput</li>
              <li className="flex items-center gap-2"><i className="fa-regular fa-circle-check text-emerald-400/70"></i> Shielded &amp; plenum-rated options</li>
              <li className="flex items-center gap-2"><i className="fa-regular fa-circle-check text-emerald-400/70"></i> Rack &amp; patch panel termination</li>
            </ul>
          </div>

          <div className="glass card-lift rounded-2xl p-7 shimmer-border flex flex-col service-card">
            <div className="icon-ring mb-5"><i className="fa-solid fa-wifi"></i></div>
            <h3 className="text-xl font-bold">Network Setup &amp; Maintenance</h3>
            <p className="text-white/40 text-sm mt-1 leading-relaxed">
              Full network design, configuration, and ongoing maintenance.
              From routers and switches to firewalls and VPNs — we keep you connected.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-white/30">
              <li className="flex items-center gap-2"><i className="fa-regular fa-circle-check text-emerald-400/70"></i> Site survey &amp; topology design</li>
              <li className="flex items-center gap-2"><i className="fa-regular fa-circle-check text-emerald-400/70"></i> Firewall &amp; security configuration</li>
              <li className="flex items-center gap-2"><i className="fa-regular fa-circle-check text-emerald-400/70"></i> 24/7 monitoring &amp; support</li>
            </ul>
          </div>

          <div className="md:col-span-2 glass-dark rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4 border border-white/5">
            <div className="flex items-center gap-4">
              <i className="fa-solid fa-bolt text-2xl text-yellow-400/60"></i>
              <span className="text-sm font-medium text-white/60">Typical deployment:</span>
              <span className="text-sm text-white/30">2 – 5 days · zero downtime</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-white/20"><i className="fa-regular fa-circle-check text-emerald-400/50 mr-1"></i> 8+ offices deployed</span>
              <span className="text-xs font-mono text-white/20"><i className="fa-regular fa-star text-amber-400/50 mr-1"></i> 100% uptime SLA</span>
            </div>
          </div>
        </div>
      </section>

      {/* MOBILE SECTION (static) */}
      <section id="mobile" className="relative px-6 md:px-10 py-20 md:py-28 max-w-7xl mx-auto">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-2">
            <span className="tag-pill"><i className="fa-solid fa-mobile-screen-button mr-1.5"></i> Mobile</span>
            <span className="text-xs text-white/20 font-mono">/ apps for iOS & Android</span>
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
              <span className="text-xs font-mono text-white/20">React Native</span>
            </div>
            <h3 className="text-xl font-bold">FitTrack</h3>
            <p className="text-white/40 text-sm mt-1">Health &amp; fitness companion</p>
            <div className="flex flex-wrap gap-1.5 mt-4">
              <span className="text-[10px] font-mono bg-white/5 px-2.5 py-1 rounded-full border border-white/5">iOS</span>
              <span className="text-[10px] font-mono bg-white/5 px-2.5 py-1 rounded-full border border-white/5">Android</span>
              <span className="text-[10px] font-mono bg-white/5 px-2.5 py-1 rounded-full border border-white/5">Expo</span>
            </div>
            <a href="#" className="inline-block mt-5 text-sm text-white/40 hover:text-white transition"><i className="fa-regular fa-arrow-right"></i> Learn more</a>
          </div>

          <div className="glass card-lift rounded-2xl p-6 shimmer-border">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">💬</span>
              <span className="text-xs font-mono text-white/20">Flutter</span>
            </div>
            <h3 className="text-xl font-bold">TalkSpace</h3>
            <p className="text-white/40 text-sm mt-1">Real-time messaging &amp; voice</p>
            <div className="flex flex-wrap gap-1.5 mt-4">
              <span className="text-[10px] font-mono bg-white/5 px-2.5 py-1 rounded-full border border-white/5">iOS</span>
              <span className="text-[10px] font-mono bg-white/5 px-2.5 py-1 rounded-full border border-white/5">Android</span>
              <span className="text-[10px] font-mono bg-white/5 px-2.5 py-1 rounded-full border border-white/5">WebRTC</span>
            </div>
            <a href="#" className="inline-block mt-5 text-sm text-white/40 hover:text-white transition"><i className="fa-regular fa-arrow-right"></i> Learn more</a>
          </div>

          <div className="glass card-lift rounded-2xl p-6 shimmer-border sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🛍️</span>
              <span className="text-xs font-mono text-white/20">SwiftUI</span>
            </div>
            <h3 className="text-xl font-bold">ShopLocal</h3>
            <p className="text-white/40 text-sm mt-1">Marketplace for local vendors</p>
            <div className="flex flex-wrap gap-1.5 mt-4">
              <span className="text-[10px] font-mono bg-white/5 px-2.5 py-1 rounded-full border border-white/5">iOS</span>
              <span className="text-[10px] font-mono bg-white/5 px-2.5 py-1 rounded-full border border-white/5">SwiftUI</span>
              <span className="text-[10px] font-mono bg-white/5 px-2.5 py-1 rounded-full border border-white/5">Stripe</span>
            </div>
            <a href="#" className="inline-block mt-5 text-sm text-white/40 hover:text-white transition"><i className="fa-regular fa-arrow-right"></i> Learn more</a>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="relative px-6 md:px-10 py-20 md:py-28 max-w-7xl mx-auto">
        <div className="relative z-10 glass rounded-3xl p-8 md:p-14 border border-white/5 shadow-2xl shadow-purple-600/5">
          <div className="grid md:grid-cols-5 gap-10 items-center">
            <div className="md:col-span-3">
              <span className="tag-pill mb-3 inline-block"><i className="fa-regular fa-paper-plane mr-1.5"></i> Let's build</span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Ready to create something <span className="gradient-text">award‑winning</span>?
              </h2>
              <p className="mt-3 text-white/50 max-w-xl text-lg">
                Whether it's a website, mobile app, or a full IT infrastructure —
                let's talk about your next project.
              </p>
              <div className="flex flex-wrap gap-4 mt-6">
                <a href="mailto:hi@sohosuccess.dev" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition">
                  <i className="fa-regular fa-envelope"></i> hi@sohosuccess.dev
                </a>
                <a href="#" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition">
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

      <Footer />
    </main>
  );
}
