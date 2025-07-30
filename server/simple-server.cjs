const express = require("express"); const cors = require("cors"); require("dotenv").config(); const app = express(); app.use(cors({ origin: ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"], credentials: true })); app.use(express.json({ limit: "2mb" })); app.get("/health", (req, res) => { res.json({ status: "ok", timestamp: new Date().toISOString() }); }); function generateLocalScript({ genre, keywords, characters, tone, maxLength }) { const location = genre === "comedy" ? "COFFEE SHOP" : genre === "drama" ? "APARTMENT" : "ROOM"; return `INT. ${location} - DAY

${characters?.[0] || "ALEX"} (${tone || "casual"})
  ${keywords ? `This is a ${genre} story about ${keywords}.` : `Welcome to our ${genre} adventure.`}

${characters?.[1] || "JORDAN"}
  ${tone === "humorous" ? "This is going to be fun!" : "I understand what you mean."}

FADE OUT.`; } app.post("/api/generate-script", async (req, res) => { try { const { genre, keywords, characters, tone, maxLength } = req.body; console.log("Script generation request:", { genre, keywords, characters, tone, maxLength }); const script = generateLocalScript({ genre, keywords, characters, tone, maxLength }); res.json({ success: true, script, model: "local-generation", timestamp: new Date().toISOString(), note: "Using local generation due to API issues" }); } catch (error) { console.error("Script generation error:", error); res.status(500).json({ success: false, error: error.message || "Failed to generate script", timestamp: new Date().toISOString() }); } }); const PORT = process.env.PORT || 4000; app.listen(PORT, () => { console.log(`AI API server running on port ${PORT}`); console.log(`Health check: http://localhost:${PORT}/health`); });
