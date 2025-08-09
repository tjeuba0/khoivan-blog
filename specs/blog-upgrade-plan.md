# KHOIVAN.DEV BLOG UPGRADE SPECIFICATION

## Overview

Transform khoivan.dev from a basic Astro starter into a professional, scalable blog platform comparable to mckerlie.com and other modern developer blogs.

## Current State Analysis

### Strengths ✅

- Solid infrastructure (VPS, Nginx, SSL)
- Working CI/CD pipeline
- Clean start with no technical debt
- Good domain name

### Critical Gaps 🚨

1. **No Content Collections** - Using raw folder structure
2. **Zero SEO** - Invisible to search engines
3. **No Design System** - Inconsistent UI
4. **Minimal Content** - Only 1 blog post
5. **No User Engagement** - No comments, analytics, search

## Implementation Phases

### PHASE 1: Foundation (Week 1)

**Goal**: Establish solid technical foundation

#### 1.1 Content Collections Setup

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content'

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    category: z.enum(['tutorial', 'article', 'opinion']),
    tags: z.array(z.string()),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    readingTime: z.string().optional(),
  }),
})

export const collections = { blog }
```

#### 1.2 Tailwind CSS Integration

```bash
npx astro add tailwind
npm install @tailwindcss/typography
```

```javascript
// tailwind.config.mjs
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#4F39FA',
        secondary: '#DA62C4',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            'code::before': { content: '""' },
            'code::after': { content: '""' },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
```

#### 1.3 SEO Component

```astro
// src/components/SEO.astro

export interface Props { title: string; description: string; image?: string; canonicalURL?: URL; type?:
'website' | 'article'; } const { title, description, image = '/og-default.jpg', canonicalURL = new URL(Astro.url.pathname,
Astro.site), type = 'website' } = Astro.props;

<!-- Primary Meta Tags -->
<title>{title}</title>
<meta name="title" content={title} />
<meta name="description" content={description} />
<link rel="canonical" href={canonicalURL} />

<!-- Open Graph / Facebook -->
<meta property="og:type" content={type} />
<meta property="og:url" content={canonicalURL} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:image" content={new URL(image, Astro.url)} />

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content={canonicalURL} />
<meta property="twitter:title" content={title} />
<meta property="twitter:description" content={description} />
<meta property="twitter:image" content={new URL(image, Astro.url)} />
```

#### 1.4 Developer Tooling

```json
// .eslintrc.json
{
  "extends": ["plugin:astro/recommended"],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "overrides": [
    {
      "files": ["*.astro"],
      "parser": "astro-eslint-parser",
      "parserOptions": {
        "parser": "@typescript-eslint/parser",
        "extraFileExtensions": [".astro"]
      }
    }
  ]
}
```

### PHASE 2: Core Blog Features (Week 2)

**Goal**: Implement essential blog functionality

#### 2.1 Blog Listing Page

```astro
// src/pages/blog/index.astro

import { getCollection } from 'astro:content'; import BaseLayout from '@layouts/BaseLayout.astro'; import
BlogCard from '@components/BlogCard.astro'; const posts = await getCollection('blog', ({ data }) => {
return data.draft !== true; }); posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

<BaseLayout title="Blog - Khoi Van" description="Technical articles about Android development">
  <div class="container mx-auto px-4 py-8">
    <h1 class="mb-8 text-4xl font-bold">All Posts</h1>
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => <BlogCard post={post} />)}
    </div>
  </div>
</BaseLayout>
```

#### 2.2 Dynamic Routes for Posts

```astro
// src/pages/blog/[...slug].astro

import { getCollection } from 'astro:content'; import BlogLayout from '@layouts/BlogLayout.astro'; export
async function getStaticPaths() { const posts = await getCollection('blog'); return posts.map(post =>
({ params: { slug: post.slug }, props: { post } })); } const { post } = Astro.props; const { Content
} = await post.render();

<BlogLayout {...post.data}>
  <Content />
</BlogLayout>
```

#### 2.3 RSS Feed

```javascript
// src/pages/rss.xml.js
import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'

export async function GET(context) {
  const posts = await getCollection('blog')
  return rss({
    title: 'Khoi Van - Android Developer',
    description: 'Technical articles about Android development',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.slug}/`,
    })),
    customData: `<language>vi-vn</language>`,
  })
}
```

### PHASE 3: User Engagement (Week 3)

**Goal**: Add interactive features

#### 3.1 Search Integration

```bash
npm install pagefind
```

Add to build script:

```json
"build": "astro build && pagefind --site dist"
```

#### 3.2 Comments System

```astro
// src/components/Comments.astro

<script
  src="https://giscus.app/client.js"
  data-repo="[USERNAME]/khoivan-blog"
  data-repo-id="[REPO_ID]"
  data-category="Blog Comments"
  data-category-id="[CATEGORY_ID]"
  data-mapping="pathname"
  data-strict="0"
  data-reactions-enabled="1"
  data-emit-metadata="0"
  data-input-position="top"
  data-theme="preferred_color_scheme"
  data-lang="en"
  data-loading="lazy"
  crossorigin="anonymous"
  async
></script>
```

#### 3.3 Dark Mode

```javascript
// src/components/ThemeToggle.astro
<button id="theme-toggle" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
  <svg class="w-6 h-6 dark:hidden" fill="currentColor" viewBox="0 0 20 20">
    <!-- Moon icon -->
  </svg>
  <svg class="w-6 h-6 hidden dark:block" fill="currentColor" viewBox="0 0 20 20">
    <!-- Sun icon -->
  </svg>
</button>

<script>
  const theme = (() => {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
      return localStorage.getItem('theme');
    }
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  })();

  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  }

  document.getElementById('theme-toggle').addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
</script>
```

### PHASE 4: Advanced Features (Week 4+)

**Goal**: Scale and enhance

#### 4.1 MDX Support

```bash
npx astro add mdx
```

#### 4.2 Analytics

```astro
// Add to BaseLayout.astro
<script defer data-domain="khoivan.dev" src="https://plausible.io/js/script.js"></script>
```

#### 4.3 View Transitions

```astro
// Add to BaseLayout.astro

import { ViewTransitions } from 'astro:transitions';
<head>
  <ViewTransitions />
</head>
```

## Success Metrics

- [ ] Lighthouse score > 95
- [ ] Core Web Vitals: Green
- [ ] SEO score: 100
- [ ] Build time < 30s
- [ ] First blog post view < 1s

## File Structure After Implementation

```
khoivan-blog/
├── src/
│   ├── content/
│   │   ├── config.ts
│   │   └── blog/
│   │       ├── post-1.md
│   │       ├── post-2.mdx
│   │       └── ...
│   ├── components/
│   │   ├── SEO.astro
│   │   ├── BlogCard.astro
│   │   ├── ThemeToggle.astro
│   │   └── Comments.astro
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── BlogLayout.astro
│   └── pages/
│       ├── index.astro
│       ├── about.astro
│       ├── blog/
│       │   ├── index.astro
│       │   └── [...slug].astro
│       └── rss.xml.js
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

## Reference Implementations

- mckerlie.com - Modern Astro blog with Tailwind
- astro-paper - Minimal SEO-friendly theme
- astro-theme-pure - Feature-rich blog template

## Notes

- Prioritize mobile-first design
- Ensure Vietnamese language support
- Focus on Android development content
- Maintain fast build times
- Keep deployment simple via existing CI/CD
