import { notFound } from "next/navigation";
import { getAllProjects, getProject } from "@/lib/content";

export async function generateStaticParams() {
  return getAllProjects().map((p) => ({
    category: p.category,
    slug: p.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const project = await getProject(category, slug);
  if (!project) return {};

  const { title, description, image } = project.frontmatter;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const project = await getProject(category, slug);
  if (!project) notFound();

  return (
    <article>
      <h1>{project.frontmatter.title}</h1>
      <p>{project.frontmatter.description}</p>
      {project.content}
    </article>
  );
}
