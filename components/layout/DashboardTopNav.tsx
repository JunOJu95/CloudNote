import Link from 'next/link'

type DashboardTopNavProps = {
  fullName: string
  email?: string
}

export default function DashboardTopNav({ fullName, email }: DashboardTopNavProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 md:px-10">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Private</p>
          <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">CloudNote Workspace</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-bold text-slate-900 dark:text-white">{fullName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{email ?? ''}</p>
          </div>
          <Link
            href="/dashboard/subscription"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary/90"
          >
            플랜 관리
          </Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              로그아웃
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
