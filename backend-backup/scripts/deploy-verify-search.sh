#!/bin/bash

# 搜索功能优化 - 部署验证脚本
# 使用方式：./scripts/deploy-verify-search.sh

set -e

echo "🚀 开始部署验证..."

# 1. 检查 PostgreSQL 连接
echo ""
echo "📊 检查 PostgreSQL 连接..."
psql -h localhost -U huntlink -d huntlink -c "SELECT version();" > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ PostgreSQL 连接成功"
else
  echo "❌ PostgreSQL 连接失败"
  exit 1
fi

# 2. 执行部分索引
echo ""
echo "📑 创建部分索引..."
psql -h localhost -U huntlink -d huntlink -f scripts/create-partial-indexes.sql
if [ $? -eq 0 ]; then
  echo "✅ 部分索引创建成功"
else
  echo "❌ 部分索引创建失败"
  exit 1
fi

# 3. 执行物化视图
echo ""
echo "📊 创建物化视图..."
psql -h localhost -U huntlink -d huntlink -f scripts/create-materialized-views.sql
if [ $? -eq 0 ]; then
  echo "✅ 物化视图创建成功"
else
  echo "❌ 物化视图创建失败"
  exit 1
fi

# 4. 验证索引
echo ""
echo "🔍 验证索引..."
psql -h localhost -U huntlink -d huntlink -c "
SELECT 
  indexname,
  pg_size_pretty(pg_relation_size(indexname::regclass)) as size
FROM pg_indexes
WHERE tablename = 'candidates'
  AND indexname LIKE 'idx_candidates%'
ORDER BY indexname;
"

# 5. 验证物化视图
echo ""
echo "📊 验证物化视图..."
psql -h localhost -U huntlink -d huntlink -c "
SELECT 
  matviewname,
  pg_size_pretty(pg_relation_size(matviewname::regclass)) as size
FROM pg_matviews
WHERE matviewname LIKE 'mv_hot_search%'
ORDER BY matviewname;
"

# 6. 测试搜索性能
echo ""
echo "⚡ 测试搜索性能..."
psql -h localhost -U huntlink -d huntlink -c "
EXPLAIN ANALYZE
SELECT id, name, city
FROM candidates
WHERE search_context @@ to_tsquery('chinese', 'Java')
LIMIT 20;
"

# 7. 刷新物化视图测试
echo ""
echo "🔄 测试物化视图刷新..."
psql -h localhost -U huntlink -d huntlink -c "SELECT refresh_mv_hot_search();"

echo ""
echo "✅ 部署验证完成！"
echo ""
echo "📊 性能预期:"
echo "  - 简单搜索：20-50ms"
echo "  - 深分页：50ms"
echo "  - 热门搜索：20-50ms"
echo ""
echo "📝 下一步:"
echo "  1. 重启后端服务：pm2 restart huntlink-backend"
echo "  2. 测试 API 接口"
echo "  3. 验证缓存命中率"
