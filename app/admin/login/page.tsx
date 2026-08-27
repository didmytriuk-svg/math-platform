'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminLoginPage() {
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('Помилка Supabase Auth:', error);
        throw new Error(error.message); // Покажемо реальну системну помилку
      }

      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Помилка входу.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-volya-grid flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white border border-[#E2E8F4] rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-display font-bold text-[#5E687E] hover:text-[#1E56FF] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            На головну сайту
          </Link>
          <span className="text-[11px] font-mono-math font-semibold text-[#5E687E] uppercase tracking-wider">
            Безпека
          </span>
        </div>

        <div className="text-center pt-2">
          <div className="w-12 h-12 bg-[#EFF4FF] text-[#1E56FF] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#D5E2FF]">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-display font-black text-2xl text-[#0D1117]">
            Вхід до Вчительської
          </h1>
          <p className="text-xs text-[#5E687E] mt-1">
            Введіть облікові дані адміністратора Volya Academy
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
              Email адміністратора
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@volya.academy"
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
                Перевірка...
              </>
            ) : (
              'Увійти в кабінет'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}