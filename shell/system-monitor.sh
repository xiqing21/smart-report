#!/bin/bash

# 系统资源监控脚本
# 功能：实时显示系统资源使用情况和占用资源最多的进程
# 作者：Trae AI Assistant
# 更新间隔：10秒

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 清屏函数
clear_screen() {
    clear
}

# 获取系统资源使用情况
get_system_resources() {
    echo -e "${BLUE}=== 系统资源使用情况 ===${NC}"
    echo -e "${CYAN}时间戳: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
    echo
    
    # CPU使用率
    cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
    echo -e "${GREEN}CPU 使用率:${NC} ${cpu_usage}%"
    
    # 内存使用情况
    memory_info=$(free -h | grep "Mem:")
    total_mem=$(echo $memory_info | awk '{print $2}')
    used_mem=$(echo $memory_info | awk '{print $3}')
    free_mem=$(echo $memory_info | awk '{print $4}')
    available_mem=$(echo $memory_info | awk '{print $7}')
    
    # 计算内存使用百分比
    mem_percent=$(free | grep "Mem:" | awk '{printf "%.1f", ($3/$2) * 100.0}')
    
    echo -e "${GREEN}内存使用:${NC} ${used_mem}/${total_mem} (${mem_percent}%)"
    echo -e "${GREEN}可用内存:${NC} ${available_mem}"
    
    # 交换空间使用情况
    swap_info=$(free -h | grep "Swap:")
    if [ "$swap_info" != "" ]; then
        swap_total=$(echo $swap_info | awk '{print $2}')
        swap_used=$(echo $swap_info | awk '{print $3}')
        if [ "$swap_total" != "0B" ]; then
            swap_percent=$(free | grep "Swap:" | awk '{if($2>0) printf "%.1f", ($3/$2) * 100.0; else print "0.0"}')
            echo -e "${GREEN}交换空间:${NC} ${swap_used}/${swap_total} (${swap_percent}%)"
        else
            echo -e "${GREEN}交换空间:${NC} 未配置"
        fi
    fi
    
    # 磁盘使用情况
    echo -e "${GREEN}磁盘使用:${NC}"
    df -h | grep -E '^/dev/' | awk '{printf "  %-20s %s/%s (%s)\n", $6, $3, $2, $5}'
    
    # 系统负载
    load_avg=$(uptime | awk -F'load average:' '{print $2}' | sed 's/^[ \t]*//')
    echo -e "${GREEN}系统负载:${NC} ${load_avg}"
    
    # 运行时间
    uptime_info=$(uptime | awk '{print $3,$4}' | sed 's/,//')
    echo -e "${GREEN}运行时间:${NC} ${uptime_info}"
    
    echo
}

# 获取占用资源最多的进程（按内存）
get_top_memory_processes() {
    echo -e "${PURPLE}=== 内存占用前5的进程 ===${NC}"
    printf "%-8s %-8s %-8s %-15s %s\n" "PID" "USER" "MEM%" "MEM(MB)" "COMMAND"
    echo "────────────────────────────────────────────────────────────────────"
    
    ps aux --sort=-%mem | head -6 | tail -5 | while read line; do
        pid=$(echo $line | awk '{print $2}')
        user=$(echo $line | awk '{print $1}')
        mem_percent=$(echo $line | awk '{print $4}')
        # 计算实际内存使用量(MB)
        mem_kb=$(echo $line | awk '{print $6}')
        mem_mb=$(echo "scale=1; $mem_kb/1024" | bc -l 2>/dev/null || echo "N/A")
        command=$(echo $line | awk '{for(i=11;i<=NF;i++) printf "%s ", $i; print ""}' | cut -c1-40)
        
        printf "%-8s %-8s %-8s %-15s %s\n" "$pid" "$user" "${mem_percent}%" "${mem_mb}MB" "$command"
    done
    echo
}

# 获取占用CPU最多的进程
get_top_cpu_processes() {
    echo -e "${YELLOW}=== CPU占用前5的进程 ===${NC}"
    printf "%-8s %-8s %-8s %-8s %s\n" "PID" "USER" "CPU%" "MEM%" "COMMAND"
    echo "────────────────────────────────────────────────────────────────────"
    
    ps aux --sort=-%cpu | head -6 | tail -5 | while read line; do
        pid=$(echo $line | awk '{print $2}')
        user=$(echo $line | awk '{print $1}')
        cpu_percent=$(echo $line | awk '{print $3}')
        mem_percent=$(echo $line | awk '{print $4}')
        command=$(echo $line | awk '{for(i=11;i<=NF;i++) printf "%s ", $i; print ""}' | cut -c1-40)
        
        printf "%-8s %-8s %-8s %-8s %s\n" "$pid" "$user" "${cpu_percent}%" "${mem_percent}%" "$command"
    done
    echo
}

# 显示网络连接统计
get_network_stats() {
    echo -e "${CYAN}=== 网络连接统计 ===${NC}"
    echo -e "${GREEN}活动连接数:${NC} $(netstat -an 2>/dev/null | grep ESTABLISHED | wc -l)"
    echo -e "${GREEN}监听端口数:${NC} $(netstat -an 2>/dev/null | grep LISTEN | wc -l)"
    echo
}

# 主监控循环
main_monitor() {
    # 检查bc命令是否存在，如果不存在则安装
    if ! command -v bc &> /dev/null; then
        echo "正在安装bc计算器..."
        apt-get update && apt-get install -y bc
    fi
    
    echo -e "${RED}系统资源实时监控器${NC}"
    echo -e "${GREEN}按 Ctrl+C 退出监控${NC}"
    echo "═══════════════════════════════════════════════════════════════════════"
    
    while true; do
        clear_screen
        echo -e "${RED}╔═══════════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║                        系统资源实时监控器                              ║${NC}"
        echo -e "${RED}║                     按 Ctrl+C 退出监控                               ║${NC}"
        echo -e "${RED}╚═══════════════════════════════════════════════════════════════════════╝${NC}"
        echo
        
        get_system_resources
        get_top_memory_processes
        get_top_cpu_processes
        get_network_stats
        
        echo -e "${BLUE}下次更新: $(date -d '+10 seconds' '+%H:%M:%S')${NC}"
        echo "═══════════════════════════════════════════════════════════════════════"
        
        # 等待10秒，允许用户中断
        sleep 10
    done
}

# 信号处理函数
cleanup() {
    echo
    echo -e "${GREEN}监控已停止。感谢使用！${NC}"
    exit 0
}

# 捕获Ctrl+C信号
trap cleanup SIGINT

# 检查参数
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "系统资源监控脚本"
    echo "用法: $0 [选项]"
    echo "选项:"
    echo "  --help, -h    显示此帮助信息"
    echo "  --once        只运行一次，不循环"
    echo "  --interval N  设置更新间隔（秒，默认10秒）"
    echo
    echo "功能:"
    echo "  - 实时显示CPU、内存、磁盘使用情况"
    echo "  - 显示占用资源最多的前5个进程"
    echo "  - 每10秒自动刷新数据"
    echo "  - 包含时间戳便于追踪"
    exit 0
fi

if [ "$1" = "--once" ]; then
    get_system_resources
    get_top_memory_processes
    get_top_cpu_processes
    get_network_stats
    exit 0
fi

# 启动主监控循环
main_monitor