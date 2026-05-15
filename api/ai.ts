import express from 'express';
import multer from 'multer';

const router = express.Router();
const upload = multer({ 
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  storage: multer.memoryStorage()
});

// Image Enhancer Route
router.post('/enhancer', upload.single('image'), async (req: any, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Image is required' });

    // Dynamic import to avoid module-level sharp loading
    const { enhanceImage } = await import('../src/services/aiService');
    const resultBuffer = await enhanceImage(req.file.buffer);

    res.set('Content-Type', 'image/jpeg');
    res.send(resultBuffer);
  } catch (error: any) {
    console.error("AI Enhancer Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Image Compressor Route
router.post('/compressor', upload.single('image'), async (req: any, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Image is required' });

    // Dynamic import to avoid module-level sharp loading
    const { compressImage } = await import('../src/services/aiService');
    const resultBuffer = await compressImage(req.file.buffer);

    res.set('Content-Type', 'image/jpeg');
    res.send(resultBuffer);
  } catch (error: any) {
    console.error("AI Compressor Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Background Remover - NOW HANDLED BY EXTERNAL API
// router.post('/bg-remover', ...) removed

// AI Text Processing Route (Humanizer, Paraphraser, etc.)
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
        prompt = `Rewrite the following text to make it sound completely human, natural, and undetectable by AI detectors. 
        Keep the original meaning and tone, but use varied sentence structures, occasional natural imperfections, and conversational flow.
        Return ONLY the rewritten text without any explanations or intro:
        
        ${input}`;
        break;
      case 'ai-paraphraser':
        prompt = `Rewrite the following text professionally to improve its flow, clarity, and impact. 
        Use a sophisticated yet accessible vocabulary. Maintain the original message but make it more compelling.
        Return ONLY the rewritten text without any explanations or intro:
        
        ${input}`;
        break;
      case 'ai-plagiarism-remover':
        prompt = `Completely rephrase the following text to ensure it's original and unique while preserving all core information. 
        Change the sentence structure, word choice, and organization entirely to avoid any plagiarism matches.
        Return ONLY the rewritten text without any explanations or intro:
        
        ${input}`;
        break;
      case 'ai-summarizer':
        prompt = `Summarize the following text into a concise and clear summary. Highlight the key points.
        Return ONLY the summary text without any explanations or intro:
        
        ${input}`;
        break;
      case 'ai-caption-generator':
        prompt = `Generate 5 engaging social media captions (Instagram/Facebook style) for the following topic or description. 
        Include relevant emojis and hashtags.
        Return ONLY the captions list without any explanations or intro:
        
        ${input}`;
        break;
      case 'ai-script-generator':
        prompt = `Generate a short YouTube video script (approx 2-3 minutes) based on the following topic or title. 
        Include a hook, intro, body points, and outro.
        Return ONLY the script without any explanations or intro:
        
        ${input}`;
        break;
      default:
        prompt = `Process the following text: ${input}`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ result: text.trim() });
  } catch (error: any) {
    console.error("AI Text Error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
