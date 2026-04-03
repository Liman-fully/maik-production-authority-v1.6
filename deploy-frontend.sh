#!/bin/bash

# HuntLink 前端部署脚本
# 用于将前端代码部署到腾讯轻量云服务器

set -e

# 配置
LOCAL_FRONTEND_DIR="/Users/liman/Desktop/huntlink-stable-final"
SERVER_USER="ubuntu"
SERVER_HOST="150.158.51.199"
SERVER_KEY="/Users/liman/Desktop/workbuddy.pem"
REMOTE_FRONTEND_DIR="/var/www/huntlink/frontend-standalone"
PM2_APP_NAME="huntlink-frontend"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

# 检查本地环境
check_local() {
    log "检查本地环境..."
    
    if [ ! -d "$LOCAL_FRONTEND_DIR" ]; then
        error "前端目录不存在: $LOCAL_FRONTEND_DIR"
        exit 1
    fi
    log "  ✓ 前端目录存在"
    
    if [ ! -f "$SERVER_KEY" ]; then
        error "SSH密钥不存在: $SERVER_KEY"
        exit 1
    fi
    log "  ✓ SSH密钥存在"
    
    # 检查package.json
    if [ ! -f "$LOCAL_FRONTEND_DIR/package.json" ]; then
        error "package.json 不存在"
        exit 1
    fi
    log "  ✓ package.json 存在"
}

# 构建前端代码
build_frontend() {
    log "构建前端代码..."
    cd "$LOCAL_FRONTEND_DIR"
    
    log "  安装依赖..."
    if npm install; then
        log "    ✓ 依赖安装成功"
    else
        error "依赖安装失败"
        exit 1
    fi
    
    log "  构建项目..."
    export NEXT_PUBLIC_API_URL=/api
    if npm run build; then
        log "    ✓ 构建成功"
    else
        error "构建失败"
        exit 1
    fi
    
    # 检查standalone输出
    if [ ! -d ".next/standalone" ]; then
        error "standalone目录不存在，检查next.config.mjs中的output配置"
        exit 1
    fi
    log "  ✓ standalone输出已生成"
}

# 准备部署文件
prepare_deploy() {
    log "准备部署文件..."
    cd "$LOCAL_FRONTEND_DIR"
    
    # 创建临时目录
    DEPLOY_DIR="/tmp/huntlink-frontend-deploy"
    rm -rf "$DEPLOY_DIR"
    mkdir -p "$DEPLOY_DIR"
    
    log "  复制standalone文件..."
    cp -r .next/standalone/* "$DEPLOY_DIR/"
    
    log "  复制static文件..."
    mkdir -p "$DEPLOY_DIR/.next"
    cp -r .next/static "$DEPLOY_DIR/.next/"
    
    log "  复制public文件..."
    cp -r public "$DEPLOY_DIR/" 2>/dev/null || mkdir -p "$DEPLOY_DIR/public"
    
    log "  复制package.json..."
    cp package.json "$DEPLOY_DIR/"
    cp package-lock.json "$DEPLOY_DIR/" 2>/dev/null || true
    
    # 创建server.js（如果不存在）
    if [ ! -f "$DEPLOY_DIR/server.js" ]; then
        log "  创建server.js..."
        cat > "$DEPLOY_DIR/server.js" << 'EOF'
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
EOF
    fi
    
    # 创建ecosystem.config.js（如果不存在）
    if [ ! -f "$DEPLOY_DIR/ecosystem.config.js" ]; then
        log "  创建ecosystem.config.js..."
        cat > "$DEPLOY_DIR/ecosystem.config.js" << 'EOF'
module.exports = {
  apps: [{
    name: 'huntlink-frontend',
    script: './server.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
}
EOF
    fi
    
    log "  ✓ 部署文件准备完成"
}

# 创建部署包
create_package() {
    log "创建部署包..."
    cd /tmp
    
    # macOS需要COPYFILE_DISABLE=1
    COPYFILE_DISABLE=1 tar -czf huntlink-frontend-standalone.tar.gz huntlink-frontend-deploy/
    
    DEPLOY_PACKAGE="/tmp/huntlink-frontend-standalone.tar.gz"
    if [ -f "$DEPLOY_PACKAGE" ]; then
        log "  ✓ 部署包创建成功: $DEPLOY_PACKAGE"
    else
        error "部署包创建失败"
        exit 1
    fi
}

# 上传部署包
upload_package() {
    log "上传部署包到服务器..."
    
    DEPLOY_PACKAGE="/tmp/huntlink-frontend-standalone.tar.gz"
    
    if [ ! -f "$DEPLOY_PACKAGE" ]; then
        error "部署包不存在: $DEPLOY_PACKAGE"
        exit 1
    fi
    
    scp -i "$SERVER_KEY" "$DEPLOY_PACKAGE" "${SERVER_USER}@${SERVER_HOST}:/tmp/"
    log "  ✓ 上传完成"
}

# 远程部署
remote_deploy() {
    log "执行远程部署..."
    
    ssh -i "$SERVER_KEY" "${SERVER_USER}@${SERVER_HOST}" << EOF
        set -e
        
        echo "停止前端服务..."
        pm2 stop "$PM2_APP_NAME" 2>/dev/null || true
        
        echo "备份当前版本..."
        if [ -d "$REMOTE_FRONTEND_DIR" ]; then
            sudo mv "$REMOTE_FRONTEND_DIR" "$REMOTE_FRONTEND_DIR.backup.$(date +%Y%m%d_%H%M%S)"
        fi
        
        echo "创建新目录..."
        sudo mkdir -p "$REMOTE_FRONTEND_DIR"
        
        echo "解压部署包..."
        sudo tar -xzf /tmp/huntlink-frontend-standalone.tar.gz -C /tmp/
        
        echo "复制文件到部署目录..."
        sudo cp -r /tmp/huntlink-frontend-deploy/* "$REMOTE_FRONTEND_DIR/"
        
        echo "设置权限..."
        sudo chown -R www-data:www-data "$REMOTE_FRONTEND_DIR"
        sudo chmod -R 755 "$REMOTE_FRONTEND_DIR"
        
        echo "安装依赖..."
        cd "$REMOTE_FRONTEND_DIR"
        sudo npm install --production
        
        echo "启动前端服务..."
        export PORT=3001
        pm2 start server.js --name "$PM2_APP_NAME" --update-env
        pm2 save
        
        echo "清理临时文件..."
        rm -f /tmp/huntlink-frontend-standalone.tar.gz
        rm -rf /tmp/huntlink-frontend-deploy
        
        echo "远程部署完成！"
EOF
    
    log "  ✓ 远程部署完成"
}

# 健康检查
health_check() {
    log "执行健康检查..."
    
    sleep 5
    
    if curl -s --connect-timeout 5 "http://${SERVER_HOST}" > /dev/null 2>&1; then
        log "  ✓ 前端服务健康检查通过"
    else
        warn "  ⚠  健康检查失败，请手动检查"
    fi
}

# 主部署流程
main() {
    log "=== HuntLink 前端部署开始 ==="
    echo
    
    check_local
    build_frontend
    prepare_deploy
    create_package
    upload_package
    remote_deploy
    health_check
    
    echo
    log "=== 部署完成 ==="
    echo
    log "部署信息:"
    log "  服务器: $SERVER_HOST"
    log "  应用名称: $PM2_APP_NAME"
    log "  部署路径: $REMOTE_FRONTEND_DIR"
    log "  运行端口: 3001"
    echo
    log "访问地址:"
    log "  网站: http://${SERVER_HOST}"
    log "  API: http://${SERVER_HOST}/api"
    echo
}

# 快速部署（跳过构建，直接部署当前构建）
quick_deploy() {
    log "快速部署模式（跳过构建）..."
    
    if [ ! -d "$LOCAL_FRONTEND_DIR/.next/standalone" ]; then
        error "standalone目录不存在，请先执行完整构建"
        exit 1
    fi
    
    prepare_deploy
    create_package
    upload_package
    remote_deploy
    health_check
    
    log "快速部署完成！"
}

# 使用说明
usage() {
    echo "用法: $0 {deploy|quick}"
    echo
    echo "命令:"
    echo "  deploy - 完整部署（构建+部署）"
    echo "  quick  - 快速部署（跳过构建）"
    echo
    exit 1
}

# 主程序
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "quick")
        quick_deploy
        ;;
    *)
        usage
        ;;
esac
