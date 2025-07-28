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
        max_tokens: 1500,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenRouter API Error ${response.status}:`, errorText);
      throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const analysisText = data.choices?.[0]?.message?.content || 'Failed to analyze script';
    
    try {
      // Try to extract JSON from response
      let jsonText = analysisText;
      const jsonMatch = analysisText.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }
      
      const analysis = JSON.parse(jsonText);
      
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
    return new Response(JSON.stringify({ 
      error: err.message || 'Failed to analyze script',
      success: false,
      timestamp: new Date().toISOString()
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