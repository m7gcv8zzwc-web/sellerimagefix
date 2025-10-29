export function GET() {
  const base = "https://sellerimagefix.vercel.app";
  return new Response(
`User-agent: *
Allow: /
Sitemap: ${base}/sitemap.xml
`,
    { headers: { "Content-Type": "text/plain" } }
  );
}
