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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`AI API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`OpenRouter API Key: ${process.env.OPENROUTER_API_KEY ? 'Found' : 'Missing'}`);
});