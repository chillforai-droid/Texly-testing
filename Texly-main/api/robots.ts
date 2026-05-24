export default function handler(req: any, res: any) {
  const baseUrl = process.env.BASE_URL || "https://www.texlyonline.in";
  res.setHeader("Content-Type", "text/plain");
  res.status(200).send(`User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml`.trim());
}
