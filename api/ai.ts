import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function (req: VercelRequest, res: VercelResponse) {
  // AI endpoint – logging removed for production
  try {
    const { action, data } = req.body;
    // process AI request
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'AI processing failed' });
  }
}
