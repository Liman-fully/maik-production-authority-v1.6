# 🔱 猎脉 (Huntlink) 权威技术栈定义

## 🚨 严禁读错
- **Backend (核心)**: NestJS (TypeScript / Node.js) - 位于 /backend
- **Frontend (UI)**: React (Vite) - 位于 /frontend-dist (预编译版) / /frontend-web (源码版)
- **Database**: PostgreSQL (GIN Index Optimized)
- **Cache**: Redis (Shadow Snapshot)

## 🛡️ 关于 Workbuddy 提到的安全漏洞
- 所有的 37 个风险主要源于 npm 依赖版本。
- **Agent 执行指令**: 严禁在生产环境执行全量 npm update（防止 2G 内存溢出）。仅允许针对 Critical 漏洞进行定向补丁。
