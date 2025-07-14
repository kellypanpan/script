import { z } from 'zod';
import { SceneRewriteRequest } from '../types/user';

// Request validation schema
const RewriteSceneSchema = z.object({
  sceneText: z.string().min(5, 'Scene text too short'),
  context: z.string().max(1000, 'Context too long').optional(),
  tone: z.enum(['casual', 'professional', 'humorous', 'dramatic']),
  genre: z.string().min(2).max(50),
  preserveStructure: z.boolean().optional().default(true),
  rewriteType: z.enum(['improve', 'shorten', 'expand', 'change_tone']).optional().default('improve'),
});

interface RewriteSceneResponse {
  success: boolean;
  originalText?: string;
  rewrittenText?: string;
  suggestions?: string[];
  error?: string;
  tokensUsed?: number;
}

export async function POST(req: Request): Promise<Response> {
  try {
    // 1. Validate request body
    const body = await req.json();
    const parsed = RewriteSceneSchema.parse(body);
    
    // 2. Check rate limits and user permissions
    const userId = req.headers.get('x-user-id') || 'anonymous';
    const userPlan = req.headers.get('x-user-plan') || 'free';
    
    // All users can use scene rewrite, but with different limits
    const dailyLimit = getUserRewriteLimit(userPlan);
    const isWithinLimit = await checkRewriteLimit(userId, dailyLimit);
    
    if (!isWithinLimit) {
      return Response.json({
        success: false,
        error: 'Daily rewrite limit exceeded',
        message: `You've reached your daily limit of ${dailyLimit} scene rewrites`
      } as RewriteSceneResponse, { status: 429 });
    }

    // 3. Generate rewrite using Claude API
    const rewrittenText = await rewriteSceneWithClaude(parsed);
    
    // 4. Track usage
    await trackRewriteUsage(userId);
    
    return Response.json({
      success: true,
      originalText: parsed.sceneText,
      rewrittenText,
      suggestions: generateRewriteSuggestions(parsed.rewriteType),
      tokensUsed: estimateTokensUsed(parsed.sceneText, rewrittenText),
    } as RewriteSceneResponse);

  } catch (error) {
    console.error('Scene rewrite error:', error);
    
    if (error instanceof z.ZodError) {
      return Response.json({
        success: false,
        error: 'Invalid request data',
        message: error.errors.map(e => e.message).join(', ')
      } as RewriteSceneResponse, { status: 400 });
    }

    return Response.json({
      success: false,
      error: 'Rewrite failed',
      message: 'Unable to rewrite scene. Please try again.'
    } as RewriteSceneResponse, { status: 500 });
  }
}

async function rewriteSceneWithClaude(request: typeof RewriteSceneSchema._output): Promise<string> {
  const systemPrompt = `You are a professional screenplay writer specializing in ${request.genre} scripts. Your task is to rewrite the given scene while maintaining the core story beats and character intentions.

Guidelines:
- Preserve the original scene structure and character actions
- Match the ${request.tone} tone throughout
- Keep dialogue natural and character-appropriate
- Maintain proper screenplay formatting
- Focus on ${request.rewriteType === 'improve' ? 'improving clarity and impact' : 
    request.rewriteType === 'shorten' ? 'making it more concise' :
    request.rewriteType === 'expand' ? 'adding more detail and depth' :
    'adjusting the tone and style'}

Return only the rewritten scene text in proper screenplay format. Do not include explanations or notes.`;

  const userPrompt = `Scene to rewrite:
${request.sceneText}

${request.context ? `Additional context: ${request.context}` : ''}

Rewrite this scene to be more ${request.rewriteType === 'improve' ? 'impactful and engaging' :
    request.rewriteType === 'shorten' ? 'concise and punchy' :
    request.rewriteType === 'expand' ? 'detailed and immersive' :
    `${request.tone} in tone`}.`;

  try {
    // TODO: Replace with actual Claude API call
    const mockRewrite = generateMockRewrite(request.sceneText, request.rewriteType);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return mockRewrite;
    
    /*
    // Real Claude API implementation:
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });

    const data = await response.json();
    return data.content[0].text;
    */
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error('Failed to rewrite scene');
  }
}

function generateMockRewrite(originalText: string, rewriteType: string): string {
  // Simple mock rewrite logic for development
  const lines = originalText.split('\n').filter(line => line.trim());
  
  switch (rewriteType) {
    case 'shorten':
      return lines
        .map(line => line.length > 80 ? line.substring(0, 77) + '...' : line)
        .join('\n');
        
    case 'expand':
      return lines
        .map(line => {
          if (line.match(/^[A-Z][A-Z\s]+$/)) return line; // Character names
          if (line.match(/^\(.+\)$/)) return line; // Parentheticals
          return line + (line.endsWith('.') ? ' The tension builds.' : '');
        })
        .join('\n');
        
    case 'change_tone':
      return lines
        .map(line => line.replace(/\./g, '!').replace(/\?/g, '?!'))
        .join('\n');
        
    default: // improve
      return lines
        .map(line => {
          if (line.includes('said')) return line.replace('said', 'declared');
          if (line.includes('walked')) return line.replace('walked', 'strode');
          return line;
        })
        .join('\n');
  }
}

function generateRewriteSuggestions(rewriteType: string): string[] {
  const suggestions = {
    improve: [
      'Use stronger action verbs',
      'Add more specific details',
      'Enhance character emotions',
    ],
    shorten: [
      'Remove unnecessary descriptions',
      'Combine similar actions',
      'Use concise dialogue',
    ],
    expand: [
      'Add environmental details',
      'Include character thoughts',
      'Describe physical reactions',
    ],
    change_tone: [
      'Adjust dialogue rhythm',
      'Modify action descriptions',
      'Change emotional intensity',
    ],
  };
  
  return suggestions[rewriteType as keyof typeof suggestions] || suggestions.improve;
}

function getUserRewriteLimit(userPlan: string): number {
  switch (userPlan) {
    case 'pro': return 25;
    case 'studio': return 100;
    default: return 5; // free
  }
}

async function checkRewriteLimit(userId: string, limit: number): Promise<boolean> {
  // TODO: Implement proper rate limiting with Redis or database
  // For now, always allow (development mode)
  return true;
}

async function trackRewriteUsage(userId: string): Promise<void> {
  // TODO: Implement usage tracking
  console.log(`Scene rewrite used by user: ${userId}`);
}

function estimateTokensUsed(original: string, rewritten: string): number {
  // Rough token estimation (4 characters ≈ 1 token)
  return Math.ceil((original.length + rewritten.length) / 4);
}