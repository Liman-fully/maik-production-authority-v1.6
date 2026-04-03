# MAIK 自动化部署指南

## 📋 部署架构

```
GitHub (代码仓库)
    ↓ push to main
GitHub Actions (自动构建)
    ↓ SSH部署
服务器 (150.158.51.199)
    ├── PM2 (后端进程管理)
    └── Nginx (前端静态服务)
```

## 🔧 首次部署准备

### 1. 服务器环境要求

```bash
# 安装 Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2
sudo npm install -pm2 -g

# 安装 Nginx
sudo apt install nginx -y

# 安装 PostgreSQL (如果未安装)
sudo apt install postgresql postgresql-contrib -y

# 安装 Redis (如果未安装)
sudo apt install redis-server -y
```

### 2. 创建目录结构

```bash
# 创建项目目录
sudo mkdir -p /var/www/maik
sudo chown -R $USER:$USER /var/www/maik

# 克隆代码
cd /var/www/maik
git clone https://github.com/Liman-fully/maik-production-authority-v1.6.git .
```

### 3. 配置环境变量

```bash
# 创建 .env 文件
cp .env.example backend/.env
nano backend/.env

# 填写真实的数据库和 Redis 配置
```

### 4. 初始化数据库

```bash
cd /var/www/maik/backend
npm run migration:run
```

## 🚀 自动部署流程

### 配置 GitHub Secrets

在你的 GitHub 仓库中添加以下 Secrets：

1. **进入**: Settings → Secrets and variables → Actions
2. **添加 3 个 secrets**:

| Secret 名称 | 值 | 说明 |
|------------|---|------|
| `SERVER_HOST` | `150.158.51.199` | 服务器 IP |
| `SERVER_USER` | `root` | SSH 用户名 |
| `SSH_PRIVATE_KEY` | *(私钥内容)* | 见下方 |

### 获取 SSH 私钥

在 Mac 终端运行：
```bash
cat ~/.ssh/id_rsa
```

**完整复制输出内容**（包括 BEGIN 和 END 行），粘贴到 GitHub 的 `SSH_PRIVATE_KEY` secret。

## 📦 部署步骤

### 自动部署（推荐）

每次推送代码到 `main` 分支，GitHub Actions 会自动：

1. ✅ 拉取代码
2. ✅ 安装依赖
3. ✅ 构建项目
4. ✅ SSH 部署到服务器
5. ✅ 重启服务
6. ✅ 健康检查

### 手动部署

如果需要手动部署：

```bash
# 后端
./deploy-backend.sh

# 前端
./deploy-frontend.sh
```

## 🔍 常见问题

### 1. GitHub Actions 失败

**检查清单：**
- [ ] GitHub Secrets 是否正确配置
- [ ] SSH 密钥是否有效
- [ ] 服务器是否可访问

### 2. 后端启动失败

```bash
# 查看日志
pm2 logs maik-backend

# 检查端口
lsof -i :3000

# 重启服务
pm2 restart maik-backend
```

### 3. 前端 404

```bash
# 检查 Nginx 配置
sudo nginx -t

# 重启 Nginx
sudo nginx -s reload
```

## 🎯 健康检查

部署后访问：
- 后端: http://150.158.51.199:3000/api/health
- 前端: http://150.158.51.199

## 📞 联系

如有问题，检查：
1. GitHub Actions 日志
2. 服务器日志: `pm2 logs`
3. Nginx 错误日志: `/var/log/nginx/error.log`