import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://my-platform.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/', // Закриваємо адмін-панель від пошуковиків
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}