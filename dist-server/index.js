"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const zod_1 = require("zod");
// Load env vars (.env)
dotenv_1.default.config();
const app = (0, express_1.default)();
// Configure CORS for production
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? [process.env.FRONTEND_URL, process.env.DOMAIN_URL].filter(Boolean)
        : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: '2mb' }));
// Serve static files with correct MIME types
app.use(express_1.default.static('dist', {
    setHeaders: (res, path) => {
        // Force correct MIME types for all JavaScript files
        if (path.endsWith('.js') || path.endsWith('.mjs')) {
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        }
        else if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css; charset=utf-8');
        }
        else if (path.endsWith('.json')) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
        }
        else if (path.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
        }
        else if (path.endsWith('.svg')) {
            res.setHeader('Content-Type', 'image/svg+xml');
        }
        else if (path.endsWith('.png')) {
            res.setHeader('Content-Type', 'image/png');
        }
        else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
            res.setHeader('Content-Type', 'image/jpeg');
        }
        else if (path.endsWith('.ico')) {
            res.setHeader('Content-Type', 'image/x-icon');
        }
        // Ensure no sniffing for JS files
        if (path.endsWith('.js') || path.endsWith('.mjs')) {
            res.setHeader('X-Content-Type-Options', 'nosniff');
        }
    }
}));
// Security headers
app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
});
// Zod schema replicated (keep in sync with frontend)
const ScriptInputSchema = zod_1.z.object({
    genre: zod_1.z.string().min(2).max(30),
    keywords: zod_1.z.string().max(500).optional(),
    characters: zod_1.z.array(zod_1.z.string()).max(10),
    tone: zod_1.z.enum(['casual', 'professional', 'humorous', 'dramatic']),
    extra: zod_1.z.string().optional(),
    maxLength: zod_1.z.enum(['short', 'default', 'extended']).default('default'),
    mode: zod_1.z.enum(['dialog-only', 'voiceover', 'shooting-script']).optional(),
    platform: zod_1.z.enum(['tiktok', 'reels', 'youtube', 'general']).default('general')
});
const TOKEN_LIMIT = {
    short: 600,
    default: 1000,
    extended: 2000,
};
async function callClaude({ model, messages, max_tokens, temperature }) {
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.CLAUDE_API_KEY;
    if (!apiKey)
        throw new Error('OPENROUTER_API_KEY is missing');
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model, messages, max_tokens, temperature }),
    });
    if (!res.ok) {
        const errorText = await res.text();
        console.error(`OpenRouter API Error ${res.status}:`, errorText);
        throw new Error(`OpenRouter API error ${res.status}: ${errorText}`);
    }
    const data = await res.json();
    return data;
}
app.post('/api/generate-script', async (req, res) => {
    try {
        const parsed = ScriptInputSchema.parse(req.body);
        const safeMaxTokens = TOKEN_LIMIT[parsed.maxLength] ?? 1000;
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
        const userPrompt = `Generate a ${parsed.mode || 'shooting-script'} script with these parameters:

Genre: ${parsed.genre}
Platform: ${parsed.platform} (optimize for this platform's requirements)
Keywords: ${parsed.keywords || 'general story'}
Characters: ${parsed.characters.join(', ') || 'Alex, Jordan'}
Tone: ${parsed.tone}
Length: ${parsed.maxLength}
Extra: ${parsed.extra || 'none'}

Please create an engaging, professional script that matches these requirements and is optimized for ${parsed.platform} format.`;
        const ai = await callClaude({
            model: 'anthropic/claude-3.5-sonnet',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            max_tokens: safeMaxTokens,
            temperature: 0.7,
        });
        const script = ai.choices?.[0]?.message?.content || ai.content || '';
        res.json({ success: true, script });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message || 'error' });
    }
});
// Scene rewrite endpoint
app.post('/api/rewrite-scene', async (req, res) => {
    try {
        const { sceneText, context, tone, genre, rewriteType = 'improve' } = req.body;
        if (!sceneText || typeof sceneText !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'sceneText is required'
            });
        }
        const systemPrompt = `You are a professional screenplay writer specializing in ${genre || 'general'} scripts. Your task is to rewrite the given scene while maintaining the core story beats and character intentions.

Guidelines:
- Preserve the original scene structure and character actions
- Match the ${tone || 'casual'} tone throughout
- Keep dialogue natural and character-appropriate
- Maintain proper screenplay formatting
- Focus on ${rewriteType === 'improve' ? 'improving clarity and impact' :
            rewriteType === 'shorten' ? 'making it more concise' :
                rewriteType === 'expand' ? 'adding more detail and depth' :
                    'adjusting the tone and style'}

Return only the rewritten scene text in proper screenplay format. Do not include explanations or notes.`;
        const userPrompt = `Scene to rewrite:
${sceneText}

${context ? `Additional context: ${context}` : ''}

Rewrite this scene to be more ${rewriteType === 'improve' ? 'impactful and engaging' :
            rewriteType === 'shorten' ? 'concise and punchy' :
                rewriteType === 'expand' ? 'detailed and immersive' :
                    `${tone} in tone`}.`;
        const ai = await callClaude({
            model: 'anthropic/claude-3.5-sonnet',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: 1000,
            temperature: 0.7
        });
        const rewrittenText = ai.choices?.[0]?.message?.content || ai.content || '';
        const suggestions = getSuggestions(rewriteType);
        res.json({
            success: true,
            originalText: sceneText,
            rewrittenText,
            suggestions,
            tokensUsed: Math.ceil((sceneText.length + rewrittenText.length) / 4)
        });
    }
    catch (err) {
        console.error('Scene rewrite error:', err);
        res.status(500).json({
            success: false,
            error: err.message || 'Scene rewrite failed'
        });
    }
});
function getSuggestions(rewriteType) {
    const suggestions = {
        improve: ['Enhanced dialogue clarity', 'Stronger action verbs', 'Better emotional depth'],
        shorten: ['Removed redundant descriptions', 'Condensed dialogue', 'Streamlined action'],
        expand: ['Added environmental details', 'Enhanced character emotions', 'Deeper scene context'],
        change_tone: ['Adjusted emotional intensity', 'Modified dialogue style', 'Updated scene atmosphere']
    };
    return suggestions[rewriteType] || suggestions.improve;
}
// ------------------- Google Cloud TTS -------------------
app.post('/api/generate-audio', async (req, res) => {
    /* Expected body: { text: string, languageCode?: string, voiceName?: string, speakingRate?: number } */
    const { text, languageCode = 'en-US', voiceName = 'en-US-Wavenet-D', speakingRate = 1.0 } = req.body || {};
    if (!text || typeof text !== 'string') {
        return res.status(400).json({ success: false, error: 'Text is required for TTS' });
    }
    const ttsKey = process.env.GOOGLE_TTS_API_KEY;
    if (!ttsKey) {
        return res.status(500).json({ success: false, error: 'GOOGLE_TTS_API_KEY missing' });
    }
    try {
        const gRes = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${ttsKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                input: { text },
                voice: { languageCode, name: voiceName },
                audioConfig: { audioEncoding: 'MP3', speakingRate }
            })
        });
        if (!gRes.ok) {
            const errText = await gRes.text();
            throw new Error(`TTS API error ${gRes.status}: ${errText}`);
        }
        const result = await gRes.json();
        return res.json({ success: true, audioContent: result.audioContent }); // base64 MP3
    }
    catch (err) {
        console.error('TTS error:', err);
        return res.status(500).json({ success: false, error: err.message || 'TTS error' });
    }
});
// Script Doctor analyze endpoint
app.post('/api/script-doctor/analyze', async (req, res) => {
    console.log('📝 Script Doctor analyze request received:', {
        hasScript: !!req.body?.script,
        scriptLength: req.body?.script?.length || 0,
        focus: req.body?.focus
    });
    try {
        const { script, focus } = req.body;
        if (!script || script.trim().length === 0) {
            console.log('❌ No script content provided');
            return res.status(400).json({
                error: 'Script content is required',
                success: false
            });
        }
        console.log('🚀 Starting AI analysis...');
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
        console.log('🔄 Calling Claude API...');
        const ai = await callClaude({
            model: 'anthropic/claude-3.5-sonnet',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: 1500,
            temperature: 0.3
        });
        console.log('✅ Claude API response received');
        const analysisText = ai.choices?.[0]?.message?.content || 'Failed to analyze script';
        console.log('📋 Raw AI response:', analysisText.substring(0, 500) + '...');
        try {
            // Try to extract JSON from markdown code blocks if present
            let jsonText = analysisText;
            const jsonMatch = analysisText.match(/```json\s*(\{[\s\S]*?\})\s*```/);
            if (jsonMatch) {
                jsonText = jsonMatch[1];
                console.log('📋 Extracted JSON from code block');
            }
            const analysis = JSON.parse(jsonText);
            console.log('✅ JSON parsed successfully, suggestions count:', analysis.suggestions?.length || 0);
            res.json({
                ...analysis,
                success: true,
                timestamp: new Date().toISOString()
            });
        }
        catch (parseError) {
            console.log('❌ JSON parsing failed:', parseError.message);
            console.log('📋 Attempting to create structured response from text...');
            // If JSON parsing fails, create a structured response with better content extraction
            const suggestions = [];
            // Try to extract suggestions from the text
            const lines = analysisText.split('\n').filter((line) => line.trim());
            let currentSuggestion = null;
            for (const line of lines) {
                if (line.includes('structure') || line.includes('dialogue') || line.includes('pacing') || line.includes('transition')) {
                    if (currentSuggestion) {
                        suggestions.push(currentSuggestion);
                    }
                    currentSuggestion = {
                        id: `suggestion-${suggestions.length + 1}`,
                        type: line.toLowerCase().includes('structure') ? 'structure' :
                            line.toLowerCase().includes('dialogue') ? 'dialogue' :
                                line.toLowerCase().includes('pacing') ? 'pacing' : 'transition',
                        title: line.substring(0, 50).replace(/[^\w\s]/g, '').trim(),
                        description: line,
                        severity: 'medium'
                    };
                }
                else if (currentSuggestion && line.trim().length > 10) {
                    currentSuggestion.description += ' ' + line;
                }
            }
            if (currentSuggestion) {
                suggestions.push(currentSuggestion);
            }
            // Fallback if no suggestions found
            if (suggestions.length === 0) {
                suggestions.push({
                    id: 'ai-suggestion-1',
                    type: 'structure',
                    title: 'AI Analysis Available',
                    description: analysisText.substring(0, 300) + '...',
                    severity: 'medium'
                });
            }
            res.json({
                suggestions,
                overallScore: 70,
                summary: 'AI analysis completed successfully.',
                success: true,
                timestamp: new Date().toISOString()
            });
        }
    }
    catch (err) {
        console.error('Script analysis error:', err);
        res.status(500).json({
            error: err.message || 'Failed to analyze script',
            success: false,
            timestamp: new Date().toISOString()
        });
    }
});
// Script Doctor rewrite endpoint  
app.post('/api/script-doctor/rewrite', async (req, res) => {
    try {
        const { text, context, tone, genre, preserveStructure } = req.body;
        if (!text || text.trim().length === 0) {
            return res.status(400).json({
                error: 'Text to rewrite is required',
                success: false
            });
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
        const ai = await callClaude({
            model: 'anthropic/claude-3.5-sonnet',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: 1000,
            temperature: 0.5
        });
        const rewriteText = ai.choices?.[0]?.message?.content || 'Failed to rewrite text';
        try {
            const rewriteResult = JSON.parse(rewriteText);
            res.json({
                ...rewriteResult,
                success: true,
                timestamp: new Date().toISOString()
            });
        }
        catch {
            // If JSON parsing fails, create a structured response
            const options = [
                rewriteText.split('\n')[0] || text,
                rewriteText.split('\n')[1] || text.replace(/\./g, ', adding depth to the moment.'),
                rewriteText.split('\n')[2] || text + ' The significance is clear.'
            ];
            res.json({
                options: options.slice(0, 3),
                reasoning: 'Rewritten to improve flow and engagement.',
                success: true,
                timestamp: new Date().toISOString()
            });
        }
    }
    catch (err) {
        console.error('Text rewrite error:', err);
        res.status(500).json({
            error: err.message || 'Failed to rewrite text',
            success: false,
            timestamp: new Date().toISOString()
        });
    }
});
// Apply suggestion to script endpoint
app.post('/api/script-doctor/apply-suggestion', async (req, res) => {
    console.log('🔧 Apply suggestion request received');
    try {
        const { script, suggestion, context } = req.body;
        if (!script || !suggestion) {
            console.log('❌ Missing script or suggestion');
            return res.status(400).json({
                error: 'Script content and suggestion are required',
                success: false
            });
        }
        console.log('🚀 Applying suggestion:', suggestion.title);
        const systemPrompt = `You are a professional screenplay editor. Apply the following improvement suggestion to the script while maintaining its overall structure and story flow.

Suggestion to apply:
- Type: ${suggestion.type}
- Title: ${suggestion.title}
- Description: ${suggestion.description}
- Severity: ${suggestion.severity}

Guidelines:
- Keep the original screenplay format (INT./EXT., character names, dialogue structure)
- Apply ONLY the specific improvement mentioned in the suggestion
- Maintain consistency with the existing tone and characters
- Don't add unnecessary elements beyond what the suggestion requests
- Return the complete improved script, not just the changed parts

Return only the improved script text in proper screenplay format.`;
        const userPrompt = `Original script:
${script}

${context ? `Additional context: ${context}` : ''}

Please apply the improvement suggestion described above and return the complete enhanced script.`;
        console.log('🔄 Calling Claude API to apply suggestion...');
        const ai = await callClaude({
            model: 'anthropic/claude-3.5-sonnet',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: 2000,
            temperature: 0.7
        });
        console.log('✅ Suggestion applied successfully');
        const improvedScript = ai.choices?.[0]?.message?.content || script;
        res.json({
            originalScript: script,
            improvedScript: improvedScript,
            appliedSuggestion: suggestion,
            success: true,
            timestamp: new Date().toISOString()
        });
    }
    catch (err) {
        console.error('Apply suggestion error:', err);
        res.status(500).json({
            error: err.message || 'Failed to apply suggestion',
            success: false,
            timestamp: new Date().toISOString()
        });
    }
});
// Health check endpoint
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Catch-all handler for SPA routing (must be last)
app.get('*', (_req, res) => {
    res.sendFile(path_1.default.join(process.cwd(), 'dist', 'index.html'));
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log('API server running on port', PORT);
});
