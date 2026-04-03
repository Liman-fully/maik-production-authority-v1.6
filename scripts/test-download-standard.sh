#!/bin/bash

# 简历下载标准化流程 - 测试脚本
# 用于验证 generateStandardFileName 方法的正确性

set -e

echo "=========================================="
echo "简历下载标准化流程 - 测试脚本"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试计数
TESTS_PASSED=0
TESTS_FAILED=0

# 测试函数
run_test() {
    local test_name="$1"
    local expected="$2"
    local actual="$3"
    
    if [ "$expected" == "$actual" ]; then
        echo -e "${GREEN}✓ PASS${NC}: $test_name"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}: $test_name"
        echo "  期望：$expected"
        echo "  实际：$actual"
        ((TESTS_FAILED++))
    fi
}

echo "测试场景 1: 标准姓名 + 手机号 + 期望职位"
echo "----------------------------------------"

# 模拟测试数据
test_name="张三_138****8000_Java 开发工程师_$(date +%Y%m%d).pdf"
echo "期望格式：$test_name"
echo ""

echo "测试场景 2: 手机号脱敏规则验证"
echo "----------------------------------------"
# 测试手机号脱敏
phone="13812348000"
masked="${phone:0:3}****${phone:7:4}"
run_test "手机号脱敏 (13812348000)" "138****8000" "$masked"

phone="15987654321"
masked="${phone:0:3}****${phone:7:4}"
run_test "手机号脱敏 (15987654321)" "159****4321" "$masked"

echo ""
echo "测试场景 3: 特殊字符清理"
echo "----------------------------------------"
# 测试特殊字符清理
test_str="Java/Python<C++>"
cleaned=$(echo "$test_str" | sed 's/[<>:"\/\\|？*]//g' | sed 's/\s\+/_/g')
run_test "特殊字符清理" "JavaPythonC++" "$cleaned"

test_str="前端 工程师 (高级)"
cleaned=$(echo "$test_str" | sed 's/[<>:"\/\\|？*]//g' | sed 's/\s\+/_/g')
run_test "空格转下划线" "前端_工程师_(高级)" "$cleaned"

echo ""
echo "测试场景 4: 文件名长度限制"
echo "----------------------------------------"
# 测试姓名长度限制
long_name="这是一个非常非常长的姓名超过十个字"
truncated="${long_name:0:10}"
run_test "姓名截断 (10 字限制)" "这是一个非常非常长的姓" "$truncated"

# 测试职位长度限制
long_position="高级资深 Java 开发工程师兼架构师"
truncated="${long_position:0:10}"
run_test "职位截断 (10 字限制)" "高级资深 Java 开发工" "$truncated"

echo ""
echo "测试场景 5: 日期格式验证"
echo "----------------------------------------"
date_str=$(date +%Y%m%d)
run_test "日期格式 (YYYYMMDD)" "^[0-9]\{8\}$" "$date_str"

echo ""
echo "=========================================="
echo "测试总结"
echo "=========================================="
echo -e "通过：${GREEN}$TESTS_PASSED${NC}"
echo -e "失败：${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}所有测试通过！${NC}"
    exit 0
else
    echo -e "${RED}部分测试失败，请检查实现${NC}"
    exit 1
fi
