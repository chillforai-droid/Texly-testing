import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Removed console.log statements for production
  // Handle AI request logic here
  res.status(200).json({ message: 'AI endpoint' });
}