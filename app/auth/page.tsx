'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function AuthPage() {
    const [mode, setMode] = useState<'login' | 'signup'>('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)

    const supabase = createClient()

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                })
                if (error) throw error
                alert('회원가입 확인 메일이 발송되었습니다.')
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                window.location.href = '/dashboard'
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSocialLogin = async (provider: 'google' | 'kakao') => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            })
            if (error) throw error
        } catch (err: any) {
            alert(err.message)
        }
    }

    return (
        <div className="flex min-h-screen w-full flex-col lg:flex-row overflow-hidden">
            {/* Left Section: Brand & Hero */}
            <div className="relative hidden w-1/2 flex-col justify-center bg-primary p-12 lg:flex">
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAaaZjEBIp6tlqJBCTXK5s_aoy4DT3F5waSBrIDZle2xjix_a7vSqN1xB4De4fgRD0lEEotgXbmofPqSx1at6D8ewa67t0BZB8mAcNlYJVwoxrc00CDasyAo-FZ5Hx2qTj4V8k78XJhDSrEVfsl5tE65VliarQSDfPHJzo0h4NbIO44Sb9hVKE8sY9uAdWNw88BHKuOBm_7ZASO6146gi9lsKKVhtlkkY3cgzGtlM5ZqH-LsElAxuHZ4u01b8K3RCkWikD1pmcD7-o')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                ></div>
                <div className="relative z-10 flex flex-col gap-6 text-white">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-4xl">cloud</span>
                        <span className="text-2xl font-bold tracking-tight">CloudNote</span>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h1 className="text-5xl font-black leading-tight tracking-tight">
                            생각을 정리하는<br />새로운 방법
                        </h1>
                        <p className="text-xl font-medium opacity-90">
                            10만 명의 사용자가 선택한 스마트 노트 앱<br />CloudNote와 함께 지금 시작하세요.
                        </p>
                    </div>
                    <div className="mt-8 flex gap-4">
                        <div className="flex -space-x-3 overflow-hidden">
                            <img alt="User 1" className="inline-block h-10 w-10 rounded-full ring-2 ring-primary" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCU0f3-0o7JoTO64IKvUyq_-KZuBE9u89ERjPQFpmXDlYNy_kVS_nWo5X_G-Wy7doLJXZol6X_VhDlzmYqq_LwT7nYcnsvC_6Utv6n4NG-ckNDd3E4fgPzMcjOeFYrLbjOcuMTfQPvydG0mjkBkoxitTbRtymhqv_q9w953RRbmeGFl0RpN8eRo4oiaVQpyfZFAHLjIBLXovedWKlR4UFUEwmywwk3s0j4hDiYI4ZPrCYpzSOkJbvHPej7-FwJTVSfB60mG1mxW5hM" />
                            <img alt="User 2" className="inline-block h-10 w-10 rounded-full ring-2 ring-primary" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAH3dW0AnaJ_z6PkW_hqr2c3wlW6IvMYwdfGADbxL5dorUPh7939jCVgDAFYUVTjBDDxlivQ58KGfzT7Z7gKPAP6rReqwnBo_tJYTJUnNX8JVWDPksuBHjBZrYlqFtasRyokKgllbmyZ_Nipg_cJCKt1fPS5HW78O7aLe0U2nATokvCKoUn5FVxdr1EtL1_gCpzHsNvohKg_yCFCStskLiXz3s_zRPgDH-S1U41f6jP0Q9w424SbeHVwuvc1hMEJhOp-wTJSPYUToE" />
                            <img alt="User 3" className="inline-block h-10 w-10 rounded-full ring-2 ring-primary" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKvCf5PJlabRrF9X3ZRqcE8MPBYSrPU1S4Cu_sCu2BNPZ_zPUB9ZnBh2bLrx93JSiNz0D6bHCIqOwMwq4iwkynf_2ossJtDPWv43Di-lFEDcaUocK5eKuiT26lSJaM5g8cGeCOjWp5_ic-FsDrwniRClQHI58iPsW0r1ghzVNsFphE2nErnnopZocmBMdCasvncMLnQSjnFnoqO7enOGqlx7RAxFrpd91y8YDjYWL8dQgIod9NPuuBUrCjYASl1mHvSB-jtegqYAU" />
                        </div>
                        <p className="text-sm self-center font-medium">지금 이 순간에도 수많은 노트가 생성되고 있습니다.</p>
                    </div>
                </div>
            </div>

            {/* Right Section: Form */}
            <div className="flex w-full flex-col justify-center bg-white dark:bg-background-dark px-6 py-12 lg:w-1/2 lg:px-20 xl:px-32">
                <div className="mx-auto w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="mb-10 flex items-center gap-2 lg:hidden">
                        <span className="material-symbols-outlined text-3xl text-primary">cloud</span>
                        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">CloudNote</span>
                    </div>

                    {/* Tabs */}
                    <div className="mb-8 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex gap-8">
                            <button
                                onClick={() => setMode('login')}
                                className={`border-b-2 pb-4 text-sm font-bold transition-colors ${mode === 'login' ? 'border-primary text-slate-900 dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                            >
                                로그인
                            </button>
                            <button
                                onClick={() => setMode('signup')}
                                className={`border-b-2 pb-4 text-sm font-bold transition-colors ${mode === 'signup' ? 'border-primary text-slate-900 dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                            >
                                회원가입
                            </button>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="flex flex-col gap-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {mode === 'login' ? '반가워요! 다시 오셨군요.' : 'CloudNote에 오신 것을 환영합니다.'}
                            </h2>
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                {mode === 'login' ? '서비스를 이용하려면 계정에 로그인하세요.' : '계정을 생성하고 스마트한 노트 작성을 시작하세요.'}
                            </p>
                        </div>

                        <form onSubmit={handleAuth} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">이메일 주소</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                                    <input
                                        required
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white outline-none"
                                        placeholder="example@cloudnote.com"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">비밀번호</label>
                                    {mode === 'login' && (
                                        <a className="text-xs font-bold text-primary hover:underline" href="#">비밀번호를 잊으셨나요?</a>
                                    )}
                                </div>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                                    <input
                                        required
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-12 text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white outline-none"
                                        placeholder="비밀번호를 입력하세요"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                    </button>
                                </div>
                            </div>

                            {error && <p className="text-xs text-red-500">{error}</p>}

                            <div className="flex items-center justify-between">
                                <label className="flex cursor-pointer items-center gap-2">
                                    <input className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" type="checkbox" />
                                    <span className="text-sm text-slate-600 dark:text-slate-400">로그인 상태 유지</span>
                                </label>
                            </div>

                            <button
                                disabled={loading}
                                className="mt-2 flex w-full items-center justify-center rounded-lg bg-primary py-3.5 text-base font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                                type="submit"
                            >
                                {loading ? '처리 중...' : mode === 'login' ? '로그인하기' : '가입하기'}
                            </button>
                        </form>

                        {/* Social Login */}
                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-slate-500 dark:bg-background-dark dark:text-slate-400">
                                    또는 다음 계정으로 {mode === 'login' ? '로그인' : '가입'}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleSocialLogin('google')}
                                className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"></path>
                                </svg>
                                구글
                            </button>
                            <button
                                onClick={() => handleSocialLogin('kakao')}
                                className="flex items-center justify-center gap-2 rounded-lg bg-[#FEE500] py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-[#FADA0A]"
                            >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 3c-4.97 0-9 3.11-9 6.95 0 2.54 1.74 4.76 4.38 5.96l-1.12 4.1c-.04.14.01.3.13.38.05.03.11.05.17.05.08 0 .15-.03.21-.08l4.82-3.2c.13.01.27.02.41.02 4.97 0 9-3.11 9-6.95S16.97 3 12 3z"></path>
                                </svg>
                                카카오
                            </button>
                        </div>

                        <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                            가입 시 CloudNote의 <a className="underline" href="#">이용약관</a> 및 <a className="underline" href="#">개인정보처리방침</a>에 동의하게 됩니다.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
