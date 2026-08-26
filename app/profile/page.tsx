'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserSubscription } from '@/types/database'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function getUserData() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      setUser(user)

      // Отримуємо підписку викладача з бази даних
      const { data: subData } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (subData) {
        setSubscription(subData)
      }

      setLoading(false)
    }

    getUserData()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Завантаження кабінету...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Шапка кабінету */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Особистий кабінет викладача</h1>
            <p className="text-sm text-gray-600 mt-1">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
          >
            Вийти
          </button>
        </div>

        {/* Статус підписки та тарифу */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Ваш тариф та доступ</h2>
          
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Поточний статус:</p>
              <p className="text-md font-semibold text-gray-900 mt-0.5">
                {subscription ? (
                  <span>Тариф: <strong className="uppercase">{subscription.tier}</strong></span>
                ) : (
                  <span className="text-amber-600">Безкоштовний доступ (Free)</span>
                )}
              </p>
            </div>
            <Link
              href="/catalog"
              className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition"
            >
              Перейти до каталогу
            </Link>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Щоб змінити тариф або активувати Pro-доступ, зверніться до адміністратора платформи згідно з обраним планом.
          </p>
        </div>
      </div>
    </div>
  )
}
