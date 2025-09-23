#!/bin/bash

# Web3 Remote Jobs Platform - Quick Docker Deployment Script
# This script provides a one-command deployment solution
# Enhanced for China mainland with mirror support

set -e

echo "🚀 Web3 Remote Jobs Platform - Docker Deployment (China Enhanced)"
echo "================================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Function to detect China mainland environment
detect_china_env() {
    echo "🌏 Detecting network environment..."
    
    # Test Docker Hub connectivity
    if ! curl -s --connect-timeout 5 https://registry-1.docker.io/v2/ > /dev/null; then
        echo "⚠️  Detected potential network issues with Docker Hub"
        echo "🇨🇳 Applying China mainland optimizations..."
        return 0  # China environment detected
    else
        echo "✅ Docker Hub connectivity OK"
        return 1  # No China-specific optimizations needed
    fi
}

# Function to configure Docker mirrors for China
configure_docker_mirrors() {
    echo "🔧 Configuring Docker registry mirrors for China mainland..."
    
    # Create Docker daemon config directory
    sudo mkdir -p /etc/docker
    
    # Create or update daemon.json with China mirrors
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
  },
  "storage-driver": "overlay2",
  "max-concurrent-downloads": 10,
  "max-concurrent-uploads": 5
}
EOF

    echo "📝 Docker daemon configuration updated"
    
    # Restart Docker service
    if command -v systemctl &> /dev/null; then
        echo "🔄 Restarting Docker service..."
        sudo systemctl daemon-reload
        sudo systemctl restart docker
        echo "✅ Docker service restarted"
    else
        echo "⚠️  Please restart Docker manually:"
        echo "   - Linux: sudo systemctl restart docker"
        echo "   - macOS/Windows: Restart Docker Desktop"
        read -p "Press Enter after restarting Docker..."
    fi
    
    # Verify mirror configuration
    echo "🔍 Verifying mirror configuration..."
    if docker info | grep -q "Registry Mirrors"; then
        echo "✅ Docker mirrors configured successfully:"
        docker info | grep -A 5 "Registry Mirrors"
    else
        echo "⚠️  Mirror configuration may not be active. Please restart Docker manually."
    fi
}

# Function to test Docker connectivity
test_docker_connectivity() {
    echo "🧪 Testing Docker connectivity..."
    
    # Test with a lightweight image
    if docker pull hello-world:latest &> /dev/null; then
        echo "✅ Docker connectivity test passed"
        docker rmi hello-world:latest &> /dev/null || true
        return 0
    else
        echo "❌ Docker connectivity test failed"
        return 1
    fi
}

# Function to create .env file if it doesn't exist
create_env_file() {
    if [ ! -f .env ]; then
        echo "📝 Creating .env file from template..."
        cp .env.example .env
        echo "✅ .env file created. Please edit it with your configuration."
        echo "⚠️  Important: Update the following variables in .env:"
        echo "   - MYSQL_ROOT_PASSWORD"
        echo "   - MYSQL_PASSWORD"
        echo "   - CRON_SECRET"
        echo "   - API keys (if needed)"
        echo ""
        read -p "Press Enter to continue after updating .env file..."
    fi
}

# Function to initialize the application
init_app() {
    echo "🔧 Initializing application..."
    
    # Create logs directory
    mkdir -p logs
    
    # Stop any existing containers
    echo "🛑 Stopping existing containers..."
    docker-compose down -v 2>/dev/null || true
    
    # Pre-pull images with better error handling
    echo "📦 Pre-pulling Docker images..."
    
    # Pull MySQL image
    echo "  📦 Pulling MySQL image..."
    if ! docker pull mysql:8.0; then
        echo "❌ Failed to pull MySQL image. Checking connectivity..."
        if detect_china_env; then
            echo "🔧 Configuring mirrors and retrying..."
            configure_docker_mirrors
            if ! docker pull mysql:8.0; then
                echo "❌ Still unable to pull images. Please check your network connection."
                echo "📝 You may need to:"
                echo "   1. Check your internet connection"
                echo "   2. Configure a VPN if needed"
                echo "   3. Use manual mirror configuration (see docs/docker-mirror-setup.md)"
                exit 1
            fi
        else
            echo "❌ Unable to pull Docker images. Please check your internet connection."
            exit 1
        fi
    fi
    
    # Pull Node.js image
    echo "  📦 Pulling Node.js image..."
    docker pull node:18-alpine || {
        echo "❌ Failed to pull Node.js image"
        exit 1
    }
    
    # Build and start services
    echo "🏗️  Building and starting services..."
    if ! docker-compose up -d --build; then
        echo "❌ Failed to start services. Checking logs..."
        docker-compose logs
        exit 1
    fi
    
    # Wait for database to be ready with timeout
    echo "⏳ Waiting for database to be ready..."
    local timeout=60
    local counter=0
    
    # Load environment variables
    if [ -f .env ]; then
        export $(grep -v '^#' .env | xargs)
    fi
    
    while ! docker-compose exec -T mysql mysqladmin ping -h localhost -u root -p"${MYSQL_ROOT_PASSWORD:-rootpassword}" --silent 2>/dev/null; do
        if [ $counter -ge $timeout ]; then
            echo "❌ Database startup timeout. Checking logs..."
            docker-compose logs mysql
            exit 1
        fi
        echo "  ⏳ Waiting... ($((counter+1))/${timeout}s)"
        sleep 1
        ((counter++))
    done
    
    echo "✅ Database is ready!"
    
    # Run database migrations
    echo "📊 Running database migrations..."
    if ! docker-compose exec -T web3-jobs-app npx prisma migrate deploy; then
        echo "⚠️  Migration failed, but continuing..."
    fi
    
    # Seed database with sample data (optional)
    read -p "🌱 Do you want to seed the database with sample data? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🌱 Seeding database..."
        docker-compose exec -T web3-jobs-app npm run db:seed || echo "⚠️  Seeding failed, but continuing..."
    fi
}

# Function to show service status
show_status() {
    echo ""
    echo "📊 Service Status:"
    echo "=================="
    docker-compose ps
    
    echo ""
    echo "🌐 Access URLs:"
    echo "==============="
    echo "📱 Web Application:  http://localhost:3000"
    echo "🗄️  phpMyAdmin:      http://localhost:8080 (if tools profile enabled)"
    echo ""
    echo "🔍 Useful Commands:"
    echo "==================="
    echo "📋 View logs:        docker-compose logs -f"
    echo "🛑 Stop services:    docker-compose down"
    echo "🔄 Restart services: docker-compose restart"
    echo "🗄️  Database shell:   docker-compose exec mysql mysql -u web3user -p web3_jobs"
    echo ""
}

# Main deployment process
main() {
    echo "Starting deployment process..."
    
    # Detect and configure for China environment if needed
    if detect_china_env; then
        configure_docker_mirrors
    fi
    
    # Test Docker connectivity
    if ! test_docker_connectivity; then
        echo "🇨🇳 Applying China mainland network optimizations..."
        configure_docker_mirrors
        if ! test_docker_connectivity; then
            echo "❌ Unable to establish Docker connectivity."
            echo "📝 Please check:"
            echo "   1. Internet connection"
            echo "   2. Docker service status"
            echo "   3. Firewall settings"
            echo "   4. Manual mirror configuration (see docs/docker-mirror-setup.md)"
            exit 1
        fi
    fi
    
    # Create environment file
    create_env_file
    
    # Initialize application
    init_app
    
    # Show status
    show_status
    
    echo "✅ Deployment completed successfully!"
    echo "🎉 Your Web3 Remote Jobs Platform is now running!"
    echo "📝 For troubleshooting, see: docs/docker-mirror-setup.md"
}

# Handle script arguments
case "${1:-}" in
    "stop")
        echo "🛑 Stopping all services..."
        docker-compose down
        ;;
    "restart")
        echo "🔄 Restarting services..."
        docker-compose restart
        ;;
    "logs")
        echo "📋 Showing logs..."
        docker-compose logs -f
        ;;
    "reset")
        echo "🔄 Performing full reset..."
        docker-compose down -v
        docker system prune -f
        main
        ;;
    "tools")
        echo "🛠️  Starting with tools (phpMyAdmin)..."
        docker-compose --profile tools up -d
        show_status
        ;;
    "mirrors")
        echo "🇨🇳 Configuring Docker mirrors for China..."
        configure_docker_mirrors
        echo "✅ Mirror configuration completed!"
        echo "📝 You can now run: ./scripts/deploy.sh"
        ;;
    "test")
        echo "🧪 Testing Docker connectivity..."
        if test_docker_connectivity; then
            echo "✅ Docker connectivity is working!"
        else
            echo "❌ Docker connectivity issues detected"
            echo "📝 Try running: ./scripts/deploy.sh mirrors"
        fi
        ;;
    *)
        main
        ;;
esac