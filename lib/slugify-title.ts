/** Slug URL seguro a partir de un título visible. */
export function slugifyTitle(input: string): string {
  const base = input
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base.length > 0 ? base : "guia";
}
