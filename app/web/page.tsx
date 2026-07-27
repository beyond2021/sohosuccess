import { getAllProjects } from '@/lib/content';
import Link from 'next/link';

export default function WebProjects() {
  const projects = getAllProjects().filter(p => p.category === 'web');
  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold">Web Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {projects.map(({ slug, frontmatter }) => (
          <Link key={slug} href={`/web/${slug}`} className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-purple-500 transition">
            <h2 className="text-2xl font-semibold">{frontmatter.title}</h2>
            <p className="text-white/50 mt-2">{frontmatter.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {frontmatter.tech.map((tech: string) => (
                <span key={tech} className="text-xs bg-white/10 px-2 py-1 rounded-full">{tech}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}