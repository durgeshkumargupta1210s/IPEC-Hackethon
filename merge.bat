@echo off
cd /d "c:\Users\namit\New folder\vs_code\web_D\IEPC_Hackathon\IPEC-Hackethon"
git config --global core.pager "cat"
git config --global core.editor "cat"
git checkout main
git pull origin main
git merge namit --no-edit
git push origin main
echo Merge completed successfully!
pause
