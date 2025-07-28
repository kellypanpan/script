// API functions for Script Doctor functionality

export interface ScriptAnalysisRequest {
  script: string;
  focus?: 'structure' | 'dialogue' | 'pacing' | 'all';
}

export interface ScriptSuggestion {
  id: string;
  type: 'structure' | 'pacing' | 'dialogue' | 'transition';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  lineStart?: number;
  lineEnd?: number;
}

export interface ScriptRewriteRequest {
  text: string;
  context: string;
  tone: 'professional' | 'casual' | 'dramatic' | 'humorous';
  genre: string;
  preserveStructure?: boolean;
}

export interface ScriptRewriteResponse {
  options: string[];
  reasoning?: string;
}

export interface ScriptAnalysisResponse {
  suggestions: ScriptSuggestion[];
  overallScore: number;
  summary: string;
}

// Analyze script using Claude API
export async function analyzeScript(request: ScriptAnalysisRequest): Promise<ScriptAnalysisResponse> {
  try {
    // Use Cloudflare Functions endpoint in production
    const endpoint = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? '/api/script-doctor/analyze' 
      : '/api/script-doctor/analyze';
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Analysis API error ${response.status}:`, errorText);
      
      // Try to parse error response
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || `Analysis failed: ${response.statusText}`);
      } catch (parseError) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }
    }

    const result = await response.json();
    
    // Check if API returned success
    if (!result.success && result.error) {
      throw new Error(result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Script analysis error:', error);
    throw error;
  }
}

// Rewrite text using Claude API
export async function rewriteText(request: ScriptRewriteRequest): Promise<ScriptRewriteResponse> {
  try {
    // Use Cloudflare Functions endpoint in production
    const endpoint = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? '/api/script-doctor/rewrite' 
      : '/api/script-doctor/rewrite';
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Rewrite failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Text rewrite error:', error);
    
    // Fallback to mock rewrite for development
    return getMockRewrite(request.text, request.tone);
  }
}

// Mock analysis for development/fallback
function getMockAnalysis(script: string): ScriptAnalysisResponse {
  const words = script.split(' ').length;
  const lines = script.split('\n').length;
  
  const suggestions: ScriptSuggestion[] = [];
  
  // Check for common script issues
  if (script.includes('He says') || script.includes('She says')) {
    suggestions.push({
      id: 'dialogue-1',
      type: 'dialogue',
      title: 'Avoid "He says/She says"',
      description: 'Consider using character names and more natural dialogue attribution.',
      severity: 'medium'
    });
  }
  
  if (!script.includes('INT.') && !script.includes('EXT.')) {
    suggestions.push({
      id: 'structure-1',
      type: 'structure',
      title: 'Add scene headings',
      description: 'Include proper scene headings (INT./EXT.) to establish location and time.',
      severity: 'high'
    });
  }
  
  if (words < 100) {
    suggestions.push({
      id: 'structure-2',
      type: 'structure',
      title: 'Expand the story',
      description: 'The script seems quite short. Consider adding more character development or conflict.',
      severity: 'low'
    });
  }
  
  if (lines < 10) {
    suggestions.push({
      id: 'pacing-1',
      type: 'pacing',
      title: 'Add more beats',
      description: 'Consider breaking up long paragraphs and adding more scene description.',
      severity: 'medium'
    });
  }
  
  if (!script.includes('.') || script.split('.').length < 3) {
    suggestions.push({
      id: 'dialogue-2',
      type: 'dialogue',
      title: 'Vary sentence structure',
      description: 'Mix short and long sentences to create better rhythm and pacing.',
      severity: 'low'
    });
  }
  
  const score = Math.max(40, 100 - (suggestions.length * 15));
  
  return {
    suggestions,
    overallScore: score,
    summary: `Script analysis complete. Found ${suggestions.length} areas for improvement. Overall score: ${score}/100.`
  };
}

// Mock rewrite for development/fallback
function getMockRewrite(text: string, tone: string): ScriptRewriteResponse {
  const options: string[] = [];
  
  switch (tone) {
    case 'professional':
      options.push(text.replace(/\b(says|said)\b/g, 'states'));
      options.push(text.replace(/\buh\b/g, '').replace(/\blike\b/g, 'such as'));
      options.push(text + ' This reflects their professional demeanor.');
      break;
      
    case 'dramatic':
      options.push(text.replace(/\./g, '...'));
      options.push(text.replace(/\b(says|said)\b/g, 'declares intensely'));
      options.push(text + ' The weight of these words hangs heavy in the air.');
      break;
      
    case 'humorous':
      options.push(text.replace(/\./g, ', or so they thought.'));
      options.push(text + ' What could possibly go wrong?');
      options.push(text.replace(/\b(says|said)\b/g, 'blurts out'));
      break;
      
    case 'casual':
    default:
      options.push(text.replace(/\b(states|declares)\b/g, 'says'));
      options.push(text + ' Pretty straightforward, really.');
      options.push(text.replace(/\bvery\b/g, 'really'));
      break;
  }
  
  return {
    options: options.slice(0, 3),
    reasoning: `Rewrote text with ${tone} tone, focusing on natural language flow.`
  };
}

// Generate TTS audio for script preview
export async function generateTTS(text: string, voice?: string): Promise<Blob> {
  try {
    const response = await fetch('/api/script-doctor/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, voice: voice || 'en-US-Wavenet-D' }),
    });

    if (!response.ok) {
      throw new Error(`TTS generation failed: ${response.statusText}`);
    }

    return await response.blob();
  } catch (error) {
    console.error('TTS generation error:', error);
    throw error;
  }
}