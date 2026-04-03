#!/bin/bash

# 单命令2GB服务器部署脚本
# 一键完成：编译 -> 打包 -> 上传 -> 部署

set -e

echo "🚀 HuntLink 2GB服务器一键部署"
echo "========================================"

# 配置
SERVER_IP="150.158.51.199"
SSH_KEY="$HOME/Desktop/workbuddy.pem"
REMOTE_USER="ubuntu"
PROJECT_DIR="/Users/liman/Desktop/huntlink-stable-final"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📊 部署配置:${NC}"
echo "- 服务器: $REMOTE_USER@$SERVER_IP"
echo "- 项目目录: $PROJECT_DIR"
echo "- 内存限制: 2GB RAM优化"
echo ""

# 1. 检查依赖
echo -e "${BLUE}🔍 步骤1: 检查依赖...${NC}"
if [ ! -f "$SSH_KEY" ]; then
    echo -e "${RED}❌ SSH密钥不存在: $SSH_KEY${NC}"
    exit 1
fi

if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ 项目目录不存在: $PROJECT_DIR${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 依赖检查通过${NC}"

# 2. 编译前端
echo -e "${BLUE}🏗️  步骤2: M1重火力编译前端...${NC}"
cd "$PROJECT_DIR"

# 检查是否需要编译
if [ ! -d ".next/standalone" ] || [ "$1" = "--force" ]; then
    echo "- 清除缓存..."
    rm -rf .next 2>/dev/null || true
    
    echo "- 设置M1优化环境..."
    export NODE_OPTIONS="--max-old-space-size=4096"
    export NEXT_TELEMETRY_DISABLED=1
    
    echo "- 运行Next.js编译..."
    if npm run build; then
        echo -e "${GREEN}✅ 前端编译成功${NC}"
    else
        echo -e "${RED}❌ 前端编译失败${NC}"
        echo -e "${YELLOW}💡 提示: 使用物理搬运模式，直接使用现有构建${NC}"
        if [ ! -d ".next/standalone" ]; then
            echo -e "${RED}❌ 没有可用的standalone构建${NC}"
            exit 1
        fi
    fi
else
    echo -e "${GREEN}✅ 使用现有编译输出${NC}"
fi

# 3. 准备部署包
echo -e "${BLUE}📦 步骤3: 准备轻量级部署包...${NC}"
DEPLOY_NAME="huntlink-2gb-$(date +%Y%m%d-%H%M%S)"
DEPLOY_DIR="/tmp/$DEPLOY_NAME"

mkdir -p "$DEPLOY_DIR"

# 复制前端
echo "- 复制前端standalone包..."
cp -r .next/standalone "$DEPLOY_DIR/frontend"
cp -r public "$DEPLOY_DIR/frontend/" 2>/dev/null || true

# 创建最小化启动脚本
cat > "$DEPLOY_DIR/frontend/start.sh" << 'EOF'
#!/bin/bash
export NODE_OPTIONS="--max-old-space-size=1024"
export PORT=3001
export NODE_ENV=production
exec node server.js
EOF
chmod +x "$DEPLOY_DIR/frontend/start.sh"

# 创建PM2配置
cat > "$DEPLOY_DIR/ecosystem.config.js" << 'EOF'
module.exports = {
  apps: [{
    name: 'huntlink-frontend',
    script: './frontend/start.sh',
    cwd: __dirname,
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '1024M',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
EOF

# 创建部署脚本
cat > "$DEPLOY_DIR/deploy.sh" << 'EOF'
#!/bin/bash
set -e
echo "🚀 开始轻量级部署..."
cd frontend
npm ci --only=production --no-audit --no-fund --silent
echo "✅ 部署完成"
echo "启动命令: pm2 start ../ecosystem.config.js"
EOF
chmod +x "$DEPLOY_DIR/deploy.sh"

# 4. 打包
echo -e "${BLUE}📦 步骤4: 打包...${NC}"
cd /tmp
tar -czf "$DEPLOY_NAME.tar.gz" "$DEPLOY_NAME"
DEPLOY_SIZE=$(du -sh "$DEPLOY_NAME.tar.gz" | cut -f1)
echo -e "${GREEN}✅ 打包完成: $DEPLOY_NAME.tar.gz ($DEPLOY_SIZE)${NC}"

# 5. 上传到服务器
echo -e "${BLUE}📤 步骤5: 上传到服务器...${NC}"
if scp -i "$SSH_KEY" "$DEPLOY_NAME.tar.gz" "$REMOTE_USER@$SERVER_IP:/tmp/"; then
    echo -e "${GREEN}✅ 上传成功${NC}"
else
    echo -e "${RED}❌ 上传失败${NC}"
    exit 1
fi

# 6. 远程部署
echo -e "${BLUE}🚀 步骤6: 远程部署...${NC}"
REMOTE_COMMANDS="
cd /tmp && \
tar -xzf $DEPLOY_NAME.tar.gz && \
cd $DEPLOY_NAME && \
./deploy.sh && \
pm2 delete huntlink-frontend 2>/dev/null || true && \
pm2 start ecosystem.config.js && \
pm2 save && \
echo '✅ 部署完成!' && \
echo '' && \
echo '📊 服务状态:' && \
pm2 status huntlink-frontend && \
echo '' && \
echo '🌐 访问地址: http://$SERVER_IP' && \
echo '💡 前端运行在: http://$SERVER_IP:3001' && \
echo '🔧 监控命令: pm2 logs huntlink-frontend'
"

if ssh -i "$SSH_KEY" "$REMOTE_USER@$SERVER_IP" "$REMOTE_COMMANDS"; then
    echo -e "${GREEN}🎉 部署成功!${NC}"
else
    echo -e "${RED}❌ 部署失败${NC}"
    exit 1
fi

# 7. 清理本地
echo -e "${BLUE}🧹 步骤7: 清理本地临时文件...${NC}"
rm -rf "$DEPLOY_DIR"
rm -f "$DEPLOY_NAME.tar.gz"
echo -e "${GREEN}✅ 清理完成${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 HuntLink 2GB服务器部署完成!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}📋 部署摘要:${NC}"
echo "- 服务器: $SERVER_IP"
echo "- 前端端口: 3001 (通过Nginx代理到80)"
echo "- 内存限制: 1GB"
echo "- 部署时间: $(date)"
echo ""
echo -e "${BLUE}🚀 访问地址:${NC}"
echo -e "  http://$SERVER_IP"
echo ""
echo -e "${BLUE}🔧 管理命令:${NC}"
echo -e "  查看状态: ssh -i $SSH_KEY $REMOTE_USER@$SERVER_IP 'pm2 status'"
echo -e "  查看日志: ssh -i $SSH_KEY $REMOTE_USER@$SERVER_IP 'pm2 logs huntlink-frontend'"
echo -e "  重启服务: ssh -i $SSH_KEY $REMOTE_USER@$SERVER_IP 'pm2 restart huntlink-frontend'"
echo ""
echo -e "${YELLOW}💡 提示: 运行 $0 --force 强制重新编译${NC}"