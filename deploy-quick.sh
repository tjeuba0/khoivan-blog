#!/bin/bash

# Quick deploy script - Bypass GitHub Actions for faster testing
# Usage: ./deploy-quick.sh

set -e  # Exit on error

echo "🚀 Quick Deploy to khoivan.dev"
echo "=============================="

# Step 1: Build
echo "📦 Building site..."
npm run build

if [ ! -d "dist" ]; then
  echo "❌ Build failed - dist folder not found"
  exit 1
fi

# Step 2: Deploy
echo "🔄 Deploying to VPS..."
rsync -avz --delete \
  -e "ssh -p 2222" \
  dist/ \
  khoivan@172.104.173.100:/var/www/khoivan.dev/

# Step 3: Clear cache
echo "🧹 Clearing cache..."
ssh -p 2222 khoivan@172.104.173.100 << 'EOF'
  sudo nginx -t && sudo nginx -s reload
  echo "Cache cleared at $(date)"
EOF

# Step 4: Verify
echo "✅ Verifying deployment..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://khoivan.dev)

if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ Deployment successful! Site is live."
  echo "🌐 Visit: https://khoivan.dev"
  echo ""
  echo "💡 To see changes immediately:"
  echo "   - Use Incognito/Private mode"
  echo "   - Or hard refresh: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)"
else
  echo "❌ Site returned HTTP $HTTP_STATUS - check server logs"
fi