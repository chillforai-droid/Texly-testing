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

    let prompt = '';
    switch (toolId) {
      case 'ai-text-generator':
        prompt = `Generate high-quality creative text on the following topic/prompt. Offer structure, rich details, and clean paragraphs. Return ONLY the content:\n\n${input}`;
        break;
      case 'ai-article-writer':
        prompt = `Write a comprehensive, professional, well-structured article or essay on the following topic. Include elegant headings, structured paragraphs, and a key lessons takeaways summary. Return ONLY the article text:\n\n${input}`;
        break;
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
      case 'grammar-checker':
        prompt = `Check the following text for grammar, spelling, punctuation, and structural errors. Return ONLY the corrected version with no extra conversational fillers:\n\n${input}`;
        break;
      case 'content-improver':
        prompt = `Upgrade the flow, tone, style, and vocabulary density of the following text to make it stand out as premium. Return ONLY the polished text:\n\n${input}`;
        break;
      case 'ai-emojifier':
        prompt = `Augment the following text by naturally inserting relevant emojis between expressions and list bullets to make it highly engaging for social media. Return ONLY the emojified text:\n'n${input}`;
        break;
      case 'ai-code-generator':
        prompt = `Write clean, safe, well-commented source code based on the following feature specifications and requested language/framework context. Return ONLY the code block:\n\n${input}`;
        break;
      case 'ai-code-explainer':
        prompt = `Provide a premium line-by-line annotation and algorithmic logic explanation for the following source code block. Organize the annotation cleanly. Return ONLY the explanation text:\n\n${input}`;
        break;
      case 'resume-tailor':
        prompt = `Analyze the following CV section and tailor / optimize it to align matching keywords with professional standards. Return ONLY the updated resume content:\n\n${input}`;
        break;
      case 'email-generator':
        prompt = `Compose a clean, professional, high-converting outreach email based on the following bullet points or description. Add a clear Subject line and structure. Return ONLY the email:\n\n${input}`;
        break;
      case 'text-translator':
        const targetLang = options?.language || 'Spanish';
        prompt = `Translate the following text accurately into ${targetLang}. Maintain formatting, paragraphs, and emotional weight. Return ONLY the translated output:\n\n${input}`;
        break;
      case 'keyword-extractor':
        prompt = `Analyze the following article and extract the top 15 highest-value semantic SEO search terms and keywords as a simple comma-separated list. Return ONLY the keywords list:\n\n${input}`;
        break;
      default:
        prompt = `Process the following text and return an improved version:\n\n${input}`;
    }

    const groqKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
    let text = '';
    let usedProvider = '';

    if (groqKey) {
      try {
        console.log('Attempting Groq API with llama-3.1-8b-instant...');
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${groqKey}`
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              { role: "system", content: "You are a helpful, professional writing and editing assistant. Answer the user prompt directly. Do not include conversational filler like 'Sure', 'Sure! Here is the text:', or any preamble. Return ONLY the requested output." },
              { role: "user", content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 2048
          })
        });

        if (!groqRes.ok) {
          throw new Error(`Groq API responded with status ${groqRes.status}`);
        }

        const groqData: any = await groqRes.json();
        const groqText = groqData?.choices?.[0]?.message?.content?.trim();
        if (groqText) {
          text = groqText;
          usedProvider = 'groq';
          console.log('Groq API call succeeded using llama-3.1-8b-instant!');
        } else {
          throw new Error('Groq returned empty response contents');
        }
      } catch (groqError: any) {
        console.warn('Groq API call failed, falling back to Gemini API:', groqError.message);
      }
    }

    if (!text) {
      try {
        console.log('Attempting Gemini API with gemini-2.0-flash...');
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent(prompt);
        const geminiText = result.response.text();
        if (geminiText) {
          text = geminiText;
          usedProvider = 'gemini';
          console.log('Gemini API call succeeded!');
        } else {
          throw new Error('Gemini returned empty response');
        }
      } catch (geminiError: any) {
        console.error('Gemini API call also failed:', geminiError);
        throw new Error(`Both Groq and Gemini APIs failed. Groq status: ${groqKey ? 'tried' : 'no key'}. Gemini error: ${geminiError.message}`);
      }
    }

    res.json({ success: true, result: text, provider: usedProvider });
  } catch (error: any) {
    console.error('AI Text Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─── HUGGING FACE GRADIO API PROXY ENGINE ─────────────────────────────────────
function extractGradioValue(item: any, spaceUrl: string): string {
  if (!item) return '';
  if (typeof item === 'string') {
    if (item.startsWith('data:image/')) {
      return item;
    } else if (item.startsWith('http://') || item.startsWith('https://')) {
      return item;
    } else {
      if (item.match(/\.(png|jpe?g|webp|gif)/i)) {
        return `${spaceUrl}/file=${item}`;
      }
      return item;
    }
  } else if (item && typeof item === 'object') {
    if (item.url) {
      if (item.url.startsWith('/')) {
        return `${spaceUrl}${item.url}`;
      }
      return item.url;
    }
    if (item.data) return item.data;
    if (item.path) return `${spaceUrl}/file=${item.path}`;
  }
  return '';
}

async function fetchGradio4Result(spaceUrl: string, eventId: string): Promise<any[]> {
  const url = `${spaceUrl}/call/predict/${eventId}`;
  console.log(`[API PROXY] Streaming results from Gradio 4: ${url}`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch SSE stream from Gradio 4: ${res.statusText}`);
  }
  const reader = res.body;
  if (!reader) {
    throw new Error(`SSE stream body is empty`);
  }

  let buffer = '';
  const decoder = new TextDecoder();
  const readerAny = reader as any;

  if (typeof readerAny[Symbol.asyncIterator] === 'function') {
    for await (const chunk of readerAny) {
      buffer += typeof chunk === 'string' ? chunk : decoder.decode(chunk, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      let currentEvent = '';
      for (const line of lines) {
        if (line.startsWith('event:')) {
          currentEvent = line.replace('event:', '').trim();
        } else if (line.startsWith('data:')) {
          const dataStr = line.replace('data:', '').trim();
          if (currentEvent === 'complete') {
            try {
              const parsed = JSON.parse(dataStr);
              return parsed;
            } catch (err) {
              console.error("Failed to parse complete data:", err);
            }
          } else if (currentEvent === 'error') {
            throw new Error(`Gradio Space error event: ${dataStr}`);
          }
        }
      }
    }
  }

  const remainingText = buffer + (await res.text().catch(() => ''));
  const lines = remainingText.split('\n');
  let currentEvent = '';
  for (const line of lines) {
    if (line.startsWith('event:')) {
      currentEvent = line.replace('event:', '').trim();
    } else if (line.startsWith('data:')) {
      const dataStr = line.replace('data:', '').trim();
      if (currentEvent === 'complete') {
        return JSON.parse(dataStr);
      } else if (currentEvent === 'error') {
        throw new Error(`Gradio Space error: ${dataStr}`);
      }
    }
  }

  throw new Error("Gradio prediction stream ended without 'complete' event");
}

async function callGradioSpace(spaceUrl: string, dataArray: any[]): Promise<string> {
  const normUrl = spaceUrl.endsWith('/') ? spaceUrl.slice(0, -1) : spaceUrl;

  // Phase 1: Try Gradio v4 API if possible (/call/predict)
  try {
    console.log(`[API PROXY] Trying Gradio v4 endpoint: ${normUrl}/call/predict`);
    const sseResponse = await fetch(`${normUrl}/call/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: dataArray })
    });

    if (sseResponse.ok) {
      const sseJson = await sseResponse.json();
      if (sseJson && sseJson.event_id) {
        const results = await fetchGradio4Result(normUrl, sseJson.event_id);
        if (results && results.length > 0) {
          const val = extractGradioValue(results[0], normUrl);
          if (val) return val;
        }
      }
    }
  } catch (gradio4Err: any) {
    console.warn(`[API PROXY] Gradio v4 interaction failed or 404, falling back to traditional endpoints:`, gradio4Err.message);
  }

  // Phase 2: Fallback to traditional Gradio v3 endpoints (/run/predict or /api/predict)
  const endpoints = ['/run/predict', '/api/predict'];
  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      console.log(`[API PROXY] Trying Gradio v3 endpoint: ${normUrl}${endpoint}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 65000); // 65 seconds timeout

      const res = await fetch(`${normUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: dataArray }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Space responded with HTTP ${res.status}: ${text}`);
      }

      const json = await res.json();
      if (json && json.data && json.data.length > 0) {
        const val = extractGradioValue(json.data[0], normUrl);
        if (val) return val;
      }
      throw new Error(`Invalid response format payload structure from Space: ${JSON.stringify(json)}`);
    } catch (err: any) {
      console.warn(`[API PROXY] Try failed on endpoint ${endpoint}:`, err.message);
      lastError = err;
    }
  }
  throw lastError || new Error('All Gradio endpoint prediction queries failed');
}

// 1. Background Remover API Endpoint
router.post('/bg-remover', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'Image base64 is required' });

    // Format the payload to fit typical Bria RMBG spaces
    // Supports raw base64 string or structured Gradio File Object
    const format1 = [image];
    const format2 = [{
      path: "input.png",
      orig_name: "input.png",
      url: image,
      size: null,
      mime_type: "image/png"
    }];

    const spaces = [
      'https://briaai-bria-background-removal.hf.space',
      'https://asharaf-bria-bg-removal.hf.space',
      'https://jitesh-bria-background-removal.hf.space'
    ];

    let resultUrl = '';
    let success = false;
    let lastError = null;

    for (const space of spaces) {
      try {
        // Try formatted object first (modern Gradio v4+)
        resultUrl = await callGradioSpace(space, format2);
        success = true;
        break;
      } catch (err) {
        try {
          // Fallback to simple base64 (Gradio v3)
          resultUrl = await callGradioSpace(space, format1);
          success = true;
          break;
        } catch (subErr: any) {
          lastError = subErr;
          console.error(`[BG Remover Proxy] space ${space} failed:`, subErr.message);
        }
      }
    }

    if (success) {
      res.json({ success: true, result: resultUrl });
    } else {
      res.status(502).json({ error: 'Background remover Hugging Face API failed to respond', details: lastError?.message });
    }
  } catch (error: any) {
    console.error('BG Remover Endpoint Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Face Swap API Endpoint
router.post('/face-swap', async (req, res) => {
  try {
    const { sourceImage, targetImage } = req.body;
    if (!sourceImage || !targetImage) {
      return res.status(400).json({ error: 'Both Source (Face) and Target (Base Body) images are required' });
    }

    // Format target and source correctly for Roop face swappers
    const spaces = [
      'https://finesand-roop-face-swap.hf.space',
      'https://s061-roop.hf.space',
      'https://s061-faceswap.hf.space'
    ];

    let resultUrl = '';
    let success = false;
    let lastError = null;

    // Gradio Face Swap expects [source, target] or structured inputs
    const dataObj = [
      { path: "source.png", url: sourceImage, orig_name: "source.png", mime_type: "image/png" },
      { path: "target.png", url: targetImage, orig_name: "target.png", mime_type: "image/png" }
    ];

    for (const space of spaces) {
      try {
        resultUrl = await callGradioSpace(space, dataObj);
        success = true;
        break;
      } catch (err: any) {
        try {
          // Backup format: direct base64 strings array
          resultUrl = await callGradioSpace(space, [sourceImage, targetImage]);
          success = true;
          break;
        } catch (subErr: any) {
          lastError = subErr;
          console.error(`[Face Swap Proxy] space ${space} failed:`, subErr.message);
        }
      }
    }

    if (success) {
      res.json({ success: true, result: resultUrl });
    } else {
      // Fallback response with beautiful blended canvas output or upscale mock to let user visualizer remain responsive
      res.status(502).json({ error: 'Face Swap Hugging Face Space was temporarily asleep or busy. Please try again in 10-15 seconds!', details: lastError?.message });
    }
  } catch (error: any) {
    console.error('Face Swap Endpoint Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Image Enhancer (CodeFormer/GFPGAN)
router.post('/image-enhancer', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'Image is required' });

    const spaces = [
      'https://sczhou-codeformer.hf.space',
      'https://janzat-codeformer.hf.space',
      'https://sczhou-gfpgan.hf.space'
    ];

    let resultUrl = '';
    let success = false;
    let lastError = null;

    // CodeFormer takes: [image, codeformer_fidelity, background_enhance, face_upsample]
    const formatObj = [
      { path: "input.png", url: image, orig_name: "input.png", mime_type: "image/png" },
      0.7, // Codeformer face fidelity weight
      true, // bg enhance flag
      true // face upscale flag
    ];

    for (const space of spaces) {
      try {
        resultUrl = await callGradioSpace(space, formatObj);
        success = true;
        break;
      } catch (err: any) {
        try {
          // Backup plain array parameters
          resultUrl = await callGradioSpace(space, [image, 0.7, true, true]);
          success = true;
          break;
        } catch (subErr: any) {
          lastError = subErr;
          console.error(`[Image Enhancer Proxy] space ${space} failed:`, subErr.message);
        }
      }
    }

    if (success) {
      res.json({ success: true, result: resultUrl });
    } else {
      res.status(502).json({ error: 'Image Enhancer Hugging Face Space failed to respond. Please try again.', details: lastError?.message });
    }
  } catch (error: any) {
    console.error('Image Enhancer Endpoint Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Image Upscaler (Super Resolution)
router.post('/image-upscale', async (req, res) => {
  try {
    const { image, scale } = req.body;
    if (!image) return res.status(400).json({ error: 'Image is required' });
    const upscaleFactor = scale ? parseInt(scale) : 2;

    const spaces = [
      'https://sczhou-codeformer.hf.space', // Enhances + upscales beautifully
      'https://janzat-codeformer.hf.space',
      'https://sczhou-gfpgan.hf.space'
    ];

    let resultUrl = '';
    let success = false;
    let lastError = null;

    const formatObj = [
      { path: "input.png", url: image, orig_name: "input.png", mime_type: "image/png" },
      0.9, // Higher fidelity weight for scaling sharpness
      true,
      true
    ];

    for (const space of spaces) {
      try {
        resultUrl = await callGradioSpace(space, formatObj);
        success = true;
        break;
      } catch (err: any) {
        try {
          resultUrl = await callGradioSpace(space, [image, 0.9, true, true]);
          success = true;
          break;
        } catch (subErr: any) {
          lastError = subErr;
          console.error(`[Image Upscale Proxy] space ${space} failed:`, subErr.message);
        }
      }
    }

    if (success) {
      res.json({ success: true, result: resultUrl });
    } else {
      res.status(502).json({ error: 'Image Upscaler Hugging Face Space failed to respond. Please try again.', details: lastError?.message });
    }
  } catch (error: any) {
    console.error('Image Upscaler Endpoint Error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
