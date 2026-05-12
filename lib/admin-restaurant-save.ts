import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeHondurasPhone } from "@/lib/formatters/phone";
import {
  isStructuredScheduleUsable,
  parseScheduleManualInput,
  type StructuredHourRow,
} from "@/lib/formatters/schedule";
import type { AdminRestaurantUpdateInput } from "@/lib/validations/admin-restaurant-update";

export function structuredRowsToScheduleLabel(rows: StructuredHourRow[]): string {
  return rows
    .map((r) => {
      const o = r.open.trim();
      const c = r.close.trim();
      if (/^cerrado$/i.test(o) && /^cerrado$/i.test(c)) return `${r.day}: Cerrado`;
      return `${r.day}: ${o} - ${c}`;
    })
    .join("\n");
}

function phoneForDb(raw: string | null | undefined): string | null {
  const t = (raw ?? "").trim();
  if (!t || /^por\s*confirmar$/i.test(t)) return null;
  return normalizeHondurasPhone(t) ?? t;
}

function resolveSchedule(p: AdminRestaurantUpdateInput): {
  scheduleLabel: string | null;
  scheduleStructured: Prisma.InputJsonValue;
} {
  const structured = p.structured;
  if (structured && isStructuredScheduleUsable(structured)) {
    const autoLabel = structuredRowsToScheduleLabel(structured);
    const label = (p.scheduleLabel?.trim() || autoLabel).trim();
    return {
      scheduleLabel: label.length ? label : autoLabel,
      scheduleStructured: structured as unknown as Prisma.InputJsonValue,
    };
  }
  const labelOnly = p.scheduleLabel?.trim() || null;
  if (!labelOnly) {
    return { scheduleLabel: null, scheduleStructured: Prisma.JsonNull as unknown as Prisma.InputJsonValue };
  }
  const parsed = parseScheduleManualInput(labelOnly);
  if (isStructuredScheduleUsable(parsed.structured)) {
    return {
      scheduleLabel: parsed.scheduleLabel,
      scheduleStructured: parsed.structured as unknown as Prisma.InputJsonValue,
    };
  }
  return { scheduleLabel: labelOnly, scheduleStructured: Prisma.JsonNull as unknown as Prisma.InputJsonValue };
}

export async function saveAdminRestaurantUpdate(
  p: AdminRestaurantUpdateInput,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const existing = await prisma.restaurant.findUnique({
    where: { slug: p.originalSlug },
    select: { id: true },
  });
  if (!existing) {
    return { ok: false, message: "No existe un restaurante con ese slug en la base de datos." };
  }

  if (p.slug !== p.originalSlug) {
    const clash = await prisma.restaurant.findUnique({ where: { slug: p.slug }, select: { id: true } });
    if (clash) {
      return { ok: false, message: `El slug «${p.slug}» ya está en uso. Elige otro.` };
    }
  }

  const { scheduleLabel, scheduleStructured } = resolveSchedule(p);

  const data: Prisma.RestaurantUpdateInput = {
    slug: p.slug,
    name: p.name,
    category: p.category,
    priceRange: p.priceRange,
    summary: p.summary?.trim() || null,
    status: p.status,
    verified: p.verified,
    source: p.source,
    address: p.address?.trim() || null,
    lat: p.lat ?? null,
    lng: p.lng ?? null,
    googleMapsUrl: p.googleMapsUrl,
    phone: phoneForDb(p.phone),
    whatsapp: phoneForDb(p.whatsapp) ?? phoneForDb(p.phone),
    instagramUrl: p.instagramUrl,
    menuUrl: p.menuUrl,
    scheduleLabel,
    scheduleStructured,
    offersDelivery: p.offersDelivery,
    acceptsReservations: p.acceptsReservations,
    featured: p.featured,
    ratingAverage: p.ratingAverage,
    reviewsCount: p.reviewsCount,
    heroUrl: p.heroUrl,
    gallery: p.gallery.length > 0 ? p.gallery : Prisma.JsonNull,
  };

  try {
    await prisma.$transaction(async (tx) => {
      if (p.slug !== p.originalSlug) {
        await tx.restaurantClaim.updateMany({
          where: { restaurantSlug: p.originalSlug },
          data: { restaurantSlug: p.slug },
        });
      }
      await tx.restaurant.update({
        where: { slug: p.originalSlug },
        data,
      });
    });
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, message: msg };
  }
}
