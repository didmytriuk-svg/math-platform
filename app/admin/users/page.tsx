'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Copy, 
  Check, 
  KeyRound, 
  Clock, 
  ArrowRight
} from 'lucide-react';
import { AdminHeaderNav } from '@/components/admin/AdminHeaderNav';

export default function AdminUsersPage() {
  const [data, setData] = useState<{
    profiles: any[];
    requests: any[];
    grades: any[];
  }>({
    profiles: [],
    requests: [],
    grades: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [subscriptionTier, setSubscriptionTier] = useState('all_access');
  const [gradeAccessId, setGradeAccessId] = useState('');
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState<any | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  const generatePassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    let randomPart = '';
    for (let i = 0; i < 4; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newPass = `math26-${randomPart}`;
    setPassword(newPass);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (err: any) {
      setErrorMsg(err.message || 'Не вдалося завантажити дані');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    generatePassword();
  }, []);

  const handleSelectRequest = (req: any) => {
    setActiveRequestId(req.id);
    setEmail(req.email);
    setFullName(req.full_name);
    setSubscriptionTier(req.subscription_tier);
    if (req.grade_id) setGradeAccessId(req.grade_id);
    generatePassword();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessInfo(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          fullName,
          subscriptionTier,
          gradeAccessId: subscriptionTier === 'single_grade' ? gradeAccessId : null,
          requestId: activeRequestId,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || 'Помилка видачі доступу');
      }

      setSuccessInfo(json.user);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const messageToCopy = successInfo
    ? `Вітаємо! Ваш доступ до платформи Volya Academy активовано.\n\n` +
      `🌐 Сайт: https://math-platform-kohl.vercel.app/login\n` +
      `📧 Логін (Email): ${successInfo.email}\n` +
      `🔑 Пароль: ${successInfo.password}\n` +
      `⭐ Тариф: ${
        successInfo.subscriptionTier === 'all_access'
          ? 'Pro — весь каталог (5–11 класи)'
          : successInfo.subscriptionTier === 'single_grade'
          ? 'Pro — один клас'
          : 'School'
      }\n` +
      `📅 Діє до: ${successInfo.proUntil}\n\n` +
      `Приємного користування матеріалами на уроках!`
    : '';

  const copyMessage = () => {
    navigator.clipboard.writeText(messageToCopy);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="min-h-screen bg-volya-grid py-10 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <AdminHeaderNav />

        <div className="bg-white border border-[#E2E8F4] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-[#0D1117]">
              Керування доступами викладачів
            </h1>
            <p className="text-xs sm:text-sm text-[#5E687E] mt-1">
              Перевіряйте оплату, видавайте логіни й паролі та контролюйте тарифи
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono-math bg-[#EFF4FF] border border-[#D5E2FF] text-[#1E56FF] px-3.5 py-2 rounded-xl">
            <Users className="w-4 h-4" />
            <span>Всього викладачів: {data.profiles.length}</span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 bg-white border border-[#E2E8F4] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#F1F4FA] pb-4">
              <h2 className="font-display font-black text-lg text-[#0D1117] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#1E56FF]" />
                Видати або оновити доступ
              </h2>
            </div>

            {successInfo && (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-display font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-[#00BA7C]" />
                  Доступ успішно створено!
                </div>
                <div className="p-3 bg-white border border-emerald-200 rounded-xl font-mono-math text-[11px] whitespace-pre-wrap leading-relaxed text-[#0D1117]">
                  {messageToCopy}
                </div>
                <button
                  type="button"
                  onClick={copyMessage}
                  className="w-full py-2.5 px-3 rounded-xl font-display font-bold text-xs bg-[#00BA7C] text-white hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Скопійовано!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Скопіювати повідомлення для клієнта
                    </>
                  )}
                </button>
              </div>
            )}

            <form onSubmit={handleGrantAccess} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono-math uppercase tracking-wider font-bold text-[#5E687E] mb-1">
                  Email викладача *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teacher@school.edu.ua"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-[#F7F9FD] border border-[#E2E8F4] rounded-xl outline-none focus:border-[#1E56FF] focus:bg-white transition"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono-math uppercase tracking-wider font-bold text-[#5E687E] mb-1">
                  Ім&apos;я та прізвище
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Оксана Коваленко"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-[#F7F9FD] border border-[#E2E8F4] rounded-xl outline-none focus:border-[#1E56FF] focus:bg-white transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-mono-math uppercase tracking-wider font-bold text-[#5E687E]">
                    Згенерований пароль *
                  </label>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="text-[10px] text-[#1E56FF] hover:underline font-mono-math font-semibold cursor-pointer"
                  >
                    Згенерувати інший
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full font-mono-math font-bold text-xs sm:text-sm pl-9 pr-4 py-2.5 bg-[#F7F9FD] border border-[#E2E8F4] rounded-xl outline-none focus:border-[#1E56FF] focus:bg-white transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono-math uppercase tracking-wider font-bold text-[#5E687E] mb-1">
                  Тарифний план *
                </label>
                <select
                  value={subscriptionTier}
                  onChange={(e) => setSubscriptionTier(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-[#F7F9FD] border border-[#E2E8F4] rounded-xl outline-none focus:border-[#1E56FF] font-medium cursor-pointer"
                  required
                >
                  <option value="all_access">💎 Pro — весь каталог 5–11 клас (890 грн/рік)</option>
                  <option value="single_grade">⭐ Pro — один клас (290 грн/рік)</option>
                  <option value="school">🏫 School B2B (3 900 грн/рік)</option>
                  <option value="free">🆓 Безкоштовний (Free)</option>
                </select>
              </div>

              {subscriptionTier === 'single_grade' && (
                <div>
                  <label className="block text-[10px] font-mono-math uppercase tracking-wider font-bold text-[#5E687E] mb-1">
                    Обраний клас *
                  </label>
                  <select
                    value={gradeAccessId}
                    onChange={(e) => setGradeAccessId(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-[#F7F9FD] border border-[#E2E8F4] rounded-xl outline-none focus:border-[#1E56FF] font-medium cursor-pointer"
                    required={subscriptionTier === 'single_grade'}
                  >
                    <option value="">-- Оберіть клас --</option>
                    {data.grades.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl font-display font-bold text-xs sm:text-sm bg-[#1E56FF] text-white hover:bg-[#0D33B3] transition-all disabled:opacity-50 shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Збереження...
                  </>
                ) : (
                  'Активувати доступ викладачу'
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-6">
            {data.requests.filter((r) => r.status === 'pending').length > 0 && (
              <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-black text-base text-amber-950 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    Нові заявки на оплату ({data.requests.filter((r) => r.status === 'pending').length})
                  </h3>
                  <span className="text-[10px] font-mono-math text-amber-800 font-bold">
                    Потребують перевірки коштів
                  </span>
                </div>

                <div className="space-y-3">
                  {data.requests
                    .filter((r) => r.status === 'pending')
                    .map((req) => (
                      <div
                        key={req.id}
                        className="bg-white border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-display font-bold text-xs text-[#0D1117]">
                              {req.full_name}
                            </span>
                            <span className="text-[10px] font-mono-math text-[#5E687E]">
                              ({req.email})
                            </span>
                          </div>
                          <div className="text-xs text-[#5E687E] flex items-center gap-2">
                            <span>Тариф: <strong>{req.subscription_tier}</strong></span>
                            {req.grades?.name && <span>({req.grades.name})</span>}
                            {req.phone_or_telegram && <span>• {req.phone_or_telegram}</span>}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSelectRequest(req)}
                          className="font-display font-bold text-xs px-3.5 py-2 rounded-xl bg-[#1E56FF] text-white hover:bg-[#0D33B3] transition-colors shrink-0 inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          Видати пароль
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="bg-white border border-[#E2E8F4] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <h3 className="font-display font-black text-lg text-[#0D1117]">
                Список активних викладачів
              </h3>

              {isLoading ? (
                <div className="py-12 flex items-center justify-center gap-2 text-xs font-mono-math text-[#5E687E]">
                  <Loader2 className="w-4 h-4 animate-spin text-[#1E56FF]" />
                  Завантаження...
                </div>
              ) : data.profiles.length > 0 ? (
                <div className="divide-y divide-[#F1F4FA]">
                  {data.profiles.map((prof) => (
                    <div
                      key={prof.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-xs text-[#0D1117]">
                            {prof.full_name || 'Без імені'}
                          </span>
                          {prof.role === 'admin' && (
                            <span className="text-[9px] font-mono-math bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded">
                              Адмін
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono-math text-[#5E687E] block">
                          {prof.email}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-[10px] font-mono-math font-bold px-2.5 py-1 rounded-lg ${
                            prof.subscription_tier === 'all_access'
                              ? 'bg-[#EFF4FF] text-[#1E56FF] border border-[#D5E2FF]'
                              : prof.subscription_tier === 'single_grade'
                              ? 'bg-emerald-50 text-[#00BA7C] border border-emerald-200'
                              : 'bg-[#F7F9FD] text-[#5E687E]'
                          }`}
                        >
                          {prof.subscription_tier === 'all_access'
                            ? '💎 Весь каталог 5–11'
                            : prof.subscription_tier === 'single_grade'
                            ? `⭐ ${prof.grades?.name || 'Один клас'}`
                            : 'Free'}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            setEmail(prof.email);
                            setFullName(prof.full_name || '');
                            setSubscriptionTier(prof.subscription_tier);
                            if (prof.grade_access_id) setGradeAccessId(prof.grade_access_id);
                            generatePassword();
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="text-xs font-display font-bold text-[#1E56FF] hover:underline cursor-pointer"
                        >
                          Змінити
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#5E687E] text-center py-8">
                  Викладачів поки що немає.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}