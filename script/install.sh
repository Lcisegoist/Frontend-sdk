#!/bin/bash

# 安装根依赖
echo "Installing root dependencies..."
pnpm install

# 安装 desktop
echo "Installing desktop dependencies..."
cd desktop && pnpm install

# 安装 service
echo "Installing service dependencies..."
cd ../service && pnpm install

echo "All done!"