#!/bin/bash

# 下载限制测试脚本
# 测试下载频率限制是否正常工作
# 限制：每分钟 5 份、每小时 50 份、每天 200 份

set -e

# 配置
BASE_URL="${API_BASE_URL:-http://localhost:3000}"
TOKEN="${TEST_TOKEN:-}"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "======================================"
echo "下载限制测试脚本"
echo "======================================"
echo ""

# 检查是否提供了 token
if [ -z "$TOKEN" ]; then
    echo -e "${YELLOW}警告：未设置 TEST_TOKEN 环境变量${NC}"
    echo "请先登录获取 token，然后设置：export TEST_TOKEN=your_token_here"
    echo ""
    echo "或者运行：TEST_TOKEN=your_token $0"
    exit 1
fi

# 测试 1: 检查批量导出接口是否已移除
echo "测试 1: 检查批量导出接口是否已移除"
echo "--------------------------------------"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/export/resumes" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"resumeIds": [1,2,3], "format": "pdf"}')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "403" ]; then
    echo -e "${GREEN}✓ 通过：批量导出接口已移除或禁止 (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}✗ 失败：批量导出接口仍然可用 (HTTP $HTTP_CODE)${NC}"
    echo "响应：$BODY"
fi

echo ""

# 测试 2: 检查下载接口是否存在
echo "测试 2: 检查下载接口状态"
echo "--------------------------------------"

# 注意：这里使用一个不存在的 taskId，应该返回 404
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}/export/download/test-task-id" \
    -H "Authorization: Bearer ${TOKEN}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "404" ]; then
    echo -e "${GREEN}✓ 通过：下载接口正常工作（返回 404 因为 taskId 不存在）${NC}"
else
    echo -e "${YELLOW}⚠ 下载接口返回 HTTP $HTTP_CODE${NC}"
fi

echo ""

# 测试 3: 频率限制测试（模拟快速多次下载）
echo "测试 3: 频率限制测试（每分钟 5 份限制）"
echo "--------------------------------------"

SUCCESS_COUNT=0
BLOCKED_COUNT=0

for i in {1..7}; do
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}/export/download/test-task-id-$i" \
        -H "Authorization: Bearer ${TOKEN}")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    
    if [ "$HTTP_CODE" = "403" ]; then
        BLOCKED_COUNT=$((BLOCKED_COUNT + 1))
        echo "  请求 $i: 被限制 (HTTP $HTTP_CODE)"
    elif [ "$HTTP_CODE" = "404" ]; then
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        echo "  请求 $i: 通过验证但文件不存在 (HTTP $HTTP_CODE)"
    else
        echo "  请求 $i: HTTP $HTTP_CODE"
    fi
done

echo ""
echo "结果：$SUCCESS_COUNT 次通过验证，$BLOCKED_COUNT 次被频率限制"

if [ $BLOCKED_COUNT -gt 0 ]; then
    echo -e "${GREEN}✓ 通过：频率限制生效${NC}"
else
    echo -e "${YELLOW}⚠ 注意：未触发频率限制（可能需要真实 taskId 测试）${NC}"
fi

echo ""

# 测试 4: 检查前端批量导出按钮是否移除
echo "测试 4: 检查前端代码"
echo "--------------------------------------"

FRONTEND_FILE="frontend-web/src/components/BatchActionBar/index.tsx"

if [ -f "$FRONTEND_FILE" ]; then
    if grep -q "DownloadIcon" "$FRONTEND_FILE"; then
        echo -e "${RED}✗ 失败：前端代码中仍然包含 DownloadIcon${NC}"
    else
        echo -e "${GREEN}✓ 通过：前端代码中已移除下载图标${NC}"
    fi
    
    if grep -q "onDownload" "$FRONTEND_FILE"; then
        echo -e "${RED}✗ 失败：前端代码中仍然包含 onDownload 属性${NC}"
    else
        echo -e "${GREEN}✓ 通过：前端代码中已移除 onDownload 属性${NC}"
    fi
else
    echo -e "${YELLOW}⚠ 警告：未找到前端文件 $FRONTEND_FILE${NC}"
    echo "请在项目根目录运行此脚本"
fi

echo ""
echo "======================================"
echo "测试完成"
echo "======================================"
echo ""
echo "手动验证步骤："
echo "1. 访问人才市场页面，确认批量操作栏没有「下载简历」按钮"
echo "2. 尝试选择多个简历，确认无法批量下载"
echo "3. 查看数据库 download_logs 表，确认下载操作被记录"
echo "4. 检查 Redis 中的下载计数：redis-cli KEYS 'download_limit:*'"
echo ""
