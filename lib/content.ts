import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import { z } from "zod";

const CONTENT_DIR = path.join(process.cwd(), "content/projects");
export const CATEGORIES = ["web", "it", "mobile"] as const;
export type Category = (typeof CATEGORIES)[number];

const ProjectFrontmatterSchema = z.object({
  title: z.string(),
  category: z.enum(CATEGORIES),
  year: z.union([z.string(), z.number()]),
  image: z.string().optional(),
  url: z.string().optional(),
  tech: z
    .array(z.string())
    .nullish()
    .transform((v) => v ?? []),
  description: z.string(),
});
export type ProjectFrontmatter = z.infer<typeof ProjectFrontmatterSchema>;

export type Project = {
  slug: string;
  category: Category;
  frontmatter: ProjectFrontmatter;
};

function yearValue(year: string | number): number {
  const n = Number(year);
  return Number.isFinite(n) ? n : 0;
}

export function getAllProjects(): Project[] {
  const results: Project[] = [];

  for (const category of CATEGORIES) {
    const categoryPath = path.join(CONTENT_DIR, category);
    if (!fs.existsSync(categoryPath)) continue;

    for (const file of fs.readdirSync(categoryPath)) {
      if (!file.endsWith(".mdx")) continue;
      const slug = file.replace(/\.mdx$/, "");
      const filePath = path.join(categoryPath, file);

      try {
        const { data } = matter(fs.readFileSync(filePath, "utf-8"));
        const parsed = ProjectFrontmatterSchema.safeParse({
          ...data,
          category,
        });
        if (!parsed.success) {
          console.warn(
            `Invalid frontmatter in ${filePath}:`,
            parsed.error.issues,
          );
          continue;
        }
        results.push({ slug, category, frontmatter: parsed.data });
      } catch (err) {
        console.warn(`Failed to read ${filePath}:`, err);
      }
    }
  }

  return results.sort(
    (a, b) => yearValue(b.frontmatter.year) - yearValue(a.frontmatter.year),
  );
}

export async function getProject(category: string, slug: string) {
  if (!CATEGORIES.includes(category as Category)) return null;
  if (!/^[a-z0-9-]+$/i.test(slug)) return null;

  const filePath = path.join(CONTENT_DIR, category, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const parsed = matter(fs.readFileSync(filePath, "utf-8"));

  const frontmatter = ProjectFrontmatterSchema.safeParse({
    ...parsed.data,
    category,
  });
  if (!frontmatter.success) {
    console.warn(
      `Invalid frontmatter in ${filePath}:`,
      frontmatter.error.issues,
    );
    return null;
  }

  const { content } = await compileMDX({
    source: parsed.content,
    options: { parseFrontmatter: false },
  });

  return { content, frontmatter: frontmatter.data };
}
