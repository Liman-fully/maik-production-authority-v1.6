#!/bin/bash
# Redis 部署脚本
# 用途：部署和验证 Redis 服务

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "========================================="
echo "🔴 Redis 部署脚本"
echo "========================================="
echo ""

# 检查 docker-compose.yml 是否存在
if [ ! -f "$PROJECT_ROOT/docker-compose.yml" ]; then
    echo "❌ 错误：docker-compose.yml 不存在"
    echo "   路径：$PROJECT_ROOT/docker-compose.yml"
    exit 1
fi

# 检查 Redis 服务配置
echo "📋 检查 Redis 服务配置..."
if grep -q "redis:" "$PROJECT_ROOT/docker-compose.yml"; then
    echo "✅ Redis 服务配置已存在"
else
    echo "❌ Redis 服务配置不存在"
    echo "   请确保 docker-compose.yml 中包含 Redis 服务定义"
    exit 1
fi

# 检查 Redis 镜像
echo ""
echo "📦 检查 Redis 镜像..."
if docker images redis:7-alpine --format '{{.Repository}}:{{.Tag}}' | grep -q "redis:7-alpine"; then
    echo "✅ Redis 镜像已存在"
else
    echo "⬇️  拉取 Redis 镜像..."
    docker pull redis:7-alpine
fi

# 启动 Redis 服务
echo ""
echo "🚀 启动 Redis 服务..."
cd "$PROJECT_ROOT"
docker-compose up -d redis

# 等待服务启动
echo ""
echo "⏳ 等待服务启动..."
sleep 5

# 验证 Redis 服务
echo ""
echo "🔍 验证 Redis 服务..."
if docker-compose ps | grep -q "huntlink-redis"; then
    echo "✅ Redis 容器已启动"
else
    echo "❌ Redis 容器启动失败"
    docker-compose logs redis
    exit 1
fi

# 检查健康状态
echo ""
echo "🏥 检查健康状态..."
HEALTH_STATUS=$(docker inspect --format='{{.State.Health.Status}}' huntlink-redis 2>/dev/null || echo "unknown")
if [ "$HEALTH_STATUS" = "healthy" ] || [ "$HEALTH_STATUS" = "unknown" ]; then
    echo "✅ Redis 健康检查通过 (状态：$HEALTH_STATUS)"
else
    echo "⚠️  Redis 健康检查状态：$HEALTH_STATUS"
fi

# 测试 Redis 连接
echo ""
echo "🔌 测试 Redis 连接..."
if docker exec huntlink-redis redis-cli ping | grep -q "PONG"; then
    echo "✅ Redis 连接测试成功 (PONG)"
else
    echo "❌ Redis 连接测试失败"
    exit 1
fi

# 显示 Redis 信息
echo ""
echo "📊 Redis 信息:"
docker exec huntlink-redis redis-cli INFO server | grep -E "^(redis_version|tcp_port|process_id)"

echo ""
echo "========================================="
echo "✅ Redis 部署完成！"
echo "========================================="
echo ""
echo "连接信息:"
echo "  - 主机：localhost"
echo "  - 端口：6379"
echo "  - 容器：huntlink-redis"
echo ""
echo "常用命令:"
echo "  - 进入容器：docker exec -it huntlink-redis redis-cli"
echo "  - 查看日志：docker-compose logs -f redis"
echo "  - 重启服务：docker-compose restart redis"
echo ""
