# 📚 猎脉项目文档导航

**版本**: V3.0（精简优化版）  
**更新时间**: 2026-03-29 01:50  
**目标**: 新 Agent 5 分钟内快速上手

---

## 🚀 新人入职（5 分钟快速上手）

### 第 1 分钟：了解项目
```bash
# 阅读项目介绍
cat README.md

# 查看当前任务
cat .task-board.md
```

### 第 2 分钟：了解规范
```bash
# 阅读协同工作标准（精简版）
cat docs/QUICK_START.md

# 核心原则：
1. 三源验证：任务看板 + git 提交 + 代码文件
2. Git 为准：一切以 git 提交记录为准
3. 责任到人：每个任务明确实际执行者
```

### 第 3 分钟：领取任务
```bash
# 查看待办任务
cat .task-board.md | grep "待开始"

# 查看都统专属待办
cat docs/TODO_DUTONG.md
```

### 第 4 分钟：开始工作
```bash
# 获取最新代码
git pull origin master

# 创建功能分支
git checkout -b feature/任务 ID
```

### 第 5 分钟：提交规范
```bash
# 提交信息格式
git commit -m "feat(任务 ID): 简短描述"

# 推送代码
git push origin feature/任务 ID
```

---

## 📋 核心文档（必读）

| 文档 | 用途 | 阅读时间 |
|------|------|---------|
| [README.md](../README.md) | 项目介绍 | 5min |
| [QUICK_START.md](QUICK_START.md) | 快速入门 | 5min |
| [.task-board.md](../.task-board.md) | 任务看板 | 2min |
| [docs/TODAY_PROGRESS.md](TODAY_PROGRESS.md) | 今日进展 | 2min |
| [docs/TODO_DUTONG.md](TODO_DUTONG.md) | 都统待办 | 2min |

**总计**: 5 个文档，16 分钟读完

---

## 📖 参考文档（按需查阅）

### 工作规范
| 文档 | 用途 |
|------|------|
| [MULTI_AGENT_COLLABORATION_STANDARD_V3.md](MULTI_AGENT_COLLABORATION_STANDARD_V3.md) | 多 Agent 协同标准（完整版） |
| [SYNC_SPEC_V2.md](SYNC_SPEC_V2.md) | 信息同步规范 |
| [QUICK_REF_SYNC_V2.md](QUICK_REF_SYNC_V2.md) | 同步快速参考 |

### 技术文档
| 文档 | 用途 |
|------|------|
| [DEPLOYMENT.md](../DEPLOYMENT.md) | 部署指南 |
| [DEPLOYMENT_TRAINING.md](DEPLOYMENT_TRAINING.md) | 部署培训材料 |
| [SKILLS_KNOWLEDGE_BASE.md](SKILLS_KNOWLEDGE_BASE.md) | 技能知识库 |

### 事故报告（学习用）
| 文档 | 说明 |
|------|------|
| [INCIDENT_REPORT_001.md](INCIDENT_REPORT_001.md) | 信息同步失误 |
| [INCIDENT_REPORT_002.md](INCIDENT_REPORT_002.md) | DEV-005 状态追踪失误 |

---

## 🗑️ 已归档文档（历史参考）

以下文档已归档到 `docs/archive/2026-03-29/`，无需阅读，仅历史参考：

| 文档 | 归档原因 |
|------|---------|
| BUG_FIX_AND_OPTIMIZATION_PLAN.md | Bug 修复已完成 |
| COMPREHENSIVE_REVIEW_2026-03-28.md | 阶段性审查 |
| DEV_TASKS_2026-03-28.md | 开发任务已完成 |
| DEVELOPMENT_PLAN_2026-03-29.md | 开发计划已执行 |
| EXPORT_SPEC_UPDATE.md | 规范已纳入标准 |
| IMPLEMENTATION_REPORT.md | 实施已完成（墨锋贡献） |
| TASK_UPDATE_RIGHT_GUARD.md | 任务已重新分配 |
| TRAINING_MATERIALS_V2.md | 培训已完成 |
| CACHE_PERFORMANCE_REPORT.md | 性能测试报告 |
| COS_SETUP_INSTRUCTIONS.md | 配置指南 |

---

## 🔧 常用脚本

| 脚本 | 用途 | 命令 |
|------|------|------|
| verify-task-status.sh | 任务状态核查 | `./scripts/verify-task-status.sh DEV-001` |
| pre-report-check.sh | 汇报前检查 | `./scripts/pre-report-check.sh` |
| training-drill.sh | 培训演练 | `./scripts/training-drill.sh` |

---

## 📞 联系方式

| 事项 | 联系人 |
|------|--------|
| 任务分配 | @左护法 |
| 技术问题 | @左护法 / @右护法 |
| 系统迭代 | @墨锋 |
| 产品问题 | @司命大人 |
| 部署培训 | @都统（每日 15:00） |

---

## ✅ 文档治理原则

### 保留原则
1. **核心文档** - 日常使用（5 个）
2. **参考文档** - 按需查阅（8 个）
3. **技术文档** - 长期有效（3 个）

### 归档原则
1. **阶段性文档** - 任务完成后归档
2. **重复文档** - 整合后删除重复
3. **临时文档** - 24 小时后归档

### 清理计划
- **每日**: 清理临时文件
- **每周**: 归档阶段性文档
- **每月**: 全面审查文档结构

---

**最后更新**: 2026-03-29 01:50  
**维护者**: 左护法（天策府主官）  
**审查周期**: 每周审查
