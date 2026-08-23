export interface Subject {
  id: string;
  name: string;
  slug: string;
}

export interface Grade {
  id: string;
  name: string;
  number: number;
  order_index: number;
}

export interface Section {
  id: string;
  subject_id: string;
  grade_id: string;
  name: string;
  slug: string;
}

export interface Topic {
  id: string;
  section_id: string;
  name: string;
  slug: string;
  order_index: number;
}

export interface MaterialType {
  id: string;
  name: string;
  slug: string;
  icon_name: string;
}

export interface Material {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  subject_id: string;
  grade_id: string;
  section_id: string;
  topic_id: string;
  material_type_id: string;
  file_path: string | null;
  preview_path: string | null;
  external_url: string | null;
  is_interactive: boolean;
  is_published: boolean;
  downloads_count: number;
  created_at: string;
  updated_at: string;
  
  grade?: Grade;
  subject?: Subject;
  section?: Section;
  topic?: Topic;
  material_type?: MaterialType;
}
