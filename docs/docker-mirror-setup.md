# Docker 中国大陆镜像配置指南

## 问题描述
在中国大陆环境下，直接访问 Docker Hub (registry-1.docker.io) 可能会遇到网络连接问题。

## 解决方案

### 方法一：配置 Docker 守护进程镜像源

#### 1. 创建或编辑 Docker 配置文件

**Linux/macOS:**
```bash
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://registry.docker-cn.com",
    "https://mirror.ccs.tencentyun.com"
  ],
  "dns": ["8.8.8.8", "8.8.4.4"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m",
    "max-file": "3"
  }
}
EOF
```

**Windows (Docker Desktop):**
1. 打开 Docker Desktop
2. 进入 Settings -> Docker Engine
3. 在 JSON 配置中添加：
```json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://registry.docker-cn.com",
    "https://mirror.ccs.tencentyun.com"
  ]
}
```

#### 2. 重启 Docker 服务

**Linux:**
```bash
sudo systemctl daemon-reload
sudo systemctl restart docker
```

**macOS/Windows:**
重启 Docker Desktop

#### 3. 验证镜像源配置
```bash
docker info | grep -A 10 "Registry Mirrors"
```

### 方法二：使用阿里云容器镜像服务

#### 1. 获取专属加速器地址
1. 登录 [阿里云容器镜像服务](https://cr.console.aliyun.com/)
2. 左侧导航栏选择 "镜像工具" -> "镜像加速器"
3. 复制专属加速器地址

#### 2. 配置加速器
```bash
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://your-id.mirror.aliyuncs.com"]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```

### 方法三：使用腾讯云镜像源

```bash
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://mirror.ccs.tencentyun.com",
    "https://ccr.ccs.tencentyun.com"
  ]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```

## 国内主要镜像源列表

| 提供商 | 镜像地址 | 说明 |
|--------|----------|------|
| 阿里云 | `https://your-id.mirror.aliyuncs.com` | 需要注册获取专属地址 |
| 腾讯云 | `https://mirror.ccs.tencentyun.com` | 公共镜像源 |
| 网易 | `https://hub-mirror.c.163.com` | 网易云镜像源 |
| 中科大 | `https://docker.mirrors.ustc.edu.cn` | 中科大镜像站 |
| Docker 中国 | `https://registry.docker-cn.com` | Docker 官方中国镜像 |
| 华为云 | `https://05f073ad3c0010ea0f4bc00b7105ec20.mirror.swr.myhuaweicloud.com` | 华为云镜像源 |

## 测试镜像源连通性

```bash
# 测试镜像拉取
docker pull hello-world

# 测试特定镜像
docker pull mysql:8.0
docker pull node:18-alpine

# 查看镜像拉取日志
docker pull mysql:8.0 --progress=plain
```

## 如果仍然有问题

### 1. 检查网络连接
```bash
# 测试域名解析
nslookup docker.mirrors.ustc.edu.cn
nslookup hub-mirror.c.163.com

# 测试 HTTPS 连接
curl -I https://docker.mirrors.ustc.edu.cn
curl -I https://hub-mirror.c.163.com
```

### 2. 使用代理（如果有）
```bash
# 在 /etc/docker/daemon.json 中添加代理配置
{
  "registry-mirrors": [...],
  "proxies": {
    "default": {
      "httpProxy": "http://proxy.example.com:8080",
      "httpsProxy": "http://proxy.example.com:8080"
    }
  }
}
```

### 3. 清理 Docker 缓存
```bash
docker system prune -f
docker builder prune -f
```

配置完成后，重新运行部署脚本：
```bash
./scripts/deploy.sh
```