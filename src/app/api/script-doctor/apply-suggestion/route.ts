import { NextRequest, NextResponse } from 'next/server';

// OpenRouter API call function (reusing from existing routes)
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
      max_tokens: max_tokens || 1500,
      temperature: temperature || 0.3,
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

interface ScriptSuggestion {
  id: string;
  type: 'structure' | 'pacing' | 'dialogue' | 'transition';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export async function POST(req: NextRequest) {
  try {
    const { script, suggestion, context, userPlan } = await req.json();

    if (!script || script.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Script content is required',
        success: false 
      }, { status: 400 });
    }

    if (!suggestion) {
      return NextResponse.json({ 
        error: 'Suggestion data is required',
        success: false 
      }, { status: 400 });
    }

    // Check if user has permission to apply suggestions
    if (userPlan === 'free') {
      return NextResponse.json({ 
        error: 'Applying suggestions is a Pro feature. Please upgrade your plan.',
        success: false 
      }, { status: 403 });
    }

    const systemPrompt = `You're a professional screenwriter and script doctor helping to apply specific script improvements.

The user has provided a script and a specific suggestion for improvement. Your task is to:
1. Apply the suggested improvement to the script
2. Make the changes seamlessly while preserving the overall story and style
3. Focus specifically on the type of improvement requested: ${suggestion.type}
4. Keep the script format professional and industry-standard

Suggestion to apply:
- Title: ${suggestion.title}
- Type: ${suggestion.type}
- Description: ${suggestion.description}
- Severity: ${suggestion.severity}

Return your response as a JSON object with this exact structure:
{
  "improvedScript": "The complete improved script with the suggestion applied",
  "appliedChanges": "Brief summary of what changes were made",
  "confidence": "high|medium|low"
}

Make sure the improved script is complete, maintains the original story intent, and clearly implements the suggested improvement.`;

    const userPrompt = `Please apply the following suggestion to this script:

ORIGINAL SCRIPT:
${script}

SUGGESTION TO APPLY:
${suggestion.title}: ${suggestion.description}

${context ? `ADDITIONAL CONTEXT: ${context}` : ''}

Please improve the script by specifically addressing this ${suggestion.type} issue while maintaining the overall story and professional formatting.`;

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

    // Extract improved script from response
    const responseText = response.choices?.[0]?.message?.content || 'Failed to apply suggestion';
    
    try {
      // Try to parse as JSON
      const result = JSON.parse(responseText);
      
      if (!result.improvedScript) {
        throw new Error('No improved script provided in response');
      }
      
      return NextResponse.json({ 
        success: true,
        improvedScript: result.improvedScript,
        appliedChanges: result.appliedChanges || `Applied: ${suggestion.title}`,
        confidence: result.confidence || 'high',
        timestamp: new Date().toISOString()
      });
    } catch (parseError) {
      // If JSON parsing fails, treat the entire response as the improved script
      console.warn('Failed to parse JSON response, using text as improved script');
      
      // Clean up the response text to extract just the script content
      let improvedScript = responseText;
      
      // Remove any JSON-like formatting that might be present
      improvedScript = improvedScript.replace(/^```json\s*/, '').replace(/```$/, '');
      improvedScript = improvedScript.replace(/^```\s*/, '').replace(/```$/, '');
      
      // If the response looks like it has structure, try to extract the script
      if (improvedScript.includes('"improvedScript"')) {
        const scriptMatch = improvedScript.match(/"improvedScript":\s*"([^"]+)"/);
        if (scriptMatch) {
          improvedScript = scriptMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
        }
      }
      
      return NextResponse.json({
        success: true,
        improvedScript: improvedScript || script, // Fallback to original if parsing completely fails
        appliedChanges: `Applied: ${suggestion.title}`,
        confidence: 'medium',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Apply suggestion error:', error);
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to apply suggestion',
      success: false,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}