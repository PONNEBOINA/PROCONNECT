import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import projectRoutes from './routes/projects.js';
import socialRoutes from './routes/social.js';
import certificateRoutes from './routes/certificates.js';
import insightsRoutes from './routes/insights.js';
import adminRoutes from './routes/admin.js';
import contestRoutes from './routes/contest.js';
import uploadRoutes from './routes/upload.js';
import technologiesRoutes from './routes/technologies.js';
import socialMediaRoutes from './routes/social-media.js';

dotenv.config();

const app = express();

// CORS configuration to allow credentials
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests, or local file access)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:8080',
      'http://localhost:8081',
      'http://localhost:3000',
      'https://proconnect-eta.vercel.app' // Add your production domain here
    ];
    
    // Allow all Vercel, Netlify, and Render domains
    if (origin.includes('.vercel.app') || 
        origin.includes('.netlify.app') || 
        origin.includes('.onrender.com') ||
        origin.includes('.github.io') ||
        allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600, // How long the results of a preflight request can be cached
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Set to true in production with HTTPS
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};

// Apply middleware
app.use(cors(corsOptions));
app.use(express.json());

// Session middleware must be after CORS but before routes
app.use((req, res, next) => {
  // Set cache control headers for all responses
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Serve static files for certificates
app.use('/uploads', express.static('uploads'));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    console.log('Database:', mongoose.connection.name);
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    console.error('Connection string (masked):', process.env.MONGODB_URI?.replace(/\/\/.*:.*@/, '//***:***@'));
  });

// Monitor MongoDB connection
mongoose.connection.on('error', (err) => {
  console.error('MongoDB runtime error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contest', contestRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/technologies', technologiesRoutes);
app.use('/api/social-media', socialMediaRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
