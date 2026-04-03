#!/bin/bash
# scripts/log-experience.sh
# 经验记录自动化脚本

set -e

ROLE=$1
TITLE=$2
SCENARIO=$3
ACTION=$4
RESULT=$5

# 检查参数
if [ -z "$ROLE" ] || [ -z "$TITLE" ]; then
  echo "❌ 用法：./log-experience.sh [ROLE] \"[标题]\" \"[场景]\" \"[做法]\" \"[效果]\""
  echo "示例：./log-experience.sh BUILDER \"积分系统 API\" \"开发积分 API\" \"使用 NestJS\" \"按时完成\""
  exit 1
fi

# 经验文件路径
EXPERIENCE_FILE="docs/experiences/$ROLE/accumulated.md"

# 检查文件是否存在
if [ ! -f "$EXPERIENCE_FILE" ]; then
  echo "⚠️ 经验文件不存在，创建中..."
  mkdir -p docs/experiences/$ROLE
  cat > "$EXPERIENCE_FILE" << EOF
# $ROLE 经验

**开始**: $(date +%Y-%m-%d)
**今日目标**: 完成 5 个任务闭环

## 今日经验

EOF
fi

# 添加经验
cat >> "$EXPERIENCE_FILE" << EOF

### $(date +%Y-%m-%d\ %H:%M) $TITLE
**场景**: $SCENARIO
**做法**: $ACTION
**效果**: $RESULT
**技能**: [自动记录]
EOF

echo "✅ 经验已记录到 $EXPERIENCE_FILE"

# 自动更新今日进展
TODAY_FILE="docs/TODAY_PROGRESS.md"
if [ -f "$TODAY_FILE" ]; then
  # 添加到"今日经验"部分
  sed -i "/^## 📝 今日经验/a\\
### $(date +%H:%M) $TITLE\\
**角色**: $ROLE\\
**效果**: $RESULT\\
" "$TODAY_FILE"
  echo "✅ 今日进展已更新"
fi

# 显示提示
echo ""
echo "🎉 任务完成！是否立即复盘？"
echo "1. 是 - 运行：./task-retrospective.sh [任务 ID] $ROLE"
echo "2. 否 - 跳过"
echo ""
