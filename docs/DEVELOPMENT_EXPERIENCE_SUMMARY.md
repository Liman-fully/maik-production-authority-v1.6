# HuntLink 猎脉招聘平台 - 开发与测试经验总结

> **总结日期**: 2026-04-03  
> **项目**: 猎脉招聘平台 (HuntLink)  
> **技术栈**: NestJS + Next.js + PostgreSQL + Redis

---

## 一、项目概况

### 1.1 服务器配置
| 项目 | 配置 |
|------|------|
| IP | 150.158.51.199 |
| 内存 | 1.9GB (极低) |
| 磁盘 | 50GB |
| Node | v20.20.1 |
| OS | Ubuntu 6.8.0 |
| 部署工具 | PM2 (非Docker) |

### 1.2 架构拓扑
```
┌─────────────────────────────────────────────────────┐
│                     用户访问                         │
│                   150.158.51.199:80                 │
└───────────────────────┬─────────────────────────────┘
                        │
          ┌─────────────┴─────────────┐
          ↓                           ↓
    ┌─────────────┐            ┌─────────────┐
    │  Nginx 80   │            │  Nginx 80   │
    │  /api → 3000│            │    /  → 3002│
    └─────────────┘            └─────────────┘
          ↓                           ↓
┌─────────────┐            ┌─────────────────────┐
│NestJS后端   │            │ Next.js前端          │
│localhost:3000            │ localhost:3002       │
│PM2: huntlink-backend     │ PM2: huntlink-frontend│
└─────────────┘            └─────────────────────┘
          ↓                           ↓
┌─────────────┐            ┌─────────────────────┐
│PostgreSQL   │            │ 静态资源             │
│localhost:5432            │ /_next/static        │
└─────────────┘            └─────────────────────┘
          ↓
┌─────────────┐
│Redis 6379   │
└─────────────┘
```

---

## 二、开发经验

### 2.1 最优开发策略
> **核心原则**: "服务器是纯运行时，本地是完整开发环境"

| 操作 | 位置 | 原因 |
|------|------|------|
| 编码 | 本地 | 开发环境完整 |
| 编译 | 本地 | 服务器内存不足 |
| 测试 | 本地 | 调试方便 |
| 部署 | 本地→服务器 | 仅同步构建结果 |

### 2.2 前端开发 (Next.js)

#### 构建配置
```javascript
// next.config.mjs
const nextConfig = {
  output: 'standalone',     // 独立运行模式
  reactStrictMode: true,
  poweredByHeader: false,
};
```

#### 打包部署流程
```bash
# 1. 本地构建
cd frontend-web
npm run build

# 2. 打包standalone
COPYFILE_DISABLE=1 tar -czf frontend.tar.gz -C .next/standalone .

# 3. 传输到服务器
scp -i ~/Desktop/workbuddy.pem frontend.tar.gz ubuntu@150.158.51.199:/tmp/

# 4. 服务器解压
sudo tar -xzf /tmp/frontend.tar.gz -C /var/www/huntlink/frontend-standalone/frontend-web/

# 5. 重启PM2
pm2 restart huntlink-frontend
```

#### 端口选择经验
- **避免3001端口**: 经常被残留进程占用
- **推荐3002端口**: 稳定可用

### 2.3 后端开发 (NestJS)

#### 项目结构
```
backend/
├── src/
│   ├── main.ts              # 入口
│   ├── app.module.ts        # 根模块
│   └── modules/             # 功能模块
│       ├── auth/            # 认证模块
│       ├── user/            # 用户模块
│       └── talent/          # 人才模块
├── dist/                    # 编译输出
│   └── src/
│       └── main.js          # 注意路径!
├── package.json
└── ecosystem.config.js      # PM2配置
```

#### 编译注意事项
```bash
# 每次编译前必须清理缓存
rm -f dist/tsconfig.tsbuildinfo
rm -rf dist
npm run build
```

#### PM2配置关键点
```javascript
module.exports = {
  apps: [{
    name: 'huntlink-backend',
    script: './current/dist/src/main.js',  // 必须是这个路径
    cwd: '/var/www/huntlink/backend',     // 不能指向current
    
    instances: 1,        // 必须为1
    exec_mode: 'fork',   // 禁止cluster
    
    env_production: {    // 环境变量必须内置
      NODE_ENV: 'production',
      JWT_SECRET: 'xxx',
      DB_HOST: 'localhost',
      // ...
    }
  }]
};
```

---

## 三、测试经验

### 3.1 API测试

#### 认证API测试
```bash
# 注册
curl -X POST http://150.158.51.199/api/auth/register/account \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"测试","password":"Test123456","role":"seeker"}'

# 登录
curl -X POST http://150.158.51.199/api/auth/login/account \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test@example.com","password":"Test123456"}'

# 人才列表
curl http://150.158.51.199/api/talents
```

#### 响应时间基准
| 端点 | 响应时间 | 状态 |
|------|----------|------|
| 首页 | < 1s | ✅ |
| 登录页 | < 1s | ✅ |
| 人才API | < 0.7s | ✅ |

### 3.2 排查问题命令

| 问题 | 命令 |
|------|------|
| PM2状态 | `pm2 status` |
| PM2日志 | `pm2 logs --lines 20` |
| 端口占用 | `ss -tlnp \| grep 3000` |
| 进程检查 | `ps aux \| grep node` |
| Nginx日志 | `sudo tail -20 /var/log/nginx/error.log` |
| 健康检查 | `curl http://localhost:3000/api/health` |

---

## 四、常见问题与解决方案

### 4.1 问题汇总

| # | 问题 | 原因 | 解决方案 |
|---|------|------|----------|
| 1 | 端口3001被占用 | 残留root进程 | 改用3002端口 |
| 2 | ecosystem.config.js损坏 | Git冲突标记 | 删除`<<<<<<< HEAD`标记 |
| 3 | PM2启动失败 | cwd路径错误 | 指向/backend而非/current |
| 4 | 数据库字段不存在 | 迁移未执行 | 手动执行SQL迁移 |
| 5 | bcrypt模块找不到 | 依赖未安装 | 服务器执行npm install |
| 6 | 编译OOM | 服务器内存不足 | 本地构建，只传dist |

### 4.2 数据库迁移
```bash
# 1. 准备迁移脚本
# 2. 传输到服务器
scp migration.sql ubuntu@150.158.51.199:/tmp/

# 3. 执行迁移
PGPASSWORD=huntlink_safe_2026 psql -h localhost -U huntlink -d huntlink -f /tmp/migration.sql

# 4. 验证
PGPASSWORD=huntlink_safe_2026 psql -h localhost -U huntlink -d huntlink -c '\d users'
```

---

## 五、部署 Checklist

### 部署前
- [ ] 代码已提交Git
- [ ] 本地测试通过
- [ ] 编译缓存已清理
- [ ] 依赖已更新到package.json

### 部署中
- [ ] 本地执行构建
- [ ] 打包构建结果
- [ ] 传输到服务器
- [ ] 执行数据库迁移（如需要）
- [ ] 重启PM2服务

### 部署后
- [ ] PM2状态正常
- [ ] API响应正常
- [ ] 前端页面正常
- [ ] 日志无错误

---

## 六、关键路径速查

### 服务器路径
| 项目 | 路径 |
|------|------|
| 后端入口 | `/var/www/huntlink/backend/current/dist/src/main.js` |
| 前端standalone | `/var/www/huntlink/frontend-standalone/frontend-web/huntlink-new/frontend-web/server.js` |
| PM2配置 | `/var/www/huntlink/backend/ecosystem.config.js` |
| Nginx配置 | `/etc/nginx/sites-enabled/huntlink` |
| 日志目录 | `/var/www/huntlink/backend/current/logs/` |

### 本地路径
| 项目 | 路径 |
|------|------|
| 后端源码 | `/Users/liman/WorkBuddy/Claw/huntlink-new/backend/` |
| 前端源码 | `/Users/liman/WorkBuddy/Claw/huntlink-new/frontend-web/` |
| 开发文档 | `/Users/liman/WorkBuddy/Claw/huntlink-new/docs/development-strategy.md` |

---

## 七、已修复的Bug

| Bug | 问题 | 状态 |
|-----|------|------|
| #001 | 数据空洞 (无简历数据) | ✅ 1034条数据已注入 |
| #002 | UI版本过期 (验证码登录) | ✅ 账号密码登录已实现 |
| #003 | Auth接口断裂 | ✅ 已修复 |
| #004 | 路由代理错误 | ✅ Nginx配置已修正 |
| #005 | 品牌名称混用 | ✅ 统一为"脉刻MAIK" |
| #006 | 导航文案 | ✅ 已修复 |

---

## 八、经验教训

### 8.1 教训
1. **禁止服务器编译**: 2GB内存无法编译Next.js/NestJS
2. **禁止服务器git pull**: 可能拉取错误版本
3. **禁止多版本共存**: 保留旧版本导致管理混乱
4. **环境变量内置**: 不要依赖.env文件

### 8.2 最佳实践
1. **本地完整测试**: 确保代码可用再部署
2. **单版本覆盖**: 每次部署直接覆盖，不保留历史
3. **自动化部署**: 使用脚本减少手动操作
4. **及时日志检查**: 部署后立即检查日志

---

**维护者**: 高级开发者团队  
**下次审查**: 2026-04-10