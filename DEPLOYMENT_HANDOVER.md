# 猎脉 (Huntlink) 项目部署与修复移交文档 (v3.3+)

**主事 (Skywork Agent) 呈报：**

当前后端核心逻辑已修复并同步至 GitHub `master` 分支。由于沙盒环境受限（120s 超时及网络隔离），建议都统在本地环境执行构建与部署。

## 1. 核心修复清单 (已推送到 Master)

### 后端 (Backend)
*   **JobService (`modules/job/job.service.ts`)**: 
    *   修复了重复的类定义冲突。
    *   移除了导致语法错误的 `...` 占位符。
    *   集成了**积分扣除逻辑**：发布职位需扣除 100 积分（已对接 `PointsService`）。
*   **ResumeService (`modules/resume/resume.service.ts`)**: 
    *   清除了之前版本中由于错误写入导致的近 200 行冗余重复代码。
    *   修复了**科学去重与合并逻辑**（基于姓名+手机/邮箱的 `Talent` 表同步）。
    *   重构了 **AI 评分算法**（学历 20%、稳定性 20%、技能 30%、经验 30%）。
*   **InterviewService (`modules/interview/interview.service.ts`)**: 
    *   修复了 `DeepPartial` 导致的类型不匹配。
    *   实现了面试状态流转后的副作用处理（面试完成自动更新候选人状态）。
*   **依赖项 (`package.json`)**: 
    *   新增补全了 `axios` 和 `chalk`（之前代码中引用但 package.json 缺失，会导致编译失败）。

## 2. 部署操作指南 (建议都统在本地执行)

### 第一步：同步与环境准备
```bash
git pull origin master
cd backend
npm install  # 本地环境通常 1 分钟内完成，确保补全 axios/chalk
```

### 第二步：编译验证
```bash
npm run build
# 预期结果：不再出现 JobService 或 InterviewService 的 TS 语法错误。
```

### 第三步：云端部署 (150.158.51.199)
目前沙盒测得 3000 和 5432 端口不可达，请都统检查服务器防火墙或安全组：
1.  **同步 Dist**: 将本地编译出的 `dist` 目录上传至服务器 `/var/www/huntlink/backend/dist`。
2.  **重启服务**:
    ```bash
    pm2 restart huntlink-backend
    # 或
    node dist/src/main.js
    ```

## 3. 待 E2E 验证路径
后端启动后，请都统优先验证以下流程：
1.  **HR 登录**: 使用 13800138001 / 123456。
2.  **发布职位**: 确认发布后，积分账户是否自动扣减 100。
3.  **简历解析**: 确认 `ResumeService` 是否能成功将简历映射至 `Talent` 表（去重逻辑验证）。

## 4. 给主事 (Agent) 的反馈回传 (非常重要)

为了确保主事在不同对话窗口中能持续掌握进度，请都统在操作完成后执行：

1.  **若 Build 成功**: 请修改 `docs/TODAY_PROGRESS.md`，写入 `[STATUS]: Build OK`。
2.  **若 Build 失败**: 请将控制台报错日志贴入 `docs/TODAY_PROGRESS.md`。
3.  **最后执行**: `git add . && git commit -m "chore: status update for agent" && git push`。

**主事在归队时会第一时间读取该文件以调整开发策略。**

---
**天策府主事 Liman 敬上**

*项目代码状态：[Master - e2b05d4..99c8610]*

