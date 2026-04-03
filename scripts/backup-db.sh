#!/bin/bash
# scripts/backup-db.sh
# 数据库备份脚本（每日执行）

set -e

BACKUP_DIR="backups/db"
DATE=$(date +%Y-%m-%d-%H-%M)
BACKUP_FILE="$BACKUP_DIR/huntlink-$DATE.sql"

# 确保备份目录存在
mkdir -p $BACKUP_DIR

echo "💾 开始备份数据库..."

# 备份数据库
mysqldump -u root -p${MYSQL_ROOT_PASSWORD} huntlink > $BACKUP_FILE

# 压缩备份
gzip $BACKUP_FILE

# 清理旧备份（保留 30 天）
find $BACKUP_DIR -name "*.sql.gz" -type f -mtime +30 -delete

echo "✅ 数据库备份完成！"
echo "📄 备份文件：$BACKUP_FILE.gz"
echo "💾 备份大小：$(du -h $BACKUP_FILE.gz | cut -f1)"
