@echo off
cd /d "c:\Users\namit\New folder\vs_code\web_D\IEPC_Hackathon\IPEC-Hackethon"
git config --global core.editor "cat"
git add ml_model/requirements.txt
git commit -m "docs: Add ML model requirements.txt with dependencies for satellite imagery analysis"
git push origin main
echo ML requirements.txt committed and pushed successfully!
