import { notFound } from 'next/navigation';
import { getAllProjects, getProject } from '@/lib/content';

export async function generateStaticParams() {
  const projects = getAllProjects().filter(p => p.category === 'web');
  return projects.map(({ slug }) => ({ slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const project = await getProject('web', slug);
    return (
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold">{project.frontmatter.title}</h1>
        <p className="text-white/50 mt-2">{project.frontmatter.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.frontmatter.tech.map((tech: string) => (
            <span key={tech} className="text-xs bg-white/5 px-3 py-1 rounded-full border border-white/5">
              {tech}
            </span>
          ))}
        </div>
        <article className="prose prose-invert mt-8 max-w-none">
          {project.content}
        </article>
      </div>
    );
  } catch {
    notFound();
  }
}
