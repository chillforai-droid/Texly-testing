import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function (req: VercelRequest, res: VercelResponse) {
  // Auto index endpoint – logging removed for production
  try {
    const { index } = req.body;
    // process indexing
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Indexing failed' });
  }
}
