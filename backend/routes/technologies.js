import express from 'express';
import Project from '../models/Project.js';
import { authenticateToken } from '../middleware/auth.js';
import fetch from 'node-fetch';

const router = express.Router();

// Technology metadata for auto-generation
const techMetadata = {
  'React': {
    summary: 'A JavaScript library for building user interfaces with component-based architecture',
    why: 'Fast, flexible, and has a massive ecosystem. Perfect for building modern, interactive web applications.',
    difficulty: 'Intermediate',
    related: ['Next.js', 'Redux', 'TypeScript', 'Tailwind CSS'],
    docsUrl: 'https://react.dev'
  },
  'Node.js': {
    summary: 'JavaScript runtime built on Chrome\'s V8 engine for building scalable server-side applications',
    why: 'Enables full-stack JavaScript development, has excellent performance, and a huge package ecosystem via npm.',
    difficulty: 'Intermediate',
    related: ['Express', 'MongoDB', 'TypeScript', 'Socket.io'],
    docsUrl: 'https://nodejs.org'
  },
  'MongoDB': {
    summary: 'A NoSQL document database that stores data in flexible, JSON-like documents',
    why: 'Flexible schema, scales horizontally, and works seamlessly with JavaScript/Node.js applications.',
    difficulty: 'Beginner',
    related: ['Mongoose', 'Node.js', 'Express', 'Redis'],
    docsUrl: 'https://www.mongodb.com/docs'
  },
  'Express': {
    summary: 'Fast, unopinionated web framework for Node.js applications',
    why: 'Minimal, flexible, and provides robust features for web and mobile applications.',
    difficulty: 'Beginner',
    related: ['Node.js', 'MongoDB', 'JWT', 'Passport'],
    docsUrl: 'https://expressjs.com'
  },
  'TypeScript': {
    summary: 'Typed superset of JavaScript that compiles to plain JavaScript',
    why: 'Adds static typing, better IDE support, and catches errors at compile time instead of runtime.',
    difficulty: 'Intermediate',
    related: ['React', 'Node.js', 'Angular', 'Next.js'],
    docsUrl: 'https://www.typescriptlang.org'
  },
  'Tailwind CSS': {
    summary: 'Utility-first CSS framework for rapidly building custom user interfaces',
    why: 'Fast development, consistent design, and no need to write custom CSS for most use cases.',
    difficulty: 'Beginner',
    related: ['React', 'Next.js', 'Vue', 'PostCSS'],
    docsUrl: 'https://tailwindcss.com'
  },
  'Docker': {
    summary: 'Platform for developing, shipping, and running applications in containers',
    why: 'Ensures consistency across environments, simplifies deployment, and improves scalability.',
    difficulty: 'Intermediate',
    related: ['Kubernetes', 'Docker Compose', 'CI/CD', 'Linux'],
    docsUrl: 'https://docs.docker.com'
  },
  'PostgreSQL': {
    summary: 'Powerful, open-source relational database system',
    why: 'ACID compliant, supports complex queries, and has excellent data integrity features.',
    difficulty: 'Intermediate',
    related: ['SQL', 'Node.js', 'Prisma', 'Redis'],
    docsUrl: 'https://www.postgresql.org/docs'
  },
  'Next.js': {
    summary: 'React framework with server-side rendering and static site generation',
    why: 'Built-in routing, API routes, excellent performance, and SEO-friendly out of the box.',
    difficulty: 'Intermediate',
    related: ['React', 'TypeScript', 'Vercel', 'Tailwind CSS'],
    docsUrl: 'https://nextjs.org/docs'
  },
  'Python': {
    summary: 'High-level programming language known for its simplicity and versatility',
    why: 'Easy to learn, extensive libraries, and used in web dev, data science, AI, and automation.',
    difficulty: 'Beginner',
    related: ['Django', 'Flask', 'FastAPI', 'NumPy'],
    docsUrl: 'https://docs.python.org'
  },
  'Vue': {
    summary: 'Progressive JavaScript framework for building user interfaces',
    why: 'Easy to learn, flexible, and has excellent documentation with a gentle learning curve.',
    difficulty: 'Beginner',
    related: ['Nuxt.js', 'Vuex', 'TypeScript', 'Tailwind CSS'],
    docsUrl: 'https://vuejs.org'
  },
  'Angular': {
    summary: 'TypeScript-based web application framework by Google',
    why: 'Complete solution with built-in tools, strong typing, and great for enterprise applications.',
    difficulty: 'Advanced',
    related: ['TypeScript', 'RxJS', 'NgRx', 'Material UI'],
    docsUrl: 'https://angular.io/docs'
  },
  'Django': {
    summary: 'High-level Python web framework that encourages rapid development',
    why: 'Batteries included, secure by default, and excellent for building robust web applications quickly.',
    difficulty: 'Intermediate',
    related: ['Python', 'PostgreSQL', 'REST', 'Celery'],
    docsUrl: 'https://docs.djangoproject.com'
  },
  'Flask': {
    summary: 'Lightweight WSGI web application framework in Python',
    why: 'Minimal, flexible, and perfect for small to medium applications or microservices.',
    difficulty: 'Beginner',
    related: ['Python', 'SQLAlchemy', 'Jinja2', 'REST'],
    docsUrl: 'https://flask.palletsprojects.com'
  },
  'Redis': {
    summary: 'In-memory data structure store used as database, cache, and message broker',
    why: 'Extremely fast, supports various data structures, and perfect for caching and real-time applications.',
    difficulty: 'Intermediate',
    related: ['Node.js', 'Python', 'Docker', 'MongoDB'],
    docsUrl: 'https://redis.io/docs'
  },
  'GraphQL': {
    summary: 'Query language for APIs and runtime for executing those queries',
    why: 'Fetch exactly what you need, strongly typed, and reduces over-fetching of data.',
    difficulty: 'Intermediate',
    related: ['Apollo', 'React', 'Node.js', 'TypeScript'],
    docsUrl: 'https://graphql.org/learn'
  },
  'AWS': {
    summary: 'Amazon Web Services - comprehensive cloud computing platform',
    why: 'Scalable, reliable, and offers a wide range of services for any application need.',
    difficulty: 'Advanced',
    related: ['Docker', 'Kubernetes', 'Terraform', 'CI/CD'],
    docsUrl: 'https://docs.aws.amazon.com'
  },
  'Firebase': {
    summary: 'Google\'s platform for building mobile and web applications',
    why: 'Real-time database, authentication, hosting, and more - all in one platform.',
    difficulty: 'Beginner',
    related: ['React', 'Angular', 'Flutter', 'Node.js'],
    docsUrl: 'https://firebase.google.com/docs'
  },
  'Prisma': {
    summary: 'Next-generation ORM for Node.js and TypeScript',
    why: 'Type-safe database access, auto-generated queries, and excellent developer experience.',
    difficulty: 'Intermediate',
    related: ['TypeScript', 'PostgreSQL', 'Node.js', 'GraphQL'],
    docsUrl: 'https://www.prisma.io/docs'
  },
  'Socket.io': {
    summary: 'Library for real-time, bidirectional communication between clients and servers',
    why: 'Easy to use, works across platforms, and perfect for chat apps and real-time features.',
    difficulty: 'Intermediate',
    related: ['Node.js', 'Express', 'React', 'WebSocket'],
    docsUrl: 'https://socket.io/docs'
  }
};

// Get default metadata for unknown technologies
const getDefaultMetadata = (techName) => ({
  summary: `${techName} is a technology used in modern software development`,
  why: 'Developers choose this technology for its unique features and capabilities in building applications.',
  difficulty: 'Intermediate',
  related: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
  docsUrl: `https://www.google.com/search?q=${encodeURIComponent(techName)}+documentation`
});

// GET /api/technologies - Get all technologies with usage stats
router.get('/', authenticateToken, async (req, res) => {
  try {
    const projects = await Project.find({ visibility: 'public' });
    
    const techMap = new Map();
    
    projects.forEach(project => {
      if (project.techStack && Array.isArray(project.techStack)) {
        project.techStack.forEach(tech => {
          const normalizedTech = tech.trim();
          if (normalizedTech) {
            // Normalize to title case for consistency
            const titleCaseTech = normalizedTech.charAt(0).toUpperCase() + normalizedTech.slice(1).toLowerCase();
            // Special cases for common technologies
            const finalTech = titleCaseTech === 'Mongodb' ? 'MongoDB' : 
                             titleCaseTech === 'Nodejs' ? 'Node.js' :
                             titleCaseTech === 'Nextjs' ? 'Next.js' :
                             titleCaseTech === 'Postgresql' ? 'PostgreSQL' :
                             titleCaseTech === 'Graphql' ? 'GraphQL' :
                             titleCaseTech === 'Socketio' ? 'Socket.io' :
                             titleCaseTech === 'Tailwindcss' || titleCaseTech === 'Tailwind' ? 'Tailwind CSS' :
                             titleCaseTech;
            
            if (techMap.has(finalTech)) {
              techMap.set(finalTech, techMap.get(finalTech) + 1);
            } else {
              techMap.set(finalTech, 1);
            }
          }
        });
      }
    });
    
    const technologies = Array.from(techMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    
    res.json(technologies);
  } catch (error) {
    console.error('Error fetching technologies:', error);
    res.status(500).json({ message: 'Failed to fetch technologies' });
  }
});

// GET /api/technologies/trending - Get trending technologies (top 10)
router.get('/trending', authenticateToken, async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentProjects = await Project.find({ 
      visibility: 'public',
      createdAt: { $gte: oneWeekAgo }
    });
    
    const techMap = new Map();
    
    recentProjects.forEach(project => {
      if (project.techStack && Array.isArray(project.techStack)) {
        project.techStack.forEach(tech => {
          const normalizedTech = tech.trim();
          if (normalizedTech) {
            // Normalize to title case for consistency
            const titleCaseTech = normalizedTech.charAt(0).toUpperCase() + normalizedTech.slice(1).toLowerCase();
            // Special cases for common technologies
            const finalTech = titleCaseTech === 'Mongodb' ? 'MongoDB' : 
                             titleCaseTech === 'Nodejs' ? 'Node.js' :
                             titleCaseTech === 'Nextjs' ? 'Next.js' :
                             titleCaseTech === 'Postgresql' ? 'PostgreSQL' :
                             titleCaseTech === 'Graphql' ? 'GraphQL' :
                             titleCaseTech === 'Socketio' ? 'Socket.io' :
                             titleCaseTech === 'Tailwindcss' || titleCaseTech === 'Tailwind' ? 'Tailwind CSS' :
                             titleCaseTech;
            
            if (techMap.has(finalTech)) {
              techMap.set(finalTech, techMap.get(finalTech) + 1);
            } else {
              techMap.set(finalTech, 1);
            }
          }
        });
      }
    });
    
    const trending = Array.from(techMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    res.json(trending);
  } catch (error) {
    console.error('Error fetching trending technologies:', error);
    res.status(500).json({ message: 'Failed to fetch trending technologies' });
  }
});

// GET /api/technologies/:techName - Get technology details
router.get('/:techName', authenticateToken, async (req, res) => {
  try {
    const { techName } = req.params;
    const decodedTechName = decodeURIComponent(techName);
    
    // Get all projects using this technology
    const projects = await Project.find({ 
      visibility: 'public',
      techStack: { $regex: new RegExp(`^${decodedTechName}$`, 'i') }
    })
    .populate('owner', 'name email profilePicture')
    .sort({ createdAt: -1 });
    
    // Get usage stats for this month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const monthlyProjects = projects.filter(p => p.createdAt >= oneMonthAgo);
    
    // Get metadata (use predefined or generate default)
    const metadata = techMetadata[decodedTechName] || getDefaultMetadata(decodedTechName);
    
    res.json({
      name: decodedTechName,
      ...metadata,
      stats: {
        totalProjects: projects.length,
        monthlyProjects: monthlyProjects.length
      },
      projects: projects.map(p => ({
        id: p._id,
        title: p.title,
        description: p.description,
        imageUrl: p.imageUrl,
        owner: p.owner,
        likesCount: p.likesCount,
        commentsCount: p.commentsCount,
        createdAt: p.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching technology details:', error);
    res.status(500).json({ message: 'Failed to fetch technology details' });
  }
});

// AI Chatbot endpoint
router.post('/ask', authenticateToken, async (req, res) => {
  try {
    const { technology, question } = req.body;

    if (!question || !technology) {
      return res.status(400).json({ message: 'Technology and question are required' });
    }

    // Use Google Gemini API (free tier)
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBqXc8vZ9K3YxH5mN2pQ7rT4sU6vW8xY0z'; // Free demo key
    
    const prompt = `You are a helpful technology expert assistant. A student is learning about ${technology} and has asked: "${question}"

Please provide a clear, accurate, and helpful response. If the question is a greeting (like "hi", "hello"), respond warmly and ask how you can help them learn about ${technology}. 

Keep your response:
- Accurate and factual
- Easy to understand for students
- Concise (2-3 paragraphs max)
- Encouraging and supportive
- Focused on ${technology} when relevant

Response:`;

    console.log('Making AI request for:', technology, question);
    console.log('Using API key:', GEMINI_API_KEY ? 'Key present' : 'Key missing');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
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
    console.log('AI response received:', data.candidates?.[0]?.content?.parts?.[0]?.text?.substring(0, 100));
    
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                   `I'd be happy to help you learn about ${technology}! Could you please ask a specific question?`;

    res.json({ answer });
  } catch (error) {
    console.error('AI chatbot error:', error);
    
    // Fallback response
    const { technology, question } = req.body;
    const fallbackAnswer = `I'm here to help you learn about ${technology}! ${question.toLowerCase().includes('hi') || question.toLowerCase().includes('hello') 
      ? `Hello! I'm your ${technology} learning assistant. Feel free to ask me anything about ${technology} - what it is, how to learn it, what you can build with it, or any specific questions you have!`
      : `That's a great question about ${technology}! While I'm having trouble connecting to my knowledge base right now, I recommend checking the official ${technology} documentation or asking in the community forums. Is there anything specific about ${technology} you'd like to know?`}`;
    
    res.json({ answer: fallbackAnswer });
  }
});

export default router;
