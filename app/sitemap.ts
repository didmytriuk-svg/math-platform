import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.volya-academy.xyz';

  // Статичні сторінки платформи
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // Динамічні сторінки матеріалів із бази даних Supabase
  let materialPages: MetadataRoute.Sitemap = [];
  try {
    const { data: materials } = await supabase
      .from('materials')
      .select('id, updated_at')
      .eq('is_published', true);

    if (materials) {
      materialPages = materials.map((material) => ({
        url: `${baseUrl}/material/${material.id}`,
        lastModified: material.updated_at ? new Date(material.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    }
  } catch (error) {
    console.error('Помилка генерації sitemap для матеріалів:', error);
  }

  return [...staticPages, ...materialPages];
}