import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase Service Role Key is missing in environment variables');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Отримання списку всіх викладачів та заявок
export async function GET(request: Request) {
  try {
    const supabaseAdmin = getAdminClient();

    const [profilesRes, requestsRes, gradesRes] = await Promise.all([
      supabaseAdmin
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          role,
          subscription_tier,
          is_pro,
          pro_until,
          grade_access_id,
          created_at,
          grades ( id, name )
        `)
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('access_requests')
        .select(`
          id,
          email,
          full_name,
          phone_or_telegram,
          subscription_tier,
          grade_id,
          status,
          created_at,
          grades ( id, name )
        `)
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('grades')
        .select('id, name, number')
        .order('number', { ascending: true }),
    ]);

    return NextResponse.json({
      profiles: profilesRes.data || [],
      requests: requestsRes.data || [],
      grades: gradesRes.data || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Створення або оновлення доступу для викладача
export async function POST(request: Request) {
  try {
    const supabaseAdmin = getAdminClient();
    const body = await request.json();

    const {
      email,
      password,
      fullName,
      subscriptionTier,
      gradeAccessId,
      proUntilMonths = 12,
      requestId,
    } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email та пароль є обовʼязковими' },
        { status: 400 }
      );
    }

    // Розраховуємо дату закінчення (за замовчуванням 12 місяців)
    const proUntil = new Date();
    proUntil.setMonth(proUntil.getMonth() + Number(proUntilMonths));

    let userId: string;

    // 1. Перевіряємо, чи існує вже користувач із таким email
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const foundUser = existingUser?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase().trim()
    );

    if (foundUser) {
      userId = foundUser.id;
      // Оновлюємо пароль існуючого користувача
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: password,
        user_metadata: { full_name: fullName },
      });
    } else {
      // Створюємо нового користувача
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email.trim(),
        password: password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });

      if (createError || !newUser.user) {
        throw new Error(createError?.message || 'Не вдалося створити користувача в системі Auth');
      }

      userId = newUser.user.id;
    }

    // 2. Оновлюємо або створюємо запис у таблиці profiles
    const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
      id: userId,
      email: email.trim(),
      full_name: fullName || null,
      role: 'teacher',
      is_pro: subscriptionTier !== 'free',
      subscription_tier: subscriptionTier,
      grade_access_id: subscriptionTier === 'single_grade' ? gradeAccessId : null,
      pro_until: subscriptionTier !== 'free' ? proUntil.toISOString() : null,
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      throw new Error(`Помилка збереження профілю: ${profileError.message}`);
    }

    // 3. Якщо створення відбулося за заявкою — міняємо статус заявки на approved
    if (requestId) {
      await supabaseAdmin
        .from('access_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);
    }

    return NextResponse.json({
      success: true,
      message: 'Доступ успішно надано!',
      user: {
        email,
        password,
        fullName,
        subscriptionTier,
        proUntil: proUntil.toLocaleDateString('uk-UA'),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}