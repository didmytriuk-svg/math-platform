export interface UserProfileAccess {
  role?: 'teacher' | 'admin' | null;
  subscription_tier?: 'free' | 'single_grade' | 'all_access' | 'school' | null;
  is_pro?: boolean | null;
  pro_until?: string | null;
  grade_access_id?: string | null;
}

export interface MaterialAccessData {
  is_premium?: boolean | null;
  grade_id?: string | null;
}

export interface AccessCheckResult {
  hasAccess: boolean;
  reason?: 'free_material' | 'admin' | 'all_access' | 'school' | 'single_grade_match' | 'needs_upgrade_grade' | 'needs_pro';
  message?: string;
}

/**
 * Перевіряє чи має користувач доступ до матеріалу за своєю тарифною підпискою
 */
export function checkMaterialAccess(
  profile: UserProfileAccess | null | undefined,
  material: MaterialAccessData | null | undefined
): AccessCheckResult {
  // 1. Якщо матеріал безкоштовний — доступ відкритий для всіх
  if (!material?.is_premium) {
    return { hasAccess: true, reason: 'free_material' };
  }

  // 2. Якщо користувач не авторизований — блокування
  if (!profile) {
    return { 
      hasAccess: false, 
      reason: 'needs_pro',
      message: 'Матеріал доступний за тарифами Pro. Увійдіть або оформіть доступ.' 
    };
  }

  // 3. Адміністратор має повний доступ завжди
  if (profile.role === 'admin') {
    return { hasAccess: true, reason: 'admin' };
  }

  // 4. Перевірка терміну дії підписки (якщо встановлено pro_until)
  if (profile.pro_until && new Date(profile.pro_until) < new Date()) {
    return { 
      hasAccess: false, 
      reason: 'needs_pro', 
      message: 'Термін дії вашої підписки завершився. Будь ласка, подовжте тариф.' 
    };
  }

  // 5. Тариф "Pro — весь каталог" або "School (B2B)"
  if (profile.subscription_tier === 'all_access' || profile.subscription_tier === 'school') {
    return { hasAccess: true, reason: profile.subscription_tier };
  }

  // 6. Тариф "Pro — один клас"
  if (profile.subscription_tier === 'single_grade') {
    if (profile.grade_access_id && material.grade_id && profile.grade_access_id === material.grade_id) {
      return { hasAccess: true, reason: 'single_grade_match' };
    }
    return { 
      hasAccess: false, 
      reason: 'needs_upgrade_grade',
      message: 'Цей матеріал належить іншому класу. Перейдіть на тариф «Pro — весь каталог» або оберіть цей клас.' 
    };
  }

  // 7. Базовий тариф Free
  return { 
    hasAccess: false, 
    reason: 'needs_pro',
    message: 'Ця розробка входить у розширені тарифи Pro.' 
  };
}
