// 导入统一API客户端
interface APIClient {
  callOpenRouter(params: {
    apiKey: string;
    messages: Array<{ role: string; content: string }>;
    maxTokens?: number;
    temperature?: number;
    model?: string;
    timeout?: number;
  }): Promise<string>;
}

// 简化版API客户端实现（适用于Cloudflare Functions）
class SimpleAPIClient {
  static async callOpenRouter(params: {
    apiKey: string;
    messages: Array<{ role: string; content: string }>;
    maxTokens?: number;
    temperature?: number;
    model?: string;
    timeout?: number;
  }): Promise<string> {
    const {
      apiKey,
      messages,
      maxTokens = 1000,
      temperature = 0.7,
      model = 'anthropic/claude-3.5-sonnet',
      timeout = 45000
    } = params;

    if (!apiKey || !apiKey.startsWith('sk-or-v1-')) {
      throw new Error('Invalid or missing OpenRouter API key');
    }

    // 设置超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://readyscriptpro.com',
          'X-Title': 'ReadyScriptPro'
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: maxTokens,
          temperature,
          stream: false
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        let errorText: string;
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = 'Failed to read error response';
        }
        
        console.error(`OpenRouter API Error ${response.status}:`, errorText);
        
        let userMessage = 'API request failed';
        if (response.status === 401) {
          userMessage = 'API authentication failed. Please check API key configuration.';
        } else if (response.status === 429) {
          userMessage = 'API rate limit exceeded. Please try again later.';
        } else if (response.status === 500) {
          userMessage = 'OpenRouter API is temporarily unavailable. Please try again.';
        } else if (response.status === 402) {
          userMessage = 'Insufficient API credits. Please check your OpenRouter account balance.';
        }
        
        throw new Error(userMessage);
      }

      let data: any;
      try {
        const responseText = await response.text();
        console.log('Raw API response length:', responseText.length);
        
        data = JSON.parse(responseText);
        const content = data.choices?.[0]?.message?.content || data.content || data.text || '';
        
        if (!content || content.trim().length === 0) {
          console.error('Empty content from API:', data);
          throw new Error('API returned empty content');
        }
        
        console.log('Generated content length:', content.length);
        return content;
      } catch (jsonError) {
        console.error('JSON parse error:', jsonError);
        throw new Error('Failed to parse API response. Please try again.');
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

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

    // 使用统一的API客户端调用OpenRouter
    const script = await SimpleAPIClient.callOpenRouter({
      apiKey,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      maxTokens: safeMaxTokens,
      temperature: 0.7,
      timeout: 45000
    });

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
    
    // 提供更友好的错误信息
    let errorMessage = 'Script generation failed';
    let statusCode = 500;
    
    if (err.name === 'AbortError') {
      errorMessage = 'Request timed out. Please try again with shorter content.';
      statusCode = 408;
    } else if (err.message.includes('fetch')) {
      errorMessage = 'Network error. Please check your connection and try again.';
      statusCode = 503;
    } else if (err.message.includes('API')) {
      errorMessage = err.message;
      statusCode = 502;
    }
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    }), {
      status: statusCode,
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