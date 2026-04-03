#!/bin/bash

# HuntLink 后端部署脚本
# 用于将后端代码部署到腾讯轻量云服务器

set -e

# 配置
LOCAL_BACKEND_DIR="/Users/liman/Desktop/huntlink-stable-final/backend"
SERVER_USER="ubuntu"
SERVER_HOST="150.158.51.199"
SERVER_KEY="/Users/liman/Desktop/workbuddy.pem"
REMOTE_BASE_DIR="/var/www/huntlink/backend"
REMOTE_CURRENT_DIR="$REMOTE_BASE_DIR/current"
REMOTE_RELEASES_DIR="$REMOTE_BASE_DIR/releases"
PM2_APP_NAME="huntlink-backend"

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
    
    if [ ! -d "$LOCAL_BACKEND_DIR" ]; then
        error "后端目录不存在: $LOCAL_BACKEND_DIR"
        exit 1
    fi
    log "  ✓ 后端目录存在"
    
    if [ ! -f "$SERVER_KEY" ]; then
        error "SSH密钥不存在: $SERVER_KEY"
        exit 1
    fi
    log "  ✓ SSH密钥存在"
    
    # 检查package.json
    if [ ! -f "$LOCAL_BACKEND_DIR/package.json" ]; then
        error "package.json 不存在"
        exit 1
    fi
    log "  ✓ package.json 存在"
}

# 构建后端代码
build_backend() {
    log "构建后端代码..."
    cd "$LOCAL_BACKEND_DIR"
    
    log "  安装依赖..."
    if npm install; then
        log "    ✓ 依赖安装成功"
    else
        error "依赖安装失败"
        exit 1
    fi
    
    log "  构建项目..."
    if npm run build; then
        log "    ✓ 构建成功"
    else
        error "构建失败"
        exit 1
    fi
    
    # 检查dist目录
    if [ ! -d "$LOCAL_BACKEND_DIR/dist" ]; then
        error "dist目录不存在"
        exit 1
    fi
    log "  ✓ dist目录已生成"
}

# 创建部署包
create_package() {
    log "创建部署包..."
    cd "$LOCAL_BACKEND_DIR"
    
    # 创建临时目录
    DEPLOY_DIR="/tmp/huntlink-backend-deploy"
    rm -rf "$DEPLOY_DIR"
    mkdir -p "$DEPLOY_DIR"
    
    # 复制必要文件
    log "  复制文件..."
    cp -r dist "$DEPLOY_DIR/"
    cp package.json "$DEPLOY_DIR/"
    cp package-lock.json "$DEPLOY_DIR/" 2>/dev/null || true
    cp ecosystem.config.js "$DEPLOY_DIR/" 2>/dev/null || true
    
    # 创建tar包（macOS需要COPYFILE_DISABLE=1）
    log "  创建tar包..."
    cd /tmp
    COPYFILE_DISABLE=1 tar -czf huntlink-backend.tar.gz huntlink-backend-deploy/
    
    DEPLOY_PACKAGE="/tmp/huntlink-backend.tar.gz"
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
    
    DEPLOY_PACKAGE="/tmp/huntlink-backend.tar.gz"
    
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
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    REMOTE_RELEASE_DIR="$REMOTE_RELEASES_DIR/v${TIMESTAMP}"
    
    ssh -i "$SERVER_KEY" "${SERVER_USER}@${SERVER_HOST}" << EOF
        set -e
        
        echo "创建发布目录..."
        sudo mkdir -p "$REMOTE_RELEASE_DIR"
        
        echo "解压部署包..."
        sudo tar -xzf /tmp/huntlink-backend.tar.gz -C /tmp/
        
        echo "复制文件到发布目录..."
        sudo cp -r /tmp/huntlink-backend-deploy/* "$REMOTE_RELEASE_DIR/"
        
        echo "设置权限..."
        sudo chown -R www-data:www-data "$REMOTE_RELEASE_DIR"
        sudo chmod -R 755 "$REMOTE_RELEASE_DIR"
        
        echo "更新current软链接..."
        sudo ln -sfn "$REMOTE_RELEASE_DIR" "$REMOTE_CURRENT_DIR"
        
        echo "重新加载PM2应用..."
        cd "$REMOTE_CURRENT_DIR"
        
        # 安装生产依赖
        sudo npm install --production
        
        # 重新加载PM2
        if pm2 list | grep -q "$PM2_APP_NAME"; then
            pm2 reload "$PM2_APP_NAME"
        else
            pm2 start ecosystem.config.js --name "$PM2_APP_NAME"
        fi
        
        pm2 save
        
        echo "清理临时文件..."
        rm -f /tmp/huntlink-backend.tar.gz
        rm -rf /tmp/huntlink-backend-deploy
        
        echo "部署完成！"
EOF
    
    log "  ✓ 远程部署完成"
}

# 健康检查
health_check() {
    log "执行健康检查..."
    
    sleep 5
    
    if curl -s --connect-timeout 5 "http://${SERVER_HOST}/api/health" > /dev/null 2>&1; then
        log "  ✓ 后端服务健康检查通过"
    else
        warn "  ⚠  健康检查失败，请手动检查"
    fi
}

# 清理旧版本
cleanup_old_releases() {
    log "清理旧版本..."
    
    ssh -i "$SERVER_KEY" "${SERVER_USER}@${SERVER_HOST}" << EOF
        # 保留最近5个版本
        cd "$REMOTE_RELEASES_DIR"
        ls -t | tail -n +6 | xargs -r sudo rm -rf
EOF
    
    log "  ✓ 旧版本清理完成"
}

# 主部署流程
main() {
    log "=== HuntLink 后端部署开始 ==="
    echo
    
    check_local
    build_backend
    create_package
    upload_package
    remote_deploy
    health_check
    cleanup_old_releases
    
    echo
    log "=== 部署完成 ==="
    echo
    log "部署信息:"
    log "  服务器: $SERVER_HOST"
    log "  应用名称: $PM2_APP_NAME"
    log "  部署路径: $REMOTE_CURRENT_DIR"
    echo
    log "访问地址:"
    log "  健康检查: http://${SERVER_HOST}/api/health"
    log "  API文档: http://${SERVER_HOST}/api/docs"
    echo
}

# 回滚功能
rollback() {
    log "执行回滚操作..."
    
    ssh -i "$SERVER_KEY" "${SERVER_USER}@${SERVER_HOST}" << EOF
        cd "$REMOTE_RELEASES_DIR"
        PREVIOUS_VERSION=
        ls -t | head -2 | tail -1
        
        if [ -n "\$PREVIOUS_VERSION" ]; then
            echo "回滚到版本: \$PREVIOUS_VERSION"
            sudo ln -sfn "$REMOTE_RELEASES_DIR/\$PREVIOUS_VERSION" "$REMOTE_CURRENT_DIR"
            
            cd "$REMOTE_CURRENT_DIR"
            pm2 reload "$PM2_APP_NAME"
            
            echo "回滚完成"
        else
            echo "没有找到之前的版本"
            exit 1
        fi
EOF
    
    log "  ✓ 回滚完成"
}

# 显示部署历史
history() {
    log "部署历史:"
    
    ssh -i "$SERVER_KEY" "${SERVER_USER}@${SERVER_HOST}" << EOF
        cd "$REMOTE_RELEASES_DIR"
        echo "最近的部署版本:"
        ls -lt | head -10
EOF
}

# 使用说明
usage() {
    echo "用法: $0 {deploy|rollback|history}"
    echo
    echo "命令:"
    echo "  deploy   - 部署后端代码"
    echo "  rollback - 回滚到上一个版本"
    echo "  history  - 显示部署历史"
    echo
    exit 1
}

# 主程序
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "rollback")
        rollback
        ;;
    "history")
        history
        ;;
    *)
        usage
        ;;
esac
