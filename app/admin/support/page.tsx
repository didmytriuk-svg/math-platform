'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageSquareWarning, Trash2, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminSupportPage() {
  const supabase = createClient();
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error loading support messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [supabase]);

  const handleDelete = async (id: string) => {
    if (!confirm('Видалити це повідомлення?')) return;

    try {
      const { error } = await supabase
        .from('support_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      alert('Помилка видалення: ' + err.message);
    }
  };

  const toggleResolved = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('support_messages')
        .update({ is_resolved: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, is_resolved: !currentStatus } : m))
      );
    } catch (err: any) {
      alert('Помилка оновлення статусу: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-volya-grid py-10 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Навігація */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-display font-bold text-[#5E687E] hover:text-[#1E56FF] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад до адмін-панелі
          </Link>
          <span className="text-xs font-mono-math font-semibold text-[#1E56FF] bg-[#EFF4FF] border border-[#D5E2FF] px-3.5 py-1.5 rounded-xl">
            Повідомлення про помилки та підтримка ({messages.length})
          </span>
        </div>

        {/* Заголовок */}
        <div className="space-y-1">
          <h1 className="font-display font-black text-2xl sm:text-3xl text-[#0D1117]">
            Звернення від викладачів
          </h1>
          <p className="text-xs sm:text-sm text-[#5E687E]">
            Повідомлення та запити на допомогу, залишені через форму на сайті.
          </p>
        </div>

        {/* Список повідомлень */}
        {isLoading ? (
          <div className="py-24 flex items-center justify-center text-[#5E687E]">
            <Loader2 className="w-8 h-8 animate-spin text-[#1E56FF]" />
          </div>
        ) : messages.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`bg-white border rounded-3xl p-6 shadow-xs space-y-4 transition-all ${
                  msg.is_resolved ? 'border-emerald-200 bg-emerald-50/20 opacity-80' : 'border-[#E2E8F4]'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F4FA]">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-black text-base text-[#0D1117]">
                        {msg.name}
                      </h3>
                      {msg.is_resolved ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#00BA7C] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" /> Опрацьовано
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                          <Clock className="w-3 h-3" /> Нове
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-xs text-[#1E56FF]">
                      Контакт: <strong>{msg.contact}</strong>
                    </p>
                  </div>

                  <span className="text-xs font-mono text-[#5E687E]">
                    {new Date(msg.created_at).toLocaleString('uk-UA')}
                  </span>
                </div>

                <div className="bg-[#F7F9FD] border border-[#E2E8F4] rounded-2xl p-4 text-xs sm:text-sm text-[#0D1117] leading-relaxed whitespace-pre-wrap font-sans">
                  {msg.message}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => toggleResolved(msg.id, msg.is_resolved)}
                    className={`px-4 py-2 rounded-xl font-display font-bold text-xs transition-colors cursor-pointer ${
                      msg.is_resolved 
                        ? 'bg-white border border-[#E2E8F4] text-[#5E687E] hover:bg-[#F7F9FD]' 
                        : 'bg-[#00BA7C] text-white hover:bg-[#059669]'
                    }`}
                  >
                    {msg.is_resolved ? 'Позначити як не вирішене' : '✓ Позначити як опрацьоване'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(msg.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title="Видалити звернення"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#E2E8F4] rounded-3xl p-16 text-center space-y-3 max-w-md mx-auto">
            <MessageSquareWarning className="w-10 h-10 text-[#5E687E] mx-auto opacity-40" />
            <p className="font-display font-bold text-sm text-[#0D1117]">
              Повідомлень поки немає.
            </p>
            <p className="text-xs text-[#5E687E]">
              Коли викладачі надішлять запит через форму підтримки, він з'явиться тут.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}