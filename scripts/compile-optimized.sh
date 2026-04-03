#!/bin/bash

# M1 Mac 重火力编译优化脚本
# 策略：本地重火力编译，远端轻量级运行

set -e

echo "🚀 启动 M1 重火力编译优化..."
echo "========================================"

# 环境检测
echo "📊 环境检测:"
echo "- Node版本: $(node --version)"
echo "- npm版本: $(npm --version)"
echo "- CPU核心: $(sysctl -n hw.ncpu) 核"
echo "- 内存: $(sysctl -n hw.memsize | awk '{print $0/1024/1024/1024 " GB"}')"

# 设置编译环境变量
export NODE_OPTIONS="--max-old-space-size=4096"  # 分配4GB内存给Node
export UV_THREADPOOL_SIZE=$(sysctl -n hw.ncpu)   # 优化线程池大小
export GOMAXPROCS=$(sysctl -n hw.ncpu)          # 优化Go最大进程数（如果使用）

echo "🔧 编译环境变量:"
echo "- NODE_OPTIONS: $NODE_OPTIONS"
echo "- UV_THREADPOOL_SIZE: $UV_THREADPOOL_SIZE"
echo "- GOMAXPROCS: $GOMAXPROCS"

# 前端编译 (Next.js 16 with Turbopack)
echo "🔄 开始前端编译优化..."
cd frontend-web

# 清除缓存以获得干净的构建
rm -rf .next 2>/dev/null || true

# 设置Next.js优化环境变量
export NEXT_TELEMETRY_DISABLED=1
export NEXT_PUBLIC_ANALYTICS_ID=""
export NEXT_PUBLIC_COMPILE_OPTIMIZED="m1"

# 使用并行编译和内存优化
echo "🏗️  运行 Next.js 编译 (Turbopack 优化)..."
time npm run build 2>&1 | tee ../logs/frontend-build-$(date +%Y%m%d-%H%M%S).log

FRONTEND_EXIT_CODE=${PIPESTATUS[0]}

cd ..

if [ $FRONTEND_EXIT_CODE -eq 0 ]; then
    echo "✅ 前端编译成功!"
    
    # 检查编译输出大小
    FRONTEND_SIZE=$(du -sh frontend-web/.next | cut -f1)
    echo "- 编译输出大小: $FRONTEND_SIZE"
    
    # 检查是否启用了standalone模式
    if [ -d "frontend-web/.next/standalone" ]; then
        STANDALONE_SIZE=$(du -sh frontend-web/.next/standalone | cut -f1)
        echo "- Standalone模式已启用，大小: $STANDALONE_SIZE"
    else
        echo "⚠️  Standalone模式未启用 - 建议在next.config.mjs中启用"
    fi
else
    echo "❌ 前端编译失败，退出码: $FRONTEND_EXIT_CODE"
    exit $FRONTEND_EXIT_CODE
fi

# 后端编译 (NestJS)
echo "🔄 开始后端编译优化..."
cd backend

# 清除dist目录
rm -rf dist 2>/dev/null || true

echo "🏗️  运行 NestJS 编译..."
time npm run build 2>&1 | tee ../logs/backend-build-$(date +%Y%m%d-%H%M%S).log

BACKEND_EXIT_CODE=${PIPESTATUS[0]}

cd ..

if [ $BACKEND_EXIT_CODE -eq 0 ]; then
    echo "✅ 后端编译成功!"
    
    # 检查编译输出大小
    BACKEND_SIZE=$(du -sh backend/dist | cut -f1)
    echo "- 编译输出大小: $BACKEND_SIZE"
    
    # 检查是否有TypeScript错误
    TS_ERRORS=$(grep -i "error\|warning" ../logs/backend-build-*.log 2>/dev/null | wc -l || echo 0)
    if [ $TS_ERRORS -gt 0 ]; then
        echo "⚠️  检测到 $TS_ERRORS 个TypeScript警告/错误"
    fi
else
    echo "❌ 后端编译失败，退出码: $BACKEND_EXIT_CODE"
    exit $BACKEND_EXIT_CODE
fi

# 生成部署包
echo "📦 生成部署包..."
DEPLOY_DIR="deploy-$(date +%Y%m%d-%H%M%S)"
mkdir -p $DEPLOY_DIR

# 前端部署包
if [ -d "frontend-web/.next/standalone" ]; then
    echo "- 复制前端standalone包..."
    cp -r frontend-web/.next/standalone $DEPLOY_DIR/frontend
else
    echo "- 复制前端.next目录..."
    cp -r frontend-web/.next $DEPLOY_DIR/frontend
fi

# 复制前端静态资源
cp -r frontend-web/public $DEPLOY_DIR/frontend/ 2>/dev/null || true

# 后端部署包
echo "- 复制后端dist目录..."
cp -r backend/dist $DEPLOY_DIR/backend/

# 复制必要的配置文件
cp backend/.env $DEPLOY_DIR/backend/.env.example 2>/dev/null || true
cp backend/package.json $DEPLOY_DIR/backend/
cp backend/package-lock.json $DEPLOY_DIR/backend/

# 创建部署脚本
cat > $DEPLOY_DIR/deploy.sh << 'EOF'
#!/bin/bash
# 远端服务器轻量级部署脚本
# 设计为在2GB RAM服务器上运行

set -e

echo "🚀 开始远端轻量级部署..."
echo "========================================"

# 设置内存限制
export NODE_OPTIONS="--max-old-space-size=1536"  # 限制为1.5GB内存

# 安装前端
echo "📦 安装前端..."
cd frontend
npm ci --only=production
cd ..

# 安装后端
echo "📦 安装后端..."
cd backend
npm ci --only=production
cd ..

echo "✅ 部署包准备完成!"
echo "- 前端运行: cd frontend && PORT=3001 node server.js"
echo "- 后端运行: cd backend && PORT=3000 node dist/src/main.js"
EOF

chmod +x $DEPLOY_DIR/deploy.sh

# 打包
echo "📦 打包部署文件..."
tar -czf $DEPLOY_DIR.tar.gz $DEPLOY_DIR
DEPLOY_SIZE=$(du -sh $DEPLOY_DIR.tar.gz | cut -f1)

echo "========================================"
echo "🎉 M1 重火力编译完成!"
echo "========================================"
echo "📊 编译统计:"
echo "- 前端大小: $FRONTEND_SIZE"
echo "- 后端大小: $BACKEND_SIZE"
echo "- 部署包大小: $DEPLOY_SIZE"
echo ""
echo "🚀 部署包: $DEPLOY_DIR.tar.gz"
echo "📋 包含:"
echo "   - 前端应用 (standalone模式)"
echo "   - 后端应用 (已编译)"
echo "   - 部署脚本 (deploy.sh)"
echo ""
echo "💡 部署到2GB服务器:"
echo "   scp $DEPLOY_DIR.tar.gz ubuntu@150.158.51.199:/tmp/"
echo "   ssh ubuntu@150.158.51.199 \"cd /tmp && tar -xzf $DEPLOY_DIR.tar.gz && cd $DEPLOY_DIR && ./deploy.sh\""
echo "========================================"

# 清理临时目录
rm -rf $DEPLOY_DIR