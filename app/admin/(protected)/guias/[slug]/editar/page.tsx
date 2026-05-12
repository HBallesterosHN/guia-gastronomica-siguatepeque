import { notFound } from "next/navigation";
import { getGuideBySlugForAdmin, listPublishedRestaurantsForPicker } from "@/lib/guides-data";
import type { GuideCopyRestaurantInput } from "@/lib/editorial/guide-copy";
import { AdminGuideEditForm } from "./admin-guide-edit-form";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function toCopyFields(r: {
  category: string;
  summary: string | null;
  ratingAverage: number;
  reviewsCount: number;
  scheduleLabel: string | null;
  address: string | null;
  menuUrl: string | null;
  instagramUrl: string | null;
}): Omit<GuideCopyRestaurantInput, "name" | "slug"> {
  return {
    category: r.category,
    summary: r.summary,
    ratingAverage: r.ratingAverage,
    reviewsCount: r.reviewsCount,
    scheduleLabel: r.scheduleLabel,
    address: r.address,
    menuUrl: r.menuUrl,
    instagramUrl: r.instagramUrl,
  };
}

export default async function AdminGuideEditPage({ params }: PageProps) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw).trim();
  const row = await getGuideBySlugForAdmin(slug);
  if (!row) notFound();

  const restaurantOptions = await listPublishedRestaurantsForPicker();

  const initial = {
    originalSlug: row.slug,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle?.trim() ?? "",
    intro: row.intro?.trim() ?? "",
    description: row.description?.trim() ?? "",
    status: row.status as "published" | "draft" | "hidden",
    featured: row.featured,
    coverImageUrl: row.coverImageUrl?.trim() ?? "",
    seoTitle: row.seoTitle?.trim() ?? "",
    seoDescription: row.seoDescription?.trim() ?? "",
    entries: row.guideRestaurants.map((gr) => ({
      restaurantId: gr.restaurantId,
      slug: gr.restaurant.slug,
      name: gr.restaurant.name,
      rank: gr.rank,
      label: gr.label?.trim() ?? "",
      note: gr.note?.trim() ?? "",
      ...toCopyFields(gr.restaurant),
    })),
    restaurantOptions: restaurantOptions.map((o) => ({
      id: o.id,
      slug: o.slug,
      name: o.name,
      ...toCopyFields(o),
    })),
  };

  return (
    <div className="space-y-4">
      <AdminGuideEditForm initial={initial} />
    </div>
  );
}
