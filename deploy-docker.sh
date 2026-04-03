#!/bin/bash

# Docker 部署脚本 - 脉刻 MAIK
# 解决 OOM 问题，内存限制 512MB/服务

set -e

echo "======================================"
echo "  脉刻 MAIK Docker 部署"
echo "======================================"
echo ""

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装"
    exit 1
fi

echo "✅ Docker 已安装"
echo ""

# 停止并删除旧容器
echo "📦 停止旧容器..."
docker-compose down --remove-orphans 2>/dev/null || true

# 清理旧镜像（可选）
echo "🧹 清理无用镜像..."
docker image prune -f 2>/dev/null || true

# 构建并启动
echo ""
echo "🔨 构建镜像..."
echo "   后端内存限制: 512MB"
echo "   前端内存限制: 512MB"
echo ""

docker-compose build --no-cache

echo ""
echo "🚀 启动服务..."
docker-compose up -d

# 等待服务启动
echo ""
echo "⏳ 等待服务启动..."
sleep 10

# 检查状态
echo ""
echo "📊 服务状态:"
docker-compose ps

# 健康检查
echo ""
echo "🏥 健康检查:"
echo "   后端: $(curl -s http://localhost:3000/api/health 2>/dev/null || echo '❌ 未响应')"
echo "   前端: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3001/ 2>/dev/null && echo ' ✅' || echo ' ❌')"

echo ""
echo "======================================"
echo "  部署完成!"
echo "======================================"
echo ""
echo "访问地址:"
echo "  前端: http://150.158.51.199:3001"
echo "  后端: http://150.158.51.199:3000"
echo ""
echo "管理命令:"
echo "  查看日志: docker-compose logs -f"
echo "  停止服务: docker-compose down"
echo "  重启服务: docker-compose restart"