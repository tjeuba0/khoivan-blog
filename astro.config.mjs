// @ts-check
import { defineConfig } from 'astro/config'

import tailwindcss from '@tailwindcss/vite'

import sitemap from '@astrojs/sitemap'

import pagefind from 'astro-pagefind'

// https://astro.build/config
export default defineConfig({
  site: 'https://khoivan.dev',
  build: {
    format: 'file',
  },
  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [sitemap(), pagefind()],
})
