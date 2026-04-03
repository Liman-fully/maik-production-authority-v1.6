# 猎脉项目部署指南

**服务器**: 腾讯轻量云 150.158.51.199  
**部署时间**: 2026-03-27  
**数据库**: PostgreSQL 16  
**状态**: 🟡 Bug 修复中（BUG-001~007）

---

## 📋 部署方式

### 方式一：Docker Compose 部署（推荐）

#### 1. SSH 登录服务器
```bash
ssh root@150.158.51.199
# 输入密码：]p85Nyx|9v.B[V
```

#### 2. 安装必要工具（如果还没有）
```bash
# 安装 Git
apt update && apt install -y git

# 安装 Docker
curl -fsSL https://get.docker.com | sh

# 安装 Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

#### 3. 克隆项目
```bash
mkdir -p /var/www/huntlink
cd /var/www/huntlink
git clone https://github.com/Liman-fully/huntlink.git .
```

#### 4. 配置环境变量
```bash
# 后端环境
cp backend/.env.example backend/.env
# 编辑 backend/.env 配置数据库密码和 COS 密钥

# 前端环境
cp frontend-web/.env.example frontend-web/.env
```

#### 5. 启动服务
```bash
docker-compose up -d
```

#### 6. 验证部署
```bash
# 查看容器状态
docker-compose ps

# 查看后端日志
docker-compose logs backend

# 查看前端日志
docker-compose logs frontend

# 查看 PostgreSQL 日志
docker-compose logs postgres

# 测试后端 API
curl http://localhost:3000/api/health

# 测试前端
curl http://localhost
```

---

### 方式二：GitHub Actions 自动部署

#### 1. 配置 GitHub Secrets
访问：https://github.com/Liman-fully/huntlink/settings/secrets/actions

添加以下 Secrets：
- `SERVER_HOST`: `150.158.51.199`
- `SERVER_USER`: `root`
- `SERVER_SSH_KEY`: [SSH 私钥内容]
- `POSTGRES_PASSWORD`: [PostgreSQL 密码]
- `JWT_SECRET`: [JWT 密钥]
- `COS_SECRET_ID`: [腾讯云 COS SecretId]
- `COS_SECRET_KEY`: [腾讯云 COS SecretKey]

#### 2. 配置 SSH 密钥认证
在服务器上执行：
```bash
mkdir -p ~/.ssh
# 将 GitHub Actions 的公钥添加到 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

#### 3. 触发部署
推送代码到 master 分支会自动触发部署。

---

## 🔧 PostgreSQL 数据库配置

### 使用 Docker Compose 自动创建（推荐）

PostgreSQL 16 容器会自动创建：
- 数据库：huntlink
- 用户：huntlink
- 密码：从环境变量读取

### 手动配置（如果需要）

```bash
# 登录 PostgreSQL
docker-compose exec postgres psql -U huntlink -d huntlink

# 创建数据库（如果还未创建）
CREATE DATABASE huntlink;

# 创建用户（如果还未创建）
CREATE USER huntlink WITH PASSWORD 'huntlink_user_password_2026';
GRANT ALL PRIVILEGES ON DATABASE huntlink TO huntlink;

# 初始化扩展（搜索功能需要）
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
```

### 数据库初始化脚本

```bash
# 运行 TypeORM 迁移
docker-compose exec backend npx typeorm migration:run

# 或者使用初始化脚本
docker-compose exec backend npx ts-node scripts/init-database.ts
```

---

## 🔧 腾讯云 COS 配置

### 获取密钥

1. 访问：https://console.cloud.tencent.com/cam/capi
2. 登录腾讯云账号
3. 点击「访问管理」→「访问密钥」
4. 点击「新建密钥」
5. 复制 SecretId 和 SecretKey

### 配置环境变量

编辑 `backend/.env`：
```bash
COS_SECRET_ID=AKIDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
COS_SECRET_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
COS_BUCKET=huntlink-1306109984
COS_REGION=ap-guangzhou
COS_DOMAIN=huntlink-1306109984.cos.ap-guangzhou.myqcloud.com
```

### 测试 COS 连接

```bash
docker-compose exec backend npx ts-node scripts/test-cos-connection.ts
```

---

## 🚀 常用命令

### 查看服务状态
```bash
docker-compose ps
```

### 查看日志
```bash
# 所有服务
docker-compose logs -f

# 单个服务
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
docker-compose logs redis  # Redis 部署后
```

### 重启服务
```bash
docker-compose restart
```

### 重新部署
```bash
cd /var/www/huntlink
git pull origin master
docker-compose down
docker-compose up -d --build
```

### 数据库操作
```bash
# 进入 PostgreSQL
docker-compose exec postgres psql -U huntlink -d huntlink

# 备份数据库
docker-compose exec postgres pg_dump -U huntlink huntlink > backup-$(date +%Y%m%d).sql

# 恢复数据库
docker-compose exec -T postgres psql -U huntlink huntlink < backup-20260328.sql
```

### Redis 操作（部署后）
```bash
# 进入 Redis
docker-compose exec redis redis-cli

# 查看缓存
docker-compose exec redis redis-cli KEYS "*"
```

---

## 🔍 健康检查

### 后端健康检查
```bash
curl http://150.158.51.199:3000/api/health
```

### 前端健康检查
```bash
curl http://150.158.51.199
```

### PostgreSQL 连接检查
```bash
docker-compose exec postgres psql -U huntlink -d huntlink -c "SELECT version();"
```

### Redis 连接检查（部署后）
```bash
docker-compose exec redis redis-cli ping
# 预期输出：PONG
```

### 运行健康检查脚本
```bash
./scripts/health-check.sh
```

---

## ⚠️ 故障排查

### 后端无法启动
```bash
# 查看日志
docker-compose logs backend

# 检查数据库连接
docker-compose exec backend ping postgres

# 检查环境变量
docker-compose exec backend env | grep DB_
```

### 前端无法访问
```bash
# 检查 Nginx 配置
docker-compose exec frontend nginx -t

# 查看日志
docker-compose logs frontend
```

### PostgreSQL 连接失败
```bash
# 检查 PostgreSQL 状态
docker-compose ps postgres

# 测试连接
docker-compose exec postgres psql -U huntlink -d huntlink -c "SELECT 1;"

# 查看 PostgreSQL 日志
docker-compose logs postgres
```

### Redis 连接失败（部署后）
```bash
# 检查 Redis 状态
docker-compose ps redis

# 测试连接
docker-compose exec redis redis-cli ping

# 查看 Redis 日志
docker-compose logs redis
```

---

## 📊 部署状态

| 组件 | 状态 | 端口 | 说明 |
|------|------|------|------|
| PostgreSQL | 🟡 待验证 | 5432 | 数据库 |
| Backend | 🟡 待验证 | 3000 | NestJS 后端 |
| Frontend | 🟡 待验证 | 80 | React 前端 |
| Redis | ⏳ 待部署 | 6379 | 缓存/会话 |

**当前状态说明**:
- 🟢 运行正常
- 🟡 待验证（Bug 修复中）
- ⏳ 待部署

---

## 🔐 安全建议

### 1. 修改默认密码
- PostgreSQL 密码：修改 `POSTGRES_PASSWORD`
- JWT_SECRET：使用强随机字符串
- 服务器 SSH 密码：建议改用 SSH 密钥

### 2. 配置防火墙
```bash
# 只开放必要端口
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS (如果需要)
ufw allow 3000/tcp  # API (开发环境)
ufw enable
```

### 3. 配置 HTTPS（推荐）
- 使用 Let's Encrypt 免费证书
- 配置 Nginx SSL
- 强制 HTTPS 重定向

### 4. 密钥管理
- 生产环境使用 GitHub Secrets
- 不要将 `.env` 文件提交到 Git
- 定期轮换密钥

### 5. 定期备份
```bash
# 数据库备份（每日）
./scripts/backup-db.sh

# 备份到 COS
./scripts/backup-to-cos.sh
```

---

## 📋 部署检查清单

### 部署前
- [ ] 服务器已准备（2G+ 内存，20G+ 磁盘）
- [ ] Docker 和 Docker Compose 已安装
- [ ] Git 已安装
- [ ] 域名已解析（如果需要）

### 部署中
- [ ] 代码已克隆
- [ ] 环境变量已配置
- [ ] Docker 容器已启动
- [ ] 所有服务健康检查通过

### 部署后
- [ ] 后端 API 可访问
- [ ] 前端页面可访问
- [ ] PostgreSQL 连接正常
- [ ] Redis 连接正常（部署后）
- [ ] COS 上传测试通过
- [ ] 备份脚本测试通过

---

## 📞 联系支持

| 事项 | 联系人 |
|------|--------|
| 部署问题 | @都统 |
| 数据库问题 | @右护法 |
| 前端问题 | @都统 |
| 后端问题 | @右护法 |
| 协调问题 | @左护法 |

---

**部署完成时间**: [待填写]  
**部署者**: 左护法 AI 团队  
**最后更新**: 2026-03-28 23:40  
**文档状态**: 🟡 Bug 修复中（BUG-004 已修复）
