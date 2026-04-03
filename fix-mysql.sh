#!/bin/bash
docker exec huntlink-mysql mysql -u root -phuntlink2024 -e "
CREATE USER IF NOT EXISTS 'huntlink'@'%' IDENTIFIED BY 'huntlink_user_password_2026';
GRANT ALL PRIVILEGES ON huntlink.* TO 'huntlink'@'%';
FLUSH PRIVILEGES;
SELECT 'User created successfully' as result;
"
