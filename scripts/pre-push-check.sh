#!/bin/bash
# ============================================
# 猎脉项目 - 提交前强制检查脚本
# 用法: ./scripts/pre-push-check.sh
# ============================================

set -e

echo "========================================="
echo "🔍 猎脉项目 - 提交前检查"
echo "========================================="

# 1. 检查 Git 冲突标记（Gemini 架构师建议）
echo ""
echo "📋 Step 1: Git 冲突标记检查..."
if grep -r "<<<<<<< " backend/src/ 2>/dev/null; then
  echo "❌ 发现 Git 冲突标记！请先解决冲突。"
  exit 1
fi
echo "✅ 无冲突标记"

# 2. 检查 TypeScript 类型
echo ""
echo "📋 Step 2: TypeScript 类型检查..."
cd backend
if npx tsc --noEmit; then
  echo "✅ Backend TypeScript 检查通过"
else
  echo "❌ Backend TypeScript 检查失败！请修复后再提交。"
  exit 1
fi

cd ..

# 2. 检查 ESLint
echo ""
echo "📋 Step 2: ESLint 检查..."
cd backend
if npm run lint 2>/dev/null || npx eslint src --ext .ts; then
  echo "✅ ESLint 检查通过"
else
  echo "⚠️ ESLint 有警告，但不阻塞提交"
fi

cd ..

# 3. 构建测试
echo ""
echo "📋 Step 3: 构建测试..."
cd backend
if npm run build; then
  echo "✅ 构建成功"
else
  echo "❌ 构建失败！请修复后再提交。"
  exit 1
fi

cd ..

# 4. 检查敏感信息
echo ""
echo "📋 Step 4: 检查敏感信息..."
if git diff --cached --name-only | xargs grep -l "password\|secret\|token" 2>/dev/null | grep -v ".env.example"; then
  echo "⚠️ 警告：以下文件可能包含敏感信息："
  git diff --cached --name-only | xargs grep -l "password\|secret\|token" 2>/dev/null | grep -v ".env.example"
  echo "请确认这些文件不包含真实的密钥！"
fi

echo ""
echo "========================================="
echo "✅ 所有检查通过！可以提交。"
echo "========================================="
