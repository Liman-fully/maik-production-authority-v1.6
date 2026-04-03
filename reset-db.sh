#!/bin/bash
docker exec huntlink-mysql mysql -u root -phuntlink2024 -e "DROP DATABASE IF EXISTS huntlink; CREATE DATABASE huntlink CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
echo "Database recreated"
