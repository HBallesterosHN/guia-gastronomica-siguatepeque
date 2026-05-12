import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuidePublicContent } from "@/components/guides/guide-public-content";
import { buildGuidePageMetadata } from "@/lib/guide-public-metadata";
import { getGuideBySlug, getOtherPublishedGuideSummaries, getPublishedGuideSlugs } from "@/lib/guides-data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getPublishedGuideSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw).trim();
  const guide = await getGuideBySlug(slug);
  if (!guide) return { title: "Guía no encontrada" };
  return buildGuidePageMetadata(guide);
}

export default async function GuiaBySlugPage({ params }: PageProps) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw).trim();
  const guide = await getGuideBySlug(slug);
  if (!guide) notFound();

  const otherGuides = await getOtherPublishedGuideSummaries(slug);

  return <GuidePublicContent guide={guide} otherGuides={otherGuides} />;
}
