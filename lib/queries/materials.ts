import { createClient } from "@/lib/supabase/server";
import { Material, Grade, Subject, MaterialType, Section, Topic } from "@/types";

export interface FilterParams {
  q?: string;
  grade?: string;
  section?: string;
  topic?: string;
  type?: string;
  sort?: "newest" | "oldest" | "title_asc" | "title_desc";
  page?: number;
  limit?: number;
}

export async function getGrades(): Promise<Grade[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("grades")
    .select("*")
    .order("order_index", { ascending: true });

  if (error) {
    console.error("Error fetching grades:", error);
    return [];
  }
  return data || [];
}

export async function getMaterialTypes(): Promise<MaterialType[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("material_types")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching types:", error);
    return [];
  }
  return data || [];
}

export async function getSections(gradeNumber?: number): Promise<Section[]> {
  const supabase = await createClient();
  let query = supabase.from("sections").select("*, grade:grades(*)");

  if (gradeNumber) {
    const { data: gradeData } = await supabase
      .from("grades")
      .select("id")
      .eq("number", gradeNumber)
      .single();

    if (gradeData) {
      query = query.eq("grade_id", gradeData.id);
    }
  }

  const { data, error } = await query.order("name", { ascending: true });
  if (error) {
    console.error("Error fetching sections:", error);
    return [];
  }
  return (data as unknown as Section[]) || [];
}

export async function getTopics(sectionSlug?: string): Promise<Topic[]> {
  const supabase = await createClient();
  let query = supabase.from("topics").select("*, section:sections(*)");

  if (sectionSlug) {
    const { data: secData } = await supabase
      .from("sections")
      .select("id")
      .eq("slug", sectionSlug)
      .single();

    if (secData) {
      query = query.eq("section_id", secData.id);
    }
  }

  const { data, error } = await query.order("order_index", { ascending: true });
  if (error) {
    console.error("Error fetching topics:", error);
    return [];
  }
  return (data as unknown as Topic[]) || [];
}

export async function getLatestMaterials(limit = 6): Promise<Material[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("materials")
    .select(`
      *,
      grade:grades(*),
      subject:subjects(*),
      section:sections(*),
      topic:topics(*),
      material_type:material_types(*)
    `)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching materials:", error);
    return [];
  }
  return (data as unknown as Material[]) || [];
}

export async function getFilteredMaterials(params: FilterParams): Promise<{
  materials: Material[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}> {
  const supabase = await createClient();
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 9;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("materials")
    .select(
      `
      *,
      grade:grades!inner(*),
      subject:subjects(*),
      section:sections!inner(*),
      topic:topics!inner(*),
      material_type:material_types!inner(*)
    `,
      { count: "exact" }
    )
    .eq("is_published", true);

  // Фільтр пошуку
  if (params.q && params.q.trim() !== "") {
    const queryTerm = `%${params.q.trim()}%`;
    query = query.or(
      `title.ilike.${queryTerm},description.ilike.${queryTerm}`
    );
  }

  // Фільтр по класу
  if (params.grade) {
    query = query.eq("grade.number", Number(params.grade));
  }

  // Фільтр по розділу
  if (params.section) {
    query = query.eq("section.slug", params.section);
  }

  // Фільтр по темі
  if (params.topic) {
    query = query.eq("topic.slug", params.topic);
  }

  // Фільтр по типу матеріалу
  if (params.type) {
    query = query.eq("material_type.slug", params.type);
  }

  // Сортування
  if (params.sort === "oldest") {
    query = query.order("created_at", { ascending: true });
  } else if (params.sort === "title_asc") {
    query = query.order("title", { ascending: true });
  } else if (params.sort === "title_desc") {
    query = query.order("title", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error filtering materials:", error);
    return { materials: [], totalCount: 0, totalPages: 1, currentPage: 1 };
  }

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / limit) || 1;

  return {
    materials: (data as unknown as Material[]) || [],
    totalCount,
    totalPages,
    currentPage: page,
  };
}