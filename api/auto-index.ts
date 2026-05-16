import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Auto index logic
  res.status(200).json({ message: 'Auto index endpoint' });
}