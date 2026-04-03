# 零容器部署实战经验总结

**时间**：2026-03-30 02:15  
**执行者**：都统 Claw  
**指导**：Gemini 架构师 + 司命大人

---

## 一、问题根源分析

### 1. Git 冲突解决导致的源码污染

**现象**：PM2 频繁重启（191 次），错误日志显示 `job.service.js:77` 语法错误：
```javascript
constructor((), jobRepository, (typeorm_2.Repository));
             ^
SyntaxError: Unexpected token ')'
```

**原因**：
- 我在解决 Git 冲突时使用了 `git checkout --theirs`，接受了破坏的 upstream 代码
- `job.service.ts` 包含两个重复的 `JobService` 类定义（16-56 行 + 58-125 行）
- 第一个版本有积分扣除逻辑但不完整（36 行有 `...`）
- 第二个版本是完整的基础 CRUD

**修复**：
- 从 Git 历史 `1e44e7c` 恢复完整版本
- 手动合并两个版本：保留积分扣除逻辑 + 完整的 CRUD 方法
- 提交 `fbab39b`

---

### 2. BullQueue 依赖注入缺失

**现象**：服务启动失败，错误：
```
Error: Nest can't resolve dependencies of the ResumeService (..., BullQueue_email-fetching, ...).
Please make sure that the argument "BullQueue_email-fetching" at index [5] is available in the ResumeModule context.
```

**原因**：
- `ResumeService` 构造函数注入了 `@InjectQueue('email-fetching')`
- 但 `ResumeModule` 没有导入 `BullModule.registerQueue({ name: 'email-fetching' })`

**修复**：
- 在 `ResumeModule` 中添加 BullModule 导入和队列注册
- 提交 `cfdb387`

---

### 3. dist 目录冲突

**现象**：原子化部署后 PM2 仍加载旧的编译产物

**原因**：
- 服务器上同时存在 `dist/` 目录和 `current/` 软链接
- Node.js 模块解析时优先找到了根目录的 `dist/`
- 软链接切换失效

**修复**：
- 删除根目录的 `dist/`，只保留 `releases/v时间戳/dist/`
- PM2 启动路径改为 `current/dist/src/main.js`

---

## 二、原子化部署方案（Gemini 架构师建议）

### 核心原则

**零停机、可回滚、权限隔离**

### 部署流程

```bash
# 1. 本地构建产物
cd backend
npm run build
tar -czf backend-dist.tar.gz dist

# 2. 上传到服务器
scp backend-dist.tar.gz ubuntu@150.158.51.199:/tmp/

# 3. 服务器端原子化部署
cd /var/www/huntlink/backend

# 创建发布目录（不影响当前运行）
TIMESTAMP=$(date +%Y%m%d%H%M%S)
sudo mkdir -p releases/v$TIMESTAMP

# 解压到发布目录
sudo tar -xzf /tmp/backend-dist.tar.gz -C releases/v$TIMESTAMP
sudo chown -R ubuntu:ubuntu releases/v$TIMESTAMP

# 验证关键文件
ls -la releases/v$TIMESTAMP/dist/src/main.js

# 原子化切换软链接（秒级切换）
sudo ln -sfn releases/v$TIMESTAMP current

# PM2 优雅重载（非 restart）
pm2 reload huntlink-backend --update-env

# 或者首次启动
pm2 start current/dist/src/main.js --name huntlink-backend

# 清理旧版本（保留最近 5 个）
cd releases
ls -t | tail -n +6 | xargs -r sudo rm -rf
```

### 回滚命令

```bash
# 查看历史版本
ls -lt releases/

# 回滚到指定版本
ln -sfn releases/v202603300200 current
pm2 reload huntlink-backend
```

---

## 三、关键经验教训

### 1. 禁止使用 PowerShell 对源文件进行批量替换

**原因**：PowerShell 的 `-replace` 命令有编码问题，会破坏 UTF-8 文件

**案例**：
- `resume.service.ts` 被 PowerShell 命令破坏，306 行类结束后还有 200 多行重复代码
- 修复：`git checkout HEAD -- filename` 恢复

---

### 2. Git 冲突解决需谨慎

**问题**：
- `git checkout --theirs` 会盲目接受 upstream 代码，可能包含错误
- 解决冲突后必须检查文件完整性（行数、语法）

**正确做法**：
```bash
# 查看冲突文件的提交历史
git log --oneline --all -- backend/src/modules/job/job.service.ts

# 从正确的提交恢复
git checkout <正确的commit-hash> -- filename

# 或手动编辑解决冲突，然后检查
wc -l filename.ts  # 检查行数是否合理
npm run build      # 立即编译验证
```

---

### 3. 构建前必须扫描 Git 冲突标记

**新增脚本**：`scripts/check-conflict-markers.sh`

```bash
#!/bin/bash
# 检查源码目录
CONFLICTS=$(grep -r "<<<<<<< " src/ 2>/dev/null || true)

if [ -n "$CONFLICTS" ]; then
    echo "❌ 发现 Git 冲突标记！"
    echo "$CONFLICTS"
    exit 1
fi
```

**集成到预检脚本**：
```bash
# 提交前检查
./scripts/pre-push-check.sh  # 已包含冲突标记检查（Step 1）
```

---

### 4. Node.js 版本差异

**问题**：
- `ecosystem.config.js` 中的 `--gc-interval=100` 不被 Node.js 20.x 支持
- 错误：`node: --gc-interval= is not allowed in NODE_OPTIONS`

**修复**：
- 删除 `--gc-interval=100` 参数
- 只保留 `--max-old-space-size=1536`

---

## 四、服务最终状态

### ✅ 部署成功

```
PM2 状态：online (PID 853743)
Uptime：稳定运行
重启次数：191（历史累计，当前稳定）
后端 API：http://150.158.51.199:3000/api/docs → HTTP 200 ✅
前端：http://150.158.51.199/ → HTTP 200 ✅
```

### 代码版本

```
本地：cfdb387（已推送）
服务器：releases/v202603300210
软链接：current -> releases/v202603300210
```

---

## 五、新增脚本与文件

### 1. 原子化部署脚本

**文件**：`scripts/atomic-deploy.sh`

**功能**：
- 创建时间戳发布目录
- 解压到 `releases/v时间戳`
- 原子化切换软链接
- PM2 优雅重载
- 自动清理旧版本（保留 5 个）

---

### 2. Git 冲突标记检查脚本

**文件**：`scripts/check-conflict-markers.sh`

**功能**：
- 扫描源码中的 `<<<<<<<`、`=======`、`>>>>>>>` 标记
- 扫描编译产物中的冲突标记
- 阻止带冲突标记的代码流入部署

---

### 3. 预检脚本更新

**文件**：`scripts/pre-push-check.sh`

**新增 Step 1**：Git 冲突标记检查（在 TypeScript 检查之前）

---

## 六、提交记录

1. **fbab39b** - fix: resolve job.service.ts merge conflict + add atomic deploy scripts
   - 修复 job.service.ts 重复类定义
   - 新增原子化部署脚本
   - 新增冲突标记检查脚本

2. **cfdb387** - fix: register BullQueue in ResumeModule for email-fetching queue
   - 在 ResumeModule 中注册 BullQueue
   - 解决依赖注入问题

---

## 七、给长风的建议

### 下次部署时的注意事项

1. **使用原子化部署脚本**
   ```bash
   # 服务器端执行
   cd /var/www/huntlink/backend
   ./scripts/atomic-deploy.sh
   ```

2. **提交前必须运行预检脚本**
   ```bash
   cd huntlink
   ./scripts/pre-push-check.sh
   ```

3. **解决 Git 冲突时务必检查文件完整性**
   ```bash
   # 解决冲突后立即检查
   git diff --check  # 检查空白错误
   npm run build     # 编译验证
   ```

4. **如果遇到依赖注入错误**
   - 检查 Module 是否导入了所需的服务
   - 检查 Provider 是否正确注册
   - 查看 NestJS 文档的依赖注入章节

---

## 八、参考文档

- **MEMORY.md**：项目核心信息和技术栈
- **docs/ARCHITECTURE_GUIDE.md**：架构指南
- **docs/AGENT_DIRECTIVE.md**：Agent 执行指令集（含第零阶段部署红线）
- **docs/DEPLOYMENT_TRAINING.md**：部署培训文档
- **backend/ecosystem.config.js**：PM2 生产配置

---

**总结**：本次实战验证了 Gemini 架构师的建议——"突防的成功不在于强行跑起来，而在于在废墟上建立秩序"。原子化部署方案已在生产环境成功实施，服务稳定运行。
