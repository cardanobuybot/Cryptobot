import { articleSlugExists } from "@/lib/articles";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createUniqueSlug(title: string): Promise<string> {
  const baseSlug = slugify(title) || `article-${Date.now()}`;

  let slug = baseSlug;
  let suffix = 2;

  while (await articleSlugExists(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}
