# 测试数据注入文档

## 📋 概述

本文档说明如何使用测试数据注入脚本，向猎脉平台注入1000+份测试简历数据。

## 🗄️ 数据库结构

### Resume 实体（简历表）

**核心字段**：

| 字段名 | 类型 | 说明 | 必填 |
|--------|------|------|------|
| id | UUID | 主键 | ✅ |
| userId | UUID | 用户ID（外键） | ✅ |
| filePath | String | 文件路径 | ✅ |
| fileName | String | 文件名 | ✅ |
| fileSize | Number | 文件大小（字节） | ✅ |
| fileType | String | 文件类型（pdf/docx/jpg/png） | ✅ |
| parseStatus | String | 解析状态（pending/processing/success/failed） | ✅ |
| basicInfo | JSON | 基本信息（姓名/手机/邮箱/年龄/性别/城市） | ❌ |
| education | JSON Array | 教育经历 | ❌ |
| workExperience | JSON Array | 工作经历 | ❌ |
| projects | JSON Array | 项目经验 | ❌ |
| skills | String Array | 技能列表 | ❌ |
| jobIntention | JSON | 求职意向（期望职位/薪资/地点/状态） | ❌ |
| score | Number | 综合评分（0-100） | ✅ |
| tier | String | 人才等级（S/A/B/C） | ✅ |
| isPublic | Boolean | 是否公开到人才广场 | ✅ |
| source | String | 来源（upload/email/import） | ✅ |
| talentId | UUID | 关联的人才ID | ❌ |

**索引字段**：
- `userId`（单列索引）
- `talentId`（单列索引）
- `tier`（单列索引）

### Talent 实体（人才表）

**核心字段**：

| 字段名 | 类型 | 说明 | 必填 |
|--------|------|------|------|
| id | UUID | 主键 | ✅ |
| userId | UUID | 用户ID | ✅ |
| name | String | 姓名 | ✅ |
| currentTitle | String | 当前职位 | ❌ |
| currentCompany | String | 当前公司 | ❌ |
| experience | String | 工作年限（应届生/1-3年/3-5年/5-10年/10年以上） | ❌ |
| education | String | 学历（本科/硕士/博士/大专） | ❌ |
| location | String | 所在城市 | ❌ |
| expectedSalary | String | 期望薪资 | ❌ |
| skills | String Array | 技能列表 | ❌ |
| jobStatus | String | 工作状态（actively_looking/open_to_offers/not_looking） | ❌ |
| age | Number | 年龄 | ❌ |
| gender | String | 性别 | ❌ |
| tier | String | 人才等级（S/A/B/C） | ✅ |
| score | Number | 综合评分 | ✅ |
| isPublic | Boolean | 是否公开 | ✅ |
| lastActive | Date | 最后活跃时间 | ❌ |

**索引字段**：
- `userId`（单列索引）
- `tier`（单列索引）
- `location + experience`（组合索引）
- `location + education`（组合索引）
- `jobStatus + location`（组合索引）
- `jobStatus + experience`（组合索引）
- `jobStatus + education`（组合索引）

### 关联关系

- `Resume.user` → `User`（多对一）
- `Resume.talentId` → `Talent.id`（一对一，可选）

## 📊 数据生成规则

### 1. 人才等级分布

| 等级 | 占比 | 分数范围 | 特征 |
|------|------|----------|------|
| S级 | 5% | 90-100 | 行业顶尖，丰富经验，多项核心技能 |
| A级 | 15% | 70-89 | 资深专家，较强能力，稳定履历 |
| B级 | 35% | 50-69 | 中坚力量，合格能力，持续成长 |
| C级 | 45% | 30-49 | 初级人才，基础能力，学习阶段 |

### 2. 学历分布

| 学历 | 占比 |
|------|------|
| 本科 | 60% |
| 硕士 | 25% |
| 博士 | 5% |
| 大专 | 10% |

### 3. 工作年限分布

| 年限范围 | 占比 |
|----------|------|
| 应届生 | 10% |
| 1-3年 | 25% |
| 3-5年 | 30% |
| 5-10年 | 25% |
| 10年以上 | 10% |

### 4. 工作状态分布

| 状态 | 占比 |
|------|------|
| actively_looking（主动求职） | 30% |
| open_to_offers（开放机会） | 40% |
| not_looking（暂不求职） | 30% |

### 5. 城市分布

- 一线城市（北上广深）：优先选择
- 新一线城市（杭州、成都等）：次优先
- 二线城市：部分选择

### 6. 技能生成

按领域分类生成：
- **技术类**（70%）：JavaScript, Python, Java, React, Node.js 等
- **产品类**（10%）：产品规划, 用户研究, 需求分析 等
- **设计类**（8%）：UI设计, UX设计, Figma 等
- **运营类**（7%）：内容运营, 用户运营, 数据分析 等
- **其他**（5%）：市场、人力、财务、法务

每份简历包含3-7个技能标签。

### 7. 薪资计算

根据工作年限和人才等级动态计算：

```
基础薪资范围（K）：
- S级: 30-80K
- A级: 20-50K
- B级: 15-35K
- C级: 8-25K

最终薪资 = 基础薪资 × (1 + 工作年限 × 0.05)
```

### 8. 姓名和联系方式

- **姓名**：随机生成中文姓名（常用姓氏 + 1-2字名）
- **手机号**：有效格式（13/15/18开头），确保唯一性
- **邮箱**：基于姓名生成拼音邮箱，确保唯一性

## 🚀 执行方法

### 前置条件

1. **确保SSH隧道已开启**：

```bash
ssh -f -N -L 15432:localhost:5432 -i ~/Desktop/workbuddy.pem ubuntu@150.158.51.199
```

验证隧道是否正常：

```bash
lsof -i :15432
```

2. **安装依赖**：

```bash
cd /Users/liman/Desktop/huntlink-stable-final/backend
npm install
```

### 执行命令

```bash
cd /Users/liman/Desktop/huntlink-stable-final/backend
npx ts-node scripts/inject-test-resumes.ts
```

### 执行流程

1. **连接数据库**（约1秒）
   - 使用环境变量 `DB_HOST=localhost`, `DB_PORT=15432`
   - 验证连接状态

2. **准备测试用户**（约1秒）
   - 查询是否存在测试用户（手机号：10000000000）
   - 不存在则创建

3. **生成数据**（约10秒）
   - 生成1200份简历数据
   - 生成对应的Talent数据
   - 显示进度（每100条）

4. **批量插入**（约120秒）
   - 每批100条，共12批
   - 使用事务保证一致性
   - 显示进度（每100条）

5. **验证数据**（约3秒）
   - 统计简历和人才数量
   - 统计等级分布
   - 统计学历分布

### 预期输出

```
🚀 开始注入测试数据...

📡 连接数据库...
✅ 数据库连接成功

👤 准备测试用户...
✅ 测试用户已存在
   用户ID: xxx-xxx-xxx

📊 生成测试数据...
   已生成 100/1200 条数据
   已生成 200/1200 条数据
   ...
   已生成 1200/1200 条数据
✅ 数据生成完成 (共 1200 条)

💾 开始批量插入数据库...
   已插入 100/1200 条数据
   已插入 200/1200 条数据
   ...
   已插入 1200/1200 条数据

✅ 数据插入成功

🔍 验证数据完整性...
   简历表记录: 1200 条
   人才表记录: 1200 条

   人才等级分布:
   - A级: 180 人
   - B级: 420 人
   - C级: 540 人
   - S级: 60 人

   学历分布:
   - 本科: 720 人
   - 硕士: 300 人
   - 博士: 60 人
   - 大专: 120 人

🎉 测试数据注入完成！

执行时间统计:
   - 总耗时: ~135 秒
   - 内存占用: ~60 MB
```

## ⚠️ 注意事项

### 1. 数据库连接

- **必须使用SSH隧道**：本地通过 `localhost:15432` 连接
- **确保隧道稳定**：网络中断会导致事务失败
- **密码正确**：`huntlink_safe_2026`

### 2. 性能优化

- **批量插入**：每批100条，减少数据库往返
- **事务保护**：失败自动回滚，保证数据一致性
- **内存控制**：生成完成后才插入，避免内存泄漏

### 3. 避免重复

- **手机号唯一性检查**：使用Set去重
- **邮箱唯一性检查**：使用Set去重
- **用户复用**：测试用户可重复使用

### 4. 错误处理

- **连接失败**：检查SSH隧道和密码
- **插入失败**：事务自动回滚，检查错误日志
- **超时**：增加 `queryRunner.timeout` 配置

### 5. 数据清理

如需重新注入，先清理旧数据：

```sql
-- 连接数据库
psql -h localhost -p 15432 -U postgres -d huntlink

-- 删除测试数据
DELETE FROM resumes WHERE user_id = '测试用户ID';
DELETE FROM talents WHERE user_id = '测试用户ID';
DELETE FROM users WHERE phone = '10000000000';
```

## 📈 资源消耗估算

### 时间消耗

| 阶段 | 时间 |
|------|------|
| 连接数据库 | 1秒 |
| 准备用户 | 1秒 |
| 生成数据 | 10秒 |
| 批量插入 | 120秒 |
| 验证数据 | 3秒 |
| **总计** | **~135秒** |

### 内存消耗

- **数据生成**：~60MB（1200条数据）
- **批量插入**：~30MB（单批次）
- **峰值内存**：~90MB

### 数据库压力

- **连接数**：1个（单一连接）
- **事务数**：1个（全程一个事务）
- **插入操作**：12批次（每批100条）
- **索引更新**：同步更新，无延迟

### 网络流量

- **SSH隧道**：~5MB数据传输
- **本地到远程**：~3MB（插入语句）
- **远程到本地**：~2MB（确认响应）

## ✅ 验证方法

### 1. 查询简历总数

```sql
SELECT COUNT(*) FROM resumes WHERE source = 'import';
```

预期结果：1200

### 2. 查询人才总数

```sql
SELECT COUNT(*) FROM talents;
```

预期结果：1200

### 3. 验证等级分布

```sql
SELECT tier, COUNT(*) 
FROM resumes 
WHERE source = 'import' 
GROUP BY tier 
ORDER BY tier;
```

预期结果：
- S级：~60
- A级：~180
- B级：~420
- C级：~540

### 4. 验证学历分布

```sql
SELECT education->0->>'degree' as degree, COUNT(*) 
FROM resumes 
WHERE source = 'import' 
GROUP BY education->0->>'degree';
```

预期结果：
- 本科：~720
- 硕士：~300
- 博士：~60
- 大专：~120

### 5. 验证数据完整性

```sql
-- 检查必填字段
SELECT COUNT(*) FROM resumes WHERE 
  basic_info->>'name' IS NULL OR 
  basic_info->>'phone' IS NULL OR 
  basic_info->>'email' IS NULL;
```

预期结果：0

### 6. 验证关联关系

```sql
-- 检查简历和人才表关联
SELECT COUNT(*) 
FROM resumes r 
LEFT JOIN talents t ON r.talent_id = t.id 
WHERE r.source = 'import' AND t.id IS NULL;
```

预期结果：0（所有简历都关联到人才）

## 🔧 故障排查

### 问题1：连接超时

**原因**：SSH隧道未开启或已断开

**解决**：
```bash
# 重新建立隧道
pkill -f 'ssh.*15432'
ssh -f -N -L 15432:localhost:5432 -i ~/Desktop/workbuddy.pem ubuntu@150.158.51.199
```

### 问题2：密码错误

**原因**：数据库密码不正确

**解决**：
```bash
# 检查环境变量
cat .env

# 确认密码为 huntlink_safe_2026
```

### 问题3：内存不足

**原因**：生成数据过多

**解决**：
```typescript
// 减少生成数量
const totalCount = 500; // 从1200改为500
```

### 问题4：插入慢

**原因**：批量大小过小

**解决**：
```typescript
// 增加批量大小
const batchSize = 200; // 从100改为200
```

### 问题5：事务超时

**原因**：插入时间过长

**解决**：
```typescript
// 设置更长超时
await queryRunner.startTransaction();
await queryRunner.query('SET statement_timeout = 300000'); // 5分钟
```

## 📝 扩展建议

### 1. 增加数据多样性

```typescript
// 添加更多技能领域
const NEW_DOMAINS = {
  '区块链': ['Ethereum', 'Solidity', 'Web3.js', 'DeFi'],
  '游戏开发': ['Unity', 'Unreal Engine', 'C#', 'C++']
};
```

### 2. 添加关联数据

```typescript
// 生成推荐记录
const recommendation = {
  resumeId: resume.id,
  jobId: randomJobId,
  score: Math.floor(Math.random() * 100),
  createdAt: new Date()
};
```

### 3. 支持增量注入

```typescript
// 检查已注入数量
const existingCount = await resumeRepo.count({ where: { userId } });
const remainingCount = totalCount - existingCount;
```

### 4. 支持并发插入

```typescript
// 使用Promise.all并发插入多批
await Promise.all(
  batches.map(batch => resumeRepo.save(batch))
);
```

---

**文档版本**：v1.0  
**最后更新**：2026-04-01  
**作者**：data-injection Agent
