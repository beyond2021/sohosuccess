import { notFound } from "next/navigation";
import { getProject } from "@/lib/content";

export default async function ProjectPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  
  // Fetch the project (returns null if not found)
  const project = await getProject("web", slug);

  // If project is null, trigger the Next.js 404 page
  if (!project) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold">{project.frontmatter.title}</h1>
      <p className="text-white/50 mt-2">{project.frontmatter.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {/* ... the rest of your tags/tech mapping ... */}
      </div>
    </div>
  );
}