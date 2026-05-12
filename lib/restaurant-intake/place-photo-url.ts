/** URL de medios Place Photos (New). @see https://developers.google.com/maps/documentation/places/web-service/place-photos */
export function buildPlacePhotoMediaUrl(
  photoResourceName: string,
  apiKey: string,
  maxH = 1600,
  maxW = 1600,
): string {
  const base = "https://places.googleapis.com/v1";
  const rel = photoResourceName.replace(/^\/+/, "");
  return `${base}/${rel}/media?maxHeightPx=${maxH}&maxWidthPx=${maxW}&key=${encodeURIComponent(apiKey)}`;
}
