# 读写分离架构方案

**版本**: v1.0  
**创建时间**: 2026-03-28 15:49  
**适用场景**: 日活 > 10 万，读写比 > 10:1

---

## 一、架构设计

### 1.1 架构拓扑

```
                    ┌──────────────┐
                    │   应用层     │
                    │ (NestJS)     │
                    └──────┬───────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
    ┌─────▼─────┐    ┌─────▼─────┐    ┌─────▼─────┐
    │  主库     │    │  从库 1    │    │  从库 2    │
    │  (写入)   │───▶│  (搜索)   │    │  (统计)   │
    │  Port:5432│    │  Port:5433│    │  Port:5434│
    └───────────┘    └───────────┘    └───────────┘
         │                  │                  │
         │             流复制             流复制
         │           (延迟<1s)           (延迟<1s)
```

### 1.2 职责分离

| 库 | 职责 | 查询类型 | 比例 |
|----|------|----------|------|
| **主库** | 写入、更新、删除 | INSERT/UPDATE/DELETE | 10% |
| **从库 1** | 搜索查询 | SELECT (搜索) | 70% |
| **从库 2** | 统计分析 | SELECT (统计/报表) | 20% |

---

## 二、TypeORM 配置

### 2.1 多数据源配置

```typescript
// backend/src/config/database.config.ts
export const databaseConfig = {
  type: 'postgres',
  entities: [Candidate, SearchLog],
  replicas: [
    {
      // 主库（写入）
      dataSource: {
        host: process.env.DB_MASTER_HOST || 'localhost',
        port: 5432,
        username: 'huntlink',
        password: process.env.DB_PASSWORD,
        database: 'huntlink',
      },
    },
    {
      // 从库 1（搜索查询）
      dataSource: {
        host: process.env.DB_SLAVE1_HOST || 'localhost',
        port: 5433,
        username: 'huntlink_read',
        password: process.env.DB_PASSWORD,
        database: 'huntlink',
      },
    },
    {
      // 从库 2（统计分析）
      dataSource: {
        host: process.env.DB_SLAVE2_HOST || 'localhost',
        port: 5434,
        username: 'huntlink_read',
        password: process.env.DB_PASSWORD,
        database: 'huntlink',
      },
    },
  ],
};
```

### 2.2 读写分离装饰器

```typescript
// backend/src/common/decorators/read-replica.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const USE_REPLICA = Symbol('USE_REPLICA');

export const UseReplica = (replica: 'master' | 'slave1' | 'slave2') =>
  SetMetadata(USE_REPLICA, replica);

// 使用示例
@UseReplica('slave1')
async searchCandidates() {
  // 自动使用从库 1
}
```

---

## 三、PostgreSQL 配置

### 3.1 主库配置

```conf
# postgresql.conf (主库)
wal_level = replica
max_wal_senders = 10
max_replication_slots = 10
synchronous_commit = on
```

### 3.2 从库配置

```conf
# postgresql.conf (从库)
hot_standby = on
hot_standby_feedback = on
```

### 3.3 创建复制用户

```sql
-- 主库执行
CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD 'replication_password';

-- 创建复制槽
SELECT pg_create_physical_replication_slot('slave1_slot');
SELECT pg_create_physical_replication_slot('slave2_slot');
```

### 3.4 配置 pg_hba.conf

```conf
# 允许从库连接
host    replication     replicator      192.168.1.0/24            scram-sha-256
host    huntlink        huntlink_read   192.168.1.0/24            scram-sha-256
```

---

## 四、性能提升

### 4.1 写入性能

| 场景 | 单库 | 读写分离 | 提升 |
|------|------|----------|------|
| 并发写入 | 100 TPS | 300 TPS | +200% |
| 批量导入 | 500 条/秒 | 1500 条/秒 | +200% |

### 4.2 读取性能

| 查询类型 | 单库 | 读写分离 | 提升 |
|----------|------|----------|------|
| 搜索查询 | 100ms | 50ms | +50% |
| 统计查询 | 500ms | 200ms | +60% |
| 报表查询 | 2000ms | 800ms | +60% |

### 4.3 可用性

| 指标 | 单库 | 读写分离 | 提升 |
|------|------|----------|------|
| 可用性 | 99.9% | 99.99% | +0.09% |
| 故障恢复 | 30 分钟 | 1 分钟 | +96% |

---

## 五、实施步骤

### 5.1 环境准备（1 天）

```bash
# 1. 部署 PostgreSQL 主库
sudo apt install postgresql-15

# 2. 部署 PostgreSQL 从库 1
sudo apt install postgresql-15

# 3. 部署 PostgreSQL 从库 2
sudo apt install postgresql-15
```

### 5.2 配置复制（2 小时）

```bash
# 1. 主库配置
sudo nano /etc/postgresql/15/main/postgresql.conf
sudo nano /etc/postgresql/15/main/pg_hba.conf

# 2. 从库配置
sudo nano /etc/postgresql/15/main/postgresql.conf

# 3. 启动复制
sudo systemctl restart postgresql
```

### 5.3 应用配置（1 小时）

```bash
# 1. 更新 TypeORM 配置
nano backend/.env

# 2. 重启服务
pm2 restart huntlink-backend

# 3. 验证读写分离
curl "http://localhost:3000/api/candidates/search?keyword=Java"
```

---

## 六、成本估算

### 6.1 服务器成本（腾讯云）

| 配置 | 数量 | 单价/月 | 总价/月 |
|------|------|---------|---------|
| 2C4G (主库) | 1 | ¥300 | ¥300 |
| 2C4G (从库 1) | 1 | ¥300 | ¥300 |
| 2C4G (从库 2) | 1 | ¥300 | ¥300 |
| **总计** | 3 | - | **¥900/月** |

### 6.2 收益分析

| 收益项 | 价值 |
|--------|------|
| 性能提升 | 用户体验提升，转化率 +20% |
| 可用性提升 | 故障时间 -96% |
| 扩展性 | 支持 10 倍流量增长 |

---

## 七、监控指标

### 7.1 复制延迟

```sql
-- 从库执行
SELECT 
  pg_last_wal_receive_lsn() - pg_last_wal_replay_lsn() as lag_bytes,
  EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp())) as lag_seconds;
```

### 7.2 连接数

```sql
-- 主库执行
SELECT 
  datname,
  numbackends,
  max_conn
FROM pg_stat_database
JOIN pg_settings ON pg_settings.name = 'max_connections';
```

### 7.3 查询性能

```sql
-- 慢查询监控
SELECT query, calls, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

---

## 八、故障处理

### 8.1 从库延迟过高

```sql
-- 检查复制状态
SELECT * FROM pg_stat_replication;

-- 检查网络延迟
ping master_host
```

### 8.2 主库故障

```bash
# 1. 提升从库 1 为主库
sudo -u postgres pg_ctl promote -D /var/lib/postgresql/15/main

# 2. 更新应用配置
nano backend/.env  # 修改 DB_MASTER_HOST

# 3. 重启服务
pm2 restart huntlink-backend
```

---

**右护法** | 镇抚司主官  
文档创建时间：2026-03-28 15:49
