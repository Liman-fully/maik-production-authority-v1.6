#!/bin/bash

# HuntLink 健康检查脚本
# 用于检查整个系统的运行状态

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

SERVER_HOST="150.158.51.199"

echo -e "${BLUE}=== HuntLink 系统健康检查 ===${NC}"
echo

# 1. 检查前端服务
echo -e "${BLUE}1. 前端服务检查${NC}"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 3 "http://${SERVER_HOST}" 2>/dev/null || echo "000")
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo -e "${GREEN}  ✓ 前端服务运行正常${NC}"
    FRONTEND_RESPONSE=$(curl -s --connect-timeout 3 "http://${SERVER_HOST}" 2>/dev/null | head -c 100)
    echo "    响应: ${FRONTEND_RESPONSE}..."
else
    echo -e "${RED}  ✗ 前端服务异常 (HTTP ${FRONTEND_STATUS})${NC}"
fi

# 2. 检查后端API
echo -e "${BLUE}\n2. 后端API检查${NC}"
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 3 "http://${SERVER_HOST}/api/health" 2>/dev/null || echo "000")
if [ "$API_STATUS" = "200" ]; then
    echo -e "${GREEN}  ✓ 后端API运行正常${NC}"
    API_RESPONSE=$(curl -s --connect-timeout 3 "http://${SERVER_HOST}/api/health" 2>/dev/null)
    echo "    响应: $API_RESPONSE"
else
    echo -e "${RED}  ✗ 后端API异常 (HTTP ${API_STATUS})${NC}"
fi

# 3. 检查数据库连接
echo -e "${BLUE}\n3. 数据库连接检查${NC}"
DB_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 3 "http://${SERVER_HOST}/api/database/health" 2>/dev/null || echo "000")
if [ "$DB_STATUS" = "200" ]; then
    echo -e "${GREEN}  ✓ 数据库连接正常${NC}"
else
    echo -e "${YELLOW}  ⚠  数据库连接检查未配置 (HTTP ${DB_STATUS})${NC}"
fi

# 4. 检查Redis连接
echo -e "${BLUE}\n4. Redis连接检查${NC}"
REDIS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 3 "http://${SERVER_HOST}/api/redis/health" 2>/dev/null || echo "000")
if [ "$REDIS_STATUS" = "200" ]; then
    echo -e "${GREEN}  ✓ Redis连接正常${NC}"
else
    echo -e "${YELLOW}  ⚠  Redis连接检查未配置 (HTTP ${REDIS_STATUS})${NC}"
fi

# 5. 检查PM2进程
echo -e "${BLUE}\n5. PM2进程检查${NC}"
PM2_FRONTEND=$(ssh -i /Users/liman/Desktop/workbuddy.pem ubuntu@${SERVER_HOST} "pm2 list" 2>/dev/null | grep "huntlink-frontend" || echo "")
PM2_BACKEND=$(ssh -i /Users/liman/Desktop/workbuddy.pem ubuntu@${SERVER_HOST} "pm2 list" 2>/dev/null | grep "huntlink-backend" || echo "")

if [ -n "$PM2_FRONTEND" ]; then
    FRONTEND_STATUS=$(echo "$PM2_FRONTEND" | awk '{print $10}')
    if [ "$FRONTEND_STATUS" = "online" ]; then
        echo -e "${GREEN}  ✓ huntlink-frontend 运行正常${NC}"
    else
        echo -e "${RED}  ✗ huntlink-frontend 状态异常: $FRONTEND_STATUS${NC}"
    fi
else
    echo -e "${RED}  ✗ huntlink-frontend 未找到${NC}"
fi

if [ -n "$PM2_BACKEND" ]; then
    BACKEND_STATUS=$(echo "$PM2_BACKEND" | awk '{print $10}')
    if [ "$BACKEND_STATUS" = "online" ]; then
        echo -e "${GREEN}  ✓ huntlink-backend 运行正常${NC}"
    else
        echo -e "${RED}  ✗ huntlink-backend 状态异常: $BACKEND_STATUS${NC}"
    fi
else
    echo -e "${RED}  ✗ huntlink-backend 未找到${NC}"
fi

# 6. 检查磁盘空间
echo -e "${BLUE}\n6. 磁盘空间检查${NC}"
DISK_INFO=$(ssh -i /Users/liman/Desktop/workbuddy.pem ubuntu@${SERVER_HOST} "df -h /" 2>/dev/null | tail -1 || echo "")
if [ -n "$DISK_INFO" ]; then
    DISK_USED=$(echo "$DISK_INFO" | awk '{print $5}' | sed 's/%//')
    DISK_AVAIL=$(echo "$DISK_INFO" | awk '{print $4}')
    echo "  根分区: ${DISK_USED}% 已用, ${DISK_AVAIL} 可用"
    
    if [ "$DISK_USED" -lt 80 ]; then
        echo -e "${GREEN}  ✓ 磁盘空间充足${NC}"
    elif [ "$DISK_USED" -lt 90 ]; then
        echo -e "${YELLOW}  ⚠  磁盘空间警告 (使用率 ${DISK_USED}%)${NC}"
    else
        echo -e "${RED}  ✗ 磁盘空间不足 (使用率 ${DISK_USED}%)${NC}"
    fi
else
    echo -e "${YELLOW}  ⚠  无法获取磁盘信息${NC}"
fi

# 7. 检查内存使用
echo -e "${BLUE}\n7. 内存使用检查${NC}"
MEMORY_INFO=$(ssh -i /Users/liman/Desktop/workbuddy.pem ubuntu@${SERVER_HOST} "free -h" 2>/dev/null | grep "^Mem:" || echo "")
if [ -n "$MEMORY_INFO" ]; then
    MEM_TOTAL=$(echo "$MEMORY_INFO" | awk '{print $2}')
    MEM_USED=$(echo "$MEMORY_INFO" | awk '{print $3}')
    MEM_AVAIL=$(echo "$MEMORY_INFO" | awk '{print $7}')
    echo "  总内存: $MEM_TOTAL, 已用: $MEM_USED, 可用: $MEM_AVAIL"
    
    if [ -n "$MEM_AVAIL" ]; then
        MEM_AVAIL_GB=$(echo "$MEM_AVAIL" | sed 's/Gi//')
        if (( $(echo "$MEM_AVAIL_GB > 0.5" | bc -l) )); then
            echo -e "${GREEN}  ✓ 内存充足${NC}"
        else
            echo -e "${YELLOW}  ⚠  内存不足 (可用 ${MEM_AVAIL})${NC}"
        fi
    fi
else
    echo -e "${YELLOW}  ⚠  无法获取内存信息${NC}"
fi

# 8. 检查Nginx状态
echo -e "${BLUE}\n8. Nginx状态检查${NC}"
NGINX_STATUS=$(ssh -i /Users/liman/Desktop/workbuddy.pem ubuntu@${SERVER_HOST} "systemctl is-active nginx" 2>/dev/null || echo "unknown")
case "$NGINX_STATUS" in
    "active")
        echo -e "${GREEN}  ✓ Nginx 运行正常${NC}"
        ;;
    "inactive")
        echo -e "${RED}  ✗ Nginx 未运行${NC}"
        ;;
    "failed")
        echo -e "${RED}  ✗ Nginx 启动失败${NC}"
        ;;
    *)
        echo -e "${YELLOW}  ⚠  Nginx 状态未知${NC}"
        ;;
esac

# 9. 检查PostgreSQL
echo -e "${BLUE}\n9. PostgreSQL状态检查${NC}"
PG_STATUS=$(ssh -i /Users/liman/Desktop/workbuddy.pem ubuntu@${SERVER_HOST} "systemctl is-active postgresql" 2>/dev/null || echo "unknown")
case "$PG_STATUS" in
    "active")
        echo -e "${GREEN}  ✓ PostgreSQL 运行正常${NC}"
        ;;
    "inactive")
        echo -e "${RED}  ✗ PostgreSQL 未运行${NC}"
        ;;
    *)
        echo -e "${YELLOW}  ⚠  PostgreSQL 状态未知${NC}"
        ;;
esac

# 10. 检查Redis
echo -e "${BLUE}\n10. Redis状态检查${NC}"
REDIS_STATUS=$(ssh -i /Users/liman/Desktop/workbuddy.pem ubuntu@${SERVER_HOST} "systemctl is-active redis" 2>/dev/null || echo "unknown")
case "$REDIS_STATUS" in
    "active")
        echo -e "${GREEN}  ✓ Redis 运行正常${NC}"
        ;;
    "inactive")
        echo -e "${RED}  ✗ Redis 未运行${NC}"
        ;;
    *)
        echo -e "${YELLOW}  ⚠  Redis 状态未知${NC}"
        ;;
esac

# 总结
echo -e "${BLUE}\n=== 健康检查总结 ===${NC}"
FAILED_CHECKS=0

if [ "$FRONTEND_STATUS" != "200" ]; then
    ((FAILED_CHECKS++))
fi

if [ "$API_STATUS" != "200" ]; then
    ((FAILED_CHECKS++))
fi

if [ -n "$PM2_FRONTEND" ] && [ "$FRONTEND_STATUS" != "online" ]; then
    ((FAILED_CHECKS++))
fi

if [ -n "$PM2_BACKEND" ] && [ "$BACKEND_STATUS" != "online" ]; then
    ((FAILED_CHECKS++))
fi

echo
if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "${GREEN}✓ 所有检查通过，系统运行正常！${NC}"
elif [ $FAILED_CHECKS -lt 3 ]; then
    echo -e "${YELLOW}⚠ 发现 $FAILED_CHECKS 个问题，需要关注${NC}"
else
    echo -e "${RED}✗ 发现 $FAILED_CHECKS 个严重问题，需要立即处理${NC}"
fi

echo
echo "建议操作:"
if [ "$FRONTEND_STATUS" != "200" ]; then
    echo "  - 检查前端日志: pm2 logs huntlink-frontend"
fi

if [ "$API_STATUS" != "200" ]; then
    echo "  - 检查后端日志: pm2 logs huntlink-backend"
fi

if [ "$NGINX_STATUS" != "active" ]; then
    echo "  - 重启Nginx: sudo systemctl restart nginx"
fi

echo
echo "详细日志查看:"
echo "  pm2 logs huntlink-frontend"
echo "  pm2 logs huntlink-backend"
echo "  tail -f /var/log/nginx/error.log"
echo
