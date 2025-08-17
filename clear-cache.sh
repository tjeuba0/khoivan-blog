#!/bin/bash

# Cache clear script for khoivan.dev
# Use this when you need to force clear cache after deployment

echo "🧹 Clearing cache for khoivan.dev"
echo "================================"

# Method 1: Clear server-side cache
echo "1. Clearing server cache..."
ssh -p 2222 khoivan@172.104.173.100 << 'EOF'
  # Reload Nginx to clear cache
  sudo nginx -s reload
  
  # Optional: Clear any file-based cache if exists
  # sudo rm -rf /var/cache/nginx/*
  
  echo "✅ Server cache cleared"
EOF

# Method 2: Test with curl (bypass cache)
echo ""
echo "2. Testing website (bypassing cache)..."
curl -H "Cache-Control: no-cache" -I https://khoivan.dev | grep -E "HTTP|Last-Modified"

echo ""
echo "✅ Cache clear complete!"
echo ""
echo "Tips to verify:"
echo "1. Open browser in Incognito/Private mode"
echo "2. Or hard refresh: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)"
echo "3. Check: https://khoivan.dev/blog/"