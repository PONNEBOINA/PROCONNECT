import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import fetch from 'node-fetch';

const router = express.Router();

// GET /api/social-posts/test - Test API key
router.get('/test', async (req, res) => {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBCaktLqFRrMIK6kLtP2HvHQ8gjMtUUYVY';
    
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Say hello in one word'
            }]
          }]
        })
      }
    );

    const data = await response.json();
    
    res.json({
      status: response.status,
      ok: response.ok,
      data: data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/social-posts/generate - Generate social media posts
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { rawText, platforms } = req.body;

    if (!rawText || !platforms || platforms.length === 0) {
      return res.status(400).json({ 
        message: 'Missing required fields: rawText and platforms' 
      });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBCaktLqFRrMIK6kLtP2HvHQ8gjMtUUYVY';

    const prompt = `You are an expert social media content writer.
Your task is to generate UNIQUE posts for each platform requested by the user.

User Input:
${rawText}

Platforms selected: ${platforms.join(", ")}

Follow these STRICT platform rules:

1. LinkedIn:
   - Professional tone
   - 5–8 lines
   - Insightful + value-driven
   - 2–4 hashtags at end

2. Twitter:
   - Max 280 characters
   - Short, punchy, bold
   - 1–2 relevant hashtags
   - No long sentences

3. Instagram:
   - Casual, friendly, emoji-rich
   - Short 2–3 lines caption
   - Add 4–8 trending hashtags

4. Facebook:
   - Conversational & community-focused
   - Easy language
   - 2–3 emojis max

RETURN STRICT JSON ONLY.
NO markdown, NO code blocks, NO explanation.

JSON FORMAT:
[
  { "platform":"LinkedIn", "content":"..." },
  { "platform":"Twitter", "content":"..." }
]

Generate ONLY for the platforms selected by the user.`;

    console.log('Calling Gemini API for social posts...');
    
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      console.error('Request URL:', response.url);
      console.error('API Key (first 10 chars):', GEMINI_API_KEY.substring(0, 10));
      return res.status(response.status).json({ 
        message: 'Failed to generate posts from Gemini API',
        error: errorText,
        status: response.status
      });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      return res.status(500).json({ 
        message: 'No response from AI' 
      });
    }

    // Extract JSON from response
    let cleanText = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    try {
      const posts = JSON.parse(cleanText);
      res.json({ posts });
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw text:', text);
      res.status(500).json({ 
        message: 'Failed to parse AI response',
        rawText: text 
      });
    }

  } catch (error) {
    console.error('Social posts generation error:', error);
    res.status(500).json({ 
      message: 'Failed to generate posts',
      error: error.message 
    });
  }
});

export default router;
