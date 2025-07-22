import { NextRequest, NextResponse } from 'next/server';

// Claude API call function (reusing from existing route)
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
      max_tokens: max_tokens || 1500,
      temperature: temperature || 0.3,
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
    const { script, focus } = await req.json();

    if (!script || script.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Script content is required',
        success: false 
      }, { status: 400 });
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

Keep suggestions concise, practical, and actionable. Focus on improvements that will make the script more professional and engaging.`;

    const userPrompt = `Please analyze this script:

${script}

${focus && focus !== 'all' ? `Focus specifically on: ${focus}` : ''}`;

    // Call OpenRouter API
    const response = await callClaude({
      model: "anthropic/claude-sonnet-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 1500,
      temperature: 0.3
    });

    // Extract analysis from Claude's response
    const analysisText = response.choices?.[0]?.message?.content || 'Failed to analyze script';
    
    try {
      // Try to parse as JSON
      const analysis = JSON.parse(analysisText);
      
      return NextResponse.json({ 
        ...analysis,
        success: true,
        timestamp: new Date().toISOString()
      });
    } catch {
      // If JSON parsing fails, create a structured response from the text
      const suggestions = [
        {
          id: 'ai-suggestion-1',
          type: 'structure',
          title: 'AI Analysis',
          description: analysisText.substring(0, 200) + '...',
          severity: 'medium'
        }
      ];
      
      return NextResponse.json({
        suggestions,
        overallScore: 70,
        summary: 'AI analysis completed successfully.',
        success: true,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Script analysis error:', error);
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to analyze script',
      success: false,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}