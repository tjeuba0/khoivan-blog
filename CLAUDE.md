# CLAUDE.md - Khoivan.dev Blog Project

## 🚀 Quick Start

```bash
# Local development
npm install
npm run dev  # http://localhost:4321

# Deploy (auto via push to main)
git push origin main
```

## 📋 Project Overview

- **Domain**: https://khoivan.dev
- **Stack**: Astro + GitHub Actions + Linode VPS
- **Status**: Production Ready ✅
- **VPS**: 172.104.173.100 (Ubuntu 22.04)

## 🔐 Critical Access Info

```bash
# SSH to VPS (custom port!)
ssh -p 2222 khoivan@172.104.173.100

# Required GitHub Secrets:
- SSH_KEY: VPS SSH private key
- HOST: 172.104.173.100
- USERNAME: khoivan
```

## 🏗️ Infrastructure

- **Web Server**: Nginx 1.24.0
- **SSL**: Let's Encrypt (auto-renew)
- **Firewall**: UFW (ports: 2222, 80, 443)
- **Security**: Fail2ban, key-only SSH
- **CI/CD**: GitHub Actions (auto-deploy on push to main)

## 📁 Project Structure

```
khoivan-blog/
├── .github/workflows/deploy.yml  # CI/CD config
├── src/
│   ├── content/blog/            # Blog posts (Markdown)
│   ├── components/              # Reusable components
│   ├── layouts/                 # Page layouts
│   └── pages/                   # Routes
└── dist/                        # Build output (deployed)
```

## 📝 Content Management

```markdown
# Create new blog post

src/content/blog/new-post.md

---

title: 'Post Title'
description: 'Description'
pubDate: 'Jan 15 2024'
heroImage: '/blog-placeholder.jpg'

---

Content in Markdown...
```

## 🔧 Key Commands

```bash
# Development
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview build

# Server Maintenance
sudo systemctl status nginx
sudo certbot certificates  # Check SSL
sudo ufw status           # Firewall status
df -h                     # Disk usage
```

## ⚠️ Important Notes

- **SSH Port**: 2222 (not default 22!)
- **Deploy**: Automatic on push to main
- **SSL**: Auto-renews via certbot
- **Backup**: Manual (needs automation)
- **Monitoring**: Not configured (needs UptimeRobot)

## ✅ Completed Features

### Core Features
- ✅ 5 high-quality blog posts
- ✅ Full SEO setup with meta tags
- ✅ Sitemap & RSS feed
- ✅ Giscus comment system
- ✅ Plausible analytics
- ✅ Pagefind search
- ✅ Dark mode toggle
- ✅ View Transitions API
- ✅ Tags & categories
- ✅ Portfolio showcase
- ✅ About page

### Technical Stack
- ✅ Astro v5.12.9
- ✅ Tailwind CSS v4
- ✅ TypeScript strict mode
- ✅ ESLint + Prettier
- ✅ Content Collections

## 🎯 Remaining TODOs

1. ⚠️ Set up monitoring (UptimeRobot)
2. ⚠️ Configure automated backups
3. ⚠️ Update Giscus repo settings
4. ⚠️ Verify Plausible domain

## 🚫 DO NOT

- Change SSH port without updating GitHub Actions
- Delete /swapfile (needed for 1GB RAM)
- Disable firewall
- Share SSH private keys

## ✅ ALWAYS

- Test locally before pushing
- Keep backups before major changes
- Monitor disk space
- Check GitHub Actions after push
