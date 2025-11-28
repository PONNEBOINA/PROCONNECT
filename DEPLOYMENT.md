# ProConnect Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables

**Frontend (.env)**
```
VITE_API_URL=your_backend_url
```

**Backend (.env)**
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### 2. Build Commands

**Frontend**
```bash
cd project-connect
npm install
npm run build
```

**Backend**
```bash
cd project-connect/backend
npm install
```

### 3. Start Commands

**Frontend (Production)**
- Deploy the `dist` folder to your hosting service (Vercel, Netlify, etc.)

**Backend (Production)**
```bash
cd project-connect/backend
node server.js
```

## Deployment Options

### Option 1: Vercel (Frontend) + Railway/Render (Backend)

**Frontend (Vercel)**
1. Push code to GitHub
2. Import project in Vercel
3. Set root directory to `project-connect`
4. Add environment variable: `VITE_API_URL`
5. Deploy

**Backend (Railway/Render)**
1. Create new service
2. Set root directory to `project-connect/backend`
3. Add environment variables (MONGODB_URI, JWT_SECRET, PORT)
4. Deploy

### Option 2: Single Server (VPS)

**Using PM2**
```bash
# Install PM2
npm install -g pm2

# Start backend
cd project-connect/backend
pm2 start server.js --name proconnect-backend

# Build and serve frontend
cd ../
npm run build
pm2 serve dist 3000 --name proconnect-frontend
```

## Post-Deployment

1. Test all features:
   - User registration/login
   - Project upload
   - Notifications
   - Admin dashboard
   - Technology Explorer
   - Contest system

2. Monitor logs for errors

3. Set up database backups

## Important Notes

- Ensure MongoDB is accessible from your backend server
- Update CORS settings in `backend/server.js` with your frontend URL
- Use HTTPS in production
- Keep .env files secure and never commit them to git
