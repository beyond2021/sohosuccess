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

        {/* Live site link - only renders when the mdx has a url: field.
            rel="noopener noreferrer" is required on target="_blank". */}
        {project.frontmatter.url && (
          <a
            href={project.frontmatter.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-full font-semibold text-sm text-white
                       bg-gradient-to-br from-[#7c3aed] to-[#2563eb]
                       transition-all duration-300 hover:no-underline
                       hover:shadow-[0_12px_30px_-10px_rgba(124,58,237,0.6)] hover:scale-[1.03]"
          >
            Visit live site
            <i className="fa-solid fa-arrow-up-right-from-square text-xs"></i>
          </a>
        )}

        <article className="prose prose-invert mt-8 max-w-none">
          {project.content}
        </article>
      </div>
    );
  } catch {
    notFound();
  }
}