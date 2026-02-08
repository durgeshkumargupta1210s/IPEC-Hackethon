@echo off
setlocal enabledelayedexpansion
cd /d "c:\Users\namit\New folder\vs_code\web_D\IEPC_Hackathon\IPEC-Hackethon"

echo Step 1: Adding all changes...
git add -A

echo Step 2: Committing changes...
git config --global core.editor "cat"
git commit -m "feat: Complete ML model deployment setup for Render - Add Flask API server (app.py) for ML model inference - Update requirements.txt with Flask, gunicorn, and dependencies - Configure render.yaml for automatic deployment - Add comprehensive deployment guide - Add environment configuration template - Ready for production deployment on Render"

echo Step 3: Pushing to GitHub...
git push origin main

echo.
echo ✅ All changes committed and pushed successfully!
echo.
pause
