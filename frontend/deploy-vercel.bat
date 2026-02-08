@echo off
REM Frontend Deployment Helper Script for Vercel (Windows)

echo 🚀 Frontend Deployment Script for Vercel
echo ========================================
echo.

REM Check if in frontend directory
if not exist package.json (
    echo ❌ Error: package.json not found. Please run this from the frontend directory.
    exit /b 1
)

REM Check for .env.production
if not exist .env.production (
    echo ⚠️  Warning: .env.production not found!
    echo Creating from template...
    copy .env.production.example .env.production
    echo ✅ Created .env.production from template
    echo.
    echo Please update the following in .env.production:
    echo   - VITE_API_URL=https://satellite-change-detection-system-1.onrender.com
    echo   - VITE_ML_API_URL=https://satellite-change-detection-system.onrender.com
    echo.
    echo Then run this script again.
    exit /b 0
)

echo ✅ Environment configuration found
echo.

REM Display environment variables
echo 📋 Environment Variables:
echo ========================
type .env.production
echo.
echo.

REM Clean install
echo 🧹 Cleaning node_modules and package-lock.json...
rmdir /s /q node_modules >nul 2>&1
del /q package-lock.json >nul 2>&1
echo ✅ Cleaned
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ npm install failed
    exit /b 1
)
echo ✅ Dependencies installed
echo.

REM Build
echo 🔨 Building production bundle...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed
    exit /b 1
)
echo ✅ Build successful
echo.

REM Check build output
echo 📊 Build Output:
echo ===============
dir /L /S dist
echo.

REM Check if Vercel CLI is installed
where vercel >nul 2>&1
if errorlevel 1 (
    echo 📥 Installing Vercel CLI...
    call npm install -g vercel
)

REM Deploy to Vercel
echo 🚀 Deploying to Vercel...
echo Please login to Vercel if prompted
echo.

call vercel deploy --prod

echo.
echo ✅ Deployment complete!
echo 💡 Check Vercel dashboard for your deployment URL
pause
