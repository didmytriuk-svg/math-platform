'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Copy,
  Check,
  Clock,
  FileText
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminSubscriptionsPage() {
  const supabase = createClient();

  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [tier, setTier] = useState('pro_all');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdDetails, setCreatedDetails] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [subRes, reqRes, gradeRes] = await Promise.all([
        supabase
          .from('user_subscriptions')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('subscription_requests')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase.from('grades').select('*')
      ]);

      setSubscriptions(subRes.data || []);
      setRequests(reqRes.data || []);
      setGrades(gradeRes.data || []);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [supabase]);

  // Функція для перетворення системного коду тарифу на людську назву
  const formatTierName = (tierCode: string) => {
    if (!tierCode) return 'Не вказано';
    if (tierCode.startsWith('Окрема покупка КТП:')) return tierCode;
    
    switch (tierCode) {
      case 'early_access':
        return 'На період розробки (Ранній доступ — 500 грн)';
      case 'single_grade':
        return 'Pro — один клас (290 грн)';
      case 'pro_all':
      case 'all_access':
        return 'Pro — весь каталог (1 250 грн)';
      case 'calendar_plans':
      case 'calendar_plans_single':
        return 'Календарні плани (Безліміт / КТП)';
      case 'school_b2b':
        return 'School (B2B) — 3 900 грн';
      default:
        return tierCode;
    }
  };

  // Швидке перенесення даних заявки у форму видачі доступу
  const handleFillFromRequest = (req: any) => {
    setFullName(req.full_name || '');
    setEmail(req.email || '');
    setContact(req.contact || '');
    if (req.tier) {
      setTier(req.tier);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteRequest = async (reqId: string) => {
    const { error } = await supabase
      .from('subscription_requests')
      .delete()
      .eq('id', reqId);

    if (!error) {
      setRequests((prev) => prev.filter((r) => r.id !== reqId));
    }
  };

  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setCreatedDetails(null);

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMsg('Введіть коректну електронну пошту викладача.');
      return;
    }

    setIsSubmitting(true);

    try {
      const generatedPassword = 'math' + Math.random().toString(36).slice(-6) + '-v7';
      const expiresDate = new Date();
      expiresDate.setFullYear(expiresDate.getFullYear() + 1);

      const dummyUserId = '00000000-0000-0000-0000-000000000000';

      const { data: existingSub } = await supabase
        .from('user_subscriptions')
        .select('id')
        .ilike('email', trimmedEmail)
        .maybeSingle();

      let subError = null;

      if (existingSub) {
        const { error } = await supabase
          .from('user_subscriptions')
          .update({
            tier: tier,
            is_active: true,
            expires_at: expiresDate.toISOString(),
            temp_password: generatedPassword,
          })
          .eq('id', existingSub.id);
        subError = error;
      } else {
        const { error } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: dummyUserId,
            email: trimmedEmail,
            tier: tier,
            is_active: true,
            expires_at: expiresDate.toISOString(),
            temp_password: generatedPassword,
          });
        subError = error;
      }

      if (subError) throw subError;

      // Видаляємо заявку зі списку очікування після обробки
      const matchingReq = requests.find(r => r.email.toLowerCase() === trimmedEmail);
      if (matchingReq) {
        await supabase.from('subscription_requests').delete().eq('id', matchingReq.id);
      }

      setCreatedDetails({
        fullName: fullName.trim() || 'Викладач',
        email: trimmedEmail,
        password: generatedPassword,
        tierName: formatTierName(tier),
        expiresAt: expiresDate.toLocaleDateString('uk-UA'),
      });

      setFullName('');
      setEmail('');
      setContact('');
      
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Сталася помилка при збереженні підписки.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSub = async (subId: string) => {
    if (!confirm('Впевнені, що хочете видалити цей доступ?')) return;

    const { error } = await supabase
      .from('user_subscriptions')
      .delete()
      .eq('id', subId);

    if (!error) {
      setSubscriptions((prev) => prev.filter((s) => s.id !== subId));
    } else {
      alert('Помилка видалення: ' + error.message);
    }
  };

  const handleCopySingle = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-volya-grid py-10 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-display font-bold text-[#5E687E] hover:text-[#1E56FF] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад до адмін-панелі
          </Link>
          <span className="text-xs font-mono-math font-semibold text-[#1E56FF] bg-[#EFF4FF] border border-[#D5E2FF] px-3 py-1 rounded-lg">
            Управління доступами та заявками
          </span>
        </div>

        {/* БЛОК ЗАЯВОК З САЙТУ */}
        {requests.length > 0 && (
          <div className="bg-amber-50/60 border border-amber-200 rounded-3xl p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <h3 className="font-display font-black text-lg text-[#0D1117]">
                  Нові замовлення та заявки з сайту ({requests.length})
                </h3>
              </div>
              <span className="text-xs text-[#5E687E]">Перевірте оплату та надішліть файл або доступ</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {requests.map((req) => {
                const isKtpSingle = req.tier && req.tier.startsWith('Окрема покупка КТП:');
                const readableTier = formatTierName(req.tier);

                return (
                  <div key={req.id} className="bg-white border border-amber-200 rounded-2xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-display font-bold text-xs text-[#0D1117]">{req.full_name}</span>
                        <span className="text-[10px] font-mono text-[#5E687E]">
                          {new Date(req.created_at).toLocaleDateString('uk-UA')}
                        </span>
                      </div>
                      <p className="font-mono text-xs text-[#1E56FF]">{req.email}</p>
                      
                      <div className={`p-2.5 rounded-xl border text-xs space-y-1 ${isKtpSingle ? 'bg-blue-50/50 border-blue-200 text-[#1E56FF]' : 'bg-emerald-50/50 border-emerald-200 text-emerald-700'}`}>
                        <div className="flex items-center gap-1.5 font-bold">
                          {isKtpSingle ? <FileText className="w-3.5 h-3.5 shrink-0" /> : <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                          <span className="leading-tight">{readableTier}</span>
                        </div>
                        {isKtpSingle && (
                          <p className="text-[10px] text-[#5E687E] italic">
                            💡 Надішліть цей файл на пошту викладача протягом до 20 хвилин.
                          </p>
                        )}
                        {req.contact && <p className="text-[11px] text-[#0D1117] pt-0.5">Контакт: {req.contact}</p>}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#F1F4FA] flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleFillFromRequest(req)}
                        className="flex-1 text-center py-2 px-3 rounded-xl bg-[#1E56FF] text-white font-display font-bold text-xs hover:bg-[#0D33B3] transition-all cursor-pointer"
                      >
                        Опрацювати →
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRequest(req.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        title="Видалити заявку"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Форма видачі доступу */}
          <div className="space-y-6">
            <div className="bg-white border border-[#E2E8F4] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-[#F1F4FA] pb-4">
                <h2 className="font-display font-black text-xl text-[#0D1117]">
                  Видати або оновити доступ
                </h2>
                <p className="text-xs text-[#5E687E] mt-0.5">
                  Реєстрація чи оновлення даних для викладача
                </p>
              </div>

              {errorMsg && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {createdDetails && (
                <div className="p-5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-4">
                  <div className="flex items-center gap-2 text-[#00BA7C] font-display font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    Доступ успішно створено!
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-[#E2E8F4] text-xs space-y-1.5 font-mono text-[#0D1117]">
                    <p>🌐 <strong>Сайт:</strong> {typeof window !== 'undefined' ? window.location.origin : ''}/login</p>
                    <p>👤 <strong>Ім'я:</strong> {createdDetails.fullName}</p>
                    <p>📧 <strong>Логін:</strong> {createdDetails.email}</p>
                    <p>🔑 <strong>Пароль:</strong> {createdDetails.password}</p>
                    <p>⭐ <strong>Тариф:</strong> {createdDetails.tierName}</p>
                    <p>📅 <strong>Діє до:</strong> {createdDetails.expiresAt}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleCreateSubscription} className="space-y-4">
                <div>
                  <label className="block font-display font-bold text-xs text-[#0D1117] uppercase tracking-wider mb-2">
                    Ім'я та прізвище викладача
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Оксана Коваленко"
                    className="w-full text-sm bg-[#F7F9FD] border border-[#E2E8F4] text-[#0D1117] rounded-xl px-4 py-3 outline-none focus:border-[#1E56FF]"
                  />
                </div>

                <div>
                  <label className="block font-display font-bold text-xs text-[#0D1117] uppercase tracking-wider mb-2">
                    Email викладача *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teacher@school.edu.ua"
                    className="w-full text-sm bg-[#F7F9FD] border border-[#E2E8F4] text-[#0D1117] rounded-xl px-4 py-3 outline-none focus:border-[#1E56FF]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-display font-bold text-xs text-[#0D1117] uppercase tracking-wider mb-2">
                    Телефон або Telegram
                  </label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="@username або +380..."
                    className="w-full text-sm bg-[#F7F9FD] border border-[#E2E8F4] text-[#0D1117] rounded-xl px-4 py-3 outline-none focus:border-[#1E56FF]"
                  />
                </div>

                <div>
                  <label className="block font-display font-bold text-xs text-[#0D1117] uppercase tracking-wider mb-2">
                    Тарифний план або тип доступу *
                  </label>
                  <input
                    type="text"
                    value={tier}
                    onChange={(e) => setTier(e.target.value)}
                    placeholder="pro_all або early_access або single_grade"
                    className="w-full text-sm bg-[#F7F9FD] border border-[#E2E8F4] text-[#0D1117] rounded-xl px-4 py-3 outline-none focus:border-[#1E56FF]"
                    required
                  />
                  <p className="text-[11px] text-[#5E687E] mt-1">
                    Можна вказати <code className="text-[#1E56FF]">pro_all</code>, <code className="text-[#1E56FF]">early_access</code>, <code className="text-[#1E56FF]">single_grade</code> тощо.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full font-display font-bold text-xs sm:text-sm py-3.5 bg-[#1E56FF] hover:bg-[#0D33B3] text-white rounded-xl transition-all shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Підтвердити оплату та зберегти доступ
                </button>
              </form>
            </div>
          </div>

          {/* Список викладачів з паролями */}
          <div className="space-y-6">
            <div className="bg-white border border-[#E2E8F4] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="border-b border-[#F1F4FA] pb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-black text-xl text-[#0D1117]">
                    Активні користувачі ({subscriptions.length})
                  </h3>
                  <p className="text-xs text-[#5E687E] mt-0.5">
                    Викладачі з діючими доступами
                  </p>
                </div>
                <button 
                  onClick={loadData}
                  className="text-xs font-display font-bold text-[#1E56FF] hover:underline cursor-pointer"
                >
                  Оновити
                </button>
              </div>

              {isLoading ? (
                <div className="py-12 flex items-center justify-center text-[#5E687E]">
                  <Loader2 className="w-6 h-6 animate-spin text-[#1E56FF]" />
                </div>
              ) : subscriptions.length > 0 ? (
                <div className="space-y-3">
                  {subscriptions.map((sub) => (
                    <div key={sub.id} className="p-4 rounded-2xl bg-[#F7F9FD] border border-[#E2E8F4] space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-mono text-xs font-bold text-[#0D1117] truncate">
                          {sub.email}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleDeleteSub(sub.id)}
                          className="text-red-500 hover:text-red-700 p-1 cursor-pointer shrink-0"
                          title="Видалити доступ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {sub.temp_password && (
                        <div className="flex items-center justify-between text-xs bg-white border border-[#E2E8F4] px-3 py-2 rounded-xl">
                          <span className="font-mono text-[#1E56FF]">
                            Пароль: <strong>{sub.temp_password}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopySingle(sub.temp_password, sub.id)}
                            className="text-[11px] font-bold text-[#00BA7C] hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            {copiedId === sub.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedId === sub.id ? 'Скопійовано' : 'Копіювати'}
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-[#5E687E] pt-1">
                        <span className="font-bold text-[#1E56FF] truncate max-w-[220px]">
                          {formatTierName(sub.tier)}
                        </span>
                        <span>
                          До: {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString('uk-UA') : 'Безстроково'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#5E687E] py-12 text-center italic">
                  Викладачів поки що немає в базі даних.
                </p>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}