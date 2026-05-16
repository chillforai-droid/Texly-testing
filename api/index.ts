import { VercelRequest, VercelResponse } from '@vercel/node';

export default function (req: VercelRequest, res: VercelResponse) {
  // API root – production logging removed
  res.status(200).json({ message: 'Texly API' });
}
