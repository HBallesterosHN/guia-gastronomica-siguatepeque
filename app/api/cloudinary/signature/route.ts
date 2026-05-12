import { auth } from "@/auth";
import { userOwnsRestaurantSlug } from "@/lib/assert-ownership";
import { isPlatformAdmin } from "@/lib/require-admin";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

const CLOUDINARY_ROOT = "mevoyasigua/restaurants";

export async function POST(req: Request) {
  const session = await auth();
  const admin = await isPlatformAdmin();

  if (!admin) {
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: "Cloudinary no está configurado en el servidor." }, { status: 503 });
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

  const folder = `${CLOUDINARY_ROOT}/${slug}`;

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign: Record<string, string | number> = { timestamp, folder };

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

  return NextResponse.json({
    signature,
    timestamp,
    apiKey,
    cloudName,
    folder,
  });
}
