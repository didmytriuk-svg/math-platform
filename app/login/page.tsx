'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowLeft, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function TeacherLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      // Якщо це головний адміністратор, пускаємо через Supabase Auth або напряму в адмінку
      if (cleanEmail === 'didmytriuk@gmail.com' || cleanEmail === 'dasha.hfun@gmail.com') {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password.trim(),
        });

        if (authError) {
          throw new Error('Невірний пароль адміністратора.');
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem('volya_user_email', cleanEmail);
          localStorage.setItem('volya_role', 'admin');
        }

        router.push('/admin');
        router.refresh();
        return;
      }

      // Для звичайних викладачів перевіряємо таблицю підписок
      const { data: subData, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .ilike('email', cleanEmail)
        .eq('is_active', true)
        .maybeSingle();

      if (subError || !subData) {
        throw new Error('Користувача з такою поштою не знайдено або доступ не активний.');
      }

      if (subData.temp_password && subData.temp_password !== password.trim()) {
        throw new Error('Невірний пароль. Перевірте дані, які вам надав адміністратор.');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('volya_user_email', cleanEmail);
        localStorage.setItem('volya_role', 'teacher');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Сталася помилка при вході.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-volya-grid flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white border border-[#E2E8F4] rounded-3xl p-8 sm:p-10 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-display font-bold text-[#5E687E] hover:text-[#1E56FF] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            На головну сайту
          </Link>
          <span className="text-[11px] font-mono-math font-semibold text-[#1E56FF] bg-[#EFF4FF] border border-[#D5E2FF] px-2.5 py-1 rounded-lg uppercase tracking-wider">
            Авторизація
          </span>
        </div>

        <div className="text-center pt-2">
          <div className="w-12 h-12 bg-[#EFF4FF] text-[#1E56FF] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#D5E2FF]">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="font-display font-black text-2xl text-[#0D1117]">
            Вхід на платформу
          </h1>
          <p className="text-xs text-[#5E687E] mt-1">
            Введіть вашу електронну пошту та пароль
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block font-display font-bold text-[11px] text-[#0D1117] uppercase tracking-wider mb-2">
              Електронна пошта (Email)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              className="w-full text-sm bg-[#F7F9FD] border border-[#E2E8F4] text-[#0D1117] rounded-xl px-4 py-3 outline-none focus:border-[#1E56FF] focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block font-display font-bold text-[11px] text-[#0D1117] uppercase tracking-wider mb-2">
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full text-sm bg-[#F7F9FD] border border-[#E2E8F4] text-[#0D1117] rounded-xl px-4 py-3 outline-none focus:border-[#1E56FF] focus:bg-white transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full font-display font-bold text-sm py-3.5 rounded-xl bg-[#1E56FF] text-white hover:bg-[#0D33B3] disabled:opacity-50 transition-all shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Вхід...
              </>
            ) : (
              'Увійти →'
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-[#F1F4FA] text-center">
          <p className="text-xs text-[#5E687E]">
            Потрібен Pro-доступ?{' '}
            <Link href="/pricing" className="text-[#1E56FF] font-bold hover:underline">
              Обрати тариф
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}