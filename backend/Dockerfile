# 后端 Dockerfile - 多阶段构建，优化镜像大小
FROM node:20-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装所有依赖（包括 devDependencies，构建需要）
RUN npm config set registry https://mirrors.tencent.com/npm/ && \
    npm ci

# 复制源代码
COPY . .

# 构建
RUN npm run build

# 生产镜像
FROM node:20-alpine

WORKDIR /app

# 复制构建产物
COPY --from=builder /app/dist ./dist

# 安装生产依赖
COPY package*.json ./
RUN npm config set registry https://mirrors.tencent.com/npm/ && \
    npm ci --only=production

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "dist/src/main.js"]