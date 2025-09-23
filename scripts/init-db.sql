-- Web3 Remote Jobs Platform - MySQL Database Initialization Script
-- This script is automatically executed when the MySQL container starts for the first time

-- Ensure UTF8MB4 character set for emoji and international character support
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Create database if not exists (should already be created by docker-compose)
CREATE DATABASE IF NOT EXISTS web3_jobs CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE web3_jobs;

-- Grant permissions to the application user
GRANT ALL PRIVILEGES ON web3_jobs.* TO 'web3user'@'%';

-- Optional: Create some initial configuration or lookup tables
-- (Prisma will handle the main schema creation through migrations)

-- Create a simple health check table
CREATE TABLE IF NOT EXISTS health_check (
    id INT AUTO_INCREMENT PRIMARY KEY,
    status VARCHAR(20) DEFAULT 'healthy',
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert initial health check record
INSERT INTO health_check (status) VALUES ('initialized') ON DUPLICATE KEY UPDATE status = 'initialized';

-- Flush privileges to ensure changes take effect
FLUSH PRIVILEGES;

-- Log the initialization
SELECT 'Web3 Jobs Database initialized successfully!' AS message;