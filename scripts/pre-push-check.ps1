# ============================================
# 猎脉项目 - 提交前强制检查脚本 (Windows)
# 用法: .\scripts\pre-push-check.ps1
# ============================================

$ErrorActionPreference = "Stop"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🔍 猎脉项目 - 提交前检查" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. 检查 TypeScript 类型
Write-Host ""
Write-Host "📋 Step 1: TypeScript 类型检查..." -ForegroundColor Yellow
Set-Location backend
try {
    npx tsc --noEmit 2>&1 | Out-Null
    Write-Host "✅ Backend TypeScript 检查通过" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend TypeScript 检查失败！请修复后再提交。" -ForegroundColor Red
    npx tsc --noEmit
    exit 1
}
Set-Location ..

# 2. 构建测试
Write-Host ""
Write-Host "📋 Step 2: 构建测试..." -ForegroundColor Yellow
Set-Location backend
try {
    npm run build 2>&1 | Out-Null
    Write-Host "✅ 构建成功" -ForegroundColor Green
} catch {
    Write-Host "❌ 构建失败！请修复后再提交。" -ForegroundColor Red
    npm run build
    exit 1
}
Set-Location ..

# 3. 检查敏感信息
Write-Host ""
Write-Host "📋 Step 3: 检查敏感信息..." -ForegroundColor Yellow
$stagedFiles = git diff --cached --name-only 2>$null
$sensitiveFiles = $stagedFiles | Where-Object { 
    $_ -notlike "*.env.example" -and 
    (Select-String -Path $_ -Pattern "password|secret|token" -SimpleMatch -ErrorAction SilentlyContinue)
}
if ($sensitiveFiles) {
    Write-Host "⚠️ 警告：以下文件可能包含敏感信息：" -ForegroundColor Yellow
    $sensitiveFiles | ForEach-Object { Write-Host "  - $_" }
    Write-Host "请确认这些文件不包含真实的密钥！" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "✅ 所有检查通过！可以提交。" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
