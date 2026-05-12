import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Ruta antigua: unifica con el editor de información principal. */
export default async function LegacySolicitarRedirect({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/dashboard/restaurantes/${slug}`);
}
