'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Loader2, AlertCircle, Lock, Mail, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
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

    try {
      const cleanEmail = email.trim().toLowerCase();

      // 1. Авторизація
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Невірний email або пароль. Перевірте введені дані.');
        }
        throw error;
      }

      if (!data.user) {
        throw new Error('Не вдалося отримати дані користувача');
      }

      // 2. Отримуємо профіль з бази
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      // 3. Прямий перехід із жорстким оновленням стану
      if (profile?.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/catalog';
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Помилка авторизації');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 bg-volya-grid">
      <div className="max-w-md w-full bg-white border border-[#E2E8F4] rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-[#1E56FF] text-white flex items-center justify-center mx-auto font-display font-black text-sm shadow-xs">
            V
          </div>
          <h1 className="font-display font-black text-2xl text-[#0D1117]">
            Вчительська
          </h1>
          <p className="text-xs text-[#5E687E]">
            Єдиний вхід для викладачів та адміністратора платформи
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono-math uppercase tracking-wider font-bold text-[#5E687E] mb-1.5">
              Електронна пошта (Email)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@school.edu.ua або admin@..."
                className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 bg-[#F7F9FD] border border-[#E2E8F4] rounded-xl outline-none focus:border-[#1E56FF] focus:bg-white transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono-math uppercase tracking-wider font-bold text-[#5E687E] mb-1.5">
              Пароль
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введіть ваш пароль"
                className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 bg-[#F7F9FD] border border-[#E2E8F4] rounded-xl outline-none focus:border-[#1E56FF] focus:bg-white transition"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl font-display font-bold text-xs sm:text-sm text-center transition-all bg-[#1E56FF] text-white hover:bg-[#0D33B3] disabled:opacity-50 shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Вхід...
              </>
            ) : (
              <>
                <span>Увійти</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-[#F1F4FA] text-center space-y-2">
          <p className="text-xs text-[#5E687E]">
            Ще не маєте доступу?{' '}
            <Link href="/pricing" className="font-bold text-[#1E56FF] hover:underline inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Оберіть тариф
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}