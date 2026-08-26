export type Grade = {
  id: string
  name: string
  order: number
}

export type Subject = {
  id: string
  name: string
  slug: string
}

export type Section = {
  id: string
  name: string
  subject_id: string
}

export type Topic = {
  id: string
  name: string
  section_id: string
}

export type MaterialType = {
  id: string
  name: string
  slug: string
}

export type AccessTier = 'free' | 'grade_pro' | 'pro_all' | 'school'

export type Material = {
  id: string
  title: string
  slug: string
  description: string | null
  grade_id: string | null
  subject_id: string | null
  section_id: string | null
  topic_id: string | null
  material_type_id: string | null
  file_url: string | null
  preview_url: string | null
  external_url: string | null
  is_interactive: boolean
  is_published: boolean
  access_tier: AccessTier
  created_at: string
  updated_at: string
  grades?: Grade
  subjects?: Subject
  sections?: Section
  topics?: Topic
  material_types?: MaterialType
}

export type UserSubscription = {
  id: string
  user_id: string
  tier: AccessTier
  target_grade_id: string | null
  expires_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}
