import type { Post } from './post'
import { postUrl } from './post'

export const SITE_URL = 'https://khoivan.dev'
export const PERSON_ID = `${SITE_URL}/#person`
export const WEBSITE_ID = `${SITE_URL}/#website`

export const person = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: 'Phạm Đình Khôi Văn',
  alternateName: ['Pham Dinh Khoi Van', 'Khôi Văn', 'Khoi Van', 'Van Pham Dinh Khoi'],
  url: `${SITE_URL}/about/`,
  image: `${SITE_URL}/avatar.jpg`,
  jobTitle: 'Senior Android Developer',
  worksFor: { '@type': 'Organization', name: 'VietinBank' },
  address: { '@type': 'PostalAddress', addressLocality: 'Hanoi', addressCountry: 'VN' },
  knowsAbout: [
    'Android',
    'Kotlin',
    'Jetpack Compose',
    'Clean Architecture',
    'Mobile banking',
    'Mobile application security',
  ],
  sameAs: ['https://github.com/tjeuba0', 'https://www.linkedin.com/in/vanmarch27/'],
}

export const website = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: `${SITE_URL}/`,
  name: 'Khoi Van - Android Developer',
  inLanguage: ['vi', 'en'],
  publisher: { '@id': PERSON_ID },
}

export function profilePage(url: string) {
  return {
    '@type': 'ProfilePage',
    '@id': `${url}#profile`,
    url,
    isPartOf: { '@id': WEBSITE_ID },
    mainEntity: { '@id': PERSON_ID },
  }
}

export function blogPosting(post: Post) {
  const url = new URL(postUrl(post), SITE_URL).toString()
  return {
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    url,
    mainEntityOfPage: url,
    headline: post.data.title,
    description: post.data.description,
    datePublished: post.data.pubDate.toISOString(),
    ...(post.data.updatedDate && { dateModified: post.data.updatedDate.toISOString() }),
    inLanguage: post.data.language,
    keywords: post.data.tags,
    author: { '@id': PERSON_ID },
    publisher: { '@id': PERSON_ID },
    isPartOf: { '@id': WEBSITE_ID },
  }
}
