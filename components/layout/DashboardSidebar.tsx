import Link from 'next/link';

export default function DashboardSidebar({ storagePercent = 0 }: { storagePercent?: number }) {
    return (
        <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hidden lg:block">
            <nav className="flex flex-col gap-2">
                <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined">home</span>
                    <span className="font-medium">홈</span>
                </Link>
                <Link href="/dashboard/notes" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined">description</span>
                    <span className="font-medium">내 메모</span>
                </Link>
                <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined">settings</span>
                    <span className="font-medium">설정</span>
                </Link>
                <Link href="/dashboard/subscription" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined">card_membership</span>
                    <span className="font-medium">구독 관리</span>
                </Link>
            </nav>

            <div className="mt-auto pt-10 px-4">
                <div className="rounded-xl bg-gradient-to-br from-primary to-blue-600 p-4 text-white">
                    <p className="text-xs font-semibold uppercase tracking-wider opacity-80">보관 용량</p>
                    <p className="mt-1 text-lg font-bold">{storagePercent}% 사용 중</p>
                    <div className="mt-3 h-1.5 w-full rounded-full bg-white/30">
                        <div className="h-full rounded-full bg-white" style={{ width: `${storagePercent}%` }}></div>
                    </div>
                    <Link href="/dashboard/subscription" className="mt-4 flex w-full justify-center items-center rounded-lg bg-white py-2 text-sm font-bold text-primary hover:bg-slate-50">업그레이드</Link>
                </div>
            </div>
        </aside>
    );
}
