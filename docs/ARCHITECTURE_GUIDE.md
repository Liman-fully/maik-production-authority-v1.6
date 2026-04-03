# 猎脉 HuntLink 核心架构指南

> 基于 15 年大厂招聘中台架构经验沉淀，专为 2G 内存/50G 硬盘 极端资源环境定制。
> 所有 Agent 在开发中必须严格遵守本文档的约束，这是项目的"底层系统提示词"。

---

## 一、部署与环境约束

### 1.1 铁律：禁止在线构建

**严禁在生产服务器（2G RAM）执行 `npm run build` 或 `npm install`。**

正确的流程：
1. 本地/CI（GitHub Actions，7G+ RAM）完成编译
2. 仅将 `dist/`、`package.json`、生产依赖打包为 `release.tar.gz`
3. 通过 SCP 传输至服务器解压运行
4. 启动命令必须包含内存限制：`NODE_OPTIONS="--max-old-space-size=1536"`

### 1.2 内存水位红线

| 阶段 | 内存限制 | 说明 |
|------|---------|------|
| CI 构建 | `--max-old-space-size=4096` | GitHub Actions 环境 |
| 生产运行 | `--max-old-space-size=1536` | 预留 512MB 给系统内核 |
| Redis | `maxmemory 256mb` + `allkeys-lru` | 仅存 Session/在线状态 |
| DB 连接池 | `max: 15-20` | 防止句柄泄露 |

### 1.3 优雅停机

后端必须监听 `SIGTERM` 信号：
- 先停止接收新 API 请求
- 等待现有数据库事务处理完成
- 释放数据库连接后再退出

严禁使用 `nohup`，强制使用 PM2 进行进程管理。

### 1.4 SSH 命令规范

永远不要在一条 SSH 命令里塞入超过 3 个 `&&`。Windows PowerShell 转义会导致命令变质。

正确做法：将复杂逻辑写入 shell 脚本，上传后执行 `bash /tmp/script.sh`。

---

## 二、业务一致性与状态机

### 2.1 招聘管线原子性（Pipeline ACID）

所有状态变更（投递 -> 初筛 -> 面试 -> 录用）必须封装在数据库事务中。

**严禁**：先改状态、后发通知。若通知发送失败，必须回滚状态。

**严禁**：在事务内调用外部 API（AI 解析、短信通知等）。先提交 DB 事务，再在 `afterCommit` 钩子中处理外部调用。

### 2.2 幂等性设计

所有操作（尤其是"一键投递"）必须支持幂等。在 API 层实现 `request_id` 校验，防止重复扣减点数或重复提醒。

### 2.3 状态机约束

招聘流程禁止裸写 `if/else`。必须引入状态机逻辑：

```
APPLIED -> FILTERED -> INTERVIEWING -> OFFERED -> REJECTED
```

确保"简历所有权"在任何异常宕机时都不会掉入"幽灵状态"（如 HR 看到已入职，猎头看到待面试）。

### 2.4 防冲突锁

处理"猎头推荐"与"个人投递"冲突时，必须使用数据库的 `UNIQUE INDEX (candidate_id, company_id)`。

面试邀请前，使用 `SELECT FOR UPDATE` 锁定 HR 的 Calendar 表，防止排期重叠。

---

## 三、IM 与实时性

### 3.1 取消"消息已读"回执

采用"状态分级"替代"已读"：
- 显示"对方活跃/离线"（基于 Redis SETEX 记录最后一次 API 请求时间）
- 显示"简历已被查阅"（HR 打开简历详情页时异步触发 Event）

**原因**：已读不回会产生信任危机，且增加 Redis 内存占用和 WebSocket 信令风暴。

### 3.2 心跳与风暴防御

客户端重连必须包含指数退避算法（Exponential Backoff），防止服务器重启后的瞬时"信令风暴"。

### 3.3 消息一致性

- 消息必须具备 `client_msg_id`（前端生成）用于去重
- `server_seq_id`（后端生成）用于排序
- 多端同步通过 Version Check 增量数据，禁止全量拉取

---

## 四、文件处理与存储

### 4.1 COS 前端直传（核心）

**严禁通过后端服务器中转文件。**

正确流程：
1. 前端向后端申请 COS 预签名上传 URL（只发一个 JSON 字符串）
2. 前端直接将文件上传到腾讯云 COS
3. 上传成功后，前端带上文件路径调用后端接口

后端只处理字符串（元数据），文件流完全不经过服务器内存。

### 4.2 简历解析：异步队列

- 使用 BullMQ（基于 Redis），`concurrency: 1`
- 先占位后解析：上传成功立即在 DB 创建 `status: PENDING` 记录
- 简历解析结果按需触发：仅在 HR 点击查看时进行深度 AI 总结，省 80% Token
- 解析超时兜底：30 秒未返回，标记为"解析失败（仅支持附件查看）"

### 4.3 多模态处理策略

| 格式 | 处理手段 | 避坑点 |
|------|---------|--------|
| PDF/Docx | pdf-parse 或 mammoth 提取文本 | 严禁加载整个文件到 Buffer，必须用 Stream |
| 图片/扫描件 | 腾讯云 OCR API | 严禁安装 Tesseract 等重型 OCR 引擎 |
| 图片型 PDF | 先提取文本，为空则触发 OCR | 限制最大页数（前 5 页） |
| 网页/邮件 | 剥离 HTML 噪音，仅保留正文 | 过滤导航栏、广告 |
| Excel | 每行映射为一个独立人才记录 | 批量导入必须设置事务保存点 |

### 4.4 双模预览

- **左侧（人性化）**：iframe/PDF.js 直接加载 COS 原始文件
- **右侧（标准化）**：异步加载 AI 提取的画像标签、匹配度、优势总结
- AI 未解析时显示"AI 正在分析中..."，不影响原始附件预览

---

## 五、搜索与性能

### 5.1 全文检索

2G 内存禁止运行 Elasticsearch（启动需 1G+ 堆内存）。

**使用 PostgreSQL 原生方案**：
- `pg_trgm` 扩展：模糊搜索
- `tsvector` + GIN 索引：全文搜索
- 复合索引：针对"职位关键词"和"城市"
- **严禁** `LIKE '%keyword%'`（全表扫描）

### 5.2 搜索冷热分离

- 热数据：最近 3 个月活跃简历，走全文索引
- 冷数据：超过 6 个月僵尸简历，关闭索引，走基础查询

### 5.3 数据库保护

- 所有查询必须包含 `LIMIT`（默认 20）
- 严禁在无索引字段上 `ORDER BY`（会触发磁盘排序）
- 批量写入必须分批（每 50 条一个批次），防止长时间行锁

### 5.4 虚拟滚动

前端渲染 1 万条以上数据时，必须使用虚拟滚动（`vue-virtual-scroller`），防止 DOM 节点爆炸。

---

## 六、CI/CD 与代码质量

### 6.1 本地预检（Pre-flight Check）

`git push` 前必须执行 `npx tsc --noEmit`。类型报错不解决，禁止提交。

已配置 Git Hooks：
- `.husky/pre-commit`：自动执行 TypeScript 检查
- `.husky/pre-push`：自动执行构建检查

### 6.2 GitHub Actions 精简流程

```yaml
- npm ci          # 严格按 package-lock.json 安装
- npx tsc --noEmit # 类型检查（不过不跑后续）
- npm run build   # 构建
```

### 6.3 依赖管理

使用 `npm ci` 而非 `npm install`，防止语义化版本自动升级导致的环境漂移。

GitHub Actions 缓存损坏时，手动清除所有缓存后重试。

---

## 七、安全与隐私

### 7.1 数据隔离

所有 SQL 查询的 `WHERE` 子句必须包含 `company_id`（租户过滤）。

### 7.2 简历脱敏

- 默认 API 返回值中，手机号/邮箱必须星号掩码（如 `138****8888`）
- 仅在"确认面试"后通过独立权限接口获取明文
- 通过 `(手机号/邮箱 + 姓名)` 或文件 MD5 进行简历去重

### 7.3 防爬与限流

- 基于 `IP + UserID` 的滑动窗口限流
- 简历预览图动态植入 HR ID 隐形水印（盲水印）

---

## 八、Token 优化策略

### 8.1 省钱原则

- 基础投递：仅提取姓名、电话（正则，不消耗 Token）
- 深度解析：仅在用户触发会员权益或 HR 点击查看时执行
- 批量导入 1 万份以上：仅对前 500 字符进行初筛解析

### 8.2 预算分配

将预算集中在核心匹配逻辑和三端协同上，而非全量 AI 处理。

---

## 九、PM2 生产配置参考

```javascript
module.exports = {
  apps: [{
    name: "huntlink-backend",
    script: "./dist/src/main.js",
    instances: 1,              // 2G内存严禁 cluster 模式
    exec_mode: "fork",
    watch: false,              // 生产环境严禁 watch
    max_memory_restart: "1500M",
    env_production: {
      NODE_ENV: "production",
      NODE_OPTIONS: "--max-old-space-size=1536 --gc-interval=100"
    },
    kill_timeout: 30000,        // 优雅停机 30 秒
    exp_backoff_restart_delay: 100
  }]
}
```

---

## 十、Agent 自检协议

在 Push 代码前进行"质量熔断"：

1. `npx tsc --noEmit` — 类型检查
2. `npm run build` — 构建验证
3. 检查是否有 `fs.readFileSync` / `fs.readFile`（应用 Stream 替代）
4. 检查是否有事务内调用外部 API
5. 检查查询是否包含 LIMIT
6. 检查文件上传是否走 COS 预签名（不经后端内存）

---

## 附录：大厂方案对比

| 维度 | Boss 直聘模式 | LinkedIn 模式 | 猎脉最适方案 |
|------|-------------|-------------|------------|
| 消息机制 | 强已读回执（高压交互） | 弱通知（异步社交） | 在线状态显示（规避信任危机） |
| 简历处理 | 在线表单（强标准化） | 附件上传（强排版） | 附件占位 + 后台异步解析 |
| 实时性 | 极高（集群支撑） | 较低（允许延迟） | 均衡：消息必达，不承诺即时回执 |
| 解析策略 | 实时结构化（极高成本） | 后台静态索引 | 异步/权益化（高耗能转化为盈利点） |
| 2G 内存适配 | 不适用 | 较难 | 极高（MQ 削峰，时间换空间） |

---

*最后更新：2026-03-29*
*来源：TheLab 架构师复盘 + 多 Agent 协作实战经验*
