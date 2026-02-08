# ML Model Deployment on Render

## Quick Start Guide

### Prerequisites
- GitHub account with repository access
- Render account (https://render.com)
- Python 3.11+

### Step 1: Push Changes to GitHub
```bash
git add ml_model/ render.yaml
git commit -m "feat: Add ML model Flask API and Render deployment configuration"
git push origin main
```

### Step 2: Deploy on Render

#### Option A: Automatic Deployment (Recommended)

1. **Connect GitHub Repository**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - **Name:** `ml-model-api`
   - **Root Directory:** Leave empty (or `/`)
   - **Runtime:** Python 3.11
   - **Build Command:** `cd ml_model && pip install -r requirements.txt`
   - **Start Command:** `gunicorn --workers 2 --threads 2 --worker-class gthread --bind 0.0.0.0:$PORT app:app`
   - **Instance Type:** Starter
   - **Auto-deploy:** Enable

3. **Environment Variables**
   ```
   PYTHONUNBUFFERED=true
   DEBUG=False
   ML_PORT=5001
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete (~3-5 minutes)

#### Option B: Using render.yaml (If Render Supports It)

1. The `render.yaml` file is already configured in the root directory
2. Render will automatically detect and use it for deployment
3. Just push to main branch and Render will auto-deploy

### Step 3: Verify Deployment

Once deployed, test the API:

```bash
# Health Check
curl https://your-service-name.onrender.com/health

# Expected Response:
{
  "status": "healthy",
  "service": "ML Model Server",
  "models": ["ndvi_predictor", "change_detector", "risk_classifier"]
}
```

### Step 4: Update Backend API URL

In `backend/src/services/mlService.js`, update:

```javascript
const ML_API_URL = 'https://your-service-name.onrender.com';
```

## API Endpoints

### 1. Health Check
```
GET /health
```
Returns service status and loaded models.

### 2. NDVI Prediction
```
POST /predict/ndvi
Content-Type: application/json

{
  "ndvi_prev": 0.7,
  "ndvi_change": -0.05,
  "red_band": 0.25,
  "nir_band": 0.50,
  "cloud_cover": 0.1,
  "temperature": 25.5,
  "humidity": 65.0
}
```

### 3. Change Detection
```
POST /predict/change
```
Detects vegetation changes between scans.

### 4. Risk Classification
```
POST /predict/risk
```
Classifies risk levels based on satellite data.

### 5. Model Performance
```
GET /model-performance
```
Returns accuracy metrics for all models.

## Troubleshooting

### Issue: Build Fails
**Solution:** Ensure all Python dependencies are installed:
```bash
pip install -r ml_model/requirements.txt
```

### Issue: Service Crashes
**Check logs:**
1. Go to Render Dashboard
2. Select `ml-model-api` service
3. Click "Logs" tab
4. Look for error messages

### Issue: Models Not Loading
- Ensure `models/` directory has trained model files
- Check model file paths in `scripts/inference.py`

### Issue: Port Already in Use
- Render automatically assigns PORT environment variable
- Ensure start command uses `$PORT`

## Production Considerations

1. **Enable Auto-scaling:** Render can auto-scale based on load
2. **Monitor Performance:** Use Render's built-in monitoring
3. **Add Caching:** Consider Redis for model caching
4. **Error Handling:** Check logs regularly for errors
5. **Update Models:** To update trained models:
   - Upload new `.pkl` files to `models/` directory
   - Commit and push to main
   - Render will auto-redeploy

## Service URL

Your deployed service will be available at:
```
https://ml-model-api.onrender.com
```

(or whatever custom domain you configure on Render)

## Next Steps

1. ✅ Push changes to GitHub
2. ✅ Create Render service
3. ✅ Configure environment variables
4. ✅ Test health endpoint
5. ✅ Update backend API URL
6. ✅ Monitor logs for errors
7. ✅ Test ML endpoints from frontend

Happy Deploying! 🚀
