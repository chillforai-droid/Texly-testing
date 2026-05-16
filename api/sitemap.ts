import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const baseUrl = 'https://yourdomain.com';
  const urls = [
    { loc: '/', priority: '1.0' },
    { loc: '/ai-tools', priority: '0.9' },
    { loc: '/blog', priority: '0.8' },
    { loc: '/about', priority: '0.7' },
    { loc: '/contact', priority: '0.6' },
  ];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  for (const url of urls) {
    xml += `<url><loc>${baseUrl}${url.loc}</loc><priority>${url.priority}</priority></url>`;
  }
  xml += '</urlset>';

  res.setHeader('Content-Type', 'application/xml');
  res.send(xml);
}