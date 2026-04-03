#!/bin/bash
# 原子化部署脚本 - 猎脉 HuntLink
# 遵循 Gemini 架构师建议：零停机、可回滚

set -e  # 任何错误立即退出

# 配置
BACKEND_DIR="/var/www/huntlink/backend"
RELEASES_DIR="$BACKEND_DIR/releases"
CURRENT_LINK="$BACKEND_DIR/current"
TIMESTAMP=$(date +%Y%m%d%H%M%S)
RELEASE_DIR="$RELEASES_DIR/v$TIMESTAMP"
TARBALL="/tmp/backend-dist.tar.gz"

echo "🚀 开始原子化部署..."

# 1. 创建发布目录
echo "📁 创建发布目录: $RELEASE_DIR"
sudo mkdir -p "$RELEASES_DIR"
sudo mkdir -p "$RELEASE_DIR"

# 2. 解压到发布目录（不影响当前运行的服务）
echo "📦 解压构建产物..."
sudo tar -xzf "$TARBALL" -C "$RELEASE_DIR"
sudo chown -R ubuntu:ubuntu "$RELEASE_DIR"

# 3. 检查关键文件是否存在
if [ ! -f "$RELEASE_DIR/dist/src/main.js" ]; then
    echo "❌ 错误：构建产物不完整，缺少 dist/src/main.js"
    sudo rm -rf "$RELEASE_DIR"
    exit 1
fi

# 4. 原子化切换软链接（秒级切换）
echo "🔗 切换软链接..."
sudo ln -sfn "$RELEASE_DIR" "$CURRENT_LINK"

# 5. PM2 优雅重载（而非重启）
echo "♻️  PM2 优雅重载..."
cd "$BACKEND_DIR"
if pm2 list | grep -q "huntlink-backend"; then
    # 服务已存在，优雅重载（0秒停机）
    pm2 reload huntlink-backend --update-env
else
    # 首次启动
    pm2 start ecosystem.config.js --env production
fi

# 6. 等待服务稳定
echo "⏳ 等待服务稳定..."
sleep 5

# 7. 健康检查
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/docs | grep -q "200"; then
    echo "✅ 部署成功！API 正常响应"
    pm2 save
else
    echo "⚠️  API 未响应，检查日志..."
    pm2 logs huntlink-backend --lines 20 --nostream
fi

# 8. 清理旧版本（保留最近 5 个）
echo "🧹 清理旧版本..."
cd "$RELEASES_DIR"
ls -t | tail -n +6 | xargs -r sudo rm -rf

echo "🎉 部署完成！当前版本: v$TIMESTAMP"
echo "💡 回滚命令: ln -sfn $RELEASES_DIR/v旧版本 $CURRENT_LINK && pm2 reload huntlink-backend"
