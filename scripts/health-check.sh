#!/bin/bash
# scripts/health-check.sh
# 系统健康检查脚本（每 5 分钟执行）

set -e

ALERT_FILE="logs/alerts.log"
mkdir -p logs

echo "🏥 健康检查..."

# 1. 检查服务运行
if ! docker-compose ps | grep -q "Up"; then
  echo "🚨 服务宕机！" >> $ALERT_FILE
  ./scripts/alert.sh "服务宕机！"
fi

# 2. 检查磁盘空间
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 90 ]; then
  echo "🚨 磁盘空间不足：${DISK_USAGE}%" >> $ALERT_FILE
  ./scripts/alert.sh "磁盘空间不足：${DISK_USAGE}%"
fi

# 3. 检查内存使用
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.0f", $3/$2*100)}')
if [ $MEMORY_USAGE -gt 80 ]; then
  echo "🚨 内存使用率高：${MEMORY_USAGE}%" >> $ALERT_FILE
  ./scripts/alert.sh "内存使用率高：${MEMORY_USAGE}%"
fi

# 4. 检查备份
LAST_BACKUP=$(ls -t backups/db/*.sql.gz 2>/dev/null | head -1)
if [ -z "$LAST_BACKUP" ]; then
  echo "🚨 今日备份未执行！" >> $ALERT_FILE
  ./scripts/alert.sh "今日备份未执行！"
fi

echo "✅ 健康检查完成"
