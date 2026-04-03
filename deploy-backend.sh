#!/bin/bash
pkill -9 -f "node dist" 2>/dev/null
sleep 1
cd /var/www/huntlink/backend
NODE_ENV=development nohup node dist/src/main.js > backend.log 2>&1 &
sleep 5
echo "=== Process Check ==="
pgrep -fa "node dist"
echo "=== Last 10 lines ==="
tail -10 backend.log
