#!/bin/bash

# MedFutureAI Deployment Setup Script
# This script prepares the project for deployment on Render

set -e  # Exit on error

echo "🚀 MedFutureAI Deployment Setup"
echo "================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Are you in the project root?${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Installing Frontend dependencies...${NC}"
npm install --legacy-peer-deps

echo -e "${YELLOW}📦 Installing Backend dependencies...${NC}"
cd backend
npm install
cd ..

echo -e "${YELLOW}🔍 Checking environment files...${NC}"
if [ ! -f ".env" ] && [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  No .env file found. Creating from .env.example...${NC}"
    cp .env.example .env.local
    echo -e "${YELLOW}⚠️  Please edit .env.local and add your API keys${NC}"
fi

if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  No backend/.env file found. Creating from backend/.env.example...${NC}"
    cp backend/.env.example backend/.env
    echo -e "${YELLOW}⚠️  Please edit backend/.env and configure your database${NC}"
fi

echo -e "${YELLOW}🏗️  Building Frontend...${NC}"
npm run build

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Configure your environment variables in .env.local and backend/.env"
echo "2. Push to GitHub: git push origin main"
echo "3. Deploy on Render using render.yaml configuration"
echo ""
echo "For local testing:"
echo "  npm run start:all"
echo ""
