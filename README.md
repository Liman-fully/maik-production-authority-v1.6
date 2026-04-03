# 🔱 猎脉 (Huntlink) 招聘平台

本项目是一个基于 NestJS (后端) 与 React (前端) 构建的全栈自动化招聘引擎。专为极低资源环境 (2G RAM / 50G Disk) 优化，集成了高感知的全文搜索与云原生附件管理。

## 🚀 核心架构与上线关键 (The Golden Rules)

基于历史审计与 2G 内存实战，本仓库严格遵守以下“生产铁律”：

1. **禁止在线构建**：严禁在生产服务器执行 `npm run build`。必须在 CI/CD 完成编译，打包 `release.tar.gz` 后分发。
2. **内存配额**：Node 程序必须设置内存限制 `NODE_OPTIONS="--max-old-space-size=1536"`。
3. **云存储优先**：简历原件强制走腾讯云 COS 预签名直传，后端仅处理字符串元数据。
4. **数据库索引**：利用 PostgreSQL GIN 索引驱动全文搜索，严禁 `LIKE '%keyword%'`。

## 🛠 快速开始

### 后端 (Backend)
```bash
cd backend
npm install
npm run start:dev
```

### 前端 (Frontend)
```bash
cd frontend-web
npm install
npm run dev
```

## 🛡 维护手册
关于部署、数据库迁移及 API 映射的详细指南，请参阅 `docs/` 目录下的相关文件。
