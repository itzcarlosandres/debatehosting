export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://debatehosting.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/api/admin',
          '/api/admin/',
          '/api/auth',
          '/api/auth/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
