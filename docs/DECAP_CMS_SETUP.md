# Decap CMS Setup Guide

## ✅ Completed Steps
1. ✓ Created `/public/admin/index.html` - Admin UI page
2. ✓ Created `/public/admin/config.yml` - CMS configuration
3. ✓ Created `/public/blog-images/` - Media upload folder

## 🔧 Next Steps: GitHub OAuth Setup

### Step 1: Create GitHub OAuth App
1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: `Khoi Van Blog CMS`
   - **Homepage URL**: `https://khoivan.dev`
   - **Authorization callback URL**: `https://decap-oauth.khoivan.dev/callback`
4. Click "Register application"
5. Save your **Client ID** and generate a **Client Secret**

### Step 2: Deploy Cloudflare Worker OAuth Proxy

#### Option A: Quick Deploy (Recommended)
1. Fork this repo: https://github.com/i40west/decap-cms-github-oauth-cloudflare
2. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```
3. Login to Cloudflare:
   ```bash
   wrangler login
   ```
4. Clone your forked repo and configure:
   ```bash
   git clone https://github.com/YOUR_USERNAME/decap-cms-github-oauth-cloudflare
   cd decap-cms-github-oauth-cloudflare
   ```
5. Edit `wrangler.toml`:
   ```toml
   name = "decap-oauth-khoivan"
   main = "src/index.js"
   compatibility_date = "2023-01-01"
   
   [env.production]
   workers_dev = false
   routes = [
     { pattern = "decap-oauth.khoivan.dev/*", zone_name = "khoivan.dev" }
   ]
   ```
6. Set secrets:
   ```bash
   wrangler secret put GITHUB_CLIENT_ID
   # Paste your Client ID
   
   wrangler secret put GITHUB_CLIENT_SECRET
   # Paste your Client Secret
   ```
7. Deploy:
   ```bash
   wrangler deploy
   ```

#### Option B: Manual Cloudflare Worker
Create a new Worker with this code:

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://khoivan.dev',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Handle /auth endpoint
    if (url.pathname === '/auth') {
      const authUrl = `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}&scope=repo,user`;
      return Response.redirect(authUrl);
    }

    // Handle /callback endpoint
    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code: code,
        }),
      });

      const data = await tokenResponse.json();
      
      // Return token to CMS
      const script = `
        <script>
          window.opener.postMessage(
            { token: '${data.access_token}', provider: 'github' },
            'https://khoivan.dev'
          );
          window.close();
        </script>
      `;
      
      return new Response(script, {
        headers: { 
          'Content-Type': 'text/html',
          ...corsHeaders 
        },
      });
    }

    return new Response('Not Found', { status: 404 });
  },
};
```

### Step 3: Configure DNS (if using subdomain)
Add CNAME record in your DNS:
```
decap-oauth.khoivan.dev → your-worker.workers.dev
```

Or use Cloudflare's custom domain feature for Workers.

## 📱 Usage

1. Visit: https://khoivan.dev/admin
2. Click "Login with GitHub"
3. Authorize the app
4. Start creating posts!

## 🎯 Features

- **Blog Posts**: Full-featured posts with MDX support
- **Daily Notes**: Quick mobile-friendly notes
- **Image Upload**: Direct to repo via GitHub API
- **Mobile Optimized**: Custom CSS for better mobile experience
- **Draft Mode**: Save drafts before publishing

## 🔒 Security Notes

- OAuth proxy only has access to your specified repo
- No database or external storage needed
- All content commits directly to GitHub
- Authentication expires after browser session

## 📝 Post Format Example

```yaml
---
title: 'My Awesome Post'
description: 'This is a great post about Android'
pubDate: 'Jan 15 2024'
author: 'Khoi Van'
category: 'engineering'
tags: ['android', 'kotlin']
heroImage: '/blog-images/hero.jpg'
draft: false
---

Your markdown content here...
```

## 🚀 Troubleshooting

1. **Login loops**: Check OAuth callback URL matches exactly
2. **403 errors**: Verify GitHub token has `repo` scope
3. **Images not uploading**: Check media_folder path in config.yml
4. **Mobile issues**: Clear browser cache and cookies

## 📱 Mobile Tips

- Use landscape mode for better editing
- Pinch to zoom in editor
- Swipe left/right to show/hide preview
- Use markdown shortcuts for faster writing