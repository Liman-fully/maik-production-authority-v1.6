#!/bin/bash

# 猎脉 (Huntlink) 一键运维诊断脚本 (V1.0)
# 用途：在 150.158.51.199 宿主机上运行，定位后端无法启动或端口不通的原因。

echo "=========================================="
echo "   Huntlink 猎脉运维自检报告 (Agent 指挥)"
echo "=========================================="

# 1. 检查端口连通性 (本地)
echo -e "\n[1/4] 检查核心服务端口..."
ports=(3000 5432 6379 80)
for port in "${ports[@]}"; do
    if netstat -tuln | grep -q ":$port "; then
        echo -e "  ✅ 端口 $port 处于监听状态"
    else
        echo -e "  ❌ 端口 $port 未开启 (服务可能未启动或监听在 127.0.0.1 而非 0.0.0.0)"
    fi
done

# 2. 检查 PM2 状态 (后端)
echo -e "\n[2/4] 检查后端 PM2 进程..."
if command -v pm2 &> /dev/null; then
    pm2 status | grep -E "huntlink|backend"
else
    echo "  ❌ 系统未安装 PM2"
fi

# 3. 检查环境变量 (.env)
echo -e "\n[3/4] 检查环境变量配置..."
if [ -f "backend/.env" ]; then
    echo "  ✅ backend/.env 文件存在"
    # 检查是否有 DB_HOST 配置
    if grep -q "DB_HOST" "backend/.env"; then
        grep "DB_HOST" "backend/.env"
    else
        echo "  ⚠️ 未找到 DB_HOST 配置，默认连接 localhost"
    fi
else
    echo "  ❌ backend/.env 文件缺失，请从 .env.example 复制"
fi

# 4. 检查内存与防火墙预警
echo -e "\n[4/4] 资源与安全自检..."
free -m | awk 'NR==2{printf "  内存状况: 已用 %sMB / 总共 %sMB (可用 %sMB)\n", $3, $2, $4}'
ufw status 2>/dev/null || echo "  提示: ufw 状态不可查 (可能由安全组控制)"

echo -e "\n=========================================="
echo "   诊断完成！请将以上信息贴给 Agent 主事。"
echo "=========================================="

