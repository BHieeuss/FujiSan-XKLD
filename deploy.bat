@echo off
cd /d %~dp0

set COMMIT_MSG=%~1
if "%COMMIT_MSG%"=="" set COMMIT_MSG=Update website and build deploy

echo ==========================================
echo  FUJISAN - BUILD ^& PUSH FOR CPANEL HOSTING
echo ==========================================

echo [1/5] Building project and packaging release zip...
call npm run release:hosting
if errorlevel 1 goto :error

echo [2/5] Staging all changes...
git add .

echo [3/5] Committing changes...
git commit -m "%COMMIT_MSG%" || echo "No changes to commit"

echo [4/5] Pulling latest from remote...
git pull origin main --no-edit
if errorlevel 1 goto :error

echo [5/5] Pushing source to GitHub...
git push origin main
if errorlevel 1 goto :error

echo ==========================================
echo  SOURCE ^& DEPLOY ZIP PUSHED SUCCESSFULLY!
echo  Open cPanel Git Version Control:
echo  1. Click 'Update from Remote'
echo  2. Click 'Deploy HEAD Commit'
echo  Domain: https://viejap.com
echo ==========================================
pause
exit /b 0

:error
echo ==========================================
echo  DEPLOY FAILED. PLEASE CHECK THE ERROR ABOVE.
echo ==========================================
pause
exit /b 1
