#!/bin/bash
# 2G RAM 生产部署优化脚本
# 禁止在生产环境编译，仅运行 dist

echo "Starting HuntLink V3.7 Deployment..."

# 1. 环境准备
docker-compose down
echo "Optimizing Redis memory limits..."
docker run --rm redis redis-cli -h redis-server CONFIG SET maxmemory 256mb
docker run --rm redis redis-cli -h redis-server CONFIG SET maxmemory-policy allkeys-lru

# 2. 后端部署 (使用 pre-built 镜像)
echo "Deploying Backend (Max Memory: 1G)..."
docker-compose up -d backend
docker exec huntlink-backend pm2 restart all --max-memory-restart 1G

# 3. 前端部署
echo "Deploying Frontend (Nginx Static)..."
docker-compose up -d frontend

# 4. 最终检查
echo "Verifying Task Status..."
./huntlink/scripts/verify-task-status.sh

echo "Deployment Success!"
echo "Access URL: http://huntlink-v37.liman.work"
