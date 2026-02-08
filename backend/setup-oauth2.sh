#!/bin/bash
# OAuth2 Setup & Testing Script
# Run this to verify Sentinel Hub OAuth2 integration

set -e

echo "╔════════════════════════════════════════════════════╗"
echo "║  Sentinel Hub OAuth2 Setup & Testing Script       ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in backend directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}✗ Error: package.json not found${NC}"
    echo "Please run this script from the backend/ directory"
    echo ""
    echo "Usage:"
    echo "  cd backend"
    echo "  bash setup-oauth2.sh"
    exit 1
fi

echo -e "${YELLOW}Step 1: Checking Node.js${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js found: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js not found. Please install Node.js v18+${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}Step 2: Checking .env file${NC}"
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ .env file exists${NC}"
    if grep -q "SENTINEL_HUB_CLIENT_ID" .env; then
        echo -e "${GREEN}✓ SENTINEL_HUB_CLIENT_ID configured${NC}"
    else
        echo -e "${YELLOW}⚠ SENTINEL_HUB_CLIENT_ID not configured${NC}"
        echo "  Add this to your .env file:"
        echo "  SENTINEL_HUB_CLIENT_ID=93c64bb2-9165-4e49-8db1-a01652bf26b5"
        echo "  SENTINEL_HUB_CLIENT_SECRET=S1J56EhAW7FCADIRaZ6nLFUvKT8D3VZv"
        echo "  ENABLE_REAL_SATELLITE_API=true"
    fi
else
    echo -e "${YELLOW}⚠ .env file not found. Creating...${NC}"
    cat > .env << EOF
SENTINEL_HUB_CLIENT_ID=93c64bb2-9165-4e49-8db1-a01652bf26b5
SENTINEL_HUB_CLIENT_SECRET=S1J56EhAW7FCADIRaZ6nLFUvKT8D3VZv
ENABLE_REAL_SATELLITE_API=true
SENTINEL_HUB_REGION=eu
EOF
    echo -e "${GREEN}✓ .env file created${NC}"
fi
echo ""

echo -e "${YELLOW}Step 3: Checking Node modules${NC}"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓ node_modules found${NC}"
else
    echo -e "${YELLOW}⚠ Installing npm packages...${NC}"
    npm install
    echo -e "${GREEN}✓ npm packages installed${NC}"
fi
echo ""

echo -e "${YELLOW}Step 4: Checking OAuth2 service file${NC}"
if [ -f "src/services/sentinelHubOAuth.js" ]; then
    echo -e "${GREEN}✓ sentinelHubOAuth.js found${NC}"
else
    echo -e "${RED}✗ sentinelHubOAuth.js not found${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}Step 5: Checking integration test${NC}"
if [ -f "src/test-oauth-integration.js" ]; then
    echo -e "${GREEN}✓ test-oauth-integration.js found${NC}"
else
    echo -e "${RED}✗ test-oauth-integration.js not found${NC}"
    exit 1
fi
echo ""

echo "╔════════════════════════════════════════════════════╗"
echo "║             OAuth2 Setup Complete!                 ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✓ All checks passed!${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Run the integration test to verify OAuth2 setup:"
echo -e "   ${YELLOW}node src/test-oauth-integration.js${NC}"
echo ""
echo "2. Start the backend server:"
echo -e "   ${YELLOW}npm start${NC}"
echo ""
echo "3. Test an API endpoint:"
echo -e "   ${YELLOW}curl -X POST http://localhost:5000/api/analyze \\${NC}"
echo -e "   ${YELLOW}  -H 'Content-Type: application/json' \\${NC}"
echo -e "   ${YELLOW}  -d '{\"latitude\": 40.7128, \"longitude\": -74.0060, \"name\": \"NYC\"}'${NC}"
echo ""
echo "Documentation:"
echo "  - Quick Reference: ../OAUTH_QUICK_REFERENCE.md"
echo "  - Full Guide: ../SENTINEL_HUB_OAUTH_INTEGRATION.md"
echo "  - Flow Diagrams: ../OAUTH_FLOW_DIAGRAMS.md"
echo "  - Deployment: ../DEPLOYMENT_CHECKLIST.md"
echo ""
