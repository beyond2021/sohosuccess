// sohosuccess/export-data.mjs
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const projectsDir = path.join(process.cwd(), "content/projects");
const categories = ["web", "it", "mobile"];
const results = [];

for (const category of categories) {
  const categoryPath = path.join(projectsDir, category);
  if (!fs.existsSync(categoryPath)) continue;

  const files = fs.readdirSync(categoryPath).filter((f) => f.endsWith(".mdx"));
  for (const file of files) {
    const slug = file.replace(/\.mdx$/, "");
    const filePath = path.join(categoryPath, file);
    const { data } = matter(fs.readFileSync(filePath, "utf-8"));

    results.push({
      id: slug,
      slug: slug,
      title: data.title,
      category: category,
      year: data.year || new Date().getFullYear().toString(),
      description: data.description || "",
      image_url: data.image || "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop", // Fallback image
      url: data.url || "",
      tech: data.tech || [],
      featured: results.length < 3, // Just marking the first 3 as featured for the home screen
    });
  }
}

fs.writeFileSync(path.join(process.cwd(), "projects.json"), JSON.stringify(results, null, 2));
console.log("✅ Exported", results.length, "projects to projects.json");