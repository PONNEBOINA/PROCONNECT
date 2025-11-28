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

dotenv.config();

const app = express();

// CORS configuration to allow credentials
const corsOptions = {
  origin: [
    'http://localhost:5173', 
    'http://localhost:8080', 
    'http://localhost:8081', 
    'http://localhost:3000',
    'https://myproconnect.netlify.app', // Add your Netlify URL here after deployment
    /\.netlify\.app$/ // Allow all Netlify preview URLs
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Serve static files for certificates
app.use('/uploads', express.static('uploads'));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
