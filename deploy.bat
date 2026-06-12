@echo off
cd /d %~dp0

echo ==========================================
echo  FUJISAN - AUTO DEPLOY TO GITHUB PAGES
echo ==========================================

echo [1/5] Staging all changes...
git add .

echo [2/5] Committing changes...
git commit -m "Update source code and deploy to GitHub Pages" || echo "No changes to commit"

echo [3/5] Pulling latest from remote...
git pull origin main --no-edit

echo [4/5] Pushing to GitHub...
git push origin main

echo [5/5] Building Angular project...
call ng build fujisan-website --configuration production

echo Copying CNAME to dist for custom domain...
copy /Y "public\CNAME" "dist\fujisan-website\browser\CNAME"

echo Copying 404.html for SPA routing...
copy /Y "dist\fujisan-website\browser\index.html" "dist\fujisan-website\browser\404.html"

echo Copying cPanel deployment config to gh-pages output...
copy /Y ".cpanel-gh-pages.yml" "dist\fujisan-website\browser\.cpanel.yml"

echo Deploying to GitHub Pages...
call npx angular-cli-ghpages --dir=dist/fujisan-website/browser --repo=https://github.com/BHieeuss/FujiSan-XKLD.git --no-silent

echo ==========================================
echo  DONE! Website deployed successfully!
echo  Domain: https://viejap.com
echo ==========================================
pause
