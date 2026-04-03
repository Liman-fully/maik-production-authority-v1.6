#!/bin/bash
TARGETS=$(find "/Users/liman/Library/Application Support/@nexu/" -name "dist" -type d 2>/dev/null)
for t in $TARGETS; do
  echo "Force overwriting Ghost Path: $t"
  cp -r /Users/liman/Desktop/huntlink-stable-final/frontend-dist/* "$t/" 2>/dev/null
done
echo "NGINX/GHOST SYNC COMPLETE."
