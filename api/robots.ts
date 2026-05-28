export default function handler(req: any, res: any) {
  const baseUrl = process.env.BASE_URL || "https://www.texlyonline.in";
  res.setHeader("Content-Type", "text/plain");
  res.status(200).send(`User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n\n# AI/LLM Crawlers\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: Google-Extended\nAllow: /\n\n# llms.txt for AI discoverability\n# ${baseUrl}/llms.txt`.trim());
}
