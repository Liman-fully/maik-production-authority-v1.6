# 腾讯云 COS 配置指南

**创建时间**: 2026-03-28 09:02  
**创建人**: 右护法（镇抚司主官）

---

## 一、获取密钥步骤

### 1. 登录腾讯云控制台

访问：https://console.cloud.tencent.com/cam/capi

### 2. 创建访问密钥

1. 点击「访问管理」→「访问密钥」
2. 点击「新建密钥」按钮
3. 复制 **SecretId**（如：`AKIDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`）
4. 复制 **SecretKey**（如：`xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`）
5. 点击「下载密钥文件」（备份保存）

---

## 二、配置 .env 文件

### 2.1 文件位置

```
huntlink/
├── backend/
│   ├── .env              ← 在这里配置
│   ├── .env.example
│   └── src/
```

### 2.2 配置内容

```bash
# ==================== 数据库配置 ====================
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=huntlink
DB_PASSWORD=你的数据库密码
DB_DATABASE=huntlink

# ==================== 腾讯云 COS 配置 ====================
COS_SECRET_ID=你的 SecretId
COS_SECRET_KEY=你的 SecretKey
COS_BUCKET=huntlink-1306109984
COS_REGION=ap-guangzhou
COS_DOMAIN=huntlink-1306109984.cos.ap-guangzhou.myqcloud.com

# ==================== Redis 配置 ====================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# ==================== JWT 配置 ====================
JWT_SECRET=HuntLink_Secret_Key_2026_LocalDev_!@#$
JWT_EXPIRATION=7d

# ==================== 服务器配置 ====================
PORT=3000
NODE_ENV=development
```

---

## 三、安全提示

### 3.1 .gitignore 保护

`.env` 文件已在 `.gitignore` 中，**不会被提交到 GitHub**：

```gitignore
# 环境变量
.env
.env.local
.env.production
```

### 3.2 密钥安全

- ✅ 密钥只保存在本地服务器
- ✅ 生产环境使用环境变量
- ✅ 定期轮换密钥（建议每 90 天）
- ✅ 不要通过微信/QQ 传输密钥

### 3.3 密钥泄露应对

如果密钥泄露：
1. 立即登录腾讯云控制台
2. 禁用泄露的密钥
3. 创建新密钥
4. 更新 `.env` 文件

---

## 四、验证配置

### 4.1 测试 COS 连接

创建后运行以下命令测试：

```bash
cd backend
npm install
npx ts-node scripts/test-cos-connection.ts
```

如果输出 `✅ COS 连接成功`，说明配置正确。

### 4.2 测试数据库连接

```bash
npx ts-node scripts/test-db-connection.ts
```

如果输出 `✅ 数据库连接成功`，说明配置正确。

---

## 五、都统部署指南

### 5.1 服务器环境要求

- PostgreSQL 15+
- Node.js 20+
- Redis 7+
- 2G 内存
- 20G 磁盘

### 5.2 部署步骤

1. **拉取代码**
   ```bash
   git clone https://github.com/Liman-fully/huntlink.git
   cd huntlink/backend
   ```

2. **配置环境变量**
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，填入密钥
   ```

3. **安装依赖**
   ```bash
   npm install
   ```

4. **数据库初始化**
   ```bash
   npx ts-node scripts/init-database.ts
   ```

5. **启动服务**
   ```bash
   npm run start:prod
   ```

### 5.3 验证部署

访问：http://服务器 IP:3000/api/health

如果返回 `{"status": "ok"}`，说明部署成功。

---

## 六、常见问题

### Q1: 找不到 .env 文件？

**A**: 在 `backend/` 目录下创建 `.env` 文件（注意前面的点）。

### Q2: 密钥格式不对？

**A**: 
- SecretId 以 `AKID` 开头，共 51 个字符
- SecretKey 共 32 个字符

### Q3: COS 上传失败？

**A**: 
1. 检查密钥是否正确
2. 检查存储桶名称是否正确
3. 检查地域是否正确（ap-guangzhou）
4. 检查防火墙是否开放外网访问

---

**右护法** | 镇抚司主官  
指南创建时间：2026-03-28 09:02
