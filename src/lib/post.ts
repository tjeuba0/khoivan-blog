import type { CollectionEntry } from 'astro:content'

export type Post = CollectionEntry<'blog'>

const WORDS_PER_MINUTE = 200

export function readingMinutes(body = ''): number {
  const words = body.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}

export function isoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function tagSlug(tag: string): string {
  return tag.toLowerCase().replace(/\s+/g, '-')
}

export function postUrl(post: Post): string {
  return `/blog/${post.id}/`
}

export function categoryUrl(category: string): string {
  return `/blog/category/${category}/`
}

export function tagUrl(tag: string): string {
  return `/blog/tag/${tagSlug(tag)}/`
}
