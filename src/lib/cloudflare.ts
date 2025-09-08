// lib/cloudflare.ts
export function getThumbnailUrl(customerCode: string, uid: string, time = 1, height = 360) {
  return `https://customer-${customerCode}.cloudflarestream.com/${uid}/thumbnails/thumbnail.jpg?time=${time}s&height=${height}`;
}

export function getIframeSrc(customerCode: string, uid: string, autoplay = false) {
  return `https://customer-${customerCode}.cloudflarestream.com/${uid}/iframe${autoplay ? "?autoplay=1" : ""}`;
}
