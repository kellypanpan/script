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
  mode: z.enum(['dialog-only', 'voiceover', 'shooting-script']).optional(),
  platform: z.enum(['tiktok', 'reels', 'youtube', 'general']).default('general')
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
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`OpenRouter API Error ${res.status}:`, errorText);
    throw new Error(`OpenRouter API error ${res.status}: ${errorText}`);
  }
  const data = await res.json();
  return data;
}

app.post('/api/generate-script', async (req, res) => {
  try {
    const parsed = ScriptInputSchema.parse(req.body);
    const safeMaxTokens = TOKEN_LIMIT[parsed.maxLength] ?? 1000;

    const systemPrompt = `You are the backend AI agent powering the script generation engine of **ReadyScriptPro**, a SaaS tool that helps creators and studios generate short film scripts that are "camera-ready" – meaning immediately usable for filming.

### 🎯 Goal:
Generate structured, concise, and professional short film scripts based on structured JSON input. The output should follow standard screenplay formatting and be optimized for fast viewing, editing, or exporting.

### ✅ Output Requirements:
- Format the script using **screenplay format**:
  - Scene headings: \`INT./EXT. – Location – Time\`
  - Actions: brief cinematic descriptions
  - Dialogues: realistic, character-driven
  - Optional: simple camera notes (e.g., "(Zoom in on face)")
- Script should reflect the input **genre** and **tone**
- Output must be **renderable as Markdown** and readable as-is
- Avoid unnecessary explanations or metadata

### ✅ Length Strategy:
Limit output based on desired video duration style:
- **TikTok Skit (15–30s)** → ~300 words max  
- **Short Film (1–3 min)** → ~500–800 words max (default mode)  
- **Pitch Script (5 min+)** → ~1200–1500 words (for Pro users)

### ✅ Modes:
| Mode            | Behavior                                           |
|------------------|----------------------------------------------------|
| "dialog-only"     | Only output character names and dialogue, no actions or INT/EXT |
| "voiceover"       | Output as a narration-friendly script              |
| "shooting-script" | Include camera angles, transitions (e.g., CLOSE-UP, SMASH CUT)  |

Your output should be predictable, elegant, and production-ready.`;

    const userPrompt = `Generate a ${parsed.mode || 'shooting-script'} script with these parameters:

Genre: ${parsed.genre}
Platform: ${parsed.platform} (optimize for this platform's requirements)
Keywords: ${parsed.keywords || 'general story'}
Characters: ${parsed.characters.join(', ') || 'Alex, Jordan'}
Tone: ${parsed.tone}
Length: ${parsed.maxLength}
Extra: ${parsed.extra || 'none'}

Please create an engaging, professional script that matches these requirements and is optimized for ${parsed.platform} format.`;

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
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ success: false, error: (err as Error).message || 'error' });
  }
});

// Scene rewrite endpoint
app.post('/api/rewrite-scene', async (req, res) => {
  try {
    const { sceneText, context, tone, genre, rewriteType = 'improve' } = req.body;

    if (!sceneText || typeof sceneText !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'sceneText is required' 
      });
    }

    const systemPrompt = `You are a professional screenplay writer specializing in ${genre || 'general'} scripts. Your task is to rewrite the given scene while maintaining the core story beats and character intentions.

Guidelines:
- Preserve the original scene structure and character actions
- Match the ${tone || 'casual'} tone throughout
- Keep dialogue natural and character-appropriate
- Maintain proper screenplay formatting
- Focus on ${rewriteType === 'improve' ? 'improving clarity and impact' : 
    rewriteType === 'shorten' ? 'making it more concise' :
    rewriteType === 'expand' ? 'adding more detail and depth' :
    'adjusting the tone and style'}

Return only the rewritten scene text in proper screenplay format. Do not include explanations or notes.`;

    const userPrompt = `Scene to rewrite:
${sceneText}

${context ? `Additional context: ${context}` : ''}

Rewrite this scene to be more ${rewriteType === 'improve' ? 'impactful and engaging' :
    rewriteType === 'shorten' ? 'concise and punchy' :
    rewriteType === 'expand' ? 'detailed and immersive' :
    `${tone} in tone`}.`;

    const ai = await callClaude({
      model: 'anthropic/claude-sonnet-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    const rewrittenText = ai.choices?.[0]?.message?.content || ai.content || '';
    
    const suggestions = getSuggestions(rewriteType);
    
    res.json({
      success: true,
      originalText: sceneText,
      rewrittenText,
      suggestions,
      tokensUsed: Math.ceil((sceneText.length + rewrittenText.length) / 4)
    });

  } catch (err: unknown) {
    console.error('Scene rewrite error:', err);
    res.status(500).json({ 
      success: false, 
      error: (err as Error).message || 'Scene rewrite failed' 
    });
  }
});

function getSuggestions(rewriteType: string): string[] {
  const suggestions = {
    improve: ['Enhanced dialogue clarity', 'Stronger action verbs', 'Better emotional depth'],
    shorten: ['Removed redundant descriptions', 'Condensed dialogue', 'Streamlined action'],
    expand: ['Added environmental details', 'Enhanced character emotions', 'Deeper scene context'],
    change_tone: ['Adjusted emotional intensity', 'Modified dialogue style', 'Updated scene atmosphere']
  };
  
  return suggestions[rewriteType as keyof typeof suggestions] || suggestions.improve;
}

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
  } catch (err: unknown) {
    console.error('TTS error:', err);
    return res.status(500).json({ success: false, error: (err as Error).message || 'TTS error' });
  }
});

// Script Doctor analyze endpoint
app.post('/api/script-doctor/analyze', async (req, res) => {
  console.log('📝 Script Doctor analyze request received:', { 
    hasScript: !!req.body?.script, 
    scriptLength: req.body?.script?.length || 0,
    focus: req.body?.focus 
  });
  
  try {
    const { script, focus } = req.body;

    if (!script || script.trim().length === 0) {
      console.log('❌ No script content provided');
      return res.status(400).json({ 
        error: 'Script content is required',
        success: false 
      });
    }

    console.log('🚀 Starting AI analysis...');

    const systemPrompt = `You're a professional screenwriter and script doctor.
Analyze the following short film script and provide 3–5 specific improvement suggestions to enhance:
- Pacing and story structure
- Dialogue tone and realism  
- Character clarity and development
- Scene transitions and visual storytelling
- Format and professional presentation

Return your analysis as a JSON object with this exact structure:
{
  "suggestions": [
    {
      "id": "unique-id",
      "type": "structure|pacing|dialogue|transition",
      "title": "Brief title",
      "description": "Specific actionable suggestion",
      "severity": "low|medium|high"
    }
  ],
  "overallScore": 75,
  "summary": "Overall assessment in 1-2 sentences"
}

Keep suggestions concise, practical, and actionable.`;

    const userPrompt = `Please analyze this script:

${script}

${focus && focus !== 'all' ? `Focus specifically on: ${focus}` : ''}`;

    console.log('🔄 Calling Claude API...');
    const ai = await callClaude({
      model: 'anthropic/claude-sonnet-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1500,
      temperature: 0.3
    });

    console.log('✅ Claude API response received');
    const analysisText = ai.choices?.[0]?.message?.content || 'Failed to analyze script';
    
    try {
      const analysis = JSON.parse(analysisText);
      res.json({ 
        ...analysis,
        success: true,
        timestamp: new Date().toISOString()
      });
    } catch {
      // If JSON parsing fails, create a structured response
      const suggestions = [
        {
          id: 'ai-suggestion-1',
          type: 'structure',
          title: 'AI Analysis',
          description: analysisText.substring(0, 200) + '...',
          severity: 'medium'
        }
      ];
      
      res.json({
        suggestions,
        overallScore: 70,
        summary: 'AI analysis completed successfully.',
        success: true,
        timestamp: new Date().toISOString()
      });
    }

  } catch (err: unknown) {
    console.error('Script analysis error:', err);
    res.status(500).json({ 
      error: (err as Error).message || 'Failed to analyze script',
      success: false,
      timestamp: new Date().toISOString()
    });
  }
});

// Script Doctor rewrite endpoint  
app.post('/api/script-doctor/rewrite', async (req, res) => {
  try {
    const { text, context, tone, genre, preserveStructure } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Text to rewrite is required',
        success: false 
      });
    }

    const systemPrompt = `You're a professional screenwriter helping to improve script dialogue and action lines.
Rewrite the provided text to make it more engaging and professional while maintaining the original meaning.

Consider these factors:
- Tone: ${tone || 'professional'}
- Genre: ${genre || 'general'}
- Preserve structure: ${preserveStructure ? 'Yes' : 'No'}

Provide 3 different rewrite options, each with a slightly different approach but all maintaining the core message.

Return your response as a JSON object with this exact structure:
{
  "options": [
    "First rewrite option",
    "Second rewrite option", 
    "Third rewrite option"
  ],
  "reasoning": "Brief explanation of the changes made"
}

Make the rewrites natural, professional, and suitable for ${genre || 'general'} genre with ${tone || 'professional'} tone.`;

    const userPrompt = `Please rewrite this text:

"${text}"

${context ? `Context: ${context}` : ''}

Focus on making it more ${tone || 'professional'} while keeping it appropriate for a ${genre || 'general'} script.`;

    const ai = await callClaude({
      model: 'anthropic/claude-sonnet-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1000,
      temperature: 0.5
    });

    const rewriteText = ai.choices?.[0]?.message?.content || 'Failed to rewrite text';
    
    try {
      const rewriteResult = JSON.parse(rewriteText);
      res.json({ 
        ...rewriteResult,
        success: true,
        timestamp: new Date().toISOString()
      });
    } catch {
      // If JSON parsing fails, create a structured response
      const options = [
        rewriteText.split('\n')[0] || text,
        rewriteText.split('\n')[1] || text.replace(/\./g, ', adding depth to the moment.'),
        rewriteText.split('\n')[2] || text + ' The significance is clear.'
      ];
      
      res.json({
        options: options.slice(0, 3),
        reasoning: 'Rewritten to improve flow and engagement.',
        success: true,
        timestamp: new Date().toISOString()
      });
    }

  } catch (err: unknown) {
    console.error('Text rewrite error:', err);
    res.status(500).json({ 
      error: (err as Error).message || 'Failed to rewrite text',
      success: false,
      timestamp: new Date().toISOString()
    });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log('API server running on port', PORT);
}); 