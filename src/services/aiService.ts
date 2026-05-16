const AI_API_URL = '/api/ai';

interface AIResponse {
  result?: string;
  error?: string;
}

export async function getAIResponse(prompt: string): Promise<string> {
  try {
    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'AI request failed');
    }

    const data: AIResponse = await response.json();

    if (!data.result) {
      throw new Error('No result from AI');
    }

    return data.result;
  } catch (error) {
    console.error('AI service error:', error);
    throw error;
  }
}
