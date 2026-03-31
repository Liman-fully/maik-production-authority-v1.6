# 🔱 猎脉 (Huntlink) 终极生产运维与开发维基

## 🚨 极其重要的环境变量 (Local Only)
- **DB_HOST**: 127.0.0.1
- **DB_PORT**: 5432
- **DB_USER**: postgres
- **DB_PASS**: huntlink_safe_2026
- **REDIS_PORT**: 6379
- **COS_REGION**: ap-shanghai (腾讯云私有桶)

## 🔑 影子测试账号
- **猎头**: hunter_01 / huntlink2026
- **HR**: hr_master / huntlink2026
- **求职者**: boss_candidate / huntlink2026

## 🛡️ Nova 的部署经验 (CTO Lessons)
1. **端口冲突**: 若 3000 不通，必有孤儿进程。执行: lsof -ti :3000 | xargs kill -9.
2. **内存熔断**: 必须携带 NODE_OPTIONS="--max-old-space-size=1536" 启动后台。
3. **UI 缓存爆破**: 若前端不更新，物理删除 frontend-dist 文件夹，重新从 GitHub pull。

## 📊 2G RAM 极限生存经验 (Finalized)
1. **内存上限**: 后端启动命令禁止删除 `NODE_OPTIONS="--max-old-space-size=1536"`。
2. **禁止本地构建**: 严禁在 MacBook (199) 执行 `npm install` 或 `npm build`。若需变更 UI，必须在 Dev 节点 build 后将 dist 物理搬运至 frontend-dist。
3. **连接池保护**: 数据库连接数 Max 设为 20。若 3000 不通，优先执行 `ps aux | grep node | xargs kill -9` 释放僵尸连接。
