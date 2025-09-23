#!/bin/bash

# Quick script to configure Docker mirrors for China mainland users
# Run this script if you're experiencing Docker Hub connectivity issues

set -e

echo "🐳 Docker Mirror Configuration for China Mainland"
echo "=================================================="

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 macOS detected"
    echo "Please configure Docker Desktop manually:"
    echo "1. Open Docker Desktop"
    echo "2. Go to Settings → Docker Engine"
    echo "3. Add the following to the JSON configuration:"
    cat << 'EOF'

{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://registry.docker-cn.com",
    "https://mirror.ccs.tencentyun.com"
  ]
}

EOF
    echo "4. Click 'Apply & Restart'"
    
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🐧 Linux detected - Auto-configuring mirrors..."
    
    # Create Docker daemon config directory
    sudo mkdir -p /etc/docker
    
    # Backup existing config if it exists
    if [ -f /etc/docker/daemon.json ]; then
        sudo cp /etc/docker/daemon.json /etc/docker/daemon.json.backup.$(date +%Y%m%d-%H%M%S)
    fi
    
    # Create new daemon.json with mirrors
    sudo tee /etc/docker/daemon.json > /dev/null <<EOF
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
    
    echo "✅ Docker daemon configuration updated"
    
    # Restart Docker service
    sudo systemctl daemon-reload
    sudo systemctl restart docker
    
    echo "✅ Docker service restarted"
    
else
    echo "❓ Unsupported OS: $OSTYPE"
    echo "Please configure Docker mirrors manually"
    exit 1
fi

# Test connectivity
echo ""
echo "🧪 Testing Docker connectivity..."
if docker pull hello-world:latest &> /dev/null; then
    echo "✅ Docker connectivity test passed!"
    docker rmi hello-world:latest &> /dev/null || true
else
    echo "❌ Docker connectivity test failed"
    echo "Please check your network connection or try a VPN"
fi

echo ""
echo "🎉 Configuration complete!"
echo "You can now run: ./scripts/deploy.sh"