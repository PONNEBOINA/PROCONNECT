# Deployment Fix Guide

## Issue
Getting 400 Bad Request when trying to register users on the deployed application.

## Root Causes
1. Frontend `.env` was pointing to `localhost:5000` instead of the Render backend URL
2. Backend CORS wasn't allowing `.onrender.com` domains
3. Missing error logging for debugging validation issues

## Fixes Applied

### 1. Frontend Configuration
Updated `project-connect/.env`:
```
VITE_API_URL="https://project-connect-wk5r.onrender.com"
```

### 2. Backend CORS Configuration
Updated `project-connect/backend/server.js` to allow Render domains:
```javascript
if (origin.includes('.vercel.app') || 
    origin.includes('.netlify.app') || 
    origin.includes('.onrender.com') || 
    allowedOrigins.includes(origin)) {
  callback(null, true);
}
```

### 3. Enhanced Error Logging
Added detailed logging in `project-connect/backend/routes/auth.js` for validation errors.

## Deployment Steps

### Backend (Render)
1. Push the updated `server.js` and `auth.js` to your repository
2. Render will auto-deploy the changes
3. Wait for deployment to complete (~2-3 minutes)

### Frontend (Vercel/Netlify/etc.)
1. **IMPORTANT**: Set the environment variable in your hosting platform:
   - Variable name: `VITE_API_URL`
   - Value: `https://project-connect-wk5r.onrender.com`
   
2. Push the code changes or trigger a redeploy
3. The frontend will now correctly point to your Render backend

### Environment Variable Setup by Platform

#### Vercel
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add: `VITE_API_URL` = `https://project-connect-wk5r.onrender.com`
4. Redeploy

#### Netlify
1. Go to Site settings → Build & deploy → Environment
2. Add: `VITE_API_URL` = `https://project-connect-wk5r.onrender.com`
3. Trigger a new deploy

#### Render (if hosting frontend there too)
1. Go to your web service
2. Environment → Add Environment Variable
3. Add: `VITE_API_URL` = `https://project-connect-wk5r.onrender.com`
4. Save and redeploy

## Testing
After deployment:
1. Open your deployed frontend URL
2. Try to register a new user
3. Check browser console for any errors
4. Check Render logs for backend errors if issues persist

## Common Issues

### Still getting 400 errors?
- Check that the environment variable is set correctly in your hosting platform
- Verify the backend is running on Render (check logs)
- Make sure MongoDB connection is working
- Check that all required fields are being sent (name, email, password, section)

### CORS errors?
- Verify your frontend domain is allowed in the backend CORS config
- Check that credentials are being sent with requests

### Backend not responding?
- Render free tier has cold starts (~30 seconds)
- Check Render logs for errors
- Verify MongoDB connection string is correct
