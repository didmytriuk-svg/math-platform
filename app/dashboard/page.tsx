'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, BookOpen, Sparkles, CheckCircle2, ShieldCheck, Loader2, Search, Filter } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function TeacherDashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [userEmail, setUserEmail] = useState<string>('');
  const [subscription, setSubscription] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Стани для пошуку та фільтрів у кабінеті
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true);
        
        let currentEmail = '';
        if (typeof window !== 'undefined') {
          currentEmail = localStorage.getItem('volya_user_email') || '';
        }

        if (!currentEmail) {
          router.push('/login');
          return;
        }

        setUserEmail(currentEmail);
        const cleanEmail = currentEmail.trim().toLowerCase();

        const isMasterAdmin = cleanEmail === 'didmytriuk@gmail.com' || cleanEmail === 'dasha.hfun@gmail.com';

        let subData = null;

        if (!isMasterAdmin) {
          const { data, error } = await supabase
            .from('user_subscriptions')
            .select('*')
            .ilike('email', cleanEmail)
            .maybeSingle();

          if (error) {
            console.error('Помилка завантаження підписки:', error.message);
          }
          subData = data;
        }

        if (isMasterAdmin) {
          setSubscription({
            tier: 'pro_all',
            expires_at: '2027-08-26T00:00:00.000Z',
            grades: { name: 'Весь каталог' }
          });
        } else if (subData) {
          let gradeObj = null;
          if (subData.grade_id) {
            const { data: gData } = await supabase
              .from('grades')
              .select('id, name')
              .eq('id', subData.grade_id)
              .maybeSingle();
            gradeObj = gData;
          }

          setSubscription({
            ...subData,
            grades: gradeObj || { name: 'Обраний клас' }
          });
        } else {
          setSubscription(null);
        }

        const { data: matData } = await supabase
          .from('materials')
          .select('*, grades(id, name), material_types(name)')
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        setMaterials(matData || []);

      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, [router, supabase]);

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    router.push('/login');
    router.refresh();
  };

  const cleanEmail = userEmail.trim().toLowerCase();
  const isMasterAdmin = cleanEmail === 'didmytriuk@gmail.com' || cleanEmail === 'dasha.hfun@gmail.com';
  
  const isPro = Boolean(isMasterAdmin || (subscription && subscription.is_active !== false));
  const isProAll = isMasterAdmin || subscription?.tier === 'pro_all';
  const assignedGradeId = subscription?.grade_id;
  const assignedGradeName = subscription?.grades?.name || 'Обраний клас';

  // Фільтрація матеріалів за пошуком, класом та типом
  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      const matchesSearch = 
        m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGrade = 
        selectedGradeFilter === 'all' || m.grade_id === selectedGradeFilter;

      const matchesType = 
        selectedTypeFilter === 'all' || m.material_type_id === selectedTypeFilter;

      return matchesSearch && matchesGrade && matchesType;
    });
  }, [materials, searchQuery, selectedGradeFilter, selectedTypeFilter]);

  // Унікальні списки класів та типів для випадаючих фільтрів
  const availableGrades = useMemo(() => {
    const map = new Map();
    materials.forEach((m) => {
      if (m.grades) map.set(m.grades.id, m.grades.name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [materials]);

  const availableTypes = useMemo(() => {
    const map = new Map();
    materials.forEach((m) => {
      if (m.material_types) map.set(m.material_type_id, m.material_types.name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [materials]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-volya-grid flex items-center justify-center">
        <div className="flex items-center gap-2 font-display font-bold text-sm text-[#0D1117]">
          <Loader2 className="w-5 h-5 animate-spin text-[#1E56FF]" />
          Завантаження кабінету...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-volya-grid py-10 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Шапка профілю */}
        <div className="bg-white border border-[#E2E8F4] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF4FF] text-[#1E56FF] flex items-center justify-center text-xl font-black">
              {userEmail?.[0]?.toUpperCase() || 'V'}
            </div>
            <div>
              <p className="text-xs text-[#5E687E] font-display font-bold uppercase tracking-wider">Особистий кабінет викладача</p>
              <h1 className="font-display font-black text-xl sm:text-2xl text-[#0D1117]">
                {userEmail}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isMasterAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center justify-center gap-2 text-xs font-display font-bold px-4 py-3 rounded-xl bg-[#1E56FF] text-white hover:bg-[#0D33B3] transition-colors"
              >
                Адмін-панель →
              </Link>
            )}
            <Link
              href="/catalog"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 text-xs font-display font-bold px-5 py-3 rounded-xl bg-[#F7F9FD] border border-[#E2E8F4] text-[#0D1117] hover:bg-[#EFF4FF] transition-colors"
            >
              Перейти в каталог →
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 text-xs font-display font-bold px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Вийти
            </button>
          </div>
        </div>

        {/* Статус підписки */}
        <div className={`border rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 ${isPro ? 'bg-[#F0FDF4] border-[#BBF7D0]' : 'bg-white border-[#E2E8F4]'}`}>
          <div className="space-y-1">
            <p className="text-xs font-display font-bold uppercase tracking-wider text-[#5E687E]">Ваш тарифний план</p>
            <h2 className="font-display font-black text-2xl text-[#0D1117] flex items-center gap-2">
              {isPro ? (
                <>
                  <ShieldCheck className="w-6 h-6 text-[#00BA7C]" />
                  {isProAll ? 'Pro-доступ активний (Весь каталог 5–11 класи)' : `Pro-доступ активний (Клас: ${assignedGradeName})`}
                </>
              ) : (
                'Безкоштовний доступ'
              )}
            </h2>
            <p className="text-xs text-[#5E687E]">
              {isPro 
                ? `Ваш доступ діє до: ${new Date(subscription?.expires_at || Date.now() + 31536000000).toLocaleDateString('uk-UA')}` 
                : 'Оновіть свій тариф до Pro, щоб отримати повний доступ до всіх розробок, презентацій та контрольних робіт.'}
            </p>
          </div>

          {!isPro && (
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 font-display font-bold text-xs sm:text-sm px-6 py-3.5 bg-[#1E56FF] text-white hover:bg-[#0D33B3] transition-all rounded-xl shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              Отримати Pro-доступ
            </Link>
          )}
        </div>

        {/* Секція матеріалів з пошуком та фільтрами */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="font-display font-black text-xl text-[#0D1117]">
              Доступні матеріали для ваших уроків
            </h2>
            <span className="text-xs font-mono-math text-[#5E687E]">
              Знайдено матеріалів: {filteredMaterials.length} з {materials.length}
            </span>
          </div>

          {/* Панель пошуку та фільтрації */}
          <div className="bg-white border border-[#E2E8F4] rounded-2xl p-4 sm:p-5 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Пошук */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#5E687E] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Пошук за назвою або описом..."
                className="w-full text-xs bg-[#F7F9FD] border border-[#E2E8F4] rounded-xl pl-10 pr-4 py-3 text-[#0D1117] outline-none focus:border-[#1E56FF] focus:bg-white transition"
              />
            </div>

            {/* Фільтр за класом */}
            <div>
              <select
                value={selectedGradeFilter}
                onChange={(e) => setSelectedGradeFilter(e.target.value)}
                className="w-full text-xs bg-[#F7F9FD] border border-[#E2E8F4] rounded-xl px-4 py-3 text-[#0D1117] outline-none focus:border-[#1E56FF] focus:bg-white transition cursor-pointer"
              >
                <option value="all">Усі класи</option>
                {availableGrades.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            {/* Фільтр за типом матеріалу */}
            <div>
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="w-full text-xs bg-[#F7F9FD] border border-[#E2E8F4] rounded-xl px-4 py-3 text-[#0D1117] outline-none focus:border-[#1E56FF] focus:bg-white transition cursor-pointer"
              >
                <option value="all">Усі типи матеріалів</option>
                {availableTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Сітка матеріалів */}
          {filteredMaterials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMaterials.map((m) => {
                const materialGradeId = m.grade_id;
                const isFree = !m.is_premium && m.access_tier !== 'grade_pro' && m.access_tier !== 'pro_all';
                
                const hasMaterialAccess = isMasterAdmin || isProAll || isFree || (subscription?.tier === 'grade_pro' && assignedGradeId && materialGradeId === assignedGradeId);

                return (
                  <div key={m.id} className="bg-white border border-[#E2E8F4] rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between hover:border-[#D5E2FF] transition-all">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded bg-[#EFF4FF] text-[#1E56FF] font-mono-math font-bold text-[10px]">
                          {m.grades?.name || 'Клас'}
                        </span>
                        <span className="text-[10px] font-bold text-[#5E687E]">
                          {m.material_types?.name || 'Матеріал'}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-sm text-[#0D1117] line-clamp-2">
                        {m.title}
                      </h3>
                      <p className="text-xs text-[#5E687E] line-clamp-2">
                        {m.description || 'Детальний опис та методичні матеріали для проведення уроку.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#F1F4FA] flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${hasMaterialAccess ? 'bg-emerald-50 text-[#00BA7C]' : 'bg-amber-50 text-amber-700'}`}>
                        {hasMaterialAccess ? (isFree ? 'Free' : 'Доступно') : 'Потрібна підписка'}
                      </span>
                      <Link
                        href={`/material/${m.id}`}
                        className="text-xs font-display font-bold text-[#1E56FF] hover:underline inline-flex items-center gap-1"
                      >
                        {hasMaterialAccess ? 'Відкрити →' : 'Детальніше →'}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-[#E2E8F4] rounded-2xl p-12 text-center space-y-2">
              <p className="font-display font-bold text-sm text-[#0D1117]">
                Нічого не знайдено за вашим запитом.
              </p>
              <p className="text-xs text-[#5E687E]">
                Спробуйте змінити пошуковий запит або скинути фільтри.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}