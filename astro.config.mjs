// @ts-check
import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import sitemap from '@astrojs/sitemap'
import pagefind from 'astro-pagefind'
import mdx from '@astrojs/mdx'
import remarkCollapse from 'remark-collapse'

// https://astro.build/config
export default defineConfig({
  site: 'https://khoivan.dev',
  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    mdx({
      syntaxHighlight: 'shiki',
      shikiConfig: {
        theme: 'github-dark',
        wrap: true,
      },
      remarkPlugins: [
        [remarkCollapse, {
          test: 'Table of contents',
        }],
      ],
    }),
    sitemap(), 
    pagefind(),
  ],

  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
})
