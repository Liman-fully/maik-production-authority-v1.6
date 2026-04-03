#!/bin/bash
# Git 冲突标记检查脚本
# 防止冲突标记混入源码导致部署失败

echo "🔍 检查 Git 冲突标记..."

# 检查源码目录
CONFLICTS=$(grep -r "<<<<<<< " src/ 2>/dev/null || true)

if [ -n "$CONFLICTS" ]; then
    echo "❌ 发现 Git 冲突标记！"
    echo "$CONFLICTS"
    echo ""
    echo "请手动解决冲突后再构建。"
    exit 1
fi

# 检查编译产物目录
CONFLICTS_IN_DIST=$(grep -r "<<<<<<< " dist/ 2>/dev/null || true)

if [ -n "$CONFLICTS_IN_DIST" ]; then
    echo "❌ 编译产物中发现冲突标记！"
    echo "$CONFLICTS_IN_DIST"
    echo ""
    echo "请清理 dist 目录并重新构建。"
    exit 1
fi

echo "✅ 未发现冲突标记，可以继续构建"
exit 0
