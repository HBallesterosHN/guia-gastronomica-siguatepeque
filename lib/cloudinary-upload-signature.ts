import "server-only";

import { v2 as cloudinary } from "cloudinary";

const CLOUDINARY_ROOT = "mevoyasigua/restaurants";

export type CloudinaryUploadSignature = {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
};

export function createRestaurantImageUploadSignature(
  slug: string,
): { ok: true; data: CloudinaryUploadSignature } | { ok: false; error: string; status: number } {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return { ok: false, error: "Cloudinary no está configurado en el servidor.", status: 503 };
  }

  const trimmed = slug.trim();
  if (!trimmed) {
    return { ok: false, error: "slug requerido", status: 400 };
  }

  const folder = `${CLOUDINARY_ROOT}/${trimmed}`;
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign: Record<string, string | number> = { timestamp, folder };

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

  return {
    ok: true,
    data: { signature, timestamp, apiKey, cloudName, folder },
  };
}
