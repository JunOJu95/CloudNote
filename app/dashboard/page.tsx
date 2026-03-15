import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

import SubscriptionInfo from '@/components/dashboard/SubscriptionInfo'

function formatBytes(bytes: number) {
    if (bytes === 0) return '0GB'
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + sizes[i]
}

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        // redirect to auth
        redirect('/auth')
    }

    const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()
    const { count: notesCount } = await supabase.from('notes').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    const { data: recentActivity } = await supabase.from('activity_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5)
    
    // Fetch active OR canceled subscription (the most recent one)
    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['active', 'canceled'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    const fullName = profile?.full_name || user.email?.split('@')[0] || '사용자'
    const planName = profile?.plan?.toLowerCase() === 'pro' ? 'Pro' : profile?.plan?.toLowerCase() === 'enterprise' ? 'Enterprise' : 'Free'

    // Usage limits
    const maxNotes = planName === 'Pro' ? 999999 : planName === 'Enterprise' ? 999999 : 5000
    const maxStorage = planName === 'Pro' ? 100 * 1024 ** 3 : planName === 'Enterprise' ? 1000 * 1024 ** 3 : 10 * 1024 ** 3 // in bytes
    const maxAi = planName === 'Pro' ? 500 : planName === 'Enterprise' ? 5000 : 100

    const currentNotes = notesCount || 0
    const currentStorage = profile?.storage_used || 0
    const currentAi = profile?.ai_summary_count || 0

    const notesPercent = Math.min(100, Math.round((currentNotes / maxNotes) * 100))
    const storagePercent = Math.min(100, Math.round((currentStorage / maxStorage) * 100))
    const aiPercent = Math.min(100, Math.round((currentAi / maxAi) * 100))

    const paymentDate = subscription?.current_period_end
        ? new Date(subscription.current_period_end).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
        : '없음'

    return (
        <div className="max-w-5xl mx-auto">
                        {/* Welcome Header */}
                        <section className="mb-10">
                            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">안녕하세요, {fullName}님! 👋</h1>
                            <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">현재 <span className="font-bold text-primary">{planName} 플랜</span>을 이용 중입니다. 모든 프리미엄 기능을 자유롭게 사용하세요.</p>
                        </section>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column: Subscription & Usage */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Subscription Info Card (Client Component) */}
                                <SubscriptionInfo 
                                    planName={planName}
                                    paymentDate={paymentDate}
                                    amount={subscription?.amount || null}
                                    isActive={subscription?.status === 'active' || subscription?.status === 'canceled'}
                                    isCanceled={subscription?.status === 'canceled'}
                                />

                                {/* Usage Progress Section */}
                                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                                    <h2 className="text-xl font-bold mb-6">이번 달 사용량</h2>
                                    <div className="space-y-6">
                                        {/* Notes count */}
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-primary text-sm">note_add</span> 메모 개수
                                                </span>
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{currentNotes.toLocaleString()} / {maxNotes === 999999 ? '무제한' : maxNotes.toLocaleString()}</span>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                                                <div className="h-full rounded-full bg-primary" style={{ width: `${notesPercent}%` }}></div>
                                            </div>
                                        </div>
                                        {/* Storage count */}
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-primary text-sm">database</span> 저장공간
                                                </span>
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{formatBytes(currentStorage)} / {formatBytes(maxStorage)}</span>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                                                <div className="h-full rounded-full bg-primary" style={{ width: `${storagePercent}%` }}></div>
                                            </div>
                                        </div>
                                        {/* AI count */}
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span> AI 요약 횟수
                                                </span>
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{currentAi.toLocaleString()} / {maxAi.toLocaleString()}</span>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                                                <div className="h-full rounded-full bg-primary" style={{ width: `${aiPercent}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Recent Activity */}
                            <div className="lg:col-span-1">
                                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm h-full">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold">최근 활동</h2>
                                        <button className="text-sm text-primary font-bold hover:underline">모두 보기</button>
                                    </div>
                                    <div className="space-y-6">
                                        {recentActivity && recentActivity.length > 0 ? (
                                            recentActivity.map((log: any) => (
                                                <div key={log.id} className="flex gap-4">
                                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                        <span className="material-symbols-outlined">
                                                            {log.action_type === 'edit' ? 'edit_note' :
                                                                log.action_type === 'create' ? 'add_circle' :
                                                                    log.action_type === 'ai_summary' ? 'auto_stories' : 'info'}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{log.description || '활동 내역이 없습니다.'}</p>
                                                        <p className="text-xs text-slate-500">
                                                            {new Date(log.created_at).toLocaleDateString('ko-KR')}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-slate-500 border border-dashed rounded-lg p-4 text-center">
                                                최근 활동이 없습니다.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
        </div>
    )
}
