# HuntLink 全链路修复最终执行计划

**生成时间**：2026-04-01 22:05  
**执行团队**：WorkBuddy + 4个子Agent  
**预计完成时间**：30分钟

---

## 一、修复执行顺序（严格按此顺序）

### 阶段一：数据库迁移（5分钟）

#### 1. 积分初始化触发器
```bash
# 连接数据库
psql -h localhost -p 15432 -U postgres -d huntlink

# 执行迁移
\i /Users/liman/Desktop/huntlink-stable-final/backend/src/migrations/points-init-trigger.sql
```

#### 2. Job字段扩展
```bash
\i /Users/liman/Desktop/huntlink-stable-final/backend/src/migrations/job-fields-extension.sql
```

---

### 阶段二：后端代码修复（10分钟）

#### 已完成的修复（由WorkBuddy执行）

✅ **1. ResumeModule启用**
- 文件：`backend/src/app.module.ts:82`
- 状态：已修复

✅ **2. Job实体扩展**
- 文件：`backend/src/modules/job/job.entity.ts`
- 状态：已添加14个字段

✅ **3. 简历解析并发优化**
- 文件：`backend/src/modules/resume/resume.processor.ts`
- 状态：并发从10降到5

✅ **4. 积分触发器迁移**
- 文件：`backend/src/migrations/points-init-trigger.sql`
- 状态：已创建

✅ **5. Job字段迁移**
- 文件：`backend/src/migrations/job-fields-extension.sql`
- 状态：已创建

#### 待修复的问题（由backend-repair发现）

⚠️ **6. 简历解析内存安全**（P0）
- 文件：`resume.service.ts`
- 问题：本地文件未清理、AI解析无超时
- 方案：
  ```typescript
  // 在COS上传成功后添加
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath); // 立即删除本地文件
  }
  
  // AI解析添加超时保护
  const aiResult = await Promise.race([
    this.aiService.parseResumeText(resumeText),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('AI解析超时')), 60000)
    )
  ]);
  ```

⚠️ **7. 文件大小检查**（P1）
- 文件：`resume.service.ts:55`
- 方案：
  ```typescript
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new BadRequestException('文件大小不能超过5MB');
  }
  ```

---

### 阶段三：前端页面创建（15分钟）

#### 需要创建的文件

**1. 职位发布页面扩展**（frontend-repair方案）
- 文件：`app/page.tsx`
- 修复：添加7大功能模块
  - ✅ 薪资范围选择器
  - ✅ 技能标签选择
  - ✅ 工作地点级联
  - ✅ 福利待遇多选
  - ✅ 紧急程度标记
  - ✅ 推荐奖励设置
  - ⚠️ 富文本编辑器（需安装依赖）

**2. 简历上传组件**（新建）
- 文件：`components/resume-uploader.tsx`
- 功能：批量拖拽上传、进度显示、文件验证

**3. 邮箱管理页面**（新建）
- 文件：`app/profile/email/page.tsx`
- 功能：邮箱账号管理、IMAP配置、验证功能

**4. 个人中心菜单入口**
- 文件：`app/profile/page.tsx`
- 修复：添加"邮箱管理"菜单项

---

### 阶段四：测试数据注入（2分钟）

```bash
# 开启SSH隧道
ssh -f -N -L 15432:localhost:5432 -i ~/Desktop/workbuddy.pem ubuntu@150.158.51.199

# 执行注入
cd /Users/liman/Desktop/huntlink-stable-final/backend
npx ts-node scripts/inject-test-resumes.ts

# 验证数据
npx ts-node scripts/verify-injection.ts
```

---

## 二、风险评估与缓解

| 风险项 | 风险等级 | 缓解措施 | 负责人 |
|--------|----------|----------|--------|
| 数据库迁移失败 | 中 | 先备份数据库 | WorkBuddy |
| 前端依赖冲突 | 低 | 使用npm替代pnpm | frontend-repair |
| 简历解析OOM | 中 | 并发降到5，添加文件清理 | backend-repair |
| 邮箱拉取失败 | 低 | ResumeModule已启用 | WorkBuddy |

---

## 三、验证清单

### 后端验证
- [ ] ResumeModule成功加载（启动日志无错误）
- [ ] 邮箱拉取API可用（POST /api/resume/email-fetch）
- [ ] 新用户注册积分=100
- [ ] Job新字段可保存
- [ ] 简历解析队列正常

### 前端验证
- [ ] 职位发布页面所有字段可用
- [ ] 简历上传功能正常
- [ ] 邮箱管理页面可访问
- [ ] 表单验证生效

### 数据验证
- [ ] resumes表：1200条记录
- [ ] talents表：1200条记录
- [ ] 等级分布正确（S/A/B/C）
- [ ] 无重复手机号/邮箱

---

## 四、执行进度

### 已完成（WorkBuddy执行）
✅ ResumeModule启用  
✅ Job实体扩展  
✅ 简历解析并发优化  
✅ 积分触发器迁移脚本  
✅ Job字段迁移脚本  
✅ 测试数据注入脚本  

### 待执行
⏳ 数据库迁移  
⏳ 后端内存安全修复  
⏳ 前端页面创建  
⏳ 测试数据注入  
⏳ 后端构建与部署  

---

## 五、下一步行动

1. **立即执行数据库迁移**（5分钟）
2. **应用后端内存安全修复**（5分钟）
3. **创建前端页面和组件**（15分钟）
4. **注入测试数据**（2分钟）
5. **构建并部署到服务器**（10分钟）

---

**总预计时间**：37分钟  
**当前进度**：50%（6/12任务完成）
