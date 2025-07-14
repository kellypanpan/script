import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { z } from 'zod';

// Load env vars (.env)
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Zod schema replicated (keep in sync with frontend)
const ScriptInputSchema = z.object({
  genre: z.string().min(2).max(30),
  keywords: z.string().max(500).optional(),
  characters: z.array(z.string()).max(10),
  tone: z.enum(['casual', 'professional', 'humorous', 'dramatic']),
  extra: z.string().optional(),
  maxLength: z.enum(['short', 'default', 'extended']).default('default'),
  mode: z.enum(['dialog-only', 'voiceover', 'shooting-script']).optional()
});

const TOKEN_LIMIT: Record<'short' | 'default' | 'extended', number> = {
  short: 600,
  default: 1000,
  extended: 2000,
};

async function callClaude({ model, messages, max_tokens, temperature }: {
  model: string;
  messages: Array<{ role: string; content: string }>;
  max_tokens?: number;
  temperature?: number;
}) {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.CLAUDE_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is missing');

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, max_tokens, temperature }),
  });
  if (!res.ok) throw new Error(`Claude API error ${res.status}`);
  const data = await res.json();
  return data;
}

app.post('/api/generate-script', async (req, res) => {
  try {
    const parsed = ScriptInputSchema.parse(req.body);
    const safeMaxTokens = TOKEN_LIMIT[parsed.maxLength] ?? 1000;

    const systemPrompt = `You are the backend AI agent powering the script generation engine.`;
    const userPrompt = JSON.stringify(parsed, null, 2);

    const ai = await callClaude({
      model: 'anthropic/claude-sonnet-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: safeMaxTokens,
      temperature: 0.7,
    });

    const script = ai.choices?.[0]?.message?.content || ai.content || '';
    res.json({ success: true, script });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message || 'error' });
  }
});

// ------------------- Google Cloud TTS -------------------
app.post('/api/generate-audio', async (req, res) => {
  /* Expected body: { text: string, languageCode?: string, voiceName?: string, speakingRate?: number } */
  const { text, languageCode = 'en-US', voiceName = 'en-US-Wavenet-D', speakingRate = 1.0 } = req.body || {};

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ success: false, error: 'Text is required for TTS' });
  }

  const ttsKey = process.env.GOOGLE_TTS_API_KEY;
  if (!ttsKey) {
    return res.status(500).json({ success: false, error: 'GOOGLE_TTS_API_KEY missing' });
  }

  try {
    const gRes = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${ttsKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode, name: voiceName },
        audioConfig: { audioEncoding: 'MP3', speakingRate }
      })
    });

    if (!gRes.ok) {
      const errText = await gRes.text();
      throw new Error(`TTS API error ${gRes.status}: ${errText}`);
    }

    const result = await gRes.json();
    return res.json({ success: true, audioContent: result.audioContent }); // base64 MP3
  } catch (err: any) {
    console.error('TTS error:', err);
    return res.status(500).json({ success: false, error: err.message || 'TTS error' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log('API server running on port', PORT);
}); 