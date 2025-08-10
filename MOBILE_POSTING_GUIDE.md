# Mobile Posting Guide

## Cách đăng bài từ điện thoại di động

### Phương pháp 1: GitHub Mobile App (Đơn giản nhất)

1. **Cài đặt GitHub Mobile**
   - iOS: https://apps.apple.com/app/github/id1477376905
   - Android: https://play.google.com/store/apps/details?id=com.github.android

2. **Tạo bài viết mới**
   - Mở repository `khoivan-blog`
   - Navigate đến `src/content/blog/`
   - Tap nút "+" để tạo file mới
   - Đặt tên file: `my-new-post.mdx`

3. **Format bài viết - QUAN TRỌNG**
   
   ⚠️ **LƯU Ý YAML - Tránh lỗi build:**
   - **LUÔN dùng dấu ngoặc kép (") thay vì ngoặc đơn (')**
   - **KHÔNG thêm fields không tồn tại**
   
   ✅ **Format ĐÚNG:**
   ```mdx
   ---
   title: "Tiêu đề bài viết"
   description: "Mô tả ngắn"
   pubDate: 2025-01-10
   author: "Khoi Van"
   category: "engineering"
   tags: ["android", "life"]
   mood: "technical"
   ---

   Nội dung bài viết ở đây...
   ```
   
   📝 **Fields cho phép:**
   - `title` (bắt buộc)
   - `description` (bắt buộc)  
   - `pubDate` (bắt buộc) - Format: YYYY-MM-DD
   - `author` (tùy chọn) - Mặc định "Khoi Van"
   - `category` - "engineering" hoặc "life"
   - `tags` - Array của strings
   - `mood` - "technical", "reflective", hoặc "peaceful"
   
   ❌ **KHÔNG dùng:** featured, language, readingTime, heroImage

4. **Thêm ảnh**
   - Upload ảnh vào `public/blog-images/` 
   - Trong bài viết: `![Mô tả ảnh](/blog-images/my-image.jpg)`

### Phương pháp 2: Git Client Apps

**Working Copy (iOS - Recommended)**
- Full Git client cho iOS
- Hỗ trợ markdown preview
- Sync với GitHub
- Price: Free với giới hạn, Pro ~$20

**Termux + Git (Android)**
```bash
# Install Termux từ F-Droid
pkg install git nano
git clone https://github.com/tjeuba0/khoivan-blog.git
cd khoivan-blog/src/content/blog
nano my-new-post.mdx
git add .
git commit -m "Add new post"
git push
```

### Phương pháp 3: Online Editors

**GitHub.dev (Web-based)**
1. Truy cập: https://github.dev/tjeuba0/khoivan-blog
2. Edit như VS Code trong browser
3. Commit trực tiếp

**Prose.io**
- CMS interface cho GitHub
- WYSIWYG editor
- Image upload support

### Phương pháp 4: Headless CMS Integration

**Netlify CMS Setup** (Cần cấu hình một lần)

1. Thêm vào `public/admin/index.html`:
```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Content Manager</title>
</head>
<body>
  <script src="https://unpkg.com/netlify-cms@^2.0.0/dist/netlify-cms.js"></script>
</body>
</html>
```

2. Config file `public/admin/config.yml`:
```yaml
backend:
  name: git-gateway
  branch: main

media_folder: "public/blog-images"
public_folder: "/blog-images"

collections:
  - name: "blog"
    label: "Blog"
    folder: "src/content/blog"
    create: true
    slug: "{{slug}}"
    extension: "mdx"
    format: "frontmatter"
    fields:
      - {label: "Title", name: "title", widget: "string"}
      - {label: "Description", name: "description", widget: "string"}
      - {label: "Publish Date", name: "pubDate", widget: "date"}
      - {label: "Author", name: "author", widget: "string", default: "Khoi Van"}
      - {label: "Category", name: "category", widget: "select", options: ["engineering", "life"]}
      - {label: "Tags", name: "tags", widget: "list"}
      - {label: "Mood", name: "mood", widget: "string", default: "reflective"}
      - {label: "Body", name: "body", widget: "markdown"}
```

3. Truy cập `/admin` trên site để quản lý content

### Tips cho Mobile Posting

1. **Chuẩn bị template sẵn**
   - Lưu template trong Notes app
   - Copy & paste khi cần

2. **Xử lý ảnh**
   - Resize ảnh trước khi upload (< 1MB)
   - Dùng app như Squoosh để optimize
   - Đặt tên file có ý nghĩa

3. **Markdown shortcuts**
   - Dùng app như Drafts (iOS) hoặc Markor (Android)
   - Có syntax highlighting và preview

4. **Workflow tối ưu**
   - Viết draft trong Notes/Google Docs
   - Format trong markdown editor
   - Push qua GitHub Mobile

### Ví dụ Post với Ảnh

```mdx
---
title: "Cafe Sài Gòn buổi sáng"
description: "Những góc cafe yêu thích để code"
pubDate: 2025-01-10
author: "Khoi Van"
category: "life"
tags: ["vietnam", "coffee", "remote-work"]
mood: "peaceful"
---

Sáng nay ngồi ở Highlands Coffee Nguyễn Huệ, view nhìn xuống phố đi bộ.

![Highlands Coffee View](/blog-images/highlands-view.jpg)

## Setup làm việc mobile

Mình thường mang theo:
- MacBook Air M2
- iPhone để test app
- Tai nghe noise cancelling

![Mobile Setup](/blog-images/mobile-setup.jpg)

Code được khoảng 3-4 tiếng thì pin MacBook còn 60%. Quán có ổ điện nên không lo.

```kotlin
// Test code highlighting trên mobile
fun main() {
    println("Hello from Saigon!")
}
```

Chiều nay sẽ thử The Coffee House bên Quận 3.
```

### Automation với Shortcuts (iOS)

Tạo Shortcut để:
1. Mở template
2. Add current date
3. Copy to clipboard
4. Open GitHub app

Share Shortcut: https://www.icloud.com/shortcuts/[id]

### Kết luận

- **Đơn giản nhất**: GitHub Mobile App
- **Chuyên nghiệp**: Working Copy (iOS) hoặc Termux (Android)
- **Tiện lợi nhất**: Setup Netlify CMS một lần, dùng mãi

Deploy tự động sau khi push, không cần làm gì thêm!