#!/bin/bash
# 环境配置向导脚本
# 使用: bash scripts/setup-env.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info() {
    echo -e "${BLUE}ℹ️${NC} $1"
}

success() {
    echo -e "${GREEN}✅${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

echo "=========================================="
echo "🔧 猎脉项目 - 环境配置向导"
echo "=========================================="
echo ""

# 创建后端.env文件
if [ ! -f "backend/.env" ]; then
    info "创建后端.env文件..."
    cp backend/.env.example backend/.env
    success "后端.env文件已创建"
else
    warning "后端.env文件已存在，将保留原文件"
fi

# 创建前端.env文件
if [ ! -f "frontend-web/.env" ]; then
    info "创建前端.env文件..."
    cp frontend-web/.env.example frontend-web/.env
    success "前端.env文件已创建"
else
    warning "前端.env文件已存在，将保留原文件"
fi

echo ""
echo "=========================================="
echo "📝 请手动配置以下关键信息:"
echo "=========================================="
echo ""

echo "1. 后端配置 (backend/.env):"
echo "   - DB_PASSWORD: 数据库密码"
echo "   - COS_SECRET_ID: 腾讯云COS密钥ID"
echo "   - COS_SECRET_KEY: 腾讯云COS密钥"
echo "   - JWT_SECRET: JWT密钥 (建议随机生成)"
echo ""

echo "2. 前端配置 (frontend-web/.env):"
echo "   - VITE_API_BASE_URL: API基础地址 (默认: http://localhost:3000/api)"
echo ""

# 提供生成随机JWT密钥的建议
echo "=========================================="
echo "🔑 生成JWT密钥建议:"
echo "=========================================="
echo ""
echo "在Linux/macOS上运行:"
echo "  openssl rand -base64 32"
echo ""
echo "或使用Node.js:"
echo "  node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
echo ""

# 询问是否配置COS
echo "=========================================="
echo "☁️  腾讯云COS配置"
echo "=========================================="
echo ""
read -p "是否要配置腾讯云COS？(y/n): " CONFIG_COS

if [ "$CONFIG_COS" = "y" ]; then
    echo ""
    read -p "请输入COS_SECRET_ID: " COS_ID
    read -p "请输入COS_SECRET_KEY: " COS_KEY
    read -p "请输入存储桶名称 (默认: huntlink-1306109984): " COS_BUCKET
    read -p "请输入地域 (默认: ap-guangzhou): " COS_REGION
    
    COS_BUCKET=${COS_BUCKET:-huntlink-1306109984}
    COS_REGION=${COS_REGION:-ap-guangzhou}
    
    # 更新后端.env文件
    sed -i.bak "s/COS_SECRET_ID=.*/COS_SECRET_ID=$COS_ID/" backend/.env
    sed -i.bak "s/COS_SECRET_KEY=.*/COS_SECRET_KEY=$COS_KEY/" backend/.env
    sed -i.bak "s/COS_BUCKET=.*/COS_BUCKET=$COS_BUCKET/" backend/.env
    sed -i.bak "s/COS_REGION=.*/COS_REGION=$COS_REGION/" backend/.env
    
    success "COS配置已更新到backend/.env"
    rm -f backend/.env.bak
fi

# 询问是否配置数据库
echo ""
echo "=========================================="
echo "🗄️  数据库配置"
echo "=========================================="
echo ""
read -p "是否要配置数据库？(y/n): " CONFIG_DB

if [ "$CONFIG_DB" = "y" ]; then
    echo ""
    read -p "请输入数据库密码: " DB_PASSWORD
    read -p "请输入数据库主机 (默认: localhost): " DB_HOST
    read -p "请输入数据库端口 (默认: 5432): " DB_PORT
    read -p "请输入数据库名称 (默认: huntlink): " DB_DATABASE
    
    DB_HOST=${DB_HOST:-localhost}
    DB_PORT=${DB_PORT:-5432}
    DB_DATABASE=${DB_DATABASE:-huntlink}
    
    # 更新后端.env文件
    sed -i.bak "s/DB_HOST=.*/DB_HOST=$DB_HOST/" backend/.env
    sed -i.bak "s/DB_PORT=.*/DB_PORT=$DB_PORT/" backend/.env
    sed -i.bak "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" backend/.env
    sed -i.bak "s/DB_DATABASE=.*/DB_DATABASE=$DB_DATABASE/" backend/.env
    
    success "数据库配置已更新到backend/.env"
    rm -f backend/.env.bak
fi

# 生成JWT密钥
echo ""
echo "=========================================="
echo "🔐 JWT密钥配置"
echo "=========================================="
echo ""
read -p "是否要生成JWT密钥？(y/n): " CONFIG_JWT

if [ "$CONFIG_JWT" = "y" ]; then
    if command -v openssl &> /dev/null; then
        JWT_SECRET=$(openssl rand -base64 32)
    else
        JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    fi
    
    # 更新后端.env文件
    sed -i.bak "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" backend/.env
    
    success "JWT密钥已生成并更新到backend/.env"
    rm -f backend/.env.bak
fi

# 配置前端API地址
echo ""
echo "=========================================="
echo "🌐 前端API配置"
echo "=========================================="
echo ""
read -p "后端API地址 (默认: http://localhost:3000/api): " API_URL

API_URL=${API_URL:-http://localhost:3000/api}

# 更新前端.env文件
sed -i.bak "s|VITE_API_BASE_URL=.*|VITE_API_BASE_URL=$API_URL|" frontend-web/.env

success "API地址已更新到frontend-web/.env"
rm -f frontend-web/.env.bak

echo ""
echo "=========================================="
echo "✅ 环境配置完成！"
echo "=========================================="
echo ""

# 显示配置摘要
echo "配置摘要:"
echo "  - 后端配置: backend/.env"
echo "  - 前端配置: frontend-web/.env"
echo ""

# 验证关键配置
warning "请验证以下关键配置是否正确:"
echo ""
echo "后端配置:"
grep -E "^(DB_HOST|DB_PORT|DB_DATABASE|COS_BUCKET|COS_REGION|JWT_SECRET)" backend/.env | sed 's/^/  /'
echo ""
echo "前端配置:"
grep -E "^VITE_API_BASE_URL" frontend-web/.env | sed 's/^/  /'
echo ""

echo "=========================================="
echo "下一步:"
echo "=========================================="
echo ""
echo "1. 检查环境: bash scripts/quick-env-check.sh"
echo "2. 启动数据库: docker-compose up -d postgres redis"
echo "3. 启动后端: cd backend && npm run start:dev"
echo "4. 启动前端: cd frontend-web && npm run dev"
echo ""
echo "或使用Docker Compose启动所有服务:"
echo "  docker-compose up -d"
echo ""
