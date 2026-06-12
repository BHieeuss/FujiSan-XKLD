@echo off
cd /d %~dp0

echo ==========================================
echo  FUJISAN - PUSH SOURCE FOR CPANEL HOSTING
echo ==========================================

echo [1/4] Staging all changes...
git add .

echo [2/4] Committing changes...
git commit -m "Update website for cPanel hosting" || echo "No changes to commit"

echo [3/4] Pulling latest from remote...
git pull origin main --no-edit
if errorlevel 1 goto :error

echo [4/4] Pushing source to GitHub...
git push origin main
if errorlevel 1 goto :error

echo ==========================================
echo  SOURCE PUSHED SUCCESSFULLY
echo  Open cPanel Git Version Control:
echo  Update from Remote, then Deploy HEAD Commit.
echo  Domain: https://viejap.com
echo ==========================================
pause
exit /b 0

:error
echo ==========================================
echo  DEPLOY FAILED. CHECK THE ERROR ABOVE.
echo ==========================================
pause
exit /b 1
