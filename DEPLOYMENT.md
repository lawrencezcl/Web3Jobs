# 🚀 Web3 Remote Jobs Platform - 部署指南

> **全面的生产部署文档，支持Docker一键部署和传统部署方式**

## 📋 目录

- [🐳 Docker 一键部署 (推荐)](#-docker-一键部署-推荐)
- [📦 传统部署方式](#-传统部署方式)
- [☁️ 云平台部署](#️-云平台部署)
- [🛠️ 配置说明](#️-配置说明)
- [🔍 故障排除](#-故障排除)

---

## 🐳 Docker 一键部署 (推荐)

### 📋 前置要求

- ✅ Docker 20.10+ 和 Docker Compose 2.0+
- ✅ 至少 2GB 可用内存
- ✅ 至少 5GB 可用磁盘空间

### 🇨🇳 中国大陆用户特别说明

如果你在中国大陆，可能会遇到 Docker Hub 连接问题。我们提供了自动检测和配置功能：

#### 方法一：自动配置（推荐）
```bash
# 部署脚本会自动检测网络环境并配置镜像源
./scripts/deploy.sh
```

#### 方法二：手动配置镜像源
```bash
# 单独配置镜像源
./scripts/configure-mirrors.sh

# 或者手动配置
./scripts/deploy.sh mirrors
```

#### 方法三：使用国内镜像（最快）
```bash
# 直接使用配置好的compose文件
cp docker-compose.china.yml docker-compose.yml
docker-compose up -d
```

### 🚀 快速开始

#### 1. 克隆项目
```bash
git clone <your-repo-url>
cd web3-remote-jobs-vercel
```

#### 2. 配置环境变量
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑配置文件
nano .env  # 或使用你喜欢的编辑器
```

**必须配置的关键变量：**
```bash
# 数据库安全配置
MYSQL_ROOT_PASSWORD=your-strong-root-password
MYSQL_PASSWORD=your-strong-user-password

# 应用安全配置
CRON_SECRET=your-super-secret-cron-key

# 生产环境URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

#### 3. 一键部署
```bash
# 使用部署脚本（推荐）
./scripts/deploy.sh

# 或手动执行
docker-compose up -d --build
```

#### 4. 验证部署
```bash
# 检查服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 访问应用
open http://localhost:3000
```

### 🛠️ Docker 管理命令

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f [service-name]

# 完全重置（删除所有数据）
docker-compose down -v

# 启动包含管理工具的服务
docker-compose --profile tools up -d

# 进入应用容器
docker-compose exec web3-jobs-app bash

# 进入数据库
docker-compose exec mysql mysql -u web3user -p web3_jobs
```

### 📊 数据库管理

```bash
# 运行数据库迁移
docker-compose exec web3-jobs-app npx prisma migrate deploy

# 填充示例数据
docker-compose exec web3-jobs-app npm run db:seed

# 重置数据库
docker-compose exec web3-jobs-app npx prisma migrate reset

# 访问 phpMyAdmin (需要启用 tools profile)
open http://localhost:8080
```

### 🔄 生产环境配置

#### docker-compose.prod.yml
```yaml
# 创建生产环境专用的compose文件
version: '3.8'
services:
  web3-jobs-app:
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_APP_URL=https://yourdomain.com
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
  
  mysql:
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
    volumes:
      - mysql_prod_data:/var/lib/mysql
```

```bash
# 使用生产配置启动
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## 📦 传统部署方式

### 🔴 本地MySQL部署

#### 1. 安装MySQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

**macOS:**
```bash
brew install mysql
brew services start mysql
```

**Windows:**
下载 MySQL Installer 从 [MySQL 官网](https://dev.mysql.com/downloads/installer/)

#### 2. 创建数据库
```sql
-- 登录MySQL
mysql -u root -p

-- 创建数据库
CREATE DATABASE web3_jobs CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户
CREATE USER 'web3user'@'localhost' IDENTIFIED BY 'your-password';
GRANT ALL PRIVILEGES ON web3_jobs.* TO 'web3user'@'localhost';
FLUSH PRIVILEGES;

-- 退出
EXIT;
```

#### 3. 配置环境变量
```bash
# .env
DATABASE_URL="mysql://web3user:your-password@localhost:3306/web3_jobs"
NODE_ENV=production
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=your-secret-key
```

#### 4. 安装和部署
```bash
# 安装依赖
npm install --legacy-peer-deps

# 生成Prisma客户端
npx prisma generate

# 运行数据库迁移
npx prisma migrate deploy

# 填充示例数据（可选）
node scripts/seed.js

# 构建应用
npm run build

# 启动应用
npm start
```

### 1.1 创建Neon数据库

1. 访问 [Neon Console](https://console.neon.tech/)
2. 使用GitHub或Google账号注册/登录
3. 点击 "Create Project"
4. 选择以下配置：
   - **Region**: 选择离你最近的区域 (建议: US East 或 EU Central)
   - **PostgreSQL Version**: 15 (推荐)
   - **Project Name**: `web3-remote-jobs`

### 1.2 获取数据库连接字符串

1. 项目创建后，进入 Dashboard
2. 点击 "Connection Details"
3. 复制 **Connection String**，格式类似：
   ```
   postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

### 1.3 运行数据库迁移

```bash
# 克隆项目
git clone <your-repo-url>
cd web3-remote-jobs-vercel

# 安装依赖
npm install --legacy-peer-deps

# 设置环境变量
cp .env.example .env
# 编辑 .env 文件，添加 DATABASE_URL

# 运行迁移
npx prisma migrate deploy
npx prisma generate
```

## ☁️ 云平台部署

### 🌐 Vercel + Neon (PostgreSQL)

#### 1. 创建 Neon 数据库

1. 访问 [Neon Console](https://console.neon.tech/)
2. 使用GitHub或Google账号注册/登录
3. 点击 "Create Project"
4. 选择以下配置：
   - **Region**: 选择离你最近的区域 (建议: US East 或 EU Central)
   - **PostgreSQL Version**: 15 (推荐)
   - **Project Name**: `web3-remote-jobs`

#### 2. 获取数据库连接字符串

1. 项目创建后，进入 Dashboard
2. 点击 "Connection Details"
3. 复制 **Connection String**，格式类似：
   ```
   postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

**注意**: 如果要使用MySQL，请修改连接字符串格式并更新 `prisma/schema.prisma` 中的 provider 为 `mysql`

#### 3. Vercel 部署配置

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 导入 GitHub 仓库
3. 配置环境变量：

| 变量名 | 值 | 必需 | 说明 |
|--------|-----|------|------|
| `DATABASE_URL` | `mysql://...` 或 `postgresql://...` | ✅ | 数据库连接字符串 |
| `CRON_SECRET` | `your-strong-random-token` | ✅ | 定时任务保护令牌 |
| `TELEGRAM_BOT_TOKEN` | `1234567890:ABC...` | ❌ | Telegram机器人令牌 |
| `DISCORD_WEBHOOK_URL` | `https://discord.com/api/webhooks/...` | ❌ | Discord Webhook URL |

#### 4. 部署和验证

```bash
# 部署后运行迁移
vercel env pull .env.local
npx prisma migrate deploy
npx prisma generate

# 测试 API 端点
curl "https://your-domain.vercel.app/api/jobs?limit=5"
curl "https://your-domain.vercel.app/api/health"
```

### 🔷 Railway + MySQL

1. 访问 [Railway](https://railway.app)
2. 创建新项目，选择 "Deploy from GitHub repo"
3. 添加 MySQL 数据库服务
4. 配置环境变量（同上表）
5. 部署完成后访问提供的 URL

### 🟠 DigitalOcean App Platform

1. 创建新应用，连接 GitHub 仓库
2. 添加 MySQL 数据库组件
3. 配置环境变量
4. 设置构建命令：`npm run build`
5. 设置运行命令：`npm start`

---

## 🛠️ 配置说明

### 🔐 API 密钥获取指南

#### Telegram Bot Token
1. 在 Telegram 中搜索 `@BotFather`
2. 发送 `/newbot` 创建机器人
3. 获取 Token：`1234567890:ABCDEF...`
4. 设置 Webhook：
```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -d "url=https://yourdomain.com/api/telegram/webhook"
```

#### Discord Webhook
1. 进入 Discord 服务器设置
2. "Integrations" → "Webhooks" → "Create Webhook"
3. 复制 Webhook URL
4. 测试连接：
```bash
curl -X POST "<WEBHOOK_URL>" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test message from Web3 Jobs Bot!"}'
```

#### 外部 API 密钥（可选）
- **Lever API**: 联系 Lever 获取 API 访问权限
- **Greenhouse API**: 在 Greenhouse 开发者门户申请

### 📊 数据库优化配置

#### MySQL 优化 (my.cnf)
```ini
[mysqld]
# 性能优化
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2

# 字符集配置
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# 连接配置
max_connections = 200
wait_timeout = 28800
```

### 🔄 定时任务配置

#### Vercel Cron
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "0 */3 * * *"
    }
  ]
}
```

#### 系统 Cron (Linux)
```bash
# 编辑 crontab
crontab -e

# 添加定时任务（每3小时执行一次）
0 */3 * * * curl -X POST "http://localhost:3000/api/cron?secret=YOUR_SECRET"
```

---

## 🔍 故障排除

### 常见问题解决

#### 1. 数据库连接失败
```bash
# 检查连接字符串
echo $DATABASE_URL

# 测试 MySQL 连接
mysql -h host -u user -p database

# 测试 PostgreSQL 连接
psql $DATABASE_URL

# 检查 Prisma 状态
npx prisma migrate status
```

#### 2. Docker 容器问题
```bash
# 查看容器状态
docker-compose ps

# 查看特定服务日志
docker-compose logs mysql
docker-compose logs web3-jobs-app

# 重启服务
docker-compose restart mysql

# 检查网络连接
docker-compose exec web3-jobs-app ping mysql
```

#### 3. API 响应慢
```bash
# 检查数据库索引
npx prisma studio

# 监控查询性能
EXPLAIN SELECT * FROM Job WHERE country = 'USA' LIMIT 10;

# 添加缺失索引
ALTER TABLE Job ADD INDEX idx_country_remote (country, remote);
```

#### 4. 内存使用过高
```bash
# Docker 内存限制
docker-compose exec web3-jobs-app free -h

# Node.js 内存使用
docker-compose exec web3-jobs-app node -e "console.log(process.memoryUsage())"

# 优化配置
# 在 docker-compose.yml 中添加内存限制
deploy:
  resources:
    limits:
      memory: 512M
```

### 🚨 紧急恢复步骤

#### 数据库恢复
```bash
# 创建备份
mysqldump -u user -p web3_jobs > backup.sql

# 恢复数据库
mysql -u user -p web3_jobs < backup.sql

# Docker 环境恢复
docker-compose exec mysql mysqldump -u web3user -p web3_jobs > backup.sql
```

#### 应用恢复
```bash
# 快速重启
docker-compose down && docker-compose up -d

# 完全重建
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

---

## 📈 性能监控

### 健康检查端点
```bash
# 应用健康检查
curl http://localhost:3000/api/health

# 数据库连接检查
curl http://localhost:3000/api/health?check=db

# 系统资源检查
docker stats
```

### 日志监控
```bash
# 实时日志查看
docker-compose logs -f --tail=100

# 按服务过滤
docker-compose logs -f web3-jobs-app

# 日志轮转配置
# 在 docker-compose.yml 中添加
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

---

## 🎯 生产环境清单

### 部署前检查
- [ ] 环境变量已配置
- [ ] 数据库连接测试通过
- [ ] SSL 证书已配置
- [ ] 域名 DNS 已解析
- [ ] 防火墙规则已设置
- [ ] 备份策略已制定

### 部署后验证
- [ ] 应用正常访问
- [ ] API 端点响应正常
- [ ] 数据库迁移成功
- [ ] 定时任务正常执行
- [ ] 通知功能测试通过
- [ ] 监控和日志正常

### 维护计划
- [ ] 定期数据库备份
- [ ] 日志清理计划
- [ ] 系统更新计划
- [ ] 性能监控设置
- [ ] 安全审计计划

---

## 🎉 部署完成

恭喜！你的 Web3 Remote Jobs Platform 现在已经成功部署并运行了！

**访问地址：**
- 🌐 主应用：http://localhost:3000 (本地) 或 https://yourdomain.com
- 🗄️ phpMyAdmin：http://localhost:8080 (Docker with tools profile)
- 📊 健康检查：/api/health

**下一步建议：**
1. 配置 SSL 证书（生产环境）
2. 设置监控和告警
3. 配置 CDN 加速
4. 优化 SEO 设置
5. 添加用户分析

享受你的全新 Web3 工作平台吧！🚀