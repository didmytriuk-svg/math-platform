import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    const {
      title,
      description,
      content,
      subject_id,
      grade_id,
      section_id,
      topic_id,
      material_type_id,
      file_url,
      external_url,
      is_interactive,
    } = body;

    if (!title || !grade_id || !material_type_id) {
      return NextResponse.json(
        { error: 'Заповніть обовʼязкові поля (назва, клас, тип).' },
        { status: 400 }
      );
    }

    const slug = `${title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'material'}-${Date.now().toString().slice(-4)}`;

    const { data, error } = await supabase
      .from('materials')
      .insert({
        title: title.trim(),
        slug,
        description: description?.trim() || null,
        content: content?.trim() || null,
        subject_id: subject_id || null,
        grade_id,
        section_id: section_id || null,
        topic_id: topic_id || null,
        material_type_id,
        file_url: file_url || null,
        external_url: external_url?.trim() || null,
        is_interactive: Boolean(is_interactive),
        is_published: true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, material: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}