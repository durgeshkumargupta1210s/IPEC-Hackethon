$env:GIT_EDITOR = "cat"
$env:GIT_PAGER = "cat"
Set-Location "c:\Users\namit\New folder\vs_code\web_D\IEPC_Hackathon\IPEC-Hackethon"

Write-Host "Step 1: Adding all changes..."
git add -A

Write-Host "Step 2: Committing changes..."
git commit -m "feat: Complete ML model deployment setup for Render
- Add Flask API server (app.py) for ML model inference
- Update requirements.txt with Flask, gunicorn, and all dependencies
- Configure render.yaml for automatic deployment on Render
- Add comprehensive deployment guide (ML_MODEL_RENDER_DEPLOYMENT.md)
- Add environment configuration template (.env.example)
- Ready for production deployment on Render"

Write-Host "Step 3: Pushing to GitHub..."
git push origin main

Write-Host "✅ All changes committed and pushed successfully!"
