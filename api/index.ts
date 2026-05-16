import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Removed console.log statements
  res.status(200).json({ message: 'API index' });
}