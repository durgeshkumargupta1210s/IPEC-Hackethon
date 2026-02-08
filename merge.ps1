#!/usr/bin/env pwsh
$ErrorActionPreference = "Stop"
$env:GIT_EDITOR = "cat"
$env:GIT_PAGER = "cat"

Set-Location "c:\Users\namit\New folder\vs_code\web_D\IEPC_Hackathon\IPEC-Hackethon"

Write-Host "Step 1: Switching to main branch..."
git checkout main

Write-Host "Step 2: Pulling latest from main..."
git pull origin main

Write-Host "Step 3: Merging namit into main..."
git merge namit --no-edit

Write-Host "Step 4: Pushing to GitHub..."
git push origin main

Write-Host "✅ Merge completed successfully!"
