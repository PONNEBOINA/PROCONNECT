# Render Environment Variables Setup

## Critical: Update These on Render

The 500 error is likely because your Render deployment doesn't have the correct environment variables set.

### Go to Render Dashboard

1. Navigate to: https://dashboard.render.com/
2. Select your backend service: `project-connect-wk5r`
3. Go to **Environment** tab
4. Add/Update these variables:

### Required Environment Variables

```
PORT=5000

MONGODB_URI=mongodb+srv://vamshi:vamshi123@cluster0.dfdzmr6.mongodb.net/proconnect?retryWrites=true&w=majority&appName=Cluster0

JWT_SECRET=proconnect_jwt_secret_key_2024_change_in_production

NODE_ENV=production
```

### Important Notes

1. **MONGODB_URI**: Make sure it includes `/proconnect` database name
2. **JWT_SECRET**: Use a strong secret in production (change the default)
3. After updating, click **Save Changes**
4. Render will automatically redeploy

### Check Logs After Deployment

1. Go to **Logs** tab in Render
2. Look for:
   - "MongoDB connected successfully"
   - "Server running on port 5000"
3. If you see errors, check:
   - MongoDB connection string is correct
   - Database name is included
   - Credentials are valid

### Test the Connection

After deployment, you can test:

```bash
curl https://project-connect-wk5r.onrender.com/api/health
```

Should return: `{"status":"ok","message":"Server is running"}`

### Common Issues

**500 Error on Login:**
- MongoDB not connected → Check MONGODB_URI
- JWT_SECRET missing → Add it to environment variables
- Database name missing → Ensure URI has `/proconnect`

**CORS Error:**
- Already fixed in code (allows .onrender.com domains)

**Cold Start:**
- Render free tier sleeps after inactivity
- First request takes ~30 seconds
- Subsequent requests are fast
