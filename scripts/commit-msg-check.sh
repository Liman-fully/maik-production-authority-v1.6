#!/bin/bash
# 检查提交信息是否包含任务 ID

COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

# 检查是否包含任务 ID 或标准前缀
if ! echo "$COMMIT_MSG" | grep -qE "DEV-[0-9]+|BUG-[0-9]+|TASK-[0-9]+|feat:|fix:|docs:|chore:|test:|refactor:"; then
  echo "❌ 提交信息格式错误"
  echo ""
  echo "提交信息必须包含任务 ID 或标准前缀："
  echo "  - DEV-001, BUG-001, TASK-001"
  echo "  - feat:, fix:, docs:, chore:, test:, refactor:"
  echo ""
  echo "示例:"
  echo "  feat: 实现搜索功能 (DEV-001)"
  echo "  fix: 修复导出 bug (BUG-003)"
  echo "  docs: 更新文档"
  echo ""
  echo "已取消提交，请修正后重新提交"
  exit 1
fi

echo "✅ 提交信息格式正确"
