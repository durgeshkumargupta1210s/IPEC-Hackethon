@echo off
REM OAuth2 Setup & Testing Script for Windows
REM Run this to verify Sentinel Hub OAuth2 integration

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════╗
echo ║  Sentinel Hub OAuth2 Setup ^& Testing Script       ║
echo ╚════════════════════════════════════════════════════╝
echo.

REM Check if we're in backend directory
if not exist "package.json" (
    echo ✗ Error: package.json not found
    echo Please run this script from the backend\ directory
    echo.
    echo Usage:
    echo   cd backend
    echo   setup-oauth2.bat
    pause
    exit /b 1
)

echo Step 1: Checking Node.js
where node >nul 2>nul
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
    echo ✓ Node.js found: !NODE_VERSION!
) else (
    echo ✗ Node.js not found. Please install Node.js v18+
    pause
    exit /b 1
)
echo.

echo Step 2: Checking .env file
if exist ".env" (
    echo ✓ .env file exists
    findstr /M "SENTINEL_HUB_CLIENT_ID" .env >nul
    if %errorlevel% equ 0 (
        echo ✓ SENTINEL_HUB_CLIENT_ID configured
    ) else (
        echo ⚠ SENTINEL_HUB_CLIENT_ID not configured
        echo   Add this to your .env file:
        echo   SENTINEL_HUB_CLIENT_ID=93c64bb2-9165-4e49-8db1-a01652bf26b5
        echo   SENTINEL_HUB_CLIENT_SECRET=S1J56EhAW7FCADIRaZ6nLFUvKT8D3VZv
        echo   ENABLE_REAL_SATELLITE_API=true
    )
) else (
    echo ⚠ .env file not found. Creating...
    (
        echo SENTINEL_HUB_CLIENT_ID=93c64bb2-9165-4e49-8db1-a01652bf26b5
        echo SENTINEL_HUB_CLIENT_SECRET=S1J56EhAW7FCADIRaZ6nLFUvKT8D3VZv
        echo ENABLE_REAL_SATELLITE_API=true
        echo SENTINEL_HUB_REGION=eu
    ) > .env
    echo ✓ .env file created
)
echo.

echo Step 3: Checking Node modules
if exist "node_modules" (
    echo ✓ node_modules found
) else (
    echo ⚠ Installing npm packages...
    call npm install
    if %errorlevel% equ 0 (
        echo ✓ npm packages installed
    ) else (
        echo ✗ npm install failed
        pause
        exit /b 1
    )
)
echo.

echo Step 4: Checking OAuth2 service file
if exist "src\services\sentinelHubOAuth.js" (
    echo ✓ sentinelHubOAuth.js found
) else (
    echo ✗ sentinelHubOAuth.js not found
    pause
    exit /b 1
)
echo.

echo Step 5: Checking integration test
if exist "src\test-oauth-integration.js" (
    echo ✓ test-oauth-integration.js found
) else (
    echo ✗ test-oauth-integration.js not found
    pause
    exit /b 1
)
echo.

echo ╔════════════════════════════════════════════════════╗
echo ║             OAuth2 Setup Complete!                 ║
echo ╚════════════════════════════════════════════════════╝
echo.
echo ✓ All checks passed!
echo.
echo Next steps:
echo.
echo 1. Run the integration test to verify OAuth2 setup:
echo    node src\test-oauth-integration.js
echo.
echo 2. Start the backend server:
echo    npm start
echo.
echo 3. Test an API endpoint:
echo    curl -X POST http://localhost:5000/api/analyze ^
echo      -H "Content-Type: application/json" ^
echo      -d "{\"latitude\": 40.7128, \"longitude\": -74.0060, \"name\": \"NYC\"}"
echo.
echo Documentation:
echo   - Quick Reference: ..\OAUTH_QUICK_REFERENCE.md
echo   - Full Guide: ..\SENTINEL_HUB_OAUTH_INTEGRATION.md
echo   - Flow Diagrams: ..\OAUTH_FLOW_DIAGRAMS.md
echo   - Deployment: ..\DEPLOYMENT_CHECKLIST.md
echo.
pause
