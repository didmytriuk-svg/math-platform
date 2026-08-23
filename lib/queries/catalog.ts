import { createClient } from '@/lib/supabase/server';

export interface CatalogFilterParams {
  search?: string;
  grade?: string;
  section?: string;
  topic?: string;
  type?: string;
  sort?: 'newest' | 'oldest' | 'title_asc';
  page?: number;
  limit?: number;
}

export async function getCatalogData(params: CatalogFilterParams) {
  const supabase = await createClient();
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 12;
  const offset = (page - 1) * limit;

  // Отримуємо списки для випадаючих списків фільтрації
  const [
    { data: grades },
    { data: sections },
    { data: topics },
    { data: materialTypes }
  ] = await Promise.all([
    supabase.from('grades').select('id, name, order_index').order('order_index', { ascending: true }),
    supabase.from('sections').select('id, name, grade_id, order_index').order('order_index', { ascending: true }),
    supabase.from('topics').select('id, name, section_id, grade_id, order_index').order('order_index', { ascending: true }),
    supabase.from('material_types').select('id, name, slug, icon').order('order_index', { ascending: true })
  ]);

  // Основний запит на матеріали
  let query = supabase
    .from('materials')
    .select(`
      id,
      title,
      slug,
      description,
      preview_url,
      file_url,
      external_url,
      is_interactive,
      view_count,
      download_count,
      created_at,
      grades ( id, name ),
      subjects ( id, name ),
      sections ( id, name ),
      topics ( id, name ),
      material_types ( id, name, slug )
    `, { count: 'exact' })
    .eq('is_published', true);

  // Текстовий пошук
  if (params.search && params.search.trim() !== '') {
    const term = `%${params.search.trim()}%`;
    query = query.or(`title.ilike.${term},description.ilike.${term}`);
  }

  // Фільтри по ID / slug
  if (params.grade) {
    query = query.eq('grade_id', params.grade);
  }

  if (params.section) {
    query = query.eq('section_id', params.section);
  }

  if (params.topic) {
    query = query.eq('topic_id', params.topic);
  }

  if (params.type) {
    // Шукаємо за slug або id типу
    const matchedType = materialTypes?.find((t) => t.slug === params.type || t.id === params.type);
    if (matchedType) {
      query = query.eq('material_type_id', matchedType.id);
    }
  }

  // Сортування
  if (params.sort === 'oldest') {
    query = query.order('created_at', { ascending: true });
  } else if (params.sort === 'title_asc') {
    query = query.order('title', { ascending: true });
  } else {
    // Default: newest
    query = query.order('created_at', { ascending: false });
  }

  // Пагінація
  query = query.range(offset, offset + limit - 1);

  const { data: materials, count, error } = await query;

  if (error) {
    console.error('Error fetching catalog materials:', error);
  }

  return {
    materials: materials || [],
    totalCount: count || 0,
    totalPages: Math.ceil((count || 0) / limit),
    currentPage: page,
    filters: {
      grades: grades || [],
      sections: sections || [],
      topics: topics || [],
      materialTypes: materialTypes || []
    }
  };
}