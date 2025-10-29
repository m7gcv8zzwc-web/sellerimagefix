export function GET() {
  const base = "https://sellerimagefix.vercel.app";
  const urls = [
    "",
    "/etsy-photo-size-guide",
    "/facebook-marketplace-photo-guide",
  ];
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls.map(u => `<url><loc>${base}${u}</loc></url>`).join("") +
    `</urlset>`;
  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
