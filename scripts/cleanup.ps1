# HuntLink 版本迭代清理脚本 (Windows PowerShell)
# 在每个版本发布前运行，确保环境干净

Write-Host "🧹 开始清理 HuntLink 项目..." -ForegroundColor Cyan

# 清理后端
Write-Host "[1/5] 清理后端..." -ForegroundColor Yellow
Set-Location backend
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force coverage -ErrorAction SilentlyContinue
Remove-Item -Force .tsbuildinfo -ErrorAction SilentlyContinue
Write-Host "✓ 后端清理完成" -ForegroundColor Green

# 清理前端
Write-Host "[2/5] 清理前端..." -ForegroundColor Yellow
Set-Location ../frontend-web
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force coverage -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .vite -ErrorAction SilentlyContinue
Write-Host "✓ 前端清理完成" -ForegroundColor Green

# 清理根目录
Write-Host "[3/5] 清理根目录..." -ForegroundColor Yellow
Set-Location ..
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .cache -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force tmp -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force logs -ErrorAction SilentlyContinue
Write-Host "✓ 根目录清理完成" -ForegroundColor Green

# 重新安装依赖
Write-Host "[4/5] 重新安装依赖..." -ForegroundColor Yellow
Set-Location backend
npm install
Set-Location ../frontend-web
npm install
Write-Host "✓ 依赖安装完成" -ForegroundColor Green

# 运行测试
Write-Host "[5/5] 运行测试..." -ForegroundColor Yellow
Set-Location ../backend
npm run test
npm run test:e2e
Set-Location ../frontend-web
npm run test
Write-Host "✓ 测试全部通过" -ForegroundColor Green

Write-Host "🎉 清理完成！项目已准备好发布新版本" -ForegroundColor Green
Write-Host ""
Write-Host "下一步："
Write-Host "1. git add ."
Write-Host "2. git commit -m 'chore: 版本 x.x.x 发布前清理'"
Write-Host "3. git push origin main"
