import { auth } from "@/auth";
import { userOwnsRestaurantSlug } from "@/lib/assert-ownership";
import { createRestaurantImageUploadSignature } from "@/lib/cloudinary-upload-signature";
import { isPlatformAdmin } from "@/lib/require-admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  const admin = await isPlatformAdmin();

  if (!admin) {
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  let body: { slug?: string };
  try {
    body = (await req.json()) as { slug?: string };
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  if (!slug) {
    return NextResponse.json({ error: "slug requerido" }, { status: 400 });
  }

  if (!admin) {
    const own = await userOwnsRestaurantSlug(session!.user!.id, slug);
    if (!own) {
      return NextResponse.json({ error: "Sin permiso para este restaurante" }, { status: 403 });
    }
  }

  const signed = createRestaurantImageUploadSignature(slug);
  if (!signed.ok) {
    return NextResponse.json({ error: signed.error }, { status: signed.status });
  }

  return NextResponse.json(signed.data);
}
