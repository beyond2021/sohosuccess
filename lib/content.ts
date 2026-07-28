import fs from "fs";
import path from "path";
import { compileMDX } from "next-mdx-remote/rsc";
import { z } from "zod";

const ProjectFrontmatterSchema = z.object({
  title: z.string(),
  category: z.enum(["web", "it", "mobile"]),
  year: z.string().or(z.number()),
  image: z.string().optional(),
  tech: z.array(z.string()).default([]),
  description: z.string(),
});

export type ProjectFrontmatter = z.infer<typeof ProjectFrontmatterSchema>;

export function getAllProjects() {
  console.log('✅ getAllProjects() is running');
  const projectsDir = path.join(process.cwd(), "content/projects");
  const categories = fs.readdirSync(projectsDir);
  const results = [];

  for (const category of categories) {
    const categoryPath = path.join(projectsDir, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;

    const files = fs
      .readdirSync(categoryPath)
      .filter((f) => f.endsWith(".mdx"));

    for (const file of files) {
      const slug = file.replace(/\.mdx$/, "");
      const filePath = path.join(categoryPath, file);
      const rawContent = fs.readFileSync(filePath, "utf-8");

      const frontmatterMatch = rawContent.match(/---\n([\s\S]*?)\n---/);
      if (!frontmatterMatch) continue;

      const frontmatterRaw = frontmatterMatch[1];
      const frontmatterObj = frontmatterRaw.split("\n").reduce(
        (acc, line) => {
          const [key, ...val] = line.split(":");
          if (!key) return acc;
          const trimmedKey = key.trim();
          let parsedVal: string | number | string[] = val.join(":").trim();
          if (parsedVal.startsWith("[") && parsedVal.endsWith("]")) {
            parsedVal = parsedVal
              .slice(1, -1)
              .split(",")
              .map((s) => s.trim().replace(/['"]/g, ""));
          } else if (parsedVal !== "" && !isNaN(Number(parsedVal))) {
            parsedVal = Number(parsedVal);
          }
          acc[trimmedKey] = parsedVal;
          return acc;
        },
        {} as Record<string, unknown>,
      );

      const parsed = ProjectFrontmatterSchema.safeParse({
        ...frontmatterObj,
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
    }
  }
  return results;
}

export async function getProject(category: string, slug: string) {
  const filePath = path.join(
    process.cwd(),
    `content/projects/${category}/${slug}.mdx`,
  );
  const rawContent = fs.readFileSync(filePath, "utf-8");

  const { content, frontmatter } = await compileMDX({
    source: rawContent,
    options: { parseFrontmatter: true },
  });

  const validated = ProjectFrontmatterSchema.parse({
    ...frontmatter,
    category,
  });
  return { content, frontmatter: validated };
}
