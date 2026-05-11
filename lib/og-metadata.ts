/**
 * Rutas públicas de Next suelen llevar `?v=` para bust de caché.
 * Para Open Graph / Twitter, una URL estable suele rastrear mejor.
 */
export function ogPublicImagePath(webPath: string): string {
  const q = webPath.indexOf("?");
  return q === -1 ? webPath : webPath.slice(0, q);
}
