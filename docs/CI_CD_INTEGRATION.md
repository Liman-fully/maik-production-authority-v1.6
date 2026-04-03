# 🤖 CI/CD 集成 - 信息同步自动检查

**版本**: V1.0  
**创建时间**: 2026-03-29  
**集成目标**: 将三源验证集成到 CI/CD 流程

---

## 📋 集成方案

### 方案 1: GitHub Actions - PR 检查

**文件**: `.github/workflows/sync-check.yml`

```yaml
name: 信息同步检查

on:
  pull_request:
    branches: [ master, develop ]
  push:
    branches: [ master ]

jobs:
  sync-check:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
      with:
        fetch-depth: 0  # 获取完整历史
    
    - name: 设置 Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
    
    - name: 安装依赖
      run: |
        cd backend && npm install
        cd ../frontend-web && npm install
    
    - name: 检查文档同步
      run: |
        echo "🔍 检查最新提交的文档同步状态"
        
        # 获取最新提交的提交信息
        LATEST_COMMIT=$(git log -1 --pretty=%B)
        
        # 提取任务 ID
        TASK_IDS=$(echo "$LATEST_COMMIT" | grep -oE "DEV-[0-9]+|BUG-[0-9]+|TASK-[0-9]+" || echo "")
        
        if [ -n "$TASK_IDS" ]; then
          echo "检测到任务 ID: $TASK_IDS"
          
          for TASK_ID in $TASK_IDS; do
            echo "检查 $TASK_ID..."
            
            # 检查 TODAY_PROGRESS.md
            if ! grep -q "$TASK_ID" docs/TODAY_PROGRESS.md; then
              echo "❌ 错误：$TASK_ID 未在 docs/TODAY_PROGRESS.md 中记录"
              exit 1
            fi
            
            # 检查 .task-board.md
            if ! grep -q "$TASK_ID" .task-board.md; then
              echo "❌ 错误：$TASK_ID 未在 .task-board.md 中记录"
              exit 1
            fi
            
            echo "✅ $TASK_ID: 文档同步检查通过"
          done
        else
          echo "ℹ️ 提交信息未包含任务 ID，跳过检查"
        fi
        
        echo "✅ 所有检查通过"
    
    - name: 运行核查脚本
      run: |
        chmod +x scripts/verify-task-status.sh
        chmod +x scripts/pre-report-check.sh
        
        # 运行汇报前检查（仅警告，不阻塞）
        ./scripts/pre-report-check.sh || true
```

---

### 方案 2: Git Hook - 本地检查

**安装方法**:

```bash
# 安装 post-commit hook
cp scripts/post-commit-check.sh .git/hooks/post-commit
chmod +x .git/hooks/post-commit

# 安装 commit-msg hook（检查提交信息格式）
cp scripts/commit-msg-check.sh .git/hooks/commit-msg
chmod +x .git/hooks/commit-msg
```

**commit-msg hook 示例** (`scripts/commit-msg-check.sh`):

```bash
#!/bin/bash
# 检查提交信息是否包含任务 ID

COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

# 检查是否包含任务 ID
if ! echo "$COMMIT_MSG" | grep -qE "DEV-[0-9]+|BUG-[0-9]+|TASK-[0-9]+|feat:|fix:|docs:|chore:"; then
  echo "❌ 提交信息格式错误"
  echo ""
  echo "提交信息必须包含任务 ID 或标准前缀："
  echo "  - DEV-001, BUG-001, TASK-001"
  echo "  - feat:, fix:, docs:, chore:"
  echo ""
  echo "示例:"
  echo "  feat: 实现搜索功能 (DEV-001)"
  echo "  fix: 修复导出 bug (BUG-003)"
  echo "  docs: 更新文档"
  exit 1
fi

echo "✅ 提交信息格式正确"
```

---

### 方案 3: 定时检查 - Cron Job

**文件**: `.github/workflows/daily-sync-check.yml`

```yaml
name: 每日文档同步检查

on:
  schedule:
    # 每天 09:00 UTC 执行
    - cron: '0 9 * * *'

jobs:
  daily-check:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
      with:
        fetch-depth: 0
    
    - name: 检查昨日提交的文档同步
      run: |
        echo "🔍 检查昨日提交的文档同步状态"
        
        # 获取昨日日期
        YESTERDAY=$(date -d "yesterday" +%Y-%m-%d)
        
        # 获取昨日的所有提交
        COMMITS=$(git log --since="$YESTERDAY 00:00:00" --until="$YESTERDAY 23:59:59" --pretty=%B)
        
        # 提取任务 ID
        TASK_IDS=$(echo "$COMMITS" | grep -oE "DEV-[0-9]+|BUG-[0-9]+|TASK-[0-9]+" | sort -u || echo "")
        
        if [ -n "$TASK_IDS" ]; then
          echo "昨日完成的任务：$TASK_IDS"
          echo ""
          
          UNSYNCED=0
          
          for TASK_ID in $TASK_IDS; do
            echo "检查 $TASK_ID..."
            
            # 检查文档同步
            if ! grep -q "$TASK_ID" docs/TODAY_PROGRESS.md; then
              echo "  ❌ $TASK_ID: 未在 TODAY_PROGRESS.md 中记录"
              UNSYNCED=$((UNSYNCED + 1))
            else
              echo "  ✅ $TASK_ID: 已同步"
            fi
          done
          
          if [ $UNSYNCED -gt 0 ]; then
            echo ""
            echo "⚠️ 发现 $UNSYNCED 个任务未同步文档"
            echo "💡 请相关成员立即更新文档"
            
            # 发送通知（可以通过 Slack/Discord webhook）
            # curl -X POST -H 'Content-type: application/json' \
            #   --data "{\"text\":\"⚠️ 发现 $UNSYNCED 个任务未同步文档，请更新\"}" \
            #   $WEBHOOK_URL
            
            exit 1
          fi
        else
          echo "ℹ️ 昨日无任务提交"
        fi
        
        echo "✅ 所有任务文档同步正常"
```

---

## 📊 检查指标

### 同步及时率

```bash
# 计算公式
同步及时率 = (及时更新的任务数 / 总任务数) * 100%

# 目标：100%
```

### 汇报准确率

```bash
# 计算公式
汇报准确率 = (准确的汇报次数 / 总汇报次数) * 100%

# 目标：100%
```

### 自动化覆盖率

```bash
# 计算公式
自动化覆盖率 = (自动检查的提交数 / 总提交数) * 100%

# 目标：100%
```

---

## 🚨 告警机制

### 告警级别

| 级别 | 触发条件 | 处理方式 |
|------|---------|---------|
| 🔴 严重 | 连续 3 次未同步 | 立即通知 + 团队通报 |
| 🟡 警告 | 单次未同步 | 提醒相关成员 |
| 🟢 提示 | 接近截止时间 | 提前提醒 |

### 通知渠道

- **GitHub Issues**: 自动创建问题
- **Slack/Discord**: Webhook 通知
- **邮件**: 每日汇总报告

---

## 📝 实施清单

- [ ] 创建 GitHub Actions 工作流
- [ ] 安装 Git Hooks
- [ ] 配置定时检查
- [ ] 设置告警通知
- [ ] 测试完整流程
- [ ] 团队培训

---

## 🔧 维护指南

### 每周检查

- 检查 GitHub Actions 是否正常运行
- 检查 Git Hooks 是否生效
- 收集团队反馈

### 每月优化

- 优化检查逻辑
- 更新告警阈值
- 改进通知机制

---

**文档位置**: `docs/CI_CD_INTEGRATION.md`  
**维护者**: 左护法  
**审查者**: 全体成员
