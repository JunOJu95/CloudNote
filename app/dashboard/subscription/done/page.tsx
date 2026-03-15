'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { issueBillingKey, processBillingPayment } from '@/utils/billing-actions'
import { createClient } from '@/utils/supabase/client'

export default function SubscriptionDonePage() {
    const searchParams = useSearchParams()
    const [status, setStatus] = useState<'activating' | 'success' | 'error'>('activating')
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const router = useRouter()
    const processed = useRef(false)

    useEffect(() => {
        if (processed.current) return

        const customerKey = searchParams.get('customerKey')
        const authKey = searchParams.get('authKey')
        
        if (!customerKey || !authKey) {
            if (!customerKey && !authKey) {
                setStatus('error')
                setErrorMessage('잘못된 접근입니다.')
            }
            return
        }

        processed.current = true
        
        const activate = async () => {
            try {
                // Billing mode
                const issueRes = await issueBillingKey(customerKey, authKey)
                if (!issueRes.success || !issueRes.billingKey) {
                    setStatus('error')
                    setErrorMessage(issueRes.error || '빌링키 발급 중 오류가 발생했습니다.')
                    return
                }

                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()
                
                if (!user) {
                    setStatus('error')
                    setErrorMessage('로그인이 필요합니다.')
                    return
                }

                const chargeRes = await processBillingPayment(
                    issueRes.billingKey, 
                    customerKey, 
                    31900,
                    user.id,
                    issueRes.cardCompany,
                    issueRes.cardNumber,
                    true // isInitial
                )
                
                if (chargeRes.success) {
                    setStatus('success')
                    router.refresh()
                } else {
                    setStatus('error')
                    setErrorMessage(chargeRes.error || '첫 달 결제 중 오류가 발생했습니다.')
                }
            } catch (err: any) {
                setStatus('error')
                setErrorMessage(err.message || '요청 처리 중 오류가 발생했습니다.')
            }
        }
        
        activate()
    }, [searchParams, router])

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col w-full">
            <div className="flex-1 flex items-center justify-center p-4 md:p-8">
                <div className="max-w-[520px] w-full bg-white dark:bg-slate-900 rounded-xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">

                    <div className="p-8 text-center border-b border-slate-100 dark:border-slate-800">
                        {status === 'activating' && (
                            <div className="mb-6 flex flex-col items-center justify-center gap-4">
                                <span className="material-symbols-outlined text-primary text-5xl animate-spin">refresh</span>
                                <h1 className="text-2xl font-bold mb-2">결제 처리 중...</h1>
                                <p className="text-slate-500 font-medium">플랜 권한을 활성화하고 있습니다. 잠시만 기다려주세요.</p>
                            </div>
                        )}
                        {status === 'success' && (
                            <>
                                <div className="mb-6 flex justify-center">
                                    <div className="w-20 h-20 bg-green-500/10 dark:bg-green-400/10 rounded-full flex items-center justify-center">
                                        <span className="material-symbols-outlined text-green-500 text-5xl">check_circle</span>
                                    </div>
                                </div>
                                <h1 className="text-2xl font-bold mb-2">결제가 완료되었습니다!</h1>
                                <p className="text-primary font-medium">Pro 플랜이 활성화되었습니다</p>
                            </>
                        )}
                        {status === 'error' && (
                            <>
                                <div className="mb-6 flex justify-center">
                                    <div className="w-20 h-20 bg-red-500/10 dark:bg-red-400/10 rounded-full flex items-center justify-center">
                                        <span className="material-symbols-outlined text-red-500 text-5xl">error</span>
                                    </div>
                                </div>
                                <h1 className="text-2xl font-bold mb-2">문제가 발생했습니다.</h1>
                                <p className="text-red-500 font-medium">{errorMessage}</p>
                            </>
                        )}
                    </div>

                    {status === 'success' && (
                        <div className="p-8 space-y-4">
                            <div className="flex justify-between items-center py-1">
                                <span className="text-slate-500 dark:text-slate-400 text-sm">주문번호</span>
                                <span className="font-medium text-sm">20231027-0001</span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-slate-500 dark:text-slate-400 text-sm">결제 금액</span>
                                <span className="font-bold text-sm">₩31,900</span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-slate-500 dark:text-slate-400 text-sm">결제 수단</span>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-slate-400 text-base">credit_card</span>
                                    <span className="font-medium text-sm">신용카드 (테스트)</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-slate-500 dark:text-slate-400 text-sm">다음 결제일</span>
                                <span className="font-medium text-sm">{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR')}</span>
                            </div>
                        </div>
                    )}

                    <div className="px-8 pb-8 pt-4 space-y-3">
                        <Link href="/dashboard" className={`w-full ${status === 'activating' ? 'opacity-50 pointer-events-none' : ''} bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2`}>
                            <span className="material-symbols-outlined text-xl">dashboard</span>
                            <span>대시보드로 이동</span>
                        </Link>
                        {status === 'success' && (
                            <button className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-xl">receipt_long</span>
                                <span>영수증 다운로드</span>
                            </button>
                        )}
                    </div>

                    <div className="px-8 pb-8 text-center space-y-4">
                        {status === 'success' && (
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                                    결제 영수증이 등록하신 이메일로 발송되었습니다.<br />
                                    메일을 받지 못하셨다면 스팸 메일함을 확인해주세요.
                                </p>
                            </div>
                        )}
                        <div className="flex flex-col items-center gap-1">
                            <p className="text-slate-400 dark:text-slate-500 text-[11px]">문제가 발생했나요?</p>
                            <a className="text-primary hover:underline text-xs font-medium" href="#">고객센터 문의하기</a>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
