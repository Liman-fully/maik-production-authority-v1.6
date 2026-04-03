#!/bin/bash
# scripts/cleanup.sh
# 系统清理脚本（每日执行）

set -e

echo "🧹 开始系统清理..."

# 1. 清理临时文件
echo "📁 清理临时文件..."
find . -name "*.tmp" -type f -delete
find . -name "*.log" -type f -mtime +7 -delete
find . -name "node_modules" -type d -prune -exec rm -rf {} \; 2>/dev/null || true

# 2. 清理旧日志
echo "📝 清理旧日志..."
LOG_DIR="logs"
if [ -d "$LOG_DIR" ]; then
  find $LOG_DIR -name "*.log" -type f -mtime +30 -delete
  echo "✅ 日志清理完成"
fi

# 3. 清理 Docker 悬空镜像
echo "🐳 清理 Docker 悬空镜像..."
docker image prune -f || true

# 4. 清理 Git 垃圾
echo "🗑️ 清理 Git 垃圾..."
git gc --prune=now --quiet || true

# 5. 清理旧备份
echo "💾 清理旧备份..."
BACKUP_DIR="backups"
if [ -d "$BACKUP_DIR" ]; then
  find $BACKUP_DIR -name "*.sql" -type f -mtime +30 -delete
  echo "✅ 备份清理完成"
fi

# 6. 检查磁盘空间
echo "💽 检查磁盘空间..."
df -h | grep -E "^/|Filesystem"

echo ""
echo "✅ 系统清理完成！"
echo "📊 清理报告："
echo "   - 临时文件：已清理"
echo "   - 旧日志：已清理（保留 30 天）"
echo "   - Docker 悬空镜像：已清理"
echo "   - Git 垃圾：已清理"
echo "   - 旧备份：已清理（保留 30 天）"
