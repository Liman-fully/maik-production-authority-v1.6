#!/bin/bash

# 2GB服务器轻量级优化部署脚本
# 策略：本地M1重火力编译，远端轻量级运行

set -e

echo "🚀 2GB服务器轻量级部署优化"
echo "========================================"

# 参数检查
if [ -z "$1" ]; then
    echo "用法: $0 <服务器IP>"
    echo "示例: $0 150.158.51.199"
    exit 1
fi

SERVER_IP="$1"
SSH_KEY="~/Desktop/workbuddy.pem"
REMOTE_USER="ubuntu"

echo "📊 部署目标:"
echo "- 服务器: $REMOTE_USER@$SERVER_IP"
echo "- 内存限制: 2GB RAM"
echo "- 优化策略: 轻量级运行，内存硬限制"

# 1. 本地编译准备
echo "🔄 步骤1: 本地编译准备..."
cd /Users/liman/Desktop/huntlink-stable-final

# 检查是否需要重新编译
if [ ! -d ".next/standalone" ] || [ "$2" = "--force" ]; then
    echo "🏗️  开始M1重火力编译..."
    
    # 设置M1优化环境
    export NODE_OPTIONS="--max-old-space-size=4096"
    export NEXT_TELEMETRY_DISABLED=1
    
    # 清除缓存
    rm -rf .next 2>/dev/null || true
    
    # 编译前端
    echo "- 编译Next.js (standalone模式)..."
    npm run build
    
    if [ ! -d ".next/standalone" ]; then
        echo "❌ 编译失败: standalone目录未生成"
        echo "💡 请检查next.config.mjs是否启用了output: 'standalone'"
        exit 1
    fi
else
    echo "✅ 使用现有编译输出"
fi

# 2. 准备部署包
echo "🔄 步骤2: 准备轻量级部署包..."
DEPLOY_DIR="huntlink-deploy-$(date +%Y%m%d-%H%M%S)"
mkdir -p $DEPLOY_DIR

echo "- 复制前端standalone包..."
cp -r .next/standalone $DEPLOY_DIR/frontend
cp -r public $DEPLOY_DIR/frontend/ 2>/dev/null || true

echo "- 复制后端..."
if [ -d "backend/dist" ]; then
    cp -r backend/dist $DEPLOY_DIR/backend/
    cp backend/package.json $DEPLOY_DIR/backend/
    cp backend/package-lock.json $DEPLOY_DIR/backend/ 2>/dev/null || true
    cp backend/.env.example $DEPLOY_DIR/backend/.env 2>/dev/null || true
else
    echo "⚠️  后端dist目录不存在，跳过后端部署"
fi

# 3. 创建优化部署脚本
echo "🔄 步骤3: 创建2GB优化部署脚本..."
cat > $DEPLOY_DIR/deploy-2gb.sh << 'EOF'
#!/bin/bash
# 2GB服务器轻量级优化部署脚本

set -e

echo "🚀 2GB服务器轻量级部署启动..."
echo "========================================"

# 内存硬限制配置
export NODE_OPTIONS="--max-old-space-size=1536"  # 限制Node.js使用1.5GB内存
export UV_THREADPOOL_SIZE=2                      # 减少线程池大小
export NODE_ENV=production

# 系统优化
echo "🔧 系统优化配置..."
sudo sysctl -w vm.swappiness=10 2>/dev/null || true
sudo sysctl -w vm.vfs_cache_pressure=50 2>/dev/null || true

# 前端部署
echo "📦 部署前端..."
cd frontend

# 安装最小化依赖
echo "- 安装生产依赖..."
npm ci --only=production --no-audit --no-fund

# 创建优化启动脚本
cat > start-optimized.sh << 'FRONTEND_EOF'
#!/bin/bash
# Next.js生产服务器优化启动脚本

# 内存限制
export NODE_OPTIONS="--max-old-space-size=1024"
export PORT=3001

# 性能优化
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1

# 启动服务器
echo "🚀 启动Next.js生产服务器 (内存限制: 1GB)"
echo "- 端口: $PORT"
echo "- 模式: standalone"

exec node server.js
FRONTEND_EOF

chmod +x start-optimized.sh
cd ..

# 后端部署（如果存在）
if [ -d "backend" ]; then
    echo "📦 部署后端..."
    cd backend
    
    # 安装最小化依赖
    npm ci --only=production --no-audit --no-fund
    
    # 创建优化启动脚本
    cat > start-optimized.sh << 'BACKEND_EOF'
#!/bin/bash
# NestJS生产服务器优化启动脚本

# 内存限制
export NODE_OPTIONS="--max-old-space-size=512"
export PORT=3000

# 性能优化
export NODE_ENV=production

# 启动服务器
echo "🚀 启动NestJS生产服务器 (内存限制: 512MB)"
echo "- 端口: $PORT"

exec node dist/src/main.js
BACKEND_EOF

    chmod +x start-optimized.sh
    cd ..
fi

# PM2配置文件
echo "📋 生成PM2配置..."
cat > ecosystem.config.js << 'PM2_EOF'
module.exports = {
  apps: [
    {
      name: 'huntlink-frontend',
      script: './frontend/start-optimized.sh',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',  // 2GB服务器不要用cluster模式
      max_memory_restart: '1024M',  // 内存超过1GB时重启
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/var/log/huntlink/frontend-error.log',
      out_file: '/var/log/huntlink/frontend-out.log',
      merge_logs: true,
      time: true
    },
    {
      name: 'huntlink-backend',
      script: './backend/start-optimized.sh',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '512M',  // 内存超过512MB时重启
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/var/log/huntlink/backend-error.log',
      out_file: '/var/log/huntlink/backend-out.log',
      merge_logs: true,
      time: true
    }
  ]
};
PM2_EOF

# 创建日志目录
sudo mkdir -p /var/log/huntlink 2>/dev/null || true
sudo chown -R $USER:$USER /var/log/huntlink 2>/dev/null || true

echo "✅ 部署包准备完成!"
echo ""
echo "📋 启动命令:"
echo "1. PM2启动: pm2 start ecosystem.config.js"
echo "2. PM2保存: pm2 save"
echo "3. PM2开机自启: pm2 startup"
echo ""
echo "🔧 监控命令:"
echo "- 查看状态: pm2 status"
echo "- 查看日志: pm2 logs"
echo "- 内存使用: pm2 monit"
echo ""
echo "💡 2GB优化提示:"
echo "- 前端限制: 1GB内存"
echo "- 后端限制: 512MB内存"
echo "- 总内存使用: ~1.5GB (为系统预留500MB)"
echo "========================================"
EOF

chmod +x $DEPLOY_DIR/deploy-2gb.sh

# 4. 创建监控脚本
echo "🔄 步骤4: 创建2GB服务器监控脚本..."
cat > $DEPLOY_DIR/monitor-2gb.sh << 'MONITOR_EOF'
#!/bin/bash
# 2GB服务器资源监控脚本

echo "📊 2GB服务器资源监控"
echo "========================================"

# 系统资源
echo "🖥️  系统资源:"
free -h | grep -E "Mem:|Swap:" | awk '{print "  "$1": "$2" (使用: "$3")"}'
echo "  CPU负载: $(uptime | awk -F'load average:' '{print $2}')"

# 进程内存
echo "🔍 进程内存使用:"
pm2 list 2>/dev/null | grep -A10 "huntlink" || echo "  PM2未运行或huntlink进程不存在"

# Node.js内存
echo "🧠 Node.js内存:"
ps aux | grep -E "node.*(server|main)" | grep -v grep | awk '{print "  "$11": "$6/1024"MB"}'

# 端口监听
echo "📡 端口监听:"
netstat -tlnp 2>/dev/null | grep -E ":3000|:3001" | awk '{print "  端口"$4": "$7}'

# 日志检查
echo "📝 最近错误:"
tail -5 /var/log/huntlink/*error.log 2>/dev/null | head -20 || echo "  无错误日志"

echo "========================================"
echo "💡 优化建议:"
echo "1. 如果内存 > 1.8GB: 考虑重启服务"
echo "2. 如果CPU > 80%: 检查是否有内存泄漏"
echo "3. 定期清理日志: find /var/log/huntlink -name \"*.log\" -size +10M -exec truncate -s 5M {} \;"
MONITOR_EOF

chmod +x $DEPLOY_DIR/monitor-2gb.sh

# 5. 打包
echo "🔄 步骤5: 打包部署文件..."
tar -czf $DEPLOY_DIR.tar.gz $DEPLOY_DIR
DEPLOY_SIZE=$(du -sh $DEPLOY_DIR.tar.gz | cut -f1)

echo "✅ 部署包创建完成!"
echo "========================================"
echo "📊 部署包信息:"
echo "- 名称: $DEPLOY_DIR.tar.gz"
echo "- 大小: $DEPLOY_SIZE"
echo "- 包含:"
echo "  1. 前端standalone应用"
echo "  2. 后端应用（如果存在）"
echo "  3. 2GB优化部署脚本"
echo "  4. 资源监控脚本"
echo ""
echo "🚀 部署命令:"
echo "1. 上传: scp -i $SSH_KEY $DEPLOY_DIR.tar.gz $REMOTE_USER@$SERVER_IP:/tmp/"
echo "2. 解压: ssh -i $SSH_KEY $REMOTE_USER@$SERVER_IP \"cd /tmp && tar -xzf $DEPLOY_DIR.tar.gz\""
echo "3. 部署: ssh -i $SSH_KEY $REMOTE_USER@$SERVER_IP \"cd /tmp/$DEPLOY_DIR && ./deploy-2gb.sh\""
echo "4. 启动: ssh -i $SSH_KEY $REMOTE_USER@$SERVER_IP \"cd /tmp/$DEPLOY_DIR && pm2 start ecosystem.config.js\""
echo ""
echo "📈 监控命令:"
echo "  ssh -i $SSH_KEY $REMOTE_USER@$SERVER_IP \"cd /tmp/$DEPLOY_DIR && ./monitor-2gb.sh\""
echo "========================================"

# 清理
rm -rf $DEPLOY_DIR

echo "🎉 2GB服务器轻量级部署包准备完成!"
echo "💡 提示: 运行 ./deploy-optimized.sh $SERVER_IP --force 强制重新编译"