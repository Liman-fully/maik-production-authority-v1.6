#!/bin/bash
# 猎脉项目部署脚本
# 使用方法：在腾讯轻量云上运行 bash deploy.sh

set -e

echo "========================================="
echo "猎脉 HuntLink 部署脚本"
echo "========================================="

# 配置
DEPLOY_DIR="/var/www/huntlink"
BACKUP_DIR="/var/www/huntlink-backup-$(date +%Y%m%d-%H%M%S)"

echo "部署目录：$DEPLOY_DIR"
echo "备份目录：$BACKUP_DIR"

# 1. 检查 Docker
echo ""
echo "[1/6] 检查 Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi
echo "✅ Docker 已安装"

# 2. 检查 Docker Compose
echo ""
echo "[2/6] 检查 Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装"
    exit 1
fi
echo "✅ Docker Compose 已安装"

# 3. 备份现有部署
if [ -d "$DEPLOY_DIR" ]; then
    echo ""
    echo "[3/6] 备份现有部署..."
    cp -r "$DEPLOY_DIR" "$BACKUP_DIR"
    echo "✅ 已备份到 $BACKUP_DIR"
else
    echo ""
    echo "[3/6] 首次部署，无需备份"
    mkdir -p "$DEPLOY_DIR"
fi

# 4. 拉取最新代码
echo ""
echo "[4/6] 拉取最新代码..."
cd "$DEPLOY_DIR"

if [ -d ".git" ]; then
    echo "检测到已有仓库，执行 git pull..."
    git pull origin master
else
    echo "克隆仓库..."
    # 注意：这里需要配置 SSH 密钥或使用 Token
    git clone https://github.com/Liman-fully/huntlink.git .
fi
echo "✅ 代码已更新"

# 5. 配置环境变量
echo ""
echo "[5/6] 配置环境变量..."

if [ ! -f "backend/.env" ]; then
    echo "创建 backend/.env..."
    cp backend/.env.example backend/.env
    
    # 请修改以下配置
    echo ""
    echo "⚠️  请编辑 backend/.env 配置数据库连接："
    echo "    DATABASE_HOST=localhost"
    echo "    DATABASE_USER=root"
    echo "    DATABASE_PASSWORD=你的数据库密码"
    echo "    DATABASE_NAME=huntlink"
    echo ""
    read -p "按回车继续..."
else
    echo "✅ backend/.env 已存在"
fi

if [ ! -f "frontend-web/.env" ]; then
    echo "创建 frontend-web/.env..."
    cp frontend-web/.env.example frontend-web/.env
    echo "✅ frontend-web/.env 已创建"
fi

# 6. 构建并启动
echo ""
echo "[6/6] 构建并启动服务..."
docker-compose down
docker-compose up -d --build

echo ""
echo "========================================="
echo "✅ 部署完成！"
echo "========================================="
echo ""
echo "服务状态检查："
echo "  docker-compose ps"
echo ""
echo "查看日志："
echo "  docker-compose logs -f"
echo ""
echo "访问地址："
echo "  前端：http://150.158.51.199"
echo "  后端：http://150.158.51.199:3000"
echo ""
