import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import fetch from 'node-fetch';

const router = express.Router();

// POST /api/social-media/generate - Generate social media post
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { projectTitle, projectDescription, projectUrl, techStack, platform } = req.body;

    if (!projectTitle || !projectDescription || !platform) {
      return res.status(400).json({ message: 'Project title, description, and platform are required' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ message: 'API key not configured' });
    }

    // Create platform-specific prompts
    const platformPrompts = {
      instagram: `Create an engaging Instagram post for a project called "${projectTitle}".

Project Description: ${projectDescription}
${techStack && techStack.length > 0 ? `Tech Stack: ${techStack.join(', ')}` : ''}
${projectUrl ? `Project Link: ${projectUrl}` : ''}

Requirements:
- Start with an attention-grabbing hook
- Use emojis appropriately (but not too many)
- Keep it concise and engaging
- Include relevant hashtags at the end (5-10 hashtags)
- Make it visually appealing with line breaks
- Highlight the key features or benefits
${projectUrl ? `- Include the project link: ${projectUrl}` : '- Add a placeholder for the link if needed'}
- End with a call-to-action

Generate the Instagram post:`,

      linkedin: `Create a professional LinkedIn post for a project called "${projectTitle}".

Project Description: ${projectDescription}
${techStack && techStack.length > 0 ? `Tech Stack: ${techStack.join(', ')}` : ''}
${projectUrl ? `Project Link: ${projectUrl}` : ''}

Requirements:
- Professional and informative tone
- Start with a compelling opening
- Explain the problem it solves
- Highlight technical achievements
${projectUrl ? `- Include the project link: ${projectUrl}` : '- Add a placeholder for the link if needed'}
- Include 3-5 relevant hashtags
- End with a call-to-action or question to engage the audience
- Use line breaks for readability

Generate the LinkedIn post:`,

      whatsapp: `Create a concise WhatsApp message for sharing a project called "${projectTitle}".

Project Description: ${projectDescription}
${techStack && techStack.length > 0 ? `Tech Stack: ${techStack.join(', ')}` : ''}
${projectUrl ? `Project Link: ${projectUrl}` : ''}

Requirements:
- Keep it brief and to the point
- Use emojis to make it friendly
- Include key highlights
${projectUrl ? `- Include the project link: ${projectUrl}` : '- Add a link placeholder [PROJECT_LINK]'}
- Make it easy to forward
- Conversational tone

Generate the WhatsApp message:`
    };

    const prompt = platformPrompts[platform];

    console.log('Generating social media post for:', platform);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    console.log('AI API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API request failed: ${response.status}`);
    }

    const data = await response.json();
    const post = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!post) {
      throw new Error('No post generated');
    }

    console.log('Post generated successfully');
    res.json({ post });

  } catch (error) {
    console.error('Social media generation error:', error);
    
    // Fallback response
    const { projectTitle, projectUrl, platform } = req.body;
    const linkText = projectUrl || '[PROJECT_LINK]';
    
    const fallbackPosts = {
      instagram: `🚀 Excited to share my latest project: ${projectTitle}! 

Built with passion and dedication, this project showcases my skills in modern web development. 

✨ Check it out: ${linkText}

Let me know what you think!

#WebDevelopment #Coding #ProjectShowcase #TechProject #Developer #Programming #BuildInPublic #TechCommunity`,

      linkedin: `I'm excited to share my latest project: ${projectTitle}

This project represents my journey in learning and applying modern development practices. It's been a great learning experience, and I'm proud of what I've built.

🔗 Check it out: ${linkText}

I'd love to hear your thoughts and feedback!

#WebDevelopment #SoftwareEngineering #ProjectShowcase #TechInnovation #ContinuousLearning`,

      whatsapp: `Hey! 👋

Just finished working on my new project: ${projectTitle}

Really excited about how it turned out! Would love for you to check it out:

${linkText}

Let me know what you think! 🚀`
    };
    
    res.json({ post: fallbackPosts[platform] || fallbackPosts.instagram });
  }
});

export default router;
