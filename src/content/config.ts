import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

// Reusable schema for SEO metadata
const seoSchema = z.object({
  title: z.string().max(60).optional(),
  description: z.string().max(160).optional(),
  ogImage: z.string().optional(),
  canonicalURL: z.string().url().optional(),
  noindex: z.boolean().default(false),
})

// Blog collection schema
const blog = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/blog',
  }),
  schema: ({ image }) =>
    z
      .object({
        // Required fields
        title: z.string().max(100),
        description: z.string().max(200),
        pubDate: z.coerce.date(),

        // Optional fields
        updatedDate: z.coerce.date().optional(),
        author: z.string().default('Khoi Van'),

        // Hero image with validation
        heroImage: image().optional(),
        heroImageAlt: z.string().optional(),

        // Categorization - Simpler, more human categories
        category: z.enum(['engineering', 'life', 'notes', 'projects']).default('notes'),
        tags: z.array(z.string()).default([]),
        
        // Mood/tone for personal posts
        mood: z.enum(['technical', 'personal', 'reflective', 'humorous']).optional(),

        // Series/Multi-part posts
        series: z.string().optional(),
        seriesOrder: z.number().optional(),

        // Post settings
        draft: z.boolean().default(false),
        featured: z.boolean().default(false),

        // Technical metadata
        language: z.enum(['vi', 'en']).default('vi'),
        readingTime: z.string().optional(), // Will be auto-calculated

        // SEO overrides
        seo: seoSchema.optional(),
      })
      .transform((data) => {
        // Auto-calculate reading time if not provided
        if (!data.readingTime) {
          // This will be calculated based on content length
          // Placeholder for now
          data.readingTime = '5 min read'
        }

        // Ensure heroImageAlt if heroImage exists
        if (data.heroImage && !data.heroImageAlt) {
          data.heroImageAlt = data.title
        }

        return {
          ...data,
          // Add computed slug-friendly category
          categorySlug: data.category.toLowerCase().replace(/\s+/g, '-'),
        }
      }),
})

// Future collections can be added here
// const portfolio = defineCollection({ ... });
// const snippets = defineCollection({ ... });
// const notes = defineCollection({ ... });

export const collections = {
  blog,
}

// Type exports for better TypeScript support
export type BlogPost = z.infer<typeof blog.schema>
