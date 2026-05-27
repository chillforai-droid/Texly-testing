# Texly AI Assistant v7 — Usage Guide

## Tool Pages में कैसे Use करें

### 1. Loading Jokes (जब tool processing हो)
```js
// Processing शुरू हो — funny loading jokes show होंगे
window.texlyStartLoading?.();

// Processing खत्म — jokes बंद
window.texlyStopLoading?.();
```

### 2. Success/Error Messages
```js
// Tool success हो
window.texlySuccess?.();

// Tool fail हो
window.texlyError?.();
```

### 3. AI से काम करवाना (text tools के लिए fallback)
```js
// जब tool fail हो या user चाहे AI से करवाना
try {
  const result = await window.texlyAIDoWork?.(
    'Summarize this text in 3 lines',  // task description
    userInputText                        // input text
  );
  // result use करो
} catch (e) {
  console.error('AI work failed', e);
}
```

### 4. Custom Messages (किसी भी tool से)
```js
import { emitAIMessage } from '../TexlyAI';

// Chat में message show करो + toast
emitAIMessage('🎉 Your image is ready! Download kar lo!');
```

### 5. useToolSuccess / useToolFailure Hooks (React components में)
```tsx
import { useToolSuccess, useToolFailure } from '../TexlyAI';

function MyTool() {
  const { celebrate } = useToolSuccess('my-tool-slug');
  const { reportFailure } = useToolFailure('my-tool-slug');

  const handleProcess = async () => {
    window.texlyStartLoading?.();
    try {
      await doWork();
      window.texlyStopLoading?.();
      celebrate(); // language-aware success message
    } catch {
      window.texlyStopLoading?.();
      reportFailure(); // language-aware error message
    }
  };
}
```

### 6. Language Detection
```tsx
import { detectLang } from '../TexlyAI';

const lang = detectLang(userInput); // 'hi' | 'en'
```

## ENV Variables Required
```env
VITE_GEMINI_API_KEY=AIzaSy_...   # Gemini Flash — free at aistudio.google.com
VITE_GROQ_API_KEY=gsk_...        # Groq — free at console.groq.com (already set)
```

## AI Flow
1. User message आता है → Language detect होती है (Hindi/English)
2. Fast JSON lookup — अगर KB में answer है → instantly reply
3. Gemini Flash call → context-aware, personality-driven reply in detected language
4. Groq fallback → अगर Gemini fail हो
5. Built-in fallback messages → अगर दोनों fail हों
