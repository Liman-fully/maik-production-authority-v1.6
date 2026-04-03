# Nova / Huntlink 产品开发文档

> 生成目的：汇总历史所有记录与当前最新记录，形成可执行的产品开发清单。
> 适用范围：Huntlink / MAIK V1 rollout、部署、功能恢复、健康检查、策略约束。

## 1. 核心定位

- **产品名**：猎脉（Huntlink）/ MAIK 过渡期记录
- **核心理念**：立于实名，成于安全，深于人脉
- **当前主任务**：`FINAL_V1_MANIFEST_SHIP`
- **当前最高层目标**：完成 V1 rollout，并保留完整部署追踪链路

## 2. 历史脉络

### 2026-03-31
- Nova CTO 战术重构完成
- UI 间距和人才卡片风格调整
- SSH 隧道建立到远程 PostgreSQL
- 后端与前端在本地成功启动
- 前端公网生产部署完成
- 采用 standalone + PM2 + Nginx 反代

### 2026-04-01
- 品牌最终部署周期进入执行
- 新增 HealthController
- 新增 RedisService.ping()
- HealthModule 接入 AppModule
- 前端与后端构建成功
- 一轮自动化远程部署被跳过（需要用户确认）
- 随后紧急恢复社交组件并成功部署

## 3. 历史确认的产品功能

### 3.1 核心功能
1. **AI 势能匹配**
   - 屏蔽算法噪音
   - 强调高质量职场节点的触达

2. **实名掩码社交**
   - 基于真实职业背书建立信任
   - 通过动态掩码守护隐私

3. **职场人脉拓展**
   - 挖掘同司、同校、同商圈关系链
   - 构建垂直职场护城河

### 3.2 已确认纳入部署的功能
- Landing Hero 渲染：`1024 nodes count`
- Seed data ShieldLevel 加锁为 `1`
- 登录页重定向到 `/talent-square`
- 消息页 `ChatWindow` 移动端 pointer 适配
- 全局 `localhost` 替换为公网 IP，确保头像可见
- `HealthController` 增加 `/api/health`
- `HealthModule` 接入 AppModule
- `RedisService.ping()` 增加
- `revenue-split.service.ts` 及相关后端模块
- 前端 8 个页面更新：messages / resumes / search / profile 等
- 后端 9 个源文件更新：health、guard、services、revenue split 等
- 社交组件恢复：
  - 交换手机号
  - 交换微信
  - 添加好友
  - 创建群组

## 4. 策略与约束

### 4.1 安全准则
- 敏感信息仅在用户授权且建立正式连接后解锁
- 社交交换能力默认需要确认动作
- 掩码与隐私优先于信息完全公开

### 4.2 部署策略
- 本地构建成功不等于远程部署成功
- 大体量代码采用模块化部署
- 遇到确认限制时，自动化任务可跳过，需人工脚本补齐
- 健康检查必须明确验证 `/api/health`

### 4.3 运维约束
- 数据量超过 50MB 时只部署改进模块
- 本机无 Docker/Homebrew/PostgreSQL 时，使用 SSH 隧道方案
- 前端采用 standalone 构建以减小部署体积

## 5. 关键事件与状态

### 已完成
- 前端公网可访问
- Nginx 反代已用过并验证成功
- PM2 远端服务在线记录存在
- 本地后端能连远程数据库
- 邮件/社交/关系型功能的基础结构已经搭建

### 曾出现的问题
- 一次本地健康检查返回 404
- 一次自动化远程部署被跳过
- 单一总表不存在，信息分散在多份记录里

### 当前状态
- 前端：已有 standalone 部署记录
- 后端：本地构建成功，远程健康需复核
- 自动化：逻辑脉冲历史仍以 2026-04-01T11:10:00Z 为旧基准，后续记录已补入

## 6. 开发清单

### P0
1. 确认已部署后端是否稳定返回 `/api/health`
2. 确认社交动作菜单在部署环境中可端到端使用
3. 核实最新脉冲中的 final manifest 任务是否仍需执行

### P1
1. 验证 revenue split 及 guard/service 变更是否已进入运行时
2. 检查历史部署跳过项是否都已补齐
3. 审核是否还有仅停留在日志里的功能未落地

### P2
1. 继续整理历史记录与当前记录的对应关系
2. 将新发现的缺口回填至脉冲文件和开发日志

## 7. 文件与记录索引

- 脉冲文件：`.nova_sync/logic_pulse_v1.1_final.json`
- 自动部署记录：`REPORTS/deploy-auto-2026-04-01.log`
- 产品总览：`REPORTS/HUNTLINK_V1_PRODUCT_MANIFEST.md`
- 工作日志：`REPORTS/WORKBUDDY_LOG.md`
- 自动化历史：`.workbuddy/automations/nova/memory.md`
- 当天记忆：`.workbuddy/memory/2026-04-01.md`

## 8. 结论

这套记录显示：
- 产品已经具备清晰的安全社交与职场关系拓展框架
- 昨天确认的部署项里，最关键的是健康检查修复和社交组件恢复
- 当前最需要的不是“再找一份记录”，而是把已确认功能逐一核实到运行态
