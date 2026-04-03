# HuntLink 招聘平台 — PM 诊断报告

> **诊断日期**: 2026-03-31  
> **诊断人**: PM (QClaw AI)  
> **仓库**: Liman-fully/huntlink  
> **状态**: 🚨 上线前 Debug 阶段

---

## 📊 项目总览

| 维度 | 现状 |
|------|------|
| 技术栈 | NestJS (后端) + Next.js (前端) + PostgreSQL + 腾讯云 COS |
| 前端锁文件 | `pnpm-lock.yaml` (pnpm 项目) ⚠️ |
| 后端锁文件 | `package-lock.json` (npm 项目) ✅ |
| CI 状态 | 🔴 最近 2 次 CI 均失败 |
| 最新提交 | `feat(search): promote Phase 2 search optimizations` (2026-03-31) |
| GitHub Issues | 0 条（Bug 未提 Issue 直接修） |
| 部署方式 | Docker + PM2，发布到腾讯云 |
| 硬件限制 | 2G RAM / 50G Disk（生产铁律） |

---

## 🔴 P0 — CI 流水线故障（阻断上线）

### Bug #1: CI 前端依赖安装失败

**现象**: 最近 2 次 CI 均失败，最近一次失败在 `Install frontend dependencies` 步骤。

**根本原因**: `.github/workflows/ci.yml` 使用 `npm ci` 但前端是 **pnpm 项目**（存在 `pnpm-lock.yaml` 而非 `package-lock.json`）。

**证据**:
```yaml
# ci.yml 第 31-32 行
- name: Install frontend dependencies
  run: cd frontend-web && npm ci   # ❌ 前端是 pnpm，没有 package-lock.json
```

**影响**: 每次 push 到 master 均触发 CI → 构建失败 → 无法部署。

---

## 🟡 P1 — CI 配置隐患

### Bug #2: Cache 路径与包管理器不匹配

**现象**: CI 的 npm cache 配置指向 `package-lock.json`，但前端使用 pnpm。

```yaml
cache: 'npm'
cache-dependency-path: |
  backend/package-lock.json
  frontend-web/package-lock.json   # ❌ 前端用 pnpm，没有此文件
```

**影响**: 前端依赖无法被缓存，每次 CI 均重新下载，浪费时间。

### Bug #3: packageManager 字段缺失

`frontend-web/package.json` 未声明使用的包管理器版本。

**影响**: 不同机器 pnpm 版本不一致可能导致 lock 文件不兼容。

### Bug #4: CI 失败时静默跳过类型检查

```yaml
- name: Type Check frontend
  run: cd frontend-web && npx tsc --noEmit || echo "Frontend type check skipped"
  # ❌ 失败不报错，导致带 TypeScript 错误的代码也能进 master
```

---

## 🟢 P2 — 工程规范建议

### 建议 #1: 建立 Bug Issue 追踪机制

目前 Bug 修复直接提交 commit，没有创建 GitHub Issue 追踪。建议后续所有 Bug 提 Issue 并关联 PR。

### 建议 #2: 添加 packageManager 声明

在 `frontend-web/package.json` 添加：
```json
"packageManager": "pnpm@9.0.0"
```

---

## ✅ 已确认正常的部分

- ✅ 后端 NestJS 架构规范，依赖正确
- ✅ 后端 CI 测试正常运行（`npm test -- --passWithNoTests`）
- ✅ CI 遵守"禁止在线构建"铁律（本地/CI 构建）
- ✅ GitHub Actions 触发逻辑正确（push + PR to master）
- ✅ PostgreSQL GIN 索引 + 分区优化已落地
- ✅ 腾讯云 COS 简历附件集成已实现
- ✅ 部署脚本（deploy.sh / deploy.optimized.sh）存在

---

## 🗺️ 立即修复计划

| 优先级 | 任务 | 负责人 | 预计时间 |
|--------|------|--------|---------|
| 🔴 P0-1 | 修复 CI pnpm 配置 | PM | 10 min |
| 🟡 P1-1 | 修复 CI cache 路径 | PM | 5 min |
| 🟡 P1-2 | 添加 packageManager 字段 | PM | 5 min |
| 🟢 P2-1 | 修复 CI 类型检查失败处理 | PM | 5 min |
| 🟡 P1-3 | 调研 CI 第二次失败原因 | PM | 10 min |
| 🟡 P2-2 | 创建 Bug Issue 追踪机制 | PM | 10 min |

---

*本报告由 QClaw PM Agent 生成，GitHub 授权配置中。*
