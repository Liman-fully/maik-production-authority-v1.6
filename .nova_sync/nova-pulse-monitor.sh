#!/bin/bash

# Nova逻辑脉冲同步监控脚本
# 监控logic_pulse.json文件的变化并执行同步操作

set -e

NOVA_SYNC_DIR="/Users/liman/Desktop/huntlink-stable-final/.nova_sync"
LOGIC_PULSE_FILE="$NOVA_SYNC_DIR/logic_pulse.json"
LOCK_FILE="$NOVA_SYNC_DIR/.monitor.lock"
LOG_FILE="$NOVA_SYNC_DIR/monitor.log"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

# 检查是否已有监控进程在运行
check_lock() {
    if [ -f "$LOCK_FILE" ]; then
        PID=$(cat "$LOCK_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            error "监控进程已在运行 (PID: $PID)"
            exit 1
        else
            warn "发现过期的锁文件，正在清理..."
            rm -f "$LOCK_FILE"
        fi
    fi
}

# 创建锁文件
create_lock() {
    echo $$ > "$LOCK_FILE"
    log "监控进程已启动 (PID: $$)"
}

# 清理锁文件
cleanup() {
    if [ -f "$LOCK_FILE" ] && [ "$(cat "$LOCK_FILE")" -eq $$ ]; then
        rm -f "$LOCK_FILE"
        log "监控进程已停止"
    fi
}

# 解析logic_pulse.json
parse_logic_pulse() {
    if [ ! -f "$LOGIC_PULSE_FILE" ]; then
        error "logic_pulse.json 文件不存在"
        return 1
    fi

    # 验证JSON格式
    if ! python3 -m json.tool "$LOGIC_PULSE_FILE" > /dev/null 2>&1; then
        error "logic_pulse.json 格式无效"
        return 1
    fi

    # 获取最新的脉冲（最后一个元素）
    PULSE_INDEX=$(cat "$LOGIC_PULSE_FILE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data)-1 if isinstance(data, list) else 0)")
    
    if [ "$PULSE_INDEX" = "0" ] && ! cat "$LOGIC_PULSE_FILE" | python3 -c "import sys, json; print(isinstance(json.load(sys.stdin), list))" | grep -q True; then
        # 旧格式：单个对象
        TIMESTAMP=$(cat "$LOGIC_PULSE_FILE" | python3 -c "import sys, json; print(json.load(sys.stdin)['timestamp'])")
        PRIORITY=$(cat "$LOGIC_PULSE_FILE" | python3 -c "import sys, json; print(json.load(sys.stdin)['priority'])")
        TASK=$(cat "$LOGIC_PULSE_FILE" | python3 -c "import sys, json; print(json.load(sys.stdin)['task'])")
        INSTRUCTION=$(cat "$LOGIC_PULSE_FILE" | python3 -c "import sys, json; print(json.load(sys.stdin)['instruction'])")
        NEXT_SYNC=$(cat "$LOGIC_PULSE_FILE" | python3 -c "import sys, json; print(json.load(sys.stdin)['next_sync'])")
        STATUS="unknown"
    else
        # 新格式：数组
        TIMESTAMP=$(cat "$LOGIC_PULSE_FILE" | python3 -c "import sys, json; data=json.load(sys.stdin); pulse=data[$PULSE_INDEX] if isinstance(data, list) else data; print(pulse['timestamp'])")
        PRIORITY=$(cat "$LOGIC_PULSE_FILE" | python3 -c "import sys, json; data=json.load(sys.stdin); pulse=data[$PULSE_INDEX] if isinstance(data, list) else data; print(pulse['priority'])")
        TASK=$(cat "$LOGIC_PULSE_FILE" | python3 -c "import sys, json; data=json.load(sys.stdin); pulse=data[$PULSE_INDEX] if isinstance(data, list) else data; print(pulse['task'])")
        INSTRUCTION=$(cat "$LOGIC_PULSE_FILE" | python3 -c "import sys, json; data=json.load(sys.stdin); pulse=data[$PULSE_INDEX] if isinstance(data, list) else data; print(pulse['instruction'])")
        NEXT_SYNC=$(cat "$LOGIC_PULSE_FILE" | python3 -c "import sys, json; data=json.load(sys.stdin); pulse=data[$PULSE_INDEX] if isinstance(data, list) else data; print(pulse['next_sync'])")
        STATUS=$(cat "$LOGIC_PULSE_FILE" | python3 -c "import sys, json; data=json.load(sys.stdin); pulse=data[$PULSE_INDEX] if isinstance(data, list) else data; print(pulse.get('status', 'unknown'))")
    fi

    log "检测到逻辑脉冲:"
    log "  时间戳: $TIMESTAMP"
    log "  优先级: $PRIORITY"
    log "  任务: $TASK"
    log "  状态: $STATUS"
    log "  下次同步: $NEXT_SYNC"
}

# 执行同步操作
execute_sync() {
    log "开始执行同步操作..."

    # 检查工作区状态
    log "检查工作区状态..."
    if [ -d "/Users/liman/Desktop/huntlink-stable-final" ]; then
        log "  huntlink-stable-final 工作区存在"
    else
        error "  huntlink-stable-final 工作区不存在"
        return 1
    fi

    # 检查Git状态
    cd "/Users/liman/Desktop/huntlink-stable-final"
    if git rev-parse --git-dir > /dev/null 2>&1; then
        GIT_STATUS=$(git status --porcelain)
        if [ -z "$GIT_STATUS" ]; then
            log "  Git工作区干净"
        else
            warn "  Git工作区有未提交的更改:"
            echo "$GIT_STATUS" | while read -r line; do
                warn "    $line"
            done
        fi
    else
        warn "  不是Git仓库"
    fi

    # 根据优先级执行不同操作
    case "$PRIORITY" in
        "P0_KNOWLEDGE_LAUNCH")
            log "执行 P0_KNOWLEDGE_LAUNCH 同步..."
            # 这里可以添加具体的部署命令
            log "  - 部署 'Ask-Elite' text-only forum"
            log "  - 启用 'External Media Link' rendering"
            log "  - 审计数据库"
            ;;
        "P1_FEATURE_ENHANCEMENT")
            log "执行 P1_FEATURE_ENHANCEMENT 同步..."
            ;;
        "P2_BUG_FIX")
            log "执行 P2_BUG_FIX 同步..."
            ;;
        *)
            warn "未知优先级: $PRIORITY"
            ;;
    esac

    log "同步操作完成"
}

# 检查是否需要同步
should_sync() {
    if [ ! -f "$LOGIC_PULSE_FILE" ]; then
        return 1
    fi

    # 获取最新的脉冲
    PULSE_INDEX=$(cat "$LOGIC_PULSE_FILE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data)-1 if isinstance(data, list) else 0)")
    
    if [ "$PULSE_INDEX" = "0" ] && ! cat "$LOGIC_PULSE_FILE" | python3 -c "import sys, json; print(isinstance(json.load(sys.stdin), list))" | grep -q True; then
        # 旧格式
        NEXT_SYNC_TIME=$(cat "$LOGIC_PULSE_FILE" | python3 -c "import sys, json; print(json.load(sys.stdin)['next_sync'])")
        STATUS="unknown"
    else
        # 新格式
        NEXT_SYNC_TIME=$(cat "$LOGIC_PULSE_FILE" | python3 -c "import sys, json; data=json.load(sys.stdin); pulse=data[$PULSE_INDEX] if isinstance(data, list) else data; print(pulse['next_sync'])")
        STATUS=$(cat "$LOGIC_PULSE_FILE" | python3 -c "import sys, json; data=json.load(sys.stdin); pulse=data[$PULSE_INDEX] if isinstance(data, list) else data; print(pulse.get('status', 'unknown'))")
    fi

    # 如果状态已经是completed，不需要同步
    if [ "$STATUS" = "completed" ]; then
        return 1
    fi

    # 如果next_sync是今天的某个时间，检查是否到达该时间
    CURRENT_TIME=$(date '+%H:%M:%S')
    if [ "$CURRENT_TIME" \> "$NEXT_SYNC_TIME" ]; then
        return 0
    fi

    return 1
}

# 主监控循环
monitor() {
    log "开始监控 Nova 逻辑脉冲同步..."
    log "监控文件: $LOGIC_PULSE_FILE"

    # 初始化最后修改时间
    if [ -f "$LOGIC_PULSE_FILE" ]; then
        LAST_MODIFIED=$(stat -c %Y "$LOGIC_PULSE_FILE" 2>/dev/null || stat -f %m "$LOGIC_PULSE_FILE")
    else
        LAST_MODIFIED=0
    fi

    while true; do
        # 检查文件是否被修改
        if [ -f "$LOGIC_PULSE_FILE" ]; then
            CURRENT_MODIFIED=$(stat -c %Y "$LOGIC_PULSE_FILE" 2>/dev/null || stat -f %m "$LOGIC_PULSE_FILE")

            if [ "$CURRENT_MODIFIED" -ne "$LAST_MODIFIED" ]; then
                log "检测到 logic_pulse.json 被修改"
                if parse_logic_pulse; then
                    execute_sync
                fi
                LAST_MODIFIED=$CURRENT_MODIFIED
            fi
        fi

        # 检查是否到达同步时间
        if should_sync; then
            log "到达同步时间，执行同步..."
            if parse_logic_pulse; then
                execute_sync
            fi
        fi

        # 每30秒检查一次
        sleep 30
    done
}

# 显示状态
show_status() {
    if [ -f "$LOGIC_PULSE_FILE" ]; then
        echo -e "${BLUE}=== Nova 逻辑脉冲同步状态 ===${NC}"
        parse_logic_pulse
        echo -e "${BLUE}==============================${NC}"
    else
        error "logic_pulse.json 文件不存在"
    fi
}

# 主程序
case "${1:-monitor}" in
    "start")
        check_lock
        create_lock
        trap cleanup EXIT
        monitor
        ;;
    "status")
        show_status
        ;;
    "sync")
        if parse_logic_pulse; then
            execute_sync
        fi
        ;;
    *)
        echo "用法: $0 {start|status|sync}"
        echo "  start  - 启动监控进程"
        echo "  status - 显示当前状态"
        echo "  sync   - 立即执行同步"
        exit 1
        ;;
esac
