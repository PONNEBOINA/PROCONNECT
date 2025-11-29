# Google Gemini API Setup for AI Chatbot

The chatbot now uses Google's Gemini AI to provide intelligent, context-aware responses to student questions.

## Get Your Free API Key

1. Go to https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

## Add to Render Environment Variables

1. Go to your Render dashboard
2. Select your backend service
3. Go to Environment tab
4. Add a new variable:
   - **Key:** `GEMINI_API_KEY`
   - **Value:** Your API key from step 3 above
5. Save and redeploy

## Features

The AI chatbot now:
- Responds intelligently to ANY question
- Understands greetings like "Hi", "Hello"
- Provides accurate, technology-specific answers
- Gives helpful, student-friendly explanations
- Works like a real AI assistant (similar to ChatGPT)

## Free Tier Limits

- 60 requests per minute
- Completely free to use
- No credit card required

## Fallback

If the API fails or rate limit is reached, the chatbot falls back to predefined answers to ensure students always get a response.
