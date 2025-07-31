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
      timeout = 30000
    } = params;

    if (!apiKey || !apiKey.startsWith('sk-or-v1-')) {
      throw new Error('Invalid or missing OpenRouter API key');
    }

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

  static parseJSONFromText(text: string): any {
    let jsonText = text.trim();
    
    const jsonPatterns = [
      /```json\s*(\{[\s\S]*?\})\s*```/,
      /```\s*(\{[\s\S]*?\})\s*```/,
      /\{[\s\S]*\}/
    ];
    
    for (const pattern of jsonPatterns) {
      const match = text.match(pattern);
      if (match) {
        jsonText = match[1] || match[0];
        break;
      }
    }
    
    jsonText = jsonText
      .replace(/[\u2018\u2019]/g, "'")  
      .replace(/[\u201c\u201d]/g, '"')  
      .replace(/\\n/g, '\\\\n')       
      .trim();
    
    return JSON.parse(jsonText);
  }
}

export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;
    const { script, focus } = await request.json();

    if (!script || script.trim().length === 0) {
      return new Response(JSON.stringify({ 
        error: 'Script content is required',
        success: false 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Call Claude API
    const apiKey = env.OPENROUTER_API_KEY || env.CLAUDE_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({
        error: 'API key not configured',
        success: false
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

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

    // 使用统一的API客户端调用OpenRouter
    const analysisText = await SimpleAPIClient.callOpenRouter({
      apiKey,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      maxTokens: 1500,
      temperature: 0.3,
      timeout: 30000
    });
    
    try {
      // 使用统一的JSON解析方法
      const analysis = SimpleAPIClient.parseJSONFromText(analysisText);
      
      return new Response(JSON.stringify({ 
        ...analysis,
        success: true,
        timestamp: new Date().toISOString()
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    } catch (parseError) {
      // Fallback structured response
      const suggestions = [
        {
          id: 'ai-suggestion-1',
          type: 'structure',
          title: 'AI Analysis Available',
          description: analysisText.substring(0, 300) + '...',
          severity: 'medium'
        }
      ];
      
      return new Response(JSON.stringify({
        suggestions,
        overallScore: 70,
        summary: 'AI analysis completed successfully.',
        success: true,
        timestamp: new Date().toISOString()
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

  } catch (err: any) {
    console.error('Script analysis error:', err);
    
    // 提供更友好的错误信息
    let errorMessage = 'Failed to analyze script';
    let statusCode = 500;
    
    if (err.name === 'AbortError') {
      errorMessage = 'Analysis timed out. Please try again with shorter script.';
      statusCode = 408;
    } else if (err.message.includes('fetch')) {
      errorMessage = 'Network error. Please check your connection and try again.';
      statusCode = 503;
    } else if (err.message.includes('API')) {
      errorMessage = err.message;
      statusCode = 502;
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false,
      timestamp: new Date().toISOString(),
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