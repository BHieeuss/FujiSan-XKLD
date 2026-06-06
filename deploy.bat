@echo off
REM 
cd /d %~dp0
echo Checking for uncommitted changes...
git add .
git status

echo Commit local changes...
git commit -m "Update source code and deploy to GitHub Pages" || echo "No changes to commit"

echo Pull and merge latest changes from remote...
git pull origin main --no-edit

echo Push to remote...
git push origin main

echo build Angular project...
call ng run App:build:production --base-href "/"



echo Deploy GitHub Pages...
call npx angular-cli-ghpages --dir=dist/app/browser --repo=https://github.com/BHieeuss/FujiSan-XKLD.git
echo done!
pause