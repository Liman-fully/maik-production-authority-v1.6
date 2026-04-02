#!/bin/bash

# Nova逻辑脉冲监控安装脚本
# 将监控服务安装到系统中

set -e

PLIST_SOURCE="/Users/liman/Desktop/huntlink-stable-final/.nova_sync/com.nova.pulse-monitor.plist"
PLIST_TARGET="$HOME/Library/LaunchAgents/com.nova.pulse-monitor.plist"

echo "=== Nova逻辑脉冲监控安装 ==="
echo

# 检查文件是否存在
if [ ! -f "$PLIST_SOURCE" ]; then
    echo "错误: 源plist文件不存在: $PLIST_SOURCE"
    exit 1
fi

if [ ! -f "/Users/liman/Desktop/huntlink-stable-final/.nova_sync/nova-pulse-monitor.sh" ]; then
    echo "错误: 监控脚本不存在"
    exit 1
fi

# 复制plist文件
echo "1. 安装plist文件到 LaunchAgents..."
cp "$PLIST_SOURCE" "$PLIST_TARGET"
echo "   ✓ 已安装到: $PLIST_TARGET"

# 加载服务
echo "2. 加载LaunchAgent服务..."
launchctl load "$PLIST_TARGET" 2>/dev/null || launchctl bootstrap gui/$(id -u) "$PLIST_TARGET" 2>/dev/null || echo "   ⚠  可能需要手动加载"
echo "   ✓ 服务已加载"

# 检查状态
echo "3. 检查服务状态..."
if launchctl list | grep -q "com.nova.pulse-monitor"; then
    echo "   ✓ 服务正在运行"
    launchctl list | grep "com.nova.pulse-monitor"
else
    echo "   ⚠  服务未运行，可能需要手动启动"
fi

echo
echo "=== 安装完成 ==="
echo
echo "可以使用以下命令管理服务:"
echo "  启动:   launchctl start com.nova.pulse-monitor"
echo "  停止:   launchctl stop com.nova.pulse-monitor"
echo "  卸载:   launchctl unload $PLIST_TARGET"
echo
echo "日志文件位置:"
echo "  标准输出: /Users/liman/Desktop/huntlink-stable-final/.nova_sync/monitor.log"
echo "  错误日志: /Users/liman/Desktop/huntlink-stable-final/.nova_sync/monitor-error.log"
echo
echo "查看实时日志:"
echo "  tail -f /Users/liman/Desktop/huntlink-stable-final/.nova_sync/monitor.log"
echo
