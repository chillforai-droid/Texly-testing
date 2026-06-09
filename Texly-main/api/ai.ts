import express from 'express';
import multer from 'multer';

const router = express.Router();
const upload = multer({ 
  limits: { fileSize: 5 * 1024 * 1024 },
  storage: multer.memoryStorage()
});

// Image Enhancer - returns original (sharp removed for Vercel compatibility)
router.post('/enhancer', upload.single('image'), async (req: any, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Image is required' });
    res.set('Content-Type', req.file.mimetype);
    res.send(req.file.buffer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Image Compressor - returns original (client-side compression preferred)
router.post('/compressor', upload.single('image'), async (req: any, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Image is required' });
    res.set('Content-Type', req.file.mimetype);
    res.send(req.file.buffer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// AI Text Processing Route
router.post('/text', async (req, res) => {
  try {
    const { input, toolId, options } = req.body;
    if (!input) return res.status(400).json({ error: 'Input text is required' });

    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    let prompt = '';
    switch (toolId) {
      case 'ai-humanizer':
        prompt = `Rewrite the following text to make it sound completely human, natural, and undetectable by AI detectors. Keep the original meaning and tone, but use varied sentence structures, occasional natural imperfections, and conversational flow. Return ONLY the rewritten text without any explanations or intro:\n\n${input}`;
        break;
      case 'ai-paraphraser':
        prompt = `Rewrite the following text professionally to improve its flow, clarity, and impact. Use a sophisticated yet accessible vocabulary. Maintain the original message but make it more compelling. Return ONLY the rewritten text without any explanations or intro:\n\n${input}`;
        break;
      case 'ai-plagiarism-remover':
        prompt = `Completely rephrase the following text to ensure it's original and unique while preserving all core information. Change the sentence structure, word choice, and organization entirely. Return ONLY the rewritten text:\n\n${input}`;
        break;
      case 'ai-summarizer':
        prompt = `Summarize the following text concisely, capturing the key points and main ideas. Return ONLY the summary:\n\n${input}`;
        break;
      case 'ai-expander':
        prompt = `Expand the following text with more detail, examples, and elaboration while maintaining the original meaning. Return ONLY the expanded text:\n\n${input}`;
        break;
      case 'ai-tone-changer':
        const tone = options?.tone || 'professional';
        prompt = `Rewrite the following text in a ${tone} tone. Return ONLY the rewritten text:\n\n${input}`;
        break;
      default:
        prompt = `Process the following text and return an improved version:\n\n${input}`;
    }

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    res.json({ success: true, result: text });
  } catch (error: any) {
    console.error('AI Text Error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
