export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;
    const body = await request.json();
    
    const { genre, keywords, characters, tone, extra, maxLength, mode, platform } = body;

    // Validate required fields
    if (!genre || !characters || !tone) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: genre, characters, tone'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiKey = env.OPENROUTER_API_KEY || env.CLAUDE_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({
        success: false,
        error: 'API key not configured'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const TOKEN_LIMIT: Record<string, number> = {
      short: 600,
      default: 1000,
      extended: 2000,
    };

    const safeMaxTokens = TOKEN_LIMIT[maxLength || 'default'] || 1000;

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

    const userPrompt = `Generate a ${mode || 'shooting-script'} script with these parameters:

Genre: ${genre}
Platform: ${platform || 'general'} (optimize for this platform's requirements)
Keywords: ${keywords || 'general story'}
Characters: ${Array.isArray(characters) ? characters.join(', ') : characters}
Tone: ${tone}
Length: ${maxLength || 'default'}
Extra: ${extra || 'none'}

Please create an engaging, professional script that matches these requirements and is optimized for ${platform || 'general'} format.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: safeMaxTokens,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenRouter API Error ${response.status}:`, errorText);
      throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const script = data.choices?.[0]?.message?.content || data.content || '';

    return new Response(JSON.stringify({ 
      success: true, 
      script 
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (err: any) {
    console.error('Script generation error:', err);
    return new Response(JSON.stringify({ 
      success: false, 
      error: err.message || 'Script generation failed' 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }
}

// Handle OPTIONS requests for CORS
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}