# 猎脉招聘平台 - 开发最优策略方案

> **制定日期**: 2026-04-02
> **适用版本**: HuntLink v2.0+
> **作者**: 高级开发者团队

---

## 一、问题诊断总结

### 🔍 已发现的关键问题

| 问题类型 | 具体表现 | 根因分析 |
|---------|---------|---------|
| **编译结构混乱** | 服务器有7个旧版本releases | 缺乏版本管理，本地多版本并存 |
| **PM2配置错误** | 一直运行旧版本dist/src/main.js | 脚本路径cwd配置不一致 |
| **环境变量缺失** | JWT_SECRET无法加载 | PM2未正确传递env_production |
| **数据库未迁移** | column User.email does not exist | 迁移脚本未在服务器执行 |
| **依赖版本差异** | bcrypt module not found | 服务器node_modules是旧版本 |
| **路由前缀混乱** | /api vs /auth 不统一 | Nginx和后端GlobalPrefix不一致 |
| **导入位置错误** | Length before initialization | TypeScript编译顺序问题 |
| **TS编译缓存** | 引用dist/src/*.ts文件 | tsconfig.tsbuildinfo残留 |

### 📊 资源限制

- **服务器内存**: 1.9GB RAM（极低）
- **磁盘空间**: 50GB
- **Node版本**: v20.20.1
- **PM2模式**: 必须使用 `fork`（禁止 cluster）

---

## 二、最优开发策略

### 🎯 核心理念

> **"服务器是纯运行时，本地是完整开发环境"**

```
┌─────────────────────────────────────────────────────────────┐
│                     本地开发环境                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │ 编码    │→ │ 编译    │→ │ 测试    │→ │ 打包    │       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
│       ↑                                              ↓      │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │ Git版本  │  │ Lint   │  │ 单元测试 │  │ tar.gz  │       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ scp上传
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                     服务器运行环境                           │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │ 解压覆盖 │→ │ npm install│→ │ PM2重启 │→ │ 冒烟测试 │       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
│                         │                  ↓                │
│                   ┌─────────┐      ┌─────────┐             │
│                   │ node_   │      │ Nginx   │             │
│                   │ modules │      │ 验证    │             │
│                   └─────────┘      └─────────┘             │
└─────────────────────────────────────────────────────────────┘
```

---

## 三、标准化部署流程

### 📋 部署前检查清单

```bash
# 1. 代码检查
- [ ] 代码已提交Git
- [ ] 已清理 tsconfig.tsbuildinfo
- [ ] dist目录已清空重新编译

# 2. 数据库检查
- [ ] 迁移脚本已准备
- [ ] 已在本地测试迁移

# 3. 依赖检查
- [ ] package.json已更新
- [ ] 新增依赖已记录

# 4. 配置检查
- [ ] 环境变量已写入ecosystem.config.js
- [ ] PM2配置已同步
- [ ] Nginx配置已检查
```

### 🔧 标准部署命令序列

```bash
#!/bin/bash
# deploy.sh - 标准部署脚本

set -e

BACKEND_DIR="/Users/liman/WorkBuddy/Claw/huntlink-new/backend"
SERVER_IP="150.158.51.199"
REMOTE_DIR="/var/www/huntlink/backend"
PACKAGE_FILE="/tmp/deploy-package.tar.gz"

echo "=== 1. 清理编译缓存 ==="
cd $BACKEND_DIR
rm -f dist/tsconfig.tsbuildinfo
rm -rf dist

echo "=== 2. 编译后端 ==="
npm run build

echo "=== 3. 打包编译结果 ==="
COPYFILE_DISABLE=1 tar -czf $PACKAGE_FILE dist/

echo "=== 4. 上传到服务器 ==="
scp -i ~/Desktop/workbuddy.pem $PACKAGE_FILE ubuntu@$SERVER_IP:/tmp/

echo "=== 5. 服务器解压覆盖 ==="
ssh -i ~/Desktop/workbuddy.pem ubuntu@$SERVER_IP "
    sudo rm -rf $REMOTE_DIR/current/dist
    sudo tar -xzf /tmp/deploy-package.tar.gz -C $REMOTE_DIR/current/
    sudo chown -R ubuntu:ubuntu $REMOTE_DIR/current/dist
"

echo "=== 6. 安装新依赖 ==="
scp -i ~/Desktop/workbuddy.pem $BACKEND_DIR/package.json ubuntu@$SERVER_IP:/tmp/
ssh -i ~/Desktop/workbuddy.pem ubuntu@$SERVER_IP "
    sudo mv /tmp/package.json $REMOTE_DIR/package.json
    cd $REMOTE_DIR && npm install --production
"

echo "=== 7. 执行数据库迁移（如需要） ==="
ssh -i ~/Desktop/workbuddy.pem ubuntu@$SERVER_IP "
    PGPASSWORD=huntlink_safe_2026 psql -h localhost -U huntlink -d huntlink -f /tmp/migration.sql
"

echo "=== 8. 重启PM2 ==="
ssh -i ~/Desktop/workbuddy.pem ubuntu@$SERVER_IP "
    pm2 delete all 2>/dev/null || true
    lsof -ti:3000 | xargs -r kill -9 2>/dev/null || true
    sleep 2
    cd $REMOTE_DIR && pm2 start ecosystem.config.js --env production
    sleep 5
"

echo "=== 9. 冒烟测试 ==="
ssh -i ~/Desktop/workbuddy.pem ubuntu@$SERVER_IP "
    curl -s http://localhost:3000/api/health
"

echo "=== 部署完成 ==="
```

---

## 四、服务器环境管理规范

### 🗂️ 服务器目录结构（精简版）

```
/var/www/huntlink/
├── backend/
│   ├── current/              # 软链接指向最新版本
│   │   ├── dist/            # 编译输出 (NestJS: dist/src/main.js)
│   │   └── logs/            # PM2日志
│   ├── node_modules/        # 生产依赖 (通过npm install安装)
│   ├── package.json         # 依赖清单
│   ├── ecosystem.config.js  # PM2配置
│   └── .env                 # 环境变量备份
├── frontend/
│   ├── .next/               # Next.js构建
│   └── package.json
└── (无releases目录，禁止多版本共存)
```

### ⚠️ 服务器禁止操作

| 禁止项 | 原因 | 替代方案 |
|--------|------|----------|
| 禁止 `npm run build` | 2G内存无法编译 | 本地编译后上传 |
| 禁止 `git pull` | 可能拉取错误版本 | 本地测试后上传 |
| 禁止 releases 多版本 | 占用磁盘，管理混乱 | 单版本覆盖 |
| 禁止 `pm2 stop/start` | 可能误操作 | 使用 `pm2 restart` |
| 禁止热更新文件 | 可能破坏一致性 | 整体打包部署 |

---

## 五、后端开发规范

### 📁 NestJS项目结构

```
backend/
├── src/
│   ├── main.ts              # 入口文件
│   ├── app.module.ts        # 根模块
│   └── modules/             # 功能模块
│       ├── auth/
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   └── dto/         # DTO必须在文件顶部导入
│       ├── user/
│       └── job/
├── dist/                    # 编译输出
│   └── src/
│       └── main.js          # 注意：NestJS输出是dist/src/main.js
├── scripts/
│   └── migrations/          # 数据库迁移脚本
├── package.json
└── tsconfig.json
```

### ⚡ 编译注意事项

1. **DTO导入位置**
   ```typescript
   // ✅ 正确：所有导入在文件顶部
   import { IsString, Length } from 'class-validator';

   @DtoClass()
   export class MyDto {
     @Length(1, 100)  // Length已导入
     name: string;
   }

   // ❌ 错误：导入在文件末尾
   @DtoClass()
   export class MyDto {
     @Length(1, 100)
     name: string;
   }
   import { Length } from 'class-validator';  // 这会导致编译错误
   ```

2. **每次编译前清理缓存**
   ```bash
   rm -f dist/tsconfig.tsbuildinfo
   rm -rf dist
   npm run build
   ```

3. **编译输出路径**
   - NestJS默认输出：`dist/src/main.js`
   - 不是 `dist/main.js`

---

## 六、PM2配置模板

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'huntlink-backend',
      // 关键：cwd是/backend，不是/backend/current
      script: './current/dist/src/main.js',
      cwd: '/var/www/huntlink/backend',
      
      instances: 1,           // 必须为1（服务器内存限制）
      exec_mode: 'fork',     // 必须用fork，禁止cluster
      
      max_memory_restart: '1500M',
      kill_timeout: 30000,
      
      // 关键：环境变量必须在这里设置
      env_production: {
        NODE_ENV: 'production',
        NODE_OPTIONS: '--max-old-space-size=1536',
        
        // JWT配置
        JWT_SECRET: 'huntlink-jwt-secret-key-2026-change-in-production',
        JWT_EXPIRATION: '7d',
        
        // 数据库配置
        DB_HOST: 'localhost',
        DB_PORT: 5432,
        DB_USERNAME: 'huntlink',
        DB_PASSWORD: 'huntlink_safe_2026',
        DB_DATABASE: 'huntlink',
        
        // Redis配置
        REDIS_HOST: 'localhost',
        REDIS_PORT: 6379,
        
        // 服务端口
        PORT: 3000,
      },
      
      // 日志配置
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      merge_logs: true,
      
      // 重启策略
      max_restarts: 10,
      restart_delay: 5000,
      autorestart: true,
    },
  ],
};
```

---

## 七、Nginx配置模板

```nginx
server {
    listen 80;
    server_name 150.158.51.199;

    # API请求 - 去掉/api前缀
    location /api {
        rewrite ^/api(.*)$ $1 break;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Next.js静态资源缓存
    location /_next/static {
        proxy_pass http://localhost:3001;
        proxy_cache_valid 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Next.js应用
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 八、数据库迁移规范

### 📋 迁移脚本模板

```sql
-- migrations/YYYY-MM-DD-feature-name.sql

-- 1. 检查字段是否存在
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'email'
    ) THEN
        -- 2. 添加字段
        ALTER TABLE users ADD COLUMN email VARCHAR(255);
        
        -- 3. 添加索引（如需要）
        CREATE UNIQUE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;
    END IF;
END $$;

-- 4. 注释说明
COMMENT ON COLUMN users.email IS '用户邮箱，用于账号密码登录';

-- 5. 回滚脚本（可选）
-- ALTER TABLE users DROP COLUMN IF EXISTS email;
```

### 🚀 迁移执行流程

```bash
# 1. 本地准备迁移脚本
# 2. 测试迁移（本地数据库）
# 3. 上传迁移脚本
scp migration.sql ubuntu@150.158.51.199:/tmp/

# 4. 服务器执行
ssh ubuntu@150.158.51.199 "
    PGPASSWORD=huntlink_safe_2026 psql -h localhost -U huntlink -d huntlink -f /tmp/migration.sql
"

# 5. 验证
ssh ubuntu@150.158.51.199 "
    PGPASSWORD=huntlink_safe_2026 psql -h localhost -U huntlink -d huntlink -c '\d users'
"
```

---

## 九、依赖管理规范

### 📦 package.json管理

```json
{
  "name": "huntlink-backend",
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "bcrypt": "^5.1.0",           // 新增依赖必须记录
    "class-validator": "^0.14.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.0",
    "pg": "^8.11.0",
    "redis": "^4.6.0",
    "typeorm": "^0.3.0"
  }
}
```

### ⚠️ 依赖更新流程

1. 本地 `npm install <package>` 添加依赖
2. 更新 `package.json`
3. 本地测试通过
4. 部署时上传新 `package.json`
5. 服务器执行 `npm install --production`
6. 重启PM2

---

## 十、调试与排错

### 🔍 常见问题快速排查

| 问题现象 | 排查命令 | 解决方案 |
|---------|---------|---------|
| 500错误 | `pm2 logs --lines 50` | 检查错误日志 |
| 404错误 | `curl localhost:3000/api/health` | 检查路由前缀 |
| 模块找不到 | `ls node_modules/<package>` | npm install |
| 端口占用 | `lsof -ti:3000` | kill掉旧进程 |
| 数据库错误 | 检查.env和PGPASSWORD | 验证连接参数 |
| 环境变量 | `pm2 env 0 \| grep JWT` | 检查ecosystem.config.js |

### 📊 健康检查端点

```bash
# 本地健康检查
curl http://localhost:3000/api/health

# 远程健康检查
curl http://150.158.51.199/api/auth/login/account -X POST -d '{}'

# PM2状态检查
ssh ubuntu@150.158.51.199 "pm2 status"
```

---

## 十一、开发工作流

### 📈 日常开发流程

```
┌─────────────────────────────────────────────────────────────┐
│                     本地开发                                 │
│                                                              │
│  1. 创建功能分支                                             │
│     git checkout -b feature/new-feature                     │
│                                                              │
│  2. 开发功能                                                 │
│     - 修改代码                                               │
│     - 本地测试                                               │
│                                                              │
│  3. 提交代码                                                 │
│     git add . && git commit -m "feat: add new feature"      │
│                                                              │
│  4. 合并到主分支                                             │
│     git checkout main && git merge feature/new-feature      │
│                                                              │
│  5. 推送                                                     │
│     git push origin main                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     部署                                     │
│                                                              │
│  1. 执行部署脚本                                             │
│     ./deploy.sh                                              │
│                                                              │
│  2. 冒烟测试                                                 │
│     - API测试                                               │
│     - 页面测试                                               │
│                                                              │
│  3. 完成                                                     │
└─────────────────────────────────────────────────────────────┘
```

### ⏱️ 部署频率建议

| 场景 | 频率 | 说明 |
|------|------|------|
| 紧急修复 | 立即 | 修复后立即部署 |
| 小功能 | 每日 | 每天结束时部署 |
| 大功能 | 每周 | 每周集中部署 |

---

## 十二、文件清单

### ✅ 必需文件

```
项目根目录/
├── backend/
│   ├── package.json              # 依赖清单
│   ├── tsconfig.json             # TypeScript配置
│   ├── nest-cli.json             # NestJS CLI配置
│   ├── ecosystem.config.js       # PM2配置（重要！）
│   └── src/
│       ├── main.ts
│       └── modules/
├── frontend/
│   ├── package.json
│   └── src/
├── scripts/
│   └── migrations/               # 数据库迁移脚本
├── deploy.sh                      # 部署脚本
└── docs/
    └── development-strategy.md    # 本文档
```

### 📄 ecosystem.config.js（服务器专用）

此文件必须在服务器上有完整配置，每次部署前检查是否需要更新。

---

## 十三、总结

### 🎯 核心原则

1. **服务器只运行**：不需要开发工具
2. **本地完整开发**：编码→编译→测试→打包
3. **一键部署**：通过脚本自动化
4. **单版本覆盖**：不保留历史版本
5. **环境变量内置**：PM2配置中直接设置

### 📋 关键路径

| 项目 | 路径 |
|------|------|
| 后端入口 | `/var/www/huntlink/backend/current/dist/src/main.js` |
| PM2配置 | `/var/www/huntlink/backend/ecosystem.config.js` |
| 日志 | `/var/www/huntlink/backend/current/logs/` |
| node_modules | `/var/www/huntlink/backend/node_modules/` |

---

**版本**: 1.0  
**更新日期**: 2026-04-02  
**下次审查**: 2026-04-09
