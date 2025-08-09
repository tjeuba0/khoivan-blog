import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'

export async function GET(context) {
  const blog = await getCollection('blog')

  // Filter out drafts and sort by date
  const posts = blog
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())

  return rss({
    title: 'Khoi Van - Android Developer Blog',
    description:
      'Technical articles about Android development, Clean Architecture, Jetpack Compose, and more.',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      author: post.data.author,
      categories: [post.data.category, ...post.data.tags],
      // Compute the link from the post slug
      link: `/blog/${post.id}`,
    })),
    customData: `<language>vi-vn</language>`,
    stylesheet: '/rss-styles.xsl',
  })
}
