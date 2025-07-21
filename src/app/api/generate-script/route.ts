import { NextRequest, NextResponse } from 'next/server';

// Claude API call function
async function callClaude({ model, messages, max_tokens, temperature }: {
  model: string;
  messages: Array<{ role: string; content: string }>;
  max_tokens?: number;
  temperature?: number;
}) {
  const CLAUDE_API_KEY = process.env.OPENROUTER_API_KEY || process.env.CLAUDE_API_KEY;
  
  if (!CLAUDE_API_KEY) {
    throw new Error('CLAUDE_API_KEY environment variable is required');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CLAUDE_API_KEY}`
    },
    body: JSON.stringify({
      model,
      max_tokens: max_tokens || 2000,
      temperature: temperature || 0.7,
      messages
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data;
}

export async function POST(req: NextRequest) {
  try {
    const { genre, keywords, characters, tone, extra, maxLength, mode } = await req.json();

    const systemPrompt = `You are the backend AI agent powering the script generation engine of **ScriptProShot**, a SaaS tool that helps creators and studios generate short film scripts that are "camera-ready" – meaning immediately usable for filming.

### 🎯 Goal:
Generate structured, concise, and professional short film scripts based on structured JSON input. The output should follow standard screenplay formatting and be optimized for fast viewing, editing, or exporting.

---

### ✅ Output Requirements:

- Format the script using **screenplay format**:
  - Scene headings: \`INT./EXT. – Location – Time\`
  - Actions: brief cinematic descriptions
  - Dialogues: realistic, character-driven
  - Optional: simple camera notes (e.g., "(Zoom in on face)")
- Script should reflect the input **genre** and **tone**
- Output must be **renderable as Markdown** and readable as-is
- Avoid unnecessary explanations or metadata

---

### ✅ Length Strategy:
Limit output based on desired video duration style:

- **TikTok Skit (15–30s)** → ~300 words max  
- **Short Film (1–3 min)** → ~500–800 words max (default mode)  
- **Pitch Script (5 min+)** → ~1200–1500 words (for Pro users)

Allow flexibility via input config:  
\`"maxLength": "short" | "default" | "extended"\`

---

### ✅ Modes (optional input key \`"mode"\`):

| Mode            | Behavior                                           |
|------------------|----------------------------------------------------|
| "dialog-only"     | Only output character names and dialogue, no actions or INT/EXT |
| "voiceover"       | Output as a narration-friendly script              |
| "shooting-script" | Include camera angles, transitions (e.g., CLOSE-UP, SMASH CUT)  |

---

### ✅ Example Output Format:
\`\`\`
TITLE: "First Date Glitch"

[INT. COFFEE SHOP – DAY]

MAYA (nervously checking her phone)  
  I swear he said 2PM...

ETHAN (suddenly appears behind her)  
  Or maybe... I hacked time.

(She drops her phone. Camera zooms on her face.)

[EXT. STREET – NIGHT]

They walk away, laughing. Her phone lights up behind them.
\`\`\`

### ✅ Additional Rules:
- Do NOT return explanations or JSON, only clean screenplay text.
- Output should be styled, concise, and usable as-is.
- Keep each character consistent with tone and personality.
- Use professional screenplay indentation and line spacing.

### ✅ Usage Context:
This API response will:
- Be rendered as a Markdown block in frontend
- Be optionally converted into PDF / FDX format
- Be reused in editable UI for collaboration

Your output should be predictable, elegant, and production-ready.`;

    const userPrompt = `{
  "genre": "${genre}",
  "keywords": "${keywords}",
  "characters": ${JSON.stringify(characters)},
  "tone": "${tone}",
  "extra": "${extra || ''}",
  "maxLength": "${maxLength}",
  "mode": "${mode}"
}`;

    // Call Claude API
    const response = await callClaude({
      model: "anthropic/claude-sonnet-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });

    // Extract script content from Claude's response
    const script = response.choices?.[0]?.message?.content || 'Failed to generate script';

    return NextResponse.json({ 
      script,
      success: true,
      model: "anthropic/claude-sonnet-4",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Script generation error:', error);
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to generate script',
      success: false,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}