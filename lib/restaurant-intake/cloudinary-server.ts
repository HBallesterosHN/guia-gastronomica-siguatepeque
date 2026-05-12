import { v2 as cloudinary } from "cloudinary";

const CLOUDINARY_FOLDER = "mevoyasigua/restaurants";

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_API_SECRET?.trim() &&
      process.env.CLOUDINARY_API_KEY?.trim() &&
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim(),
  );
}

export function configureCloudinary(): void {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary no está configurado. Define NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET.",
    );
  }
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
}

export function cloudinaryRestaurantFolder(slug: string): string {
  return `${CLOUDINARY_FOLDER}/${slug}`;
}

/** URLs ya subidas a nuestra carpeta en Cloudinary (evita re-subida en persist). */
export function isAlreadyOurCloudinaryUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return false;
    return /(^|\.)res\.cloudinary\.com$/i.test(u.hostname) && u.pathname.includes("/mevoyasigua/");
  } catch {
    return false;
  }
}

export async function uploadHttpsImageToRestaurantFolder(slug: string, sourceUrl: string): Promise<string> {
  const folder = cloudinaryRestaurantFolder(slug);
  configureCloudinary();
  const r = await cloudinary.uploader.upload(sourceUrl, {
    folder,
    resource_type: "image",
    overwrite: false,
  });
  return r.secure_url;
}
