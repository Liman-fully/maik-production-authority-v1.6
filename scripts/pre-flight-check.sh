#!/bin/bash
echo "天策府预检启动..."
# 检查占位符
if grep -r "\.\.\." backend/src | grep -v "spread"; then echo "发现占位符错误！"; exit 1; fi
echo "自检成功。"
