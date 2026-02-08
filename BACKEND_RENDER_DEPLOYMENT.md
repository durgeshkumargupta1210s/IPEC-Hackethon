# Backend Deployment on Render - Quick Start Guide

## Prerequisites
- GitHub repository pushed
- Render account (https://render.com)
- MongoDB Atlas account (for database)
- Environment variables ready

## Step 1: Update Environment Variables

Add these to Render's environment variables:

```
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
CORS_ORIGIN=https://your-frontend-domain.com,https://satellite-change-detection-system.onrender.com
ML_API_URL=https://satellite-change-detection-system.onrender.com
JWT_SECRET=your_jwt_secret_key
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
REDIS_URL=redis://default:password@your-redis-instance:port
```

## Step 2: Deploy on Render

### Option A: Using Dashboard (Recommended)

1. **Go to Render Dashboard**: https://dashboard.render.com

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Select the repository

3. **Configure Service**:
   - **Name**: `forest-guard-backend`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Starter ($7/month)
   - **Auto-deploy**: Enable

4. **Add Environment Variables** (click "Advanced"):
   - Add all variables from Step 1

5. **Create Service** and wait for deployment

### Option B: Using render.yaml

The `render.yaml` file in the root directory includes backend configuration.

## Step 3: Connect ML Model API

Update these files to use deployed ML API:

**File**: `backend/src/services/mlService.js`

```javascript
const ML_API_URL = process.env.ML_API_URL || 'https://satellite-change-detection-system.onrender.com';

async function callMLAPI(endpoint, data) {
  try {
    const response = await axios.post(`${ML_API_URL}${endpoint}`, data, {
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    console.error(`ML API Error: ${error.message}`);
    throw error;
  }
}
```

## Step 4: Verify Deployment

Test your deployed backend:

```bash
# Health Check
curl https://your-backend-domain.onrender.com/health

# Expected Response:
{
  "status": "healthy",
  "environment": "production",
  "database": "connected"
}
```

## Step 5: Update Frontend Configuration

In `frontend/src/services/api.js`:

```javascript
const API_BASE_URL = process.env.VITE_API_URL || 
  'https://your-backend-domain.onrender.com';

export default axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

## Deployment Architecture

```
┌─────────────────────────────────────────────┐
│         Frontend (Vercel/Netlify)           │
│   https://your-frontend-domain.com          │
└──────────────────┬──────────────────────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
┌────────▼──────────┐  ┌────▼─────────────────┐
│   Backend API     │  │  ML Model API        │
│  (Node.js/Render) │  │ (Python/Render)      │
│ forest-guard-     │  │ satellite-change-    │
│    backend        │  │  detection-system    │
└────────┬──────────┘  └──────────────────────┘
         │
┌────────▼──────────────────┐
│   MongoDB Atlas            │
│   (Cloud Database)         │
└───────────────────────────┘
```

## Monitoring & Logs

1. **View Logs**: Render Dashboard → Select Service → Logs
2. **Monitor Performance**: Use Render's built-in monitoring
3. **Set Alerts**: Configure email alerts for service issues

## Troubleshooting

### Issue: Service Crashes
- Check logs for errors
- Verify NODE_ENV is set to `production`
- Ensure MONGO_URI is correct

### Issue: CORS Errors
- Add frontend URL to CORS_ORIGIN
- Use comma-separated list for multiple origins

### Issue: ML API Not Responding
- Verify ML_API_URL is correct
- Check if ML service is running
- Check network connectivity

### Issue: Database Connection Failed
- Verify MONGO_URI format
- Check MongoDB Atlas IP whitelist
- Ensure credentials are correct

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| NODE_ENV | Node environment | `production` |
| PORT | Server port | `10000` |
| MONGO_URI | MongoDB connection | `mongodb+srv://...` |
| CORS_ORIGIN | Allowed origins | `https://domain.com` |
| ML_API_URL | ML model API | `https://ml-api.onrender.com` |
| JWT_SECRET | JWT signing key | `random_secret_key` |
| REDIS_URL | Redis URL | `redis://user:pass@host:port` |

## Production Checklist

- [ ] MongoDB Atlas configured with production credentials
- [ ] CORS_ORIGIN includes frontend domain
- [ ] ML_API_URL points to deployed ML service
- [ ] JWT_SECRET is set and secure
- [ ] SMTP credentials for email alerts
- [ ] Error logging configured
- [ ] Rate limiting enabled
- [ ] HTTPS enforced
- [ ] Database backups enabled
- [ ] Health checks configured

## Next Steps

1. ✅ Deploy backend on Render
2. ✅ Configure environment variables
3. ✅ Test health endpoint
4. ✅ Update frontend API URL
5. ✅ Test API connectivity from frontend
6. ✅ Monitor logs for errors
7. ✅ Set up alerts

## Support

If you encounter issues:
1. Check Render logs
2. Verify environment variables
3. Test API endpoints with curl/Postman
4. Check MongoDB Atlas connection
5. Review error messages in logs

Happy Deploying! 🚀
