#!/bin/bash

# 搜索性能优化 - 应用数据库索引脚本 (PostgreSQL)
# 使用方法：./scripts/apply-indexes.sh

set -e

# 从 .env 读取数据库配置
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# 默认值
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USERNAME:-huntlink}
DB_NAME=${DB_DATABASE:-huntlink}

echo "Applying search performance indexes..."
echo "Database: ${DB_HOST}:${DB_PORT}/${DB_NAME}"
echo ""

# 执行 SQL 迁移
PGPASSWORD=${DB_PASSWORD:-} psql -h "${DB_HOST}" \
      -p "${DB_PORT}" \
      -U "${DB_USER}" \
      -d "${DB_NAME}" \
      -f src/migrations/add-search-indexes.sql

echo ""
echo "Index application complete!"
echo ""
echo "Next steps:"
echo "1. Build TypeScript: npm run build"
echo "2. Run performance test: npx ts-node src/performance/search-performance.test.ts"
echo "3. Restart service: pm2 restart huntlink-backend or npm run start:prod"
