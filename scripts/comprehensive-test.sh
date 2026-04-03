#!/bin/bash
# scripts/comprehensive-test.sh
# 猎脉项目 - 综合测试脚本
# 创建时间：2026-03-28 23:25

set -e

echo "=========================================="
echo "🧪 猎脉项目 - 综合测试套件"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试结果统计
PASSED=0
FAILED=0
WARNINGS=0

# 测试函数
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
    ((WARNINGS++))
}

# ==========================================
# 1. 环境检查
# ==========================================
echo "📋 1. 环境检查"
echo "------------------------------------------"

# 检查 Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    pass "Node.js 已安装：$NODE_VERSION"
else
    fail "Node.js 未安装"
fi

# 检查 npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    pass "npm 已安装：$NPM_VERSION"
else
    fail "npm 未安装"
fi

# 检查 Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    pass "Docker 已安装：$DOCKER_VERSION"
else
    warn "Docker 未安装（可能影响部署）"
fi

# 检查 Git
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    pass "Git 已安装：$GIT_VERSION"
else
    fail "Git 未安装"
fi

echo ""

# ==========================================
# 2. 代码质量检查
# ==========================================
echo "📋 2. 代码质量检查"
echo "------------------------------------------"

cd backend

# 检查 package.json
if [ -f "package.json" ]; then
    pass "package.json 存在"
    
    # 检查必要脚本
    if grep -q '"test"' package.json; then
        pass "测试脚本已定义"
    else
        warn "测试脚本未定义"
    fi
    
    if grep -q '"lint"' package.json; then
        pass "Lint 脚本已定义"
    else
        warn "Lint 脚本未定义"
    fi
else
    fail "package.json 不存在"
fi

# 检查 TypeScript 配置
if [ -f "tsconfig.json" ]; then
    pass "tsconfig.json 存在"
else
    warn "tsconfig.json 不存在"
fi

# 检查 NestJS 配置
if [ -f "nest-cli.json" ]; then
    pass "nest-cli.json 存在"
else
    warn "nest-cli.json 不存在"
fi

cd ..
echo ""

# ==========================================
# 3. 文档完整性检查
# ==========================================
echo "📋 3. 文档完整性检查"
echo "------------------------------------------"

DOCS=(
    "README.md"
    "DEPLOYMENT.md"
    ".task-board.md"
    "docs/TODAY_PROGRESS.md"
    "docs/MAINTENANCE.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        pass "$doc 存在"
    else
        fail "$doc 不存在"
    fi
done

echo ""

# ==========================================
# 4. Docker 部署检查（如果已部署）
# ==========================================
echo "📋 4. Docker 部署检查"
echo "------------------------------------------"

if [ -f "docker-compose.yml" ]; then
    pass "docker-compose.yml 存在"
    
    # 检查容器状态（如果 Docker 可用）
    if command -v docker-compose &> /dev/null; then
        echo "检查容器状态..."
        docker-compose ps || warn "无法获取容器状态（可能未启动）"
    else
        warn "docker-compose 未安装"
    fi
else
    fail "docker-compose.yml 不存在"
fi

echo ""

# ==========================================
# 5. 数据库配置检查
# ==========================================
echo "📋 5. 数据库配置检查"
echo "------------------------------------------"

if [ -f "backend/.env" ]; then
    pass "backend/.env 存在"
    
    # 检查 PostgreSQL 配置
    if grep -q "DB_HOST" backend/.env || grep -q "DATABASE_URL" backend/.env; then
        pass "数据库配置已定义"
    else
        warn "数据库配置可能缺失"
    fi
    
    # 检查 COS 配置
    if grep -q "COS_SECRET_ID" backend/.env; then
        pass "COS 配置已定义"
    else
        warn "COS 配置未定义"
    fi
    
    # 检查 JWT 配置
    if grep -q "JWT_SECRET" backend/.env; then
        pass "JWT 配置已定义"
    else
        fail "JWT 配置缺失（安全风险）"
    fi
else
    warn "backend/.env 不存在（可能是 .env.example）"
fi

echo ""

# ==========================================
# 6. GitHub 同步检查
# ==========================================
echo "📋 6. GitHub 同步检查"
echo "------------------------------------------"

# 检查 Git 状态
if git status &> /dev/null; then
    # 检查是否有未提交更改
    if [ -z "$(git status --porcelain)" ]; then
        pass "工作区干净，无未提交更改"
    else
        warn "有未提交更改"
        git status --short
    fi
    
    # 检查远程同步
    if git remote -v &> /dev/null; then
        pass "Git 远程仓库已配置"
    else
        warn "Git 远程仓库未配置"
    fi
else
    fail "Git 仓库未初始化"
fi

echo ""

# ==========================================
# 7. 安全扫描
# ==========================================
echo "📋 7. 安全扫描"
echo "------------------------------------------"

# 检查敏感文件
if [ -f ".env" ]; then
    if [ -r ".env" ]; then
        warn ".env 文件可读（确保已加入 .gitignore）"
    fi
fi

# 检查 .gitignore
if [ -f ".gitignore" ]; then
    if grep -q "\.env" .gitignore; then
        pass ".env 已加入 .gitignore"
    else
        warn ".env 可能未加入 .gitignore"
    fi
else
    fail ".gitignore 不存在"
fi

echo ""

# ==========================================
# 测试结果汇总
# ==========================================
echo "=========================================="
echo "📊 测试结果汇总"
echo "=========================================="
echo -e "${GREEN}✅ 通过${NC}: $PASSED"
echo -e "${RED}❌ 失败${NC}: $FAILED"
echo -e "${YELLOW}⚠️  警告${NC}: $WARNINGS"
echo ""

if [ $FAILED -gt 0 ]; then
    echo -e "${RED}🔴 测试未通过，存在 $FAILED 个失败项${NC}"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}🟡 测试通过，但有 $WARNINGS 个警告项${NC}"
    exit 0
else
    echo -e "${GREEN}🟢 所有测试通过！${NC}"
    exit 0
fi
