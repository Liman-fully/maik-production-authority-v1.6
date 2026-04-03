#!/bin/bash
# 快速开发环境检查脚本
# 使用: bash scripts/quick-env-check.sh

set -e

echo "=========================================="
echo "🔍 猎脉项目 - 开发环境快速检查"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查函数
check_success() {
    echo -e "${GREEN}✅${NC} $1"
}

check_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

check_error() {
    echo -e "${RED}❌${NC} $1"
}

check_info() {
    echo -e "${BLUE}ℹ️${NC} $1"
}

# 统计
TOTAL=0
PASSED=0
FAILED=0
WARNINGS=0

check() {
    TOTAL=$((TOTAL + 1))
    if [ $1 -eq 0 ]; then
        check_success "$2"
        PASSED=$((PASSED + 1))
    else
        check_error "$2"
        FAILED=$((FAILED + 1))
    fi
}

warn() {
    TOTAL=$((TOTAL + 1))
    check_warning "$1"
    WARNINGS=$((WARNINGS + 1))
}

info() {
    check_info "$1"
}

echo "📋 开始环境检查..."
echo ""

# 1. 检查Node.js
echo "1. 检查Node.js环境..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    check_success "Node.js已安装: $NODE_VERSION"
else
    check_error "Node.js未安装"
    info "请运行: install_binary node 22.12.0"
fi

# 2. 检查npm
echo ""
echo "2. 检查npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    check_success "npm已安装: $NPM_VERSION"
else
    check_error "npm未安装"
fi

# 3. 检查Docker
echo ""
echo "3. 检查Docker..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    check_success "Docker已安装: $DOCKER_VERSION"
else
    check_warning "Docker未安装 (可选，但推荐)"
fi

# 4. 检查项目结构
echo ""
echo "4. 检查项目结构..."

if [ -d "backend" ]; then
    check_success "后端目录存在"
else
    check_error "后端目录不存在"
fi

if [ -d "frontend-web" ]; then
    check_success "前端目录存在"
else
    check_error "前端目录不存在"
fi

if [ -f "docker-compose.yml" ]; then
    check_success "docker-compose.yml存在"
else
    check_error "docker-compose.yml不存在"
fi

# 5. 检查依赖安装
echo ""
echo "5. 检查依赖安装..."

if [ -d "backend/node_modules" ]; then
    MODULE_COUNT=$(ls backend/node_modules | wc -l)
    check_success "后端依赖已安装 ($MODULE_COUNT个包)"
else
    check_error "后端依赖未安装"
    info "请运行: cd backend && npm install"
fi

if [ -d "frontend-web/node_modules" ]; then
    MODULE_COUNT=$(ls frontend-web/node_modules | wc -l)
    check_success "前端依赖已安装 ($MODULE_COUNT个包)"
else
    check_error "前端依赖未安装"
    info "请运行: cd frontend-web && npm install"
fi

# 6. 检查环境文件
echo ""
echo "6. 检查环境配置文件..."

if [ -f "backend/.env" ]; then
    check_success "后端.env文件已创建"
    
    # 检查关键配置
    if grep -q "COS_SECRET_ID" backend/.env; then
        check_success "COS配置已设置"
    else
        check_warning "COS配置可能缺失"
    fi
    
    if grep -q "DB_HOST" backend/.env; then
        check_success "数据库配置已设置"
    else
        check_warning "数据库配置可能缺失"
    fi
else
    check_error "后端.env文件不存在"
    info "请复制: cp backend/.env.example backend/.env 并配置"
fi

if [ -f "frontend-web/.env" ]; then
    check_success "前端.env文件已创建"
else
    check_error "前端.env文件不存在"
    info "请复制: cp frontend-web/.env.example frontend-web/.env 并配置"
fi

# 7. 检查技能安装
echo ""
echo "7. 检查技能安装..."

if [ -d "$HOME/.workbuddy/skills/tencentcloud-cos" ]; then
    check_success "tencentcloud-cos技能已安装"
else
    check_warning "tencentcloud-cos技能未安装"
fi

if [ -d "$HOME/.workbuddy/skills/tencent-cloud-migration" ]; then
    check_success "tencent-cloud-migration技能已安装"
else
    check_warning "tencent-cloud-migration技能未安装"
fi

# 8. 检查构建能力（可选）
echo ""
echo "8. 检查构建配置..."

if [ -f "backend/Dockerfile" ]; then
    check_success "后端Dockerfile存在"
else
    check_error "后端Dockerfile不存在"
fi

if [ -f "frontend-web/next.config.mjs" ]; then
    check_success "前端Next.js配置存在"
else
    check_error "前端Next.js配置不存在"
fi

if [ -f "docker-compose.yml" ]; then
    check_success "Docker Compose配置存在"
else
    check_error "Docker Compose配置不存在"
fi

# 总结
echo ""
echo "=========================================="
echo "📊 检查总结"
echo "=========================================="
echo -e "总检查项: ${TOTAL}"
echo -e "${GREEN}通过: ${PASSED}${NC}"
echo -e "${RED}失败: ${FAILED}${NC}"
echo -e "${YELLOW}警告: ${WARNINGS}${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 环境检查通过！可以开始开发了${NC}"
    echo ""
    echo "下一步:"
    echo "  1. 配置.env文件"
    echo "  2. 运行: docker-compose up -d (推荐)"
    echo "  3. 或分别启动:"
    echo "     - cd backend && npm run start:dev"
    echo "     - cd frontend-web && npm run dev"
else
    echo -e "${RED}❌ 环境检查未通过，请修复上述问题${NC}"
    echo ""
    echo "常见问题:"
    echo "  - Node.js未安装: 使用 install_binary 工具安装"
    echo "  - 依赖未安装: 运行 npm install"
    echo "  - .env文件缺失: 复制 .env.example 并配置"
fi

echo ""
