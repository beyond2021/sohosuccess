import Link from "next/link";
import { ProjectFrontmatter } from "@/lib/content";

interface WebSectionProps {
  projects: {
    slug: string;
    frontmatter: ProjectFrontmatter;
  }[];
}

export default function WebSection({ projects }: WebSectionProps) {
  return (
    <section
      id="web"
      className="relative px-6 md:px-10 py-20 md:py-28 max-w-7xl mx-auto"
    >
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-2">
          <span className="tag-pill">
            <i className="fa-solid fa-code mr-1.5"></i> Web
          </span>
          <span className="text-xs text-white/20 font-mono">
            / websites & landing pages
          </span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          Websites &amp; <span className="gradient-text">Landing Pages</span>
        </h2>
        <div className="section-line"></div>
        <p className="mt-4 text-white/50 max-w-2xl text-lg">
          High-conversion, award-winning designs built with Next.js 13,
          Tailwind, and modern motion — tailored to your brand.
        </p>
      </div>

      <div className="relative z-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        {projects.map(({ slug, frontmatter }) => (
          <Link
            key={slug}
            href={`/web/${slug}`}
            className="glass card-lift rounded-2xl p-6 shimmer-border hover:no-underline"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">✨</span>
              <span className="text-xs font-mono text-white/20">
                {frontmatter.year}
              </span>
            </div>
            <h3 className="text-xl font-bold">{frontmatter.title}</h3>
            <p className="text-white/40 text-sm mt-1">
              {frontmatter.description}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-4">
              {frontmatter.tech.slice(0, 3).map((tech: string) => (
                <span
                  key={tech}
                  className="text-[10px] font-mono bg-white/5 px-2.5 py-1 rounded-full border border-white/5"
                >
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
  );
}
