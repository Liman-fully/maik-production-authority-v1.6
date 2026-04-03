#!/bin/bash
# 🚨 汇报前强制检查脚本
# 用法：./scripts/pre-report-check.sh
# 强制：每次汇报前必须执行

set -e

echo "🚨 汇报前强制检查"
echo "================================"
echo ""

# 1️⃣ 检查今日进展文档是否最新
echo "1️⃣ 今日进展文档检查:"
echo "--------------------------------"
if [ -f "docs/TODAY_PROGRESS.md" ]; then
    LAST_UPDATE=$(grep "最后更新" docs/TODAY_PROGRESS.md | tail -1)
    echo "📝 $LAST_UPDATE"
    
    # 检查是否包含今日日期
    TODAY=$(date +%Y-%m-%d)
    if grep -q "$TODAY" docs/TODAY_PROGRESS.md; then
        echo "✅ 文档包含今日日期 ($TODAY)"
    else
        echo "⚠️  警告：文档未包含今日日期，可能未更新"
    fi
else
    echo "❌ 错误：docs/TODAY_PROGRESS.md 不存在"
    exit 1
fi
echo ""

# 2️⃣ 检查最新 git 提交
echo "2️⃣ 最新 Git 提交:"
echo "--------------------------------"
LATEST_5=$(git log --oneline -5)
echo "$LATEST_5"
echo ""

# 3️⃣ 检查任务看板同步状态
echo "3️⃣ 任务看板同步检查:"
echo "--------------------------------"

# 获取最新提交中的任务 ID
LATEST_COMMIT_MSG=$(git log --oneline -1)
TASK_IDS=$(echo "$LATEST_COMMIT_MSG" | grep -oE "DEV-[0-9]+|BUG-[0-9]+|UI-[0-9]+" || echo "")

if [ -n "$TASK_IDS" ]; then
    echo "📝 最新提交包含任务 ID: $TASK_IDS"
    echo "🔍 检查任务看板是否同步..."
    
    for TASK_ID in $TASK_IDS; do
        if grep -q "$TASK_ID" .task-board.md; then
            STATUS=$(grep -A 2 "$TASK_ID" .task-board.md | grep -oE "✅|🟡|⏳" | head -1)
            if [ "$STATUS" = "✅" ]; then
                echo "  ✅ $TASK_ID: 任务看板标记为已完成"
            else
                echo "  ⚠️  $TASK_ID: 任务看板状态为 $STATUS，请确认是否正确"
            fi
        else
            echo "  ❌ $TASK_ID: 任务看板中未找到"
        fi
    done
else
    echo "ℹ️  最新提交未包含任务 ID（可能是文档更新）"
fi
echo ""

# 4️⃣ 检查是否有未提交的更改
echo "4️⃣ 工作区状态:"
echo "--------------------------------"
UNCOMMITTED=$(git status --porcelain 2>/dev/null | wc -l)
if [ "$UNCOMMITTED" -eq 0 ]; then
    echo "✅ 工作区干净，无未提交更改"
else
    echo "⚠️  警告：有 $UNCOMMITTED 个未提交的文件"
    git status --porcelain | head -10
    echo ""
    echo "💡 提示：请先提交更改再汇报"
fi
echo ""

# 5️⃣ 生成汇报摘要
echo "5️⃣ 汇报摘要:"
echo "--------------------------------"
TODAY=$(date +%Y-%m-%d)
TODAY_COMMITS=$(git log --since="$TODAY 00:00:00" --oneline 2>/dev/null | wc -l || echo "0")
echo "📊 今日提交数：$TODAY_COMMITS"

# 统计今日完成的任务
COMPLETED_TASKS=$(git log --since="$TODAY 00:00:00" --oneline | grep -oE "✅|完成|completed" | wc -l || echo "0")
echo "📊 今日完成任务数：$COMPLETED_TASKS"

# 检查是否有待汇报的重要提交
IMPORTANT_COMMITS=$(git log --oneline -5 | grep -E "feat:|fix:|DEV:|BUG:" | wc -l)
if [ "$IMPORTANT_COMMITS" -gt 0 ]; then
    echo "📊 最近 5 次提交中的重要更新：$IMPORTANT_COMMITS 个"
fi
echo ""

# 6️⃣ 交叉验证抽查
echo "6️⃣ 交叉验证抽查:"
echo "--------------------------------"
echo "随机抽查最近完成的任务..."

# 查找最近一个完成的任务
LAST_TASK=$(git log --oneline -10 | grep -oE "DEV-[0-9]+" | head -1)
if [ -n "$LAST_TASK" ]; then
    echo "🔍 抽查任务：$LAST_TASK"
    
    # 运行快速验证
    HAS_COMMIT=$(git log --oneline --grep="$LAST_TASK" | wc -l)
    echo "  - Git 提交：$HAS_COMMIT 个"
    
    if grep -q "$LAST_TASK" docs/TODAY_PROGRESS.md 2>/dev/null; then
        echo "  - 文档同步：✅ 已更新"
    else
        echo "  - 文档同步：⚠️  未更新"
    fi
fi
echo ""

# 7️⃣ 最终判断
echo "================================"
echo "📋 汇报资格检查:"
echo "================================"

ISSUES=0

if [ "$UNCOMMITTED" -gt 0 ]; then
    echo "❌ 有未提交更改，请先提交"
    ISSUES=$((ISSUES + 1))
fi

if [ "$TODAY_COMMITS" -eq 0 ] && [ "$COMPLETED_TASKS" -eq 0 ]; then
    echo "⚠️  今日无提交，确认是否需要汇报"
fi

if [ $ISSUES -eq 0 ]; then
    echo "✅ 检查通过，可以汇报"
    echo ""
    echo "📝 汇报建议:"
    echo "   - 今日提交：$TODAY_COMMITS 个"
    echo "   - 完成任务：$COMPLETED_TASKS 个"
    echo "   - 最新提交：$(git log --oneline -1)"
else
    echo "❌ 发现 $ISSUES 个问题，请先解决再汇报"
    exit 1
fi

echo ""
echo "================================"
echo "✅ 检查完成"
echo ""
echo "💡 汇报模板:"
echo "   今日完成:"
echo "   - [任务 1] (提交 ID)"
echo "   - [任务 2] (提交 ID)"
echo ""
echo "   正在进行:"
echo "   - [任务 3] (预计完成时间)"
echo ""
