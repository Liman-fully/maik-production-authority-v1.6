## WorkBuddy 开发日志

### 2026-03-31 21:30 — Nova CTO 战术重构执行完毕

**任务**: 执行 Nova (CTO) 战时指令，重构 UI + 启动本地开发环境

#### UI 修改 (Nova 基准)
1. **导航栏 (navigation.tsx L113)**
   - `px-4` → `px-12`：导航栏水平内边距升级为高级感间距
   - 保留 backdrop-blur 磨砂效果和滚动感知

2. **人才卡片 (talent-card.tsx L155)**
   - `bg-card` → `bg-slate-50 border border-slate-200`：Soft-Slate 风格
   - `hover:bg-accent/30` → `hover:bg-slate-100`：柔和悬停效果

#### 环境修复
1. **SSH 隧道**: 建立 `localhost:15432` → 远端 `150.158.51.199:5432` PostgreSQL 隧道
2. **远程认证**: 修复远程 PostgreSQL 密码认证 (postgres 用户密码同步)
3. **app.module.ts**: 修复 TypeORM 环境变量映射 (DB_USER→DB_USERNAME)，增加重试次数到99
4. **后端启动**: NestJS 成功连接远程数据库，http://localhost:3000 API 200
5. **前端启动**: Next.js 16 Turbopack 模式，http://localhost:199 HTTP 200

#### 服务状态
| 服务 | 端口 | 状态 | 备注 |
|------|------|------|------|
| 后端 NestJS | 3000 | ✅ Running | 远程DB via SSH隧道 |
| 前端 Next.js | 199 | ✅ Running | Turbopack热更新 |
| SSH 隧道 | 15432 | ✅ Active | → 远端PG:5432 |

#### 注意事项
- 本机无 Docker/Homebrew/PostgreSQL，后端通过 SSH 隧道连接远程数据库
- 前端 node_modules 使用 npm（非 pnpm，因本机无 pnpm）
- node_modules 已在 .gitignore 中，不会污染 Git 索引

### 2026-03-31 21:45 — 公网生产部署完成

**任务**: 将前端部署到远端服务器，公网可访问

#### 部署步骤
1. **next.config.mjs**: 启用 `output: 'standalone'` 模式，减少部署体积至 39MB
2. **本地 Build**: `NEXT_PUBLIC_API_URL=/api next build` → standalone 输出
3. **打包上传**: `COPYFILE_DISABLE=1 tar -czf` → `scp` 到远端
4. **远端解压**: `/var/www/huntlink/frontend-standalone/standalone/`
5. **PM2 启动**: `PORT=3001 pm2 start server.js --name huntlink-frontend` (199 端口需 root 权限)
6. **Nginx 更新**: 反代 `/` → `localhost:3001`，`/api` → `localhost:3000`
7. **PM2 save**: 保存进程列表，服务器重启自动恢复

#### 公网验证
- **http://150.158.51.199** → HTTP 200 ✅
- **http://150.158.51.199/api/docs** → HTTP 200 ✅

#### 远端 PM2 服务状态
| 服务 | 端口 | 内存 | 状态 |
|------|------|------|------|
| huntlink-backend | 3000 | 112MB | ✅ online |
| huntlink-frontend | 3001 | 28MB | ✅ online |

#### 关于本机 Docker
- Nova 授权了本机 Docker，但本机尚未安装 Docker Desktop
- 当前通过 SSH 隧道方案已满足需求，Docker 可后续按需安装
