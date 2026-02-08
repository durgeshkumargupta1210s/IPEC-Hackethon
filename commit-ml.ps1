$env:GIT_EDITOR = "cat"
$env:GIT_PAGER = "cat"
Set-Location "c:\Users\namit\New folder\vs_code\web_D\IEPC_Hackathon\IPEC-Hackethon"
git add ml_model/requirements.txt
git commit -m "docs: Add ML model requirements.txt with dependencies"
git push origin main
Write-Host "✅ ML requirements.txt pushed to GitHub!"
