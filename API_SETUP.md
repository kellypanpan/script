# ScriptProShot API Setup Guide

## 🚀 Quick Start

### 1. Environment Setup

Copy the example environment file:
```bash
cp .env.example .env.local
```

Add your Claude API key:
```env
CLAUDE_API_KEY=your_actual_claude_api_key_here
```

### 2. API Endpoint

The script generation API is available at:
- **Local**: `POST http://localhost:3000/api/generate-script`
- **Production**: `POST https://your-domain.com/api/generate-script`

### 3. Request Format

```json
{
  "genre": "comedy",
  "keywords": "awkward date, AI dating app, coffee spill",
  "characters": ["Maya", "Ethan"],
  "tone": "humorous",
  "extra": "unexpected glitch at the end",
  "maxLength": "default",
  "mode": "shooting-script"
}
```

### 4. Response Format

**Success Response:**
```json
{
  "script": "INT. COFFEE SHOP – DAY\n\nMAYA approaches...",
  "success": true,
  "model": "claude-3-5-sonnet-20241022",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Response:**
```json
{
  "error": "Failed to generate script",
  "success": false,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 📋 API Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `genre` | string | ✅ | comedy, drama, thriller, horror, romance, action |
| `keywords` | string | ✅ | Story concept, setting, conflict, plot points |
| `characters` | string[] | ✅ | Array of character names |
| `tone` | string | ✅ | casual, professional, humorous, dramatic |
| `extra` | string | ❌ | Additional story elements or twists |
| `maxLength` | string | ❌ | "short" (300w), "default" (800w), "extended" (1500w) |
| `mode` | string | ❌ | "dialog-only", "shooting-script", "voiceover" |

## 🔧 Implementation Options

### Option 1: Direct Anthropic API
```env
CLAUDE_API_KEY=sk-ant-api03-...
```

### Option 2: AWS Bedrock
```env
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
CLAUDE_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v1:0
```

### Option 3: Google Vertex AI
```env
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_LOCATION=us-central1
```

## 🔄 Frontend Integration

The React component automatically calls the API and falls back to local generation:

```typescript
const handleGenerateScript = async () => {
  try {
    const response = await fetch('/api/generate-script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scriptInput)
    });
    
    const data = await response.json();
    if (data.success) {
      setGeneratedScript(data.script);
    }
  } catch (error) {
    // Fallback to local generation
  }
};
```

## 🧪 Testing

Test the API with curl:
```bash
curl -X POST http://localhost:3000/api/generate-script \
  -H "Content-Type: application/json" \
  -d '{
    "genre": "comedy",
    "keywords": "coffee shop disaster",
    "characters": ["Alex", "Jordan"],
    "tone": "humorous",
    "maxLength": "short",
    "mode": "shooting-script"
  }'
```

## 🔒 Security Notes

- Never commit `.env.local` to version control
- Use environment variables for all API keys
- Implement rate limiting in production
- Add authentication for production use
- Validate input parameters server-side

## 📚 Next Steps

1. Set up your Claude API key
2. Test the local endpoint
3. Deploy to your preferred platform
4. Configure monitoring and logging
5. Add authentication and rate limiting