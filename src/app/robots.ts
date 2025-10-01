import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/test/',
          '/debug/',
          '/*.json$',
          '/mini-app/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/test/',
          '/debug/',
        ],
      },
    ],
    sitemap: 'https://www.richidea.top/sitemap.xml',
    host: 'https://www.richidea.top',
  }
}