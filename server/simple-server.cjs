const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true
}));

app.use(express.json({ limit: "2mb" }));

app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    hasApiKey: !!process.env.OPENROUTER_API_KEY
  });
});

// OpenRouter API call function
async function callOpenRouterAPI(messages, maxTokens = 1000) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not found in environment variables');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://readyscriptpro.com',
      'X-Title': 'ReadyScriptPro'
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-sonnet',
      messages: messages,
      max_tokens: maxTokens,
      temperature: 0.7,
      stream: false
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

app.post("/api/generate-script", async (req, res) => {
  try {
    const { genre, keywords, characters, tone, maxLength, platform } = req.body;
    
    console.log("Script generation request:", { genre, keywords, characters, tone, maxLength, platform });

    // Construct the prompt for OpenRouter
    const characterList = characters && characters.length > 0 ? characters.join(', ') : 'Alex, Jordan';
    const keywordText = keywords ? `Keywords/Theme: ${keywords}` : '';
    
    const prompt = `Generate a professional ${genre} script for ${platform || 'general'} platform.

Requirements:
- Genre: ${genre}
- Characters: ${characterList}
- Tone: ${tone}
- Length: ${maxLength} (short = 30-60 seconds, default = 1-3 minutes, extended = 3-5 minutes)
${keywordText}

Please create a complete script with:
- Proper screenplay formatting (INT./EXT. scene headings)
- Character names in ALL CAPS
- Natural dialogue
- Action lines
- Camera directions if appropriate for ${platform}

Make it engaging, professional, and ready for production.`;

    const messages = [
      {
        role: 'user',
        content: prompt
      }
    ];

    console.log('Calling OpenRouter API...');
    const script = await callOpenRouterAPI(messages, 1500);
    
    if (!script || script.trim().length === 0) {
      throw new Error('OpenRouter API returned empty script');
    }

    console.log('Script generated successfully, length:', script.length);

    res.json({
      success: true,
      script: script.trim(),
      model: "anthropic/claude-3.5-sonnet",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Script generation error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate script",
      timestamp: new Date().toISOString()
    });
  }
});

// Script Doctor - Analyze endpoint
app.post("/api/script-doctor/analyze", async (req, res) => {
  try {
    const { script, focus } = req.body;

    if (!script || script.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Script content is required',
        success: false 
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

Keep suggestions concise, practical, and actionable. Focus on improvements that will make the script more professional and engaging.`;

    const userPrompt = `Please analyze this script:

${script}

${focus && focus !== 'all' ? `Focus specifically on: ${focus}` : ''}`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];

    console.log('Analyzing script with OpenRouter API...');
    const analysisText = await callOpenRouterAPI(messages, 1500);
    
    try {
      // Try to parse as JSON
      const analysis = JSON.parse(analysisText);
      
      res.json({ 
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
      
      res.json({
        suggestions,
        overallScore: 70,
        summary: 'AI analysis completed successfully.',
        success: true,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Script analysis error:', error);
    
    res.status(500).json({ 
      error: error.message || 'Failed to analyze script',
      success: false,
      timestamp: new Date().toISOString()
    });
  }
});

// Script Doctor - Apply suggestion endpoint
app.post("/api/script-doctor/apply-suggestion", async (req, res) => {
  try {
    const { script, suggestion } = req.body;

    if (!script || !suggestion) {
      return res.status(400).json({ 
        error: 'Script and suggestion are required',
        success: false 
      });
    }

    const prompt = `Apply this improvement suggestion to the script:

Original Script:
${script}

Suggestion to Apply:
${suggestion.description}

Please return the improved script with the suggestion applied. Keep the same format and style, but implement the specific improvement mentioned.`;

    const messages = [
      {
        role: 'user',
        content: prompt
      }
    ];

    console.log('Applying suggestion with OpenRouter API...');
    const improvedScript = await callOpenRouterAPI(messages, 2000);
    
    res.json({
      success: true,
      script: improvedScript.trim(),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Apply suggestion error:', error);
    
    res.status(500).json({ 
      error: error.message || 'Failed to apply suggestion',
      success: false,
      timestamp: new Date().toISOString()
    });
  }
});

// Script Doctor - Rewrite endpoint
app.post("/api/script-doctor/rewrite", async (req, res) => {
  try {
    const { script, instructions } = req.body;

    if (!script) {
      return res.status(400).json({ 
        error: 'Script is required',
        success: false 
      });
    }

    const prompt = `Rewrite this script according to the following instructions:

Original Script:
${script}

Rewrite Instructions:
${instructions || 'Improve the overall quality, dialogue, and structure while maintaining the core story.'}

Please return a completely rewritten version that implements the requested changes while maintaining professional screenplay formatting.`;

    const messages = [
      {
        role: 'user',
        content: prompt
      }
    ];

    console.log('Rewriting script with OpenRouter API...');
    const rewrittenScript = await callOpenRouterAPI(messages, 2000);
    
    res.json({
      success: true,
      script: rewrittenScript.trim(),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Script rewrite error:', error);
    
    res.status(500).json({ 
      error: error.message || 'Failed to rewrite script',
      success: false,
      timestamp: new Date().toISOString()
    });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`AI API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`OpenRouter API Key: ${process.env.OPENROUTER_API_KEY ? 'Found' : 'Missing'}`);
});