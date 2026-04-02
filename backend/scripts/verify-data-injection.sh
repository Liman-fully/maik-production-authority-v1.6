#!/bin/bash

# 测试数据注入快速执行脚本
# 用法: ./scripts/run-data-injection.sh

set -e

echo "🚀 猎脉测试数据注入工具"
echo "========================"
echo ""

# 检查SSH隧道
echo "📡 检查SSH隧道..."
if ! lsof -i :15432 > /dev/null 2>&1; then
    echo "⚠️  SSH隧道未开启，正在建立连接..."
    ssh -f -N -L 15432:localhost:5432 -i ~/Desktop/workbuddy.pem ubuntu@150.158.51.199
    sleep 2
    echo "✅ SSH隧道已建立"
else
    echo "✅ SSH隧道已开启"
fi

echo ""

# 检查依赖
echo "📦 检查依赖..."
if [ ! -d "node_modules" ]; then
    echo "⚠️  依赖未安装，正在安装..."
    npm install
fi
echo "✅ 依赖已就绪"

echo ""

# 检查环境变量
echo "🔧 检查环境变量..."
if [ ! -f ".env" ]; then
    echo "❌ .env 文件不存在"
    exit 1
fi

if ! grep -q "DB_PORT=15432" .env; then
    echo "⚠️  DB_PORT 不是 15432，请检查SSH隧道配置"
fi
echo "✅ 环境变量正确"

echo ""

# 执行注入
echo "💾 开始注入测试数据..."
echo ""

npx ts-node scripts/inject-test-resumes.ts

echo ""
echo "✅ 数据注入完成！"
