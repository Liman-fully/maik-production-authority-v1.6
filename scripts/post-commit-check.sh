#!/bin/bash
# 🔗 Git Hook - 提交时自动检查文档同步
# 安装方法：cp scripts/post-commit-check.sh .git/hooks/post-commit && chmod +x .git/hooks/post-commit

set -e

echo "🔗 提交后检查：文档同步状态"
echo "================================"

# 获取最新提交信息
LATEST_COMMIT=$(git log -1 --pretty=%B)

# 检查是否包含任务 ID
TASK_IDS=$(echo "$LATEST_COMMIT" | grep -oE "DEV-[0-9]+|BUG-[0-9]+|TASK-[0-9]+" || echo "")

if [ -n "$TASK_IDS" ]; then
    echo "📝 检测到任务 ID: $TASK_IDS"
    echo ""
    
    for TASK_ID in $TASK_IDS; do
        echo "检查 $TASK_ID..."
        
        # 检查是否在 TODAY_PROGRESS.md 中提到
        if grep -q "$TASK_ID" docs/TODAY_PROGRESS.md 2>/dev/null; then
            echo "  ✅ $TASK_ID: 已在 TODAY_PROGRESS.md 中记录"
        else
            echo "  ⚠️  $TASK_ID: 未在 TODAY_PROGRESS.md 中记录"
            echo "  💡 提示：请尽快更新文档"
        fi
        
        # 检查是否在 task-board.md 中提到
        if grep -q "$TASK_ID" .task-board.md 2>/dev/null; then
            echo "  ✅ $TASK_ID: 已在 task-board.md 中记录"
        else
            echo "  ⚠️  $TASK_ID: 未在 task-board.md 中记录"
            echo "  💡 提示：请尽快更新任务看板"
        fi
        echo ""
    done
else
    echo "ℹ️  提交信息未包含任务 ID（可能是文档更新或其他）"
fi

echo "================================"
echo "✅ 检查完成"
echo ""
echo "💡 提醒："
echo "   - 任务完成后请立即更新文档"
echo "   - 汇报前请执行 ./scripts/pre-report-check.sh"
echo ""
