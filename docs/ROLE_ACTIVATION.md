# 角色自动化激活系统

> **版本**: V1.0  
> **创建时间**: 2026-03-28  
> **触发方式**: 司命大人一句话激活

---

## 🎯 激活流程

### 触发语句

**司命大人说**：
```
"你来做 [角色名称]"
或
"你担任 [角色代码]"
```

**示例**：
- "你来做协调者"
- "你担任 COORDINATOR"
- "你来做左护法"

---

## 🤖 Agent 自动执行

### 阶段 1: 文档定位（30 秒）

**自动搜索**：
```bash
# 1. 查找角色主文档
find docs/ -name "*[ROLE]*" -type f

# 2. 查找相关文档
grep -r "[角色名称]" docs/ --include="*.md"

# 3. 生成文档清单
```

**输出**：
```markdown
## [角色名称] 文档清单

### 核心文档
- [ ] docs/[ROLE]_HANDOVER.md - 角色交接手册
- [ ] docs/EXPERIENCE_SYSTEM.md - 经验系统
- [ ] .task-board.md - 任务看板

### 参考文档
- [ ] docs/NEWCOMER_GUIDE.md - 新人引导
- [ ] docs/5MIN_CLOSED_LOOP.md - 5 分钟闭环
- [ ] ORGANIZATION.md - 组织总览
```

---

### 阶段 2: 经验继承（1 分钟）

**自动执行**：
```bash
# 1. 检查是否有前任经验
if [ -f "docs/experiences/[ROLE]/handover.md" ]; then
  # 2. 复制到 inherited.md
  cp docs/experiences/[ROLE]/handover.md \
     docs/experiences/[ROLE]/inherited.md
  
  # 3. 更新继承信息
  echo "继承时间：$(date)" >> inherited.md
  echo "继承自：自动激活" >> inherited.md
  
  # 4. 创建积累经验文件
  cat > docs/experiences/[ROLE]/accumulated.md << EOF
# [ROLE] 积累的经验

**开始时间**: $(date)
**激活方式**: 自动激活

## 今日经验

### $(date +%Y-%m-%d)

准备开始工作...
EOF
  
  echo "✅ 经验继承完成"
else
  echo "⚠️ 未找到前任经验，创建新文件"
  mkdir -p docs/experiences/[ROLE]
  # 创建空模板
fi
```

---

### 阶段 3: 记忆续写（自动）

**自动开启**：
```typescript
// 监听任务完成事件
on('TASK_COMPLETED', async (task) => {
  // 1. 自动总结
  const summary = await generateSummary(task);
  
  // 2. 记录经验
  await appendExperience({
    role: currentRole,
    title: task.title,
    scenario: task.scenario,
    action: task.action,
    result: task.result,
    timestamp: new Date()
  });
  
  // 3. 更新任务看板
  await updateTaskBoard(task.id, 'completed');
  
  // 4. 通知司命大人
  await notify('@司命大人 任务已完成，经验已记录');
});
```

---

### 阶段 4: 任务复盘（自动）

**每次任务后自动执行**：
```markdown
## 任务复盘

**任务 ID**: [ID]
**任务名称**: [名称]
**完成时间**: [时间]

### 做得好的
- [ ] [点 1]
- [ ] [点 2]

### 需要改进的
- [ ] [点 1]
- [ ] [点 2]

### 经验教训
- [ ] [经验 1]
- [ ] [经验 2]

### 下一步行动
- [ ] [行动 1]
- [ ] [行动 2]
```

**自动记录到**：
- `docs/experiences/[ROLE]/accumulated.md`
- `.task-board.md`（更新状态）
- `docs/TODAY_PROGRESS.md`（今日进展）

---

## 📋 激活示例

### 示例 1: 激活协调者

**司命大人说**：
```
"你来做协调者"
```

**Agent 自动执行**：
```
✅ 1. 定位文档
   - docs/LEFT_HANDOVER_MANUAL.md
   - docs/EXPERIENCE_SYSTEM.md
   - .task-board.md

✅ 2. 继承经验
   - 复制 handover.md → inherited.md
   - 创建 accumulated.md
   - 开启记忆续写

✅ 3. 开始工作
   - 查看任务看板
   - 分配今日任务
   - 监控进度

✅ 4. 任务复盘
   - 每次任务后自动总结
   - 记录经验
   - 更新文档
```

---

## 🛠️ 自动化脚本

### 脚本 1: 角色激活

```bash
#!/bin/bash
# scripts/activate-role.sh

ROLE_NAME=$1
ROLE_CODE=$(get_role_code $ROLE_NAME)

echo "🚀 激活角色：$ROLE_NAME ($ROLE_CODE)"

# 1. 定位文档
echo "📍 定位文档..."
find_docs $ROLE_CODE

# 2. 继承经验
echo "📚 继承经验..."
inherit_experience $ROLE_CODE

# 3. 开启记忆续写
echo "📝 开启记忆续写..."
start_memory_writing $ROLE_CODE

# 4. 开始工作
echo "✅ 角色激活完成，开始工作！"
```

### 脚本 2: 任务复盘

```bash
#!/bin/bash
# scripts/task-retrospective.sh

TASK_ID=$1
ROLE_CODE=$2

# 1. 读取任务信息
TASK=$(get_task $TASK_ID)

# 2. 生成复盘
cat >> docs/experiences/$ROLE_CODE/accumulated.md << EOF

### $(date +%Y-%m-%d %H:%M)

**任务**: $TASK.title
**做得好的**: 
- $TASK.good_points

**需要改进**:
- $TASK.improvements

**经验教训**:
- $TASK.learnings
EOF

# 3. 更新任务看板
update_task_board $TASK_ID "completed"

echo "✅ 任务复盘完成"
```

---

## 📊 激活状态监控

### 激活状态

| 角色 | 激活时间 | 经验继承 | 记忆续写 | 状态 |
|------|---------|---------|---------|------|
| LEADER | - | - | - | ⏳ 待激活 |
| COORDINATOR | 2026-03-28 09:00 | ✅ | ✅ | 🟢 运行中 |
| BUILDER | - | - | - | ⏳ 待激活 |
| REVIEWER | - | - | - | ⏳ 待激活 |

### 经验积累统计

| 角色 | 今日经验 | 本周经验 | 本月经验 | 总经验 |
|------|---------|---------|---------|--------|
| COORDINATOR | 3 | 15 | 45 | 45 |
| BUILDER | 0 | 0 | 0 | 0 |

---

## 💬 使用说明

### 司命大人

**激活角色**：
```
对 Agent 说："你来做 [角色名称]"
```

**查看状态**：
```
cat docs/experiences/[ROLE]/accumulated.md
```

**查看复盘**：
```
cat docs/TODAY_PROGRESS.md
```

### Agent

**自动执行**：
1. 监听激活语句
2. 执行激活流程
3. 开始工作
4. 自动复盘

**手动触发**：
```bash
./scripts/activate-role.sh COORDINATOR
```

---

## 📋 检查清单

### 激活前检查

- [ ] 角色文档已创建
- [ ] 经验系统已配置
- [ ] 任务看板已就绪
- [ ] 自动化脚本已测试

### 激活后检查

- [ ] 文档已定位
- [ ] 经验已继承
- [ ] 记忆已开启
- [ ] 复盘已配置

### 日常检查

- [ ] 任务后自动复盘
- [ ] 经验自动积累
- [ ] 文档自动更新

---

**文档位置**: `docs/ROLE_ACTIVATION.md`  
**版本**: V1.0  
**最后更新**: 2026-03-28  
**维护者**: 左护法（天策府主官）  
**审核**: 司命大人
