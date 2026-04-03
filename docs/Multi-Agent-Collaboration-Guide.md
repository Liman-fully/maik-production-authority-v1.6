# 猎脉项目多Agent协作开发指南

> 基于 2026 年 AI Agent 生态最佳实践，结合猎脉项目实际情况整理

---

## 一、多Agent协作的必要性

### 1.1 单Agent的极限

| 问题 | 表现 | 影响 |
|------|------|------|
| **上下文窗口溢出** | 长对话后遗忘早期内容 | 代码不一致、重复劳动 |
| **角色混淆** | 一个Agent同时做产品+开发+测试 | 专业度下降、质量失控 |
| **错误累积** | 小错误未及时发现，最终导致大问题 | 部署失败、返工成本高 |
| **无法并行** | 串行执行，效率低 | 开发周期长 |

### 1.2 猎脉项目的Agent分工现状

```
司命大人（用户）
    ├── 天策府（产品策略）
    │   ├── 左护法（主官）
    │   ├── 策画郎中（产品规划）
    │   ├── 审议郎中（方案审核）
    │   └── 验收郎中（部署验收）
    │
    ├── 神机营（技术实现）
    │   ├── 都统（主官，Claw）
    │   ├── 前锋校尉（前端）
    │   ├── 后阵校尉（后端）
    │   └── 督造校尉（运维）
    │
    └── 镇抚司（质量监督）
        ├── 右护法（主官，待定）
        ├── 监察御史（代码审查）
        ├── 度支主事（性能优化）
        └── 考功郎中（质量评估）
```

---

## 二、四种核心协作模式

### 2.1 Supervisor（监督者模式）

**核心思想**：一个"老板"Agent负责任务分解与分配，多个"员工"Agent各司其职。

**适用场景**：
- 复杂多步骤任务（如研究报告生成、代码审查）
- 需要严格流程控制的项目
- 猎脉场景：PRD评审流程、版本发布流程

**架构示例**：
```
用户请求 → Supervisor Agent
              ├── 产品Agent（需求分析）
              ├── 前端Agent（UI实现）
              ├── 后端Agent（API开发）
              └── 测试Agent（质量验证）
              ↓
           结果聚合 → 返回用户
```

**优势**：
- 集中控制，流程清晰
- 易于调试和追踪
- 适合企业级协作

**劣势**：
- Supervisor为单点瓶颈
- LLM调用成本较高

### 2.2 Handoff（交接模式）

**核心思想**：Agent间直接交接控制权，无需中间层。

**适用场景**：
- 客服/对话系统
- 状态机驱动的流程
- 猎脉场景：用户注册流程、简历处理流程

**架构示例**：
```
分诊Agent → 技术Agent → 销售Agent → 结束
    ↑           ↑           ↑
    └───────────┴───────────┘
         可随时回退
```

**优势**：
- 去中心化，低延迟
- 模拟人类协作方式
- 灵活性强

**劣势**：
- 调试困难
- 可能形成环路

### 2.3 Router（路由器模式）

**核心思想**：轻量级路由层根据输入特征快速分发到专业Agent。

**适用场景**：
- 简单分类分发任务
- 不需要多Agent协作的场景
- 猎脉场景：API请求路由、消息分发

**架构示例**：
```python
class AgentRouter:
    def register(self, agent_name, agent, matcher):
        """注册Agent和匹配规则"""
        self.agents[agent_name] = {'agent': agent, 'matcher': matcher}
    
    def route(self, query):
        """规则匹配失败时降级至LLM路由"""
        for name, config in self.agents.items():
            if config['matcher'](query):
                return config['agent'].handle(query)
        # 降级到LLM路由
        return self.llm_route(query)
```

**优势**：
- 路由延迟极低
- 可预测性强
- 成本可控

**劣势**：
- 不支持多Agent协作
- 规则维护成本高

### 2.4 Swarm（群体智能模式）

**核心思想**：多个Agent并行工作，通过共享状态（黑板模式）协调。

**适用场景**：
- 研究/创意类任务
- 需要并行探索的场景
- 猎脉场景：市场调研、技术选型评估

**架构示例**：
```python
@dataclass
class SharedBlackboard:
    """共享黑板状态"""
    topic: str
    findings: List[str] = field(default_factory=list)
    votes: Dict[str, int] = field(default_factory=dict)

async def research_swarm(topic, num_agents=5):
    """多个Agent并行研究并汇总"""
    blackboard = SharedBlackboard(topic=topic)
    
    # 并行执行
    tasks = [agent.research(blackboard) for agent in agents]
    await asyncio.gather(*tasks)
    
    # 投票决策
    return aggregate_results(blackboard)
```

**优势**：
- 真正并行执行
- 去中心化
- 无单点故障

**劣势**：
- 协调复杂
- 结果合成难度大

---

## 三、猎脉协作模式选型决策树

```
                    需要多Agent协作？
                         │
            ┌────────────┴────────────┐
           是                         否
            │                          │
    需要严格流程控制？              Router模式
            │
    ┌───────┴───────┐
   是               否
    │               │
Supervisor      需要并行执行？
模式                │
            ┌───────┴───────┐
           是               否
            │               │
        Swarm模式      Handoff模式
```

### 猎脉各场景推荐模式

| 场景 | 推荐模式 | 理由 |
|------|----------|------|
| PRD评审流程 | Supervisor | 需要严格审批流程 |
| 版本发布流程 | Supervisor | 需要集中控制和回滚机制 |
| 用户注册流程 | Handoff | 状态机驱动，流程清晰 |
| 简历处理流程 | Handoff | 各阶段独立，顺序传递 |
| API请求路由 | Router | 简单分发，无需协作 |
| 技术选型评估 | Swarm | 需要多角度并行探索 |
| 市场调研 | Swarm | 需要广泛收集信息 |

---

## 四、通信协议：MCP与A2A

### 4.1 MCP（Model Context Protocol）

**定义**：Anthropic推出的工具调用标准接口。

**核心功能**：
- 工具注册：声明可用工具（名称、描述、参数Schema）
- 函数调用：JSON-RPC调用，支持参数验证
- 流式响应：分块返回，减少延迟
- 状态管理：会话级状态持久化

**猎脉应用**：
```json
{
  "tools": [
    {
      "name": "analyze_resume",
      "description": "分析简历并提取关键信息",
      "parameters": {
        "resume_id": "string",
        "extract_fields": ["education", "experience", "skills"]
      }
    },
    {
      "name": "calculate_match_score",
      "description": "计算简历与岗位的匹配度",
      "parameters": {
        "resume_id": "string",
        "job_id": "string"
      }
    }
  ]
}
```

### 4.2 A2A（Agent-to-Agent协议）

**定义**：Google主导的开源协议，定义Agent间协作标准。

**核心机制**：
- Agent Card：数字名片（能力声明）
- 任务发现：通过注册中心查找专业Agent
- 任务委托：发送任务描述，确认接受
- 执行监控：流式返回进度
- 结果返回：异步或同步获取

**Agent Card 示例**：
```json
{
  "name": "backend_agent",
  "capabilities": ["api_development", "database_design", "performance_optimization"],
  "endpoint": "https://huntlink.example.com/agents/backend",
  "version": "1.0",
  "department": "神机营"
}
```

### 4.3 MCP与A2A的关系

```
┌─────────────────────────────────────────┐
│           Agent协作层（A2A）             │
│   Agent A ←──通信──→ Agent B            │
└────────────────┬────────────────────────┘
                 │
┌────────────────┴────────────────────────┐
│           工具调用层（MCP）              │
│   Agent → Database, API, FileSystem     │
└─────────────────────────────────────────┘
```

- MCP是"底层基础设施"：统一Agent访问工具的方式
- A2A是"上层协作框架"：定义Agent间如何分工

---

## 五、Skills（技能模块）实践

### 5.1 Skills与Tools的区别

| 维度 | Tools | Skills |
|------|-------|--------|
| **本质** | 可执行的函数/API | 知识+行为模式 |
| **粒度** | 原子操作 | 复合能力 |
| **包含内容** | 输入/输出Schema | 示例、SOP、风格指南 |
| **使用方式** | 直接调用 | 按需加载，指导Agent行为 |

### 5.2 猎脉Skills规划

```
~/.workbuddy/skills/
├── hr-recruitment-knowledge/    # HR招聘领域知识
├── resume-understanding/        # 简历深度分析
├── image-understanding/         # 图片/截图理解
├── nestjs-best-practices/       # NestJS最佳实践
├── vue-best-practices/          # Vue最佳实践
├── docker-expert/               # Docker专家
├── typeorm/                     # TypeORM专家
└── postgresql/                  # PostgreSQL专家
```

### 5.3 Skills使用规范

**加载时机**：
- 任务涉及特定领域时按需加载
- 避免一次性加载过多Skills

**命名规范**：
- 使用小写字母和连字符
- 格式：`{domain}-{capability}`
- 示例：`hr-recruitment-knowledge`

---

## 六、生产实践：五个关键教训

### 6.1 从2个Agent开始，逐步扩展

**错误做法**：一开始就设计10个Agent的复杂系统

**正确做法**：
1. 先定义1个主Agent + 1个专业Agent
2. 验证协作流程可行性
3. 逐步添加更多专业Agent

**猎脉实践**：
- 第一阶段：都统（主Agent） + 左护法（产品Agent）
- 第二阶段：添加监察御史（审查Agent）
- 第三阶段：扩展到完整的三大部门

### 6.2 严格定义Agent间Schema

**使用Pydantic/TypeScript接口**：
```typescript
// 猎脉Agent间通信Schema
interface TaskDelegation {
  task_id: string;
  task_type: 'development' | 'review' | 'deployment';
  description: string;
  input_data: Record<string, any>;
  expected_output: string;
  deadline?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface TaskResult {
  task_id: string;
  status: 'completed' | 'failed' | 'cancelled';
  output_data?: Record<string, any>;
  error_message?: string;
  execution_time_ms: number;
}
```

### 6.3 设置明确终止条件

**防止无限循环和Token爆炸**：
```python
MAX_ITERATIONS = 10
MAX_TOKENS_PER_AGENT = 50000

class AgentExecutionContext:
    iteration_count: int = 0
    total_tokens: int = 0
    
    def should_continue(self):
        return (
            self.iteration_count < MAX_ITERATIONS and
            self.total_tokens < MAX_TOKENS_PER_AGENT
        )
```

### 6.4 实现全链路日志与可观测性

**日志记录内容**：
- Agent启动/停止时间
- 任务接收/完成时间
- 工具调用记录
- 错误和异常
- Token消耗统计

**猎脉日志规范**：
```markdown
## 2026-03-29 05:00 后端部署日志

### Agent: 都统（神机营）
### 任务: 部署验证修复

**执行步骤**：
1. 05:00 - 拉取GitHub最新代码 ✓
2. 05:05 - 服务器环境检查 ✓
3. 05:10 - TypeScript编译 ✓
4. 05:15 - 部署后端服务 ✓
5. 05:20 - API端点验证 ✓

**消耗**：Token 125,000，耗时 20分钟
**状态**：成功
```

### 6.5 关键决策点插入人工审核

**审核触发条件**：
- 涉及生产环境部署
- 数据库Schema变更
- 外部API调用
- 用户数据导出

**猎脉审核流程**：
```
都统完成开发
    ↓
提交代码到GitHub
    ↓
监察御史自动审查
    ↓
发现风险 → 暂停 → 通知司命大人确认
    ↓
无风险 → 继续部署
```

---

## 七、猎脉多Agent协作检查清单

### 开发前

- [ ] 明确任务类型，选择合适的协作模式
- [ ] 定义Agent间通信Schema
- [ ] 设置终止条件和资源限制
- [ ] 确认所需Skills已安装

### 开发中

- [ ] 遵循"从2个Agent开始"原则
- [ ] 记录每个Agent的执行日志
- [ ] 在关键决策点暂停等待人工确认
- [ ] 监控Token消耗和执行时间

### 开发后

- [ ] 保存执行日志到`.workbuddy/memory/`
- [ ] 更新MEMORY.md记录经验教训
- [ ] 提交代码到GitHub
- [ ] 向司命大人汇报完成状态

---

## 八、参考资料

1. [多Agent协作架构模式实战](https://dev.to/jiade/duo-agentxie-zuo-jia-gou-mo-shi-shi-zhan-cong-fen-ceng-gui-hua-dao-dong-tai-bian-pai-de-wan-zheng-zhi-nan-467a)
2. [2026 AI Agent生态全景解析](https://www.cnblogs.com/databank/p/19508724)
3. [Google A2A Protocol](https://github.com/google/A2A)
4. [Anthropic MCP](https://modelcontextprotocol.io/)

---

*本文档基于 2026 年 AI Agent 生态最佳实践整理，将持续更新。*

*最后更新：2026-03-29*
