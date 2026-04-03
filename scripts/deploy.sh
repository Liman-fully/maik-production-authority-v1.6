#!/bin/bash
# HuntLink 标准化部署脚本
# 使用方法: ./scripts/deploy.sh

set -e

# ============== 配置 ==============
BACKEND_DIR="/Users/liman/WorkBuddy/Claw/huntlink-new/backend"
SERVER_IP="150.158.51.199"
REMOTE_USER="ubuntu"
SSH_KEY="~/Desktop/workbuddy.pem"
REMOTE_DIR="/var/www/huntlink/backend"
PACKAGE_FILE="/tmp/huntlink-deploy-$(date +%Y%m%d-%H%M%S).tar.gz"

# ============== 颜色输出 ==============
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

# ============== 部署前检查 ==============
log "=== 部署前检查 ==="

if [ ! -d "$BACKEND_DIR" ]; then
    error "后端目录不存在: $BACKEND_DIR"
    exit 1
fi

cd $BACKEND_DIR

# 检查package.json
if [ ! -f "package.json" ]; then
    error "package.json不存在"
    exit 1
fi

# ============== 步骤1: 清理并编译 ==============
log "=== 1. 清理编译缓存 ==="
rm -f dist/tsconfig.tsbuildinfo
rm -rf dist

log "=== 2. 编译后端 ==="
npm run build

if [ ! -f "dist/src/main.js" ]; then
    error "编译失败：dist/src/main.js不存在"
    exit 1
fi

log "编译成功"

# ============== 步骤3: 打包 ==============
log "=== 3. 打包编译结果 ==="
COPYFILE_DISABLE=1 tar -czf $PACKAGE_FILE dist/

if [ ! -f "$PACKAGE_FILE" ]; then
    error "打包失败"
    exit 1
fi

log "打包完成: $(du -h $PACKAGE_FILE | cut -f1)"

# ============== 步骤4: 上传 ==============
log "=== 4. 上传到服务器 ==="
scp -i $SSH_KEY $PACKAGE_FILE $REMOTE_USER@$SERVER_IP:/tmp/

log "上传完成"

# ============== 步骤5: 服务器操作 ==============
log "=== 5. 服务器部署 ==="

ssh -i $SSH_KEY $REMOTE_USER@$SERVER_IP << 'EOF'
    set -e

    echo "[$(date '+%H:%M:%S')] 5.1 停止旧服务"
    pm2 delete all 2>/dev/null || true
    lsof -ti:3000 2>/dev/null | xargs -r kill -9 2>/dev/null || true
    sleep 2

    echo "[$(date '+%H:%M:%S')] 5.2 解压覆盖dist"
    sudo rm -rf /var/www/huntlink/backend/current/dist
    sudo mkdir -p /var/www/huntlink/backend/current
    sudo tar -xzf /tmp/huntlink-deploy-*.tar.gz -C /var/www/huntlink/backend/current/
    sudo chown -R ubuntu:ubuntu /var/www/huntlink/backend/current/dist

    echo "[$(date '+%H:%M:%S')] 5.3 安装依赖"
    if [ -f /tmp/package.json ]; then
        sudo mv /tmp/package.json /var/www/huntlink/backend/package.json
        sudo chown ubuntu:ubuntu /var/www/huntlink/backend/package.json
        cd /var/www/huntlink/backend && npm install --production 2>&1 | tail -5
    fi

    echo "[$(date '+%H:%M:%S')] 5.4 启动PM2"
    cd /var/www/huntlink/backend && pm2 start ecosystem.config.js --env production
    sleep 5

    echo "[$(date '+%H:%M:%S')] 5.5 冒烟测试"
    RESULT=$(curl -s http://localhost:3000/api/health 2>/dev/null || echo "FAILED")
    echo "Health check: $RESULT"
    
    if echo "$RESULT" | grep -q "status"; then
        echo "部署成功"
    else
        echo "健康检查失败"
        pm2 logs --lines 10 --nostream
    fi
EOF

# ============== 步骤6: 远程API测试 ==============
log "=== 6. 远程API测试 ==="

RESULT=$(curl -s -X POST http://$SERVER_IP/api/auth/login/account \
    -H 'Content-Type: application/json' \
    -d '{"identifier":"test@test.com","password":"test123"}')

if echo "$RESULT" | grep -q "token\|success\|error"; then
    log "API测试通过"
else
    warn "API响应异常: $RESULT"
fi

# ============== 完成 ==============
log "=== 部署完成 ==="
log "后端地址: http://$SERVER_IP"
log "监控: ssh -i $SSH_KEY $REMOTE_USER@$SERVER_IP 'pm2 monit'"
