import DashboardSidebar from '@/components/layout/DashboardSidebar'
import DashboardTopNav from '@/components/layout/DashboardTopNav'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

function getStorageLimitByPlan(plan: string | undefined) {
  const normalizedPlan = plan?.toLowerCase()

  if (normalizedPlan === 'pro') return 100 * 1024 ** 3
  if (normalizedPlan === 'enterprise') return 1000 * 1024 ** 3
  return 10 * 1024 ** 3
}

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, storage_used, plan')
    .eq('id', user.id)
    .single()

  const fullName = profile?.full_name || user.email?.split('@')[0] || '사용자'
  const maxStorage = getStorageLimitByPlan(profile?.plan)
  const currentStorage = profile?.storage_used ?? 0
  const storagePercent = Math.min(100, Math.round((currentStorage / maxStorage) * 100))

  return (
    <div className="font-display">
      <div className="flex min-h-screen bg-background-light dark:bg-background-dark">
        <DashboardSidebar storagePercent={storagePercent} />
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardTopNav fullName={fullName} email={user.email} />
          <main className="flex-1 overflow-y-auto p-6 md:p-10">{children}</main>
        </div>
      </div>
    </div>
  )
}
