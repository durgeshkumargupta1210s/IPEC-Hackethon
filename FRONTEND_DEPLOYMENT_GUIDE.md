# Frontend Deployment Guide - Render/Vercel

## Current Deployment Status

✅ **ML Model API**: https://satellite-change-detection-system.onrender.com
✅ **Backend API**: https://satellite-change-detection-system-1.onrender.com
⏳ **Frontend**: Ready to deploy

## Frontend Deployment Options

### Option 1: Vercel (Recommended for React/Vite)

**Step 1: Connect GitHub**
1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Select the project

**Step 2: Configure Build**
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

**Step 3: Environment Variables**
```
VITE_API_URL=https://satellite-change-detection-system-1.onrender.com
VITE_ML_API_URL=https://satellite-change-detection-system.onrender.com
VITE_ENV=production
```

**Step 4: Deploy**
- Click "Deploy"
- Wait for deployment (2-3 minutes)

### Option 2: Render (All-in-One)

**Step 1: Create Web Service**
1. Go to Render Dashboard: https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repository

**Step 2: Configure Frontend Service**
- **Name**: `forest-guard-frontend`
- **Root Directory**: `frontend`
- **Runtime**: Node
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run preview` (or `npm run build && npm start`)
- **Instance Type**: Starter

**Step 3: Add Environment Variables**
```
VITE_API_URL=https://satellite-change-detection-system-1.onrender.com
VITE_ML_API_URL=https://satellite-change-detection-system.onrender.com
NODE_ENV=production
```

**Step 4: Deploy**
- Click "Create Web Service"
- Wait 3-5 minutes

### Option 3: Netlify

**Step 1: Connect**
1. Go to https://netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub

**Step 2: Configure Build**
- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `dist`

**Step 3: Environment Variables**
```
VITE_API_URL=https://satellite-change-detection-system-1.onrender.com
VITE_ML_API_URL=https://satellite-change-detection-system.onrender.com
```

**Step 4: Deploy**
- Click "Deploy site"

## Update Frontend Configuration

### 1. Update API Service URLs

**File**: `frontend/src/services/api.js`

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  'https://satellite-change-detection-system-1.onrender.com';

const ML_API_URL = import.meta.env.VITE_ML_API_URL || 
  'https://satellite-change-detection-system.onrender.com';

export { API_BASE_URL, ML_API_URL };
```

### 2. Create .env.production

**File**: `frontend/.env.production`

```
VITE_API_URL=https://satellite-change-detection-system-1.onrender.com
VITE_ML_API_URL=https://satellite-change-detection-system.onrender.com
VITE_ENV=production
```

### 3. Update Axios Instance

**File**: `frontend/src/services/api.js`

```javascript
import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
instance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add response interceptor
instance.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default instance;
```

## Architecture After Frontend Deployment

```
┌─────────────────────────────────┐
│   Frontend (Vercel/Netlify)     │
│   https://your-domain.com       │
└──────────────┬──────────────────┘
               │ API Calls
       ┌───────┴────────┐
       │                │
┌──────▼──────┐  ┌─────▼──────────┐
│  Backend    │  │  ML Model API  │
│  (Render)   │  │  (Render)      │
│  :8000      │  │  :5001         │
└──────┬──────┘  └────────────────┘
       │
┌──────▼──────────┐
│  MongoDB Atlas  │
│  (Cloud DB)     │
└─────────────────┘
```

## Deployment Checklist

- [ ] Update `frontend/.env.production` with backend URLs
- [ ] Update API service files with environment variables
- [ ] Test API connectivity locally: `npm run dev`
- [ ] Verify WebSocket works: Check browser console
- [ ] Build production bundle: `npm run build`
- [ ] Deploy to Vercel/Netlify/Render
- [ ] Test health endpoint from frontend
- [ ] Verify all API calls work
- [ ] Check real-time updates (WebSocket)
- [ ] Test PDF export functionality
- [ ] Monitor Sentry/logs for errors

## Post-Deployment Verification

### 1. Test Health Endpoints
```bash
# Backend health
curl https://satellite-change-detection-system-1.onrender.com/health

# ML API health
curl https://satellite-change-detection-system.onrender.com/health

# Frontend loads
curl https://your-frontend-domain.com
```

### 2. Test API Integration
1. Open browser DevTools (F12)
2. Go to "Network" tab
3. Open frontend URL
4. Perform analysis in UI
5. Verify API calls succeed
6. Check WebSocket connection (ws://)

### 3. Test Features
- [ ] Dashboard loads with regions
- [ ] Analysis works with satellite data
- [ ] Results display correctly
- [ ] Real-time updates work
- [ ] PDF export functions
- [ ] Email alerts work
- [ ] Comparison mode displays data

## Troubleshooting

### Issue: API calls fail with 404
**Solution**: Verify VITE_API_URL is correct in deployment variables

### Issue: CORS errors
**Solution**: 
1. Check Backend CORS_ORIGIN includes frontend URL
2. Update on Render dashboard
3. Restart backend service

### Issue: WebSocket not connecting
**Solution**:
1. Verify backend is running
2. Check browser console for errors
3. Ensure socket.io is configured correctly

### Issue: Images/assets not loading
**Solution**:
1. Verify build includes public directory
2. Check dist/ folder has assets
3. Verify CDN/static file serving

## Performance Tips

1. **Enable Gzip Compression** (Vercel does this automatically)
2. **Use CDN for Assets** (Vercel/Netlify provide this)
3. **Optimize Bundle Size**:
   ```bash
   npm run build
   npm install -g vite-plugin-visualizer
   ```
4. **Lazy Load Routes**:
   ```javascript
   const Dashboard = lazy(() => import('./pages/Dashboard'));
   ```
5. **Cache API Responses** with React Query/SWR

## Environment Variables Reference

| Variable | Frontend | Backend | Purpose |
|----------|----------|---------|---------|
| VITE_API_URL | ✅ | - | Backend API endpoint |
| VITE_ML_API_URL | ✅ | - | ML Model API endpoint |
| NODE_ENV | - | ✅ | Environment (production) |
| MONGO_URI | - | ✅ | Database connection |
| CORS_ORIGIN | - | ✅ | Frontend domain for CORS |

## Next Steps

1. ✅ Deploy Backend (DONE)
2. ⏳ Deploy Frontend (IN PROGRESS)
3. Configure environment variables
4. Test all API connections
5. Monitor logs for errors
6. Set up analytics/monitoring
7. Configure custom domain (optional)

## Support

If deployment fails:
1. Check build logs on deployment platform
2. Verify environment variables are set
3. Test locally: `npm run build && npm run preview`
4. Check for missing dependencies
5. Review console errors in browser DevTools

Happy Deploying! 🚀
