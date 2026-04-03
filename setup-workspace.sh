#!/bin/bash

# HuntLink Stable Final 工作区设置脚本
# 这个脚本用于设置和验证huntlink-stable-final工作区环境

set -e

WORKSPACE_DIR="/Users/liman/Desktop/huntlink-stable-final"

echo "=== HuntLink Stable Final 工作区设置 ==="
echo "工作区路径: $WORKSPACE_DIR"
echo

# 1. 检查目录结构
echo "1. 检查目录结构..."
required_dirs=("app" "backend" "components" "docs")
for dir in "${required_dirs[@]}"; do
    if [ -d "$WORKSPACE_DIR/$dir" ]; then
        echo "   ✓ $dir 目录存在"
    else
        echo "   ✗ $dir 目录不存在"
        exit 1
    fi
done

# 2. 检查关键文件
echo
echo "2. 检查关键文件..."
required_files=("package.json" ".env.local" ".gitignore")
for file in "${required_files[@]}"; do
    if [ -f "$WORKSPACE_DIR/$file" ]; then
        echo "   ✓ $file 存在"
    else
        echo "   ✗ $file 不存在"
    fi
done

# 3. 检查Node.js版本
echo
echo "3. 检查Node.js环境..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "   ✓ Node.js 版本: $NODE_VERSION"
    
    # 检查是否满足最低版本要求 (v18+)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -ge 18 ]; then
        echo "   ✓ Node.js 版本符合要求 (>= 18)"
    else
        echo "   ⚠  Node.js 版本过低，建议升级到 v18+"
    fi
else
    echo "   ✗ Node.js 未安装"
    exit 1
fi

# 4. 安装依赖
echo
echo "4. 安装依赖..."
cd "$WORKSPACE_DIR"

# 检查node_modules是否存在
if [ -d "node_modules" ]; then
    echo "   ⚠  node_modules 已存在，跳过安装"
else
    echo "   正在安装依赖..."
    if npm install; then
        echo "   ✓ 依赖安装成功"
    else
        echo "   ✗ 依赖安装失败"
        exit 1
    fi
fi

# 5. 验证环境变量
echo
echo "5. 验证环境变量..."
if [ -f ".env.local" ]; then
    echo "   ✓ .env.local 文件存在"
    
    # 检查关键变量
    if grep -q "NEXT_PUBLIC_API_URL" .env.local; then
        API_URL=$(grep "NEXT_PUBLIC_API_URL" .env.local | cut -d'=' -f2)
        echo "   ✓ API_URL: $API_URL"
    fi
    
    if grep -q "PORT=199" .env.local; then
        echo "   ✓ 开发端口: 199"
    fi
else
    echo "   ✗ .env.local 文件不存在"
fi

# 6. 检查后端连接
echo
echo "6. 检查后端连接..."
if grep -q "API_BASE_URL" .env.local; then
    BACKEND_URL=$(grep "API_BASE_URL" .env.local | cut -d'=' -f2)
    echo "   后端API地址: $BACKEND_URL"
    
    # 尝试连接（如果后端正在运行）
    if curl -s --connect-timeout 2 "$BACKEND_URL/health" > /dev/null 2>&1; then
        echo "   ✓ 后端连接正常"
    else
        echo "   ⚠  无法连接到后端，请确保后端服务正在运行"
        echo "      后端端口: 3000"
    fi
fi

# 7. 检查Git配置
echo
echo "7. 检查Git配置..."
cd "$WORKSPACE_DIR"
if git rev-parse --git-dir > /dev/null 2>&1; then
    echo "   ✓ Git仓库已初始化"
    
    # 检查远程仓库
    if git remote -v | grep -q "origin"; then
        REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "未知")
        echo "   ✓ 远程仓库: $REMOTE_URL"
    else
        echo "   ⚠  未配置远程仓库"
    fi
    
    # 检查当前分支
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "未知")
    echo "   ✓ 当前分支: $CURRENT_BRANCH"
else
    echo "   ⚠  不是Git仓库"
fi

# 8. 显示有用的命令
echo
echo "=== 设置完成 ==="
echo
echo "工作区已准备就绪！"
echo
echo "常用命令:"
echo "  启动开发服务器: npm run dev"
echo "  构建生产版本: npm run build"
echo "  运行代码检查: npm run lint"
echo "  启动后端: cd backend && npm run start:dev"
echo
echo "开发环境:"
echo "  前端: http://localhost:199"
echo "  后端: http://localhost:3000"
echo "  API文档: http://localhost:3000/api/docs"
echo
echo "部署命令:"
echo "  前端部署: ./deploy-frontend.sh"
echo "  后端部署: ./deploy-backend.sh"
echo
