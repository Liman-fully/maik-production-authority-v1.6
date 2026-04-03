#!/bin/bash
# scripts/verify-deployment.sh
# 部署验证脚本（BUG-001）
# 用途：验证所有服务是否正常运行

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "========================================="
echo "🔍 猎脉项目 - 部署验证脚本"
echo "========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

pass() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    ((PASSED++))
}

fail() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    ((FAILED++))
}

warn() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
}

# 1. 检查 Docker Compose
echo "📋 1. 检查 Docker Compose"
echo "------------------------------------------"

if command -v docker-compose &> /dev/null; then
    pass "docker-compose 已安装"
else
    fail "docker-compose 未安装"
    echo "   安装：curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose"
fi

# 2. 检查项目目录
echo ""
echo "📋 2. 检查项目目录"
echo "------------------------------------------"

if [ -f "$PROJECT_ROOT/docker-compose.yml" ]; then
    pass "docker-compose.yml 存在"
else
    fail "docker-compose.yml 不存在"
    exit 1
fi

if [ -f "$PROJECT_ROOT/backend/.env" ] || [ -f "$PROJECT_ROOT/backend/.env.example" ]; then
    pass "环境变量配置文件存在"
else
    warn "环境变量配置文件不存在"
fi

# 3. 检查容器状态
echo ""
echo "📋 3. 检查容器状态"
echo "------------------------------------------"

cd "$PROJECT_ROOT"

echo "容器列表:"
docker-compose ps

echo ""
echo "检查关键服务..."

# PostgreSQL
if docker-compose ps | grep -q "huntlink-postgres.*Up"; then
    pass "PostgreSQL 容器运行中"
else
    fail "PostgreSQL 容器未运行"
    echo "   启动：docker-compose up -d postgres"
fi

# Backend
if docker-compose ps | grep -q "huntlink-backend.*Up"; then
    pass "Backend 容器运行中"
else
    fail "Backend 容器未运行"
    echo "   启动：docker-compose up -d backend"
fi

# Frontend
if docker-compose ps | grep -q "huntlink-frontend.*Up"; then
    pass "Frontend 容器运行中"
else
    fail "Frontend 容器未运行"
    echo "   启动：docker-compose up -d frontend"
fi

# Redis（可选）
if docker-compose ps | grep -q "huntlink-redis.*Up"; then
    pass "Redis 容器运行中"
else
    warn "Redis 容器未运行（可选，如需部署请运行：./scripts/deploy-redis.sh）"
fi

# 4. 检查服务健康状态
echo ""
echo "📋 4. 检查服务健康状态"
echo "------------------------------------------"

# PostgreSQL 健康检查
echo "PostgreSQL 健康检查..."
if docker exec huntlink-postgres pg_isready -U huntlink &> /dev/null; then
    pass "PostgreSQL 健康检查通过"
else
    fail "PostgreSQL 健康检查失败"
fi

# Backend 健康检查
echo "Backend 健康检查..."
if curl -s http://localhost:3000/api/health &> /dev/null; then
    pass "Backend API 健康检查通过"
else
    warn "Backend API 健康检查失败（可能服务还未完全启动）"
    echo "   查看日志：docker-compose logs backend"
fi

# Redis 健康检查（如果存在）
if docker ps | grep -q huntlink-redis; then
    echo "Redis 健康检查..."
    if docker exec huntlink-redis redis-cli ping &> /dev/null; then
        pass "Redis 健康检查通过"
    else
        fail "Redis 健康检查失败"
    fi
fi

# 5. 数据库连接测试
echo ""
echo "📋 5. 数据库连接测试"
echo "------------------------------------------"

echo "测试 PostgreSQL 连接..."
if docker exec huntlink-postgres psql -U huntlink -d huntlink -c "SELECT version();" &> /dev/null; then
    pass "PostgreSQL 连接成功"
    
    # 检查扩展
    echo "检查 PostgreSQL 扩展..."
    if docker exec huntlink-postgres psql -U huntlink -d huntlink -c "SELECT * FROM pg_extension WHERE extname = 'pg_trgm';" | grep -q "pg_trgm"; then
        pass "pg_trgm 扩展已安装（搜索功能需要）"
    else
        warn "pg_trgm 扩展未安装（搜索功能可能不可用）"
        echo "   安装：docker exec huntlink-postgres psql -U huntlink -d huntlink -c 'CREATE EXTENSION pg_trgm;'"
    fi
else
    fail "PostgreSQL 连接失败"
fi

# 6. 磁盘空间检查
echo ""
echo "📋 6. 磁盘空间检查"
echo "------------------------------------------"

DISK_USAGE=$(df -h / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    pass "磁盘空间充足 (使用率：${DISK_USAGE}%)"
elif [ "$DISK_USAGE" -lt 90 ]; then
    warn "磁盘空间紧张 (使用率：${DISK_USAGE}%)"
else
    fail "磁盘空间不足 (使用率：${DISK_USAGE}%)"
fi

# 7. 内存使用检查
echo ""
echo "📋 7. 内存使用检查"
echo "------------------------------------------"

MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.0f", $3/$2*100)}')
if [ "$MEMORY_USAGE" -lt 80 ]; then
    pass "内存使用正常 (使用率：${MEMORY_USAGE}%)"
elif [ "$MEMORY_USAGE" -lt 90 ]; then
    warn "内存使用较高 (使用率：${MEMORY_USAGE}%)"
else
    fail "内存使用过高 (使用率：${MEMORY_USAGE}%)"
fi

# 8. 日志检查
echo ""
echo "📋 8. 最近日志检查"
echo "------------------------------------------"

echo "Backend 最近日志（最后 10 行）:"
docker-compose logs --tail=10 backend | tail -10

# 汇总
echo ""
echo "========================================="
echo "📊 验证结果汇总"
echo "========================================="
echo -e "${GREEN}✅ 通过${NC}: $PASSED"
echo -e "${RED}❌ 失败${NC}: $FAILED"
echo ""

if [ $FAILED -gt 0 ]; then
    echo -e "${RED}🔴 验证未通过，存在 $FAILED 个失败项${NC}"
    echo ""
    echo "建议操作:"
    echo "1. 查看失败项的具体错误信息"
    echo "2. 根据提示修复问题"
    echo "3. 重新运行此脚本验证"
    echo ""
    echo "常用命令:"
    echo "  - 重启所有服务：docker-compose restart"
    echo "  - 查看日志：docker-compose logs -f"
    echo "  - 重新部署：docker-compose down && docker-compose up -d --build"
    exit 1
else
    echo -e "${GREEN}🟢 所有验证通过！部署成功！${NC}"
    echo ""
    echo "访问地址:"
    echo "  - 前端：http://localhost"
    echo "  - 后端 API: http://localhost:3000/api"
    echo "  - 健康检查：http://localhost:3000/api/health"
    exit 0
fi
