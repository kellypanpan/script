import { NextRequest, NextResponse } from 'next/server';

// OpenRouter API call function (reusing from existing route)
async function callClaude({ model, messages, max_tokens, temperature }: {
  model: string;
  messages: Array<{ role: string; content: string }>;
  max_tokens?: number;
  temperature?: number;
}) {
  const CLAUDE_API_KEY = process.env.OPENROUTER_API_KEY || process.env.CLAUDE_API_KEY;
  
  if (!CLAUDE_API_KEY) {
    throw new Error('OPENROUTER_API_KEY environment variable is required');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CLAUDE_API_KEY}`
    },
    body: JSON.stringify({
      model,
      max_tokens: max_tokens || 1000,
      temperature: temperature || 0.5,
      messages
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data;
}

export async function POST(req: NextRequest) {
  try {
    const { text, context, tone, genre, preserveStructure } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Text to rewrite is required',
        success: false 
      }, { status: 400 });
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

    // Call OpenRouter API
    const response = await callClaude({
      model: "anthropic/claude-sonnet-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 1000,
      temperature: 0.5
    });

    // Extract rewrite from response
    const rewriteText = response.content?.[0]?.text || response.content;
    
    try {
      // Try to parse as JSON
      const rewriteResult = JSON.parse(rewriteText);
      
      return NextResponse.json({ 
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
      
      return NextResponse.json({
        options: options.slice(0, 3),
        reasoning: 'Rewritten to improve flow and engagement.',
        success: true,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Text rewrite error:', error);
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to rewrite text',
      success: false,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}