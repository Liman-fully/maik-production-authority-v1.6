#!/bin/bash

# ============================================
# 人才推荐功能测试脚本
# ============================================
# 用法：./test-recommendation.sh [BASE_URL] [JWT_TOKEN]
# 示例：./test-recommendation.sh http://localhost:3000 "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
# ============================================

set -e

BASE_URL=${1:-"http://localhost:3000"}
JWT_TOKEN=${2:-""}

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}============================================${NC}"
echo -e "${YELLOW}   人才推荐功能测试${NC}"
echo -e "${YELLOW}============================================${NC}"
echo ""
echo "Base URL: ${BASE_URL}"
echo ""

# 检查 JWT Token
if [ -z "$JWT_TOKEN" ]; then
  echo -e "${RED}错误：请提供 JWT Token${NC}"
  echo "用法：$0 [BASE_URL] [JWT_TOKEN]"
  echo ""
  echo "示例:"
  echo "  $0 http://localhost:3000 eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  exit 1
fi

# HTTP 请求头
HEADERS="Authorization: Bearer $JWT_TOKEN"
CONTENT_TYPE="Content-Type: application/json"

# ============================================
# 测试 1: 获取推荐列表（空）
# ============================================
echo -e "${GREEN}[测试 1] 获取用户推荐列表${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET \
  -H "$HEADERS" \
  "$BASE_URL/recommendations?limit=10")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  echo -e "${GREEN}✓ 请求成功 (HTTP $HTTP_CODE)${NC}"
  echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
else
  echo -e "${RED}✗ 请求失败 (HTTP $HTTP_CODE)${NC}"
  echo "$BODY"
fi
echo ""

# ============================================
# 测试 2: 生成推荐列表
# ============================================
echo -e "${GREEN}[测试 2] 生成推荐列表${NC}"

# 模拟用户行为数据
BEHAVIOR_DATA='{
  "behavior": {
    "viewedCandidateIds": ["1", "2"],
    "downloadedCandidateIds": ["3"],
    "searchedPositions": ["Java 工程师", "后端开发"],
    "industry": "互联网",
    "preferredSkills": ["Java", "Spring Boot", "MySQL", "Redis"]
  },
  "limit": 5
}'

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  -H "$HEADERS" \
  -H "$CONTENT_TYPE" \
  -d "$BEHAVIOR_DATA" \
  "$BASE_URL/recommendations/generate")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  echo -e "${GREEN}✓ 推荐生成成功 (HTTP $HTTP_CODE)${NC}"
  echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
else
  echo -e "${RED}✗ 推荐生成失败 (HTTP $HTTP_CODE)${NC}"
  echo "$BODY"
fi
echo ""

# ============================================
# 测试 3: 再次获取推荐列表（应该有数据）
# ============================================
echo -e "${GREEN}[测试 3] 再次获取推荐列表${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET \
  -H "$HEADERS" \
  "$BASE_URL/recommendations?limit=10")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  echo -e "${GREEN}✓ 请求成功 (HTTP $HTTP_CODE)${NC}"
  echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
else
  echo -e "${RED}✗ 请求失败 (HTTP $HTTP_CODE)${NC}"
  echo "$BODY"
fi
echo ""

# ============================================
# 测试 4: 更新推荐状态
# ============================================
echo -e "${GREEN}[测试 4] 更新推荐状态（标记为已展示）${NC}"

# 获取第一条推荐 ID
FIRST_REC_ID=$(echo "$BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data'][0]['id'] if data.get('data') and len(data['data']) > 0 else '')" 2>/dev/null || echo "")

if [ -n "$FIRST_REC_ID" ]; then
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    -H "$HEADERS" \
    -H "$CONTENT_TYPE" \
    -d '{"status": "shown"}' \
    "$BASE_URL/recommendations/$FIRST_REC_ID/status")

  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  RESP_BODY=$(echo "$RESPONSE" | head -n-1)

  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo -e "${GREEN}✓ 状态更新成功 (HTTP $HTTP_CODE)${NC}"
    echo "$RESP_BODY" | python3 -m json.tool 2>/dev/null || echo "$RESP_BODY"
  else
    echo -e "${RED}✗ 状态更新失败 (HTTP $HTTP_CODE)${NC}"
    echo "$RESP_BODY"
  fi
else
  echo -e "${YELLOW}⚠ 跳过：没有可用的推荐 ID${NC}"
fi
echo ""

# ============================================
# 测试 5: 批量更新推荐状态
# ============================================
echo -e "${GREEN}[测试 5] 批量更新推荐状态${NC}"

# 获取所有推荐 ID
ALL_IDS=$(echo "$BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(','.join([r['id'] for r in data.get('data', [])]))" 2>/dev/null || echo "")

if [ -n "$ALL_IDS" ]; then
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    -H "$HEADERS" \
    -H "$CONTENT_TYPE" \
    -d '{"status": "clicked"}' \
    "$BASE_URL/recommendations/bulk-status?ids=$ALL_IDS")

  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  RESP_BODY=$(echo "$RESPONSE" | head -n-1)

  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo -e "${GREEN}✓ 批量更新成功 (HTTP $HTTP_CODE)${NC}"
    echo "$RESP_BODY" | python3 -m json.tool 2>/dev/null || echo "$RESP_BODY"
  else
    echo -e "${RED}✗ 批量更新失败 (HTTP $HTTP_CODE)${NC}"
    echo "$RESP_BODY"
  fi
else
  echo -e "${YELLOW}⚠ 跳过：没有可用的推荐 ID${NC}"
fi
echo ""

# ============================================
# 测试 6: 获取推荐统计
# ============================================
echo -e "${GREEN}[测试 6] 获取推荐统计信息${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET \
  -H "$HEADERS" \
  "$BASE_URL/recommendations/stats")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  echo -e "${GREEN}✓ 统计获取成功 (HTTP $HTTP_CODE)${NC}"
  echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
else
  echo -e "${RED}✗ 统计获取失败 (HTTP $HTTP_CODE)${NC}"
  echo "$BODY"
fi
echo ""

# ============================================
# 测试 7: 清除缓存
# ============================================
echo -e "${GREEN}[测试 7] 清除推荐缓存${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  -H "$HEADERS" \
  "$BASE_URL/recommendations/cache/clear")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  echo -e "${GREEN}✓ 缓存清除成功 (HTTP $HTTP_CODE)${NC}"
  echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
else
  echo -e "${RED}✗ 缓存清除失败 (HTTP $HTTP_CODE)${NC}"
  echo "$BODY"
fi
echo ""

# ============================================
# 测试完成
# ============================================
echo -e "${YELLOW}============================================${NC}"
echo -e "${YELLOW}   测试完成${NC}"
echo -e "${YELLOW}============================================${NC}"
