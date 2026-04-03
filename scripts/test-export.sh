#!/bin/bash

# 批量导出功能测试脚本
# 用于测试简历批量导出功能（PDF 和 Excel 格式）

set -e

# 配置
BASE_URL="${API_BASE_URL:-http://localhost:3000}"
TOKEN="${API_TOKEN:-}"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================"
echo "  批量导出功能测试"
echo "========================================"
echo ""

# 检查 TOKEN
if [ -z "$TOKEN" ]; then
    echo -e "${RED}错误：请设置 API_TOKEN 环境变量${NC}"
    echo "用法：export API_TOKEN='your-jwt-token'"
    exit 1
fi

# 测试 1: 创建 PDF 导出任务
echo -e "${YELLOW}[测试 1] 创建 PDF 导出任务${NC}"
PDF_RESPONSE=$(curl -s -X POST "${BASE_URL}/export/resumes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "resumeIds": ["resume-id-1", "resume-id-2"],
    "format": "pdf"
  }')
echo "响应：${PDF_RESPONSE}"
PDF_TASK_ID=$(echo ${PDF_RESPONSE} | grep -o '"taskId":"[^"]*"' | cut -d'"' -f4)
echo "PDF 任务 ID: ${PDF_TASK_ID}"
echo ""

# 测试 2: 创建 Excel 导出任务
echo -e "${YELLOW}[测试 2] 创建 Excel 导出任务${NC}"
EXCEL_RESPONSE=$(curl -s -X POST "${BASE_URL}/export/resumes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "resumeIds": ["resume-id-1", "resume-id-2"],
    "format": "excel"
  }')
echo "响应：${EXCEL_RESPONSE}"
EXCEL_TASK_ID=$(echo ${EXCEL_RESPONSE} | grep -o '"taskId":"[^"]*"' | cut -d'"' -f4)
echo "Excel 任务 ID: ${EXCEL_TASK_ID}"
echo ""

# 测试 3: 查询导出进度
echo -e "${YELLOW}[测试 3] 查询导出进度${NC}"
if [ -n "$PDF_TASK_ID" ]; then
    STATUS_RESPONSE=$(curl -s -X GET "${BASE_URL}/export/status/${PDF_TASK_ID}" \
      -H "Authorization: Bearer ${TOKEN}")
    echo "PDF 任务状态：${STATUS_RESPONSE}"
fi
echo ""

# 测试 4: 等待并查询最终状态
echo -e "${YELLOW}[测试 4] 等待处理完成（5 秒）${NC}"
sleep 5

if [ -n "$PDF_TASK_ID" ]; then
    FINAL_STATUS=$(curl -s -X GET "${BASE_URL}/export/status/${PDF_TASK_ID}" \
      -H "Authorization: Bearer ${TOKEN}")
    echo "PDF 最终状态：${FINAL_STATUS}"
    
    # 检查状态是否为 completed
    if echo ${FINAL_STATUS} | grep -q '"status":"completed"'; then
        echo -e "${GREEN}✓ PDF 导出成功${NC}"
        
        # 测试下载
        echo ""
        echo -e "${YELLOW}[测试 5] 下载 PDF 文件${NC}"
        curl -s -X GET "${BASE_URL}/export/download/${PDF_TASK_ID}" \
          -H "Authorization: Bearer ${TOKEN}" \
          -o "/tmp/export_${PDF_TASK_ID}.pdf"
        echo "文件已下载到：/tmp/export_${PDF_TASK_ID}.pdf"
        echo -e "${GREEN}✓ 下载成功${NC}"
    else
        echo -e "${RED}✗ PDF 导出未完成或失败${NC}"
    fi
fi

echo ""
echo "========================================"
echo "  测试完成"
echo "========================================"

# 清理
echo ""
echo "提示："
echo "1. 检查 /tmp/export_*.pdf 文件"
echo "2. 查看 backend/uploads/exports/ 目录"
echo "3. 检查数据库 export_tasks 表"
