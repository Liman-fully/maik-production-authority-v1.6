#!/bin/bash
# 脉刻 Maik 自动化部署脚本 (v2)
set -e

SERVER="ubuntu@150.158.51.199"
REMOTE_DIR="/home/ubuntu/huntlink"
KEY="/Users/liman/Desktop/workbuddy.pem"
LOCAL_DIR="/Users/liman/Desktop/huntlink-stable-final"
APP_NAME="maik-backend"

echo "🚀 开始部署脉刻 Maik 后端..."

# 1. 本地构建
echo "📦 [1/5] 本地构建..."
cd "$LOCAL_DIR/backend"
npm run build
echo "✅ 构建成功"

# 2. 创建远程目录
echo "📂 [2/5] 准备服务器目录..."
ssh -o StrictHostKeyChecking=no -i "$KEY" "$SERVER" "mkdir -p $REMOTE_DIR/backend"

# 3. 同步代码 (Tar over SSH)
echo "📤 [3/5] 同步代码..."
tar cf - dist/ package.json package-lock.json src/ | ssh -o StrictHostKeyChecking=no -i "$KEY" "$SERVER" "cd $REMOTE_DIR/backend && tar xf -"
echo "✅ 同步完成"

# 4. 安装依赖 (Production Only)
echo "🔧 [4/5] 安装生产依赖..."
ssh -o StrictHostKeyChecking=no -i "$KEY" "$SERVER" "
    cd $REMOTE_DIR/backend
    npm install --omit=dev --no-audit --no-fund
"
echo "✅ 依赖安装完成"

# 5. 重启 PM2
echo "🔄 [5/5] 重启服务..."
ssh -o StrictHostKeyChecking=no -i "$KEY" "$SERVER" "
    cd $REMOTE_DIR/backend
    pm2 delete $APP_NAME 2>/dev/null || true
    pm2 start dist/src/main.js --name $APP_NAME --env NODE_ENV=production
    pm2 save
    sleep 2
    pm2 logs $APP_NAME --lines 5 --nostream
"
echo "🎉 部署完成！"
