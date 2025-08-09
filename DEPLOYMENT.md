# Deployment Guide for khoivan.dev

## 🚀 Quick Deploy

```bash
# Automatic deployment (via GitHub Actions)
git add .
git commit -m "Complete blog implementation with all features"
git push origin main
```

## ✅ Completed Features

### Phase 1 - Foundation ✓
- Content Collections with Zod schema validation
- Tailwind CSS v4 with Typography plugin
- BaseLayout with SEO components
- TypeScript strict mode
- ESLint + Prettier configuration
- Sitemap & RSS feed generation

### Phase 2 - Core Features ✓
- Blog listing with pagination
- Tags & categories system
- About page with skills showcase
- Portfolio page with projects
- 5 high-quality blog posts

### Phase 3 - Advanced Features ✓
- **Pagefind Search**: Full-text search across all content
- **Giscus Comments**: GitHub-based commenting system
- **Dark Mode**: System-aware with manual toggle
- **View Transitions**: SPA-like navigation
- **Plausible Analytics**: Privacy-friendly analytics

## 📋 Pre-Deployment Checklist

1. **Update Giscus Configuration** (src/components/Comments.astro):
   ```javascript
   data-repo="YOUR_GITHUB_USERNAME/khoivan-blog"
   data-repo-id="YOUR_REPO_ID"
   data-category-id="YOUR_CATEGORY_ID"
   ```
   Get these values from: https://giscus.app

2. **Update Plausible Analytics** (src/components/Analytics.astro):
   ```javascript
   const domain = 'khoivan.dev' // Your actual domain
   ```

3. **Update Site Configuration** (astro.config.mjs):
   ```javascript
   site: 'https://khoivan.dev',
   ```

4. **Test Locally**:
   ```bash
   npm run build
   npm run preview
   ```

## 🔧 Manual Deployment to VPS

If GitHub Actions isn't configured, deploy manually:

```bash
# Build locally
npm run build

# Transfer to VPS (custom SSH port!)
rsync -avz -e "ssh -p 2222" dist/ khoivan@172.104.173.100:/var/www/khoivan.dev/

# Or using scp
scp -P 2222 -r dist/* khoivan@172.104.173.100:/var/www/khoivan.dev/
```

## 🔐 GitHub Actions Setup

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to VPS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy to VPS
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          port: 2222
          source: "dist/*"
          target: "/var/www/khoivan.dev"
          strip_components: 1
```

Add these secrets to GitHub repository:
- `HOST`: 172.104.173.100
- `USERNAME`: khoivan
- `SSH_KEY`: Your VPS SSH private key

## 🌐 Nginx Configuration

Ensure your VPS has this configuration:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name khoivan.dev www.khoivan.dev;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name khoivan.dev www.khoivan.dev;
    
    ssl_certificate /etc/letsencrypt/live/khoivan.dev/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/khoivan.dev/privkey.pem;
    
    root /var/www/khoivan.dev;
    index index.html;
    
    # Enable gzip
    gzip on;
    gzip_types text/css application/javascript application/json;
    
    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Handle Astro's clean URLs
    location / {
        try_files $uri $uri.html $uri/ =404;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

## 📊 Post-Deployment Verification

1. **Check all pages load**:
   - Homepage: https://khoivan.dev
   - Blog: https://khoivan.dev/blog
   - About: https://khoivan.dev/about
   - Portfolio: https://khoivan.dev/portfolio
   - Search: https://khoivan.dev/search

2. **Verify features**:
   - [ ] Dark mode toggle works
   - [ ] Search returns results
   - [ ] Comments load on blog posts
   - [ ] RSS feed accessible at /rss.xml
   - [ ] Sitemap at /sitemap-index.xml

3. **Test performance**:
   - Run PageSpeed Insights
   - Check GTmetrix score
   - Verify Plausible tracking

## 🐛 Troubleshooting

### Pagefind search not working
- Ensure `/pagefind` directory is deployed
- Check browser console for errors

### Dark mode not persisting
- Check localStorage is accessible
- Verify JavaScript is enabled

### Comments not loading
- Verify Giscus configuration
- Check GitHub Discussions is enabled on repo

### Analytics not tracking
- Verify Plausible domain configuration
- Check for ad blockers

## 📈 Next Steps

1. **Content Strategy**:
   - Plan weekly blog posts
   - Create content calendar
   - Set up draft workflow

2. **SEO Optimization**:
   - Submit sitemap to Google Search Console
   - Add structured data
   - Optimize meta descriptions

3. **Performance**:
   - Add image optimization
   - Implement lazy loading
   - Consider CDN for assets

4. **Monitoring**:
   - Set up UptimeRobot
   - Configure error tracking
   - Add performance monitoring

## 🎉 Congratulations!

Your professional blog is ready with:
- Modern Astro v5 architecture
- Full-featured blog platform
- Dark mode support
- Search functionality
- Comment system
- Analytics tracking
- SEO optimization
- Mobile-responsive design

The blog is now at feature parity with (and beyond) mckerlie.com!