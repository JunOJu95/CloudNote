'use client'

import { useState } from 'react'
import { cancelSubscription } from '@/utils/billing-actions'
import { useRouter } from 'next/navigation'

interface SubscriptionInfoProps {
    planName: string
    paymentDate: string
    amount: number | null
    isActive: boolean
    isCanceled?: boolean
}

export default function SubscriptionInfo({ 
    planName, 
    paymentDate, 
    amount, 
    isActive,
    isCanceled = false
}: SubscriptionInfoProps) {
    const [isCanceling, setIsCanceling] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const router = useRouter()

    const handleCancel = async () => {
        setIsCanceling(true)
        try {
            const res = await cancelSubscription()
            if (res.success) {
                alert('구독 취소가 완료되었습니다. 다음 결제일 전까지는 서비스를 계속 이용하실 수 있습니다.')
                setShowConfirm(false)
                router.refresh()
            } else {
                alert(res.error || '구독 취소 중 오류가 발생했습니다.')
            }
        } catch (error) {
            alert('요청 처리 중 오류가 발생했습니다.')
        } finally {
            setIsCanceling(false)
        }
    }

    return (
        <>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">구독 정보</h2>
                    {isActive ? (
                        <span className={`rounded-full ${isCanceled ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'} px-3 py-1 text-xs font-bold uppercase tracking-wide`}>
                            {isCanceled ? '해지 예정' : '활성 상태'}
                        </span>
                    ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 uppercase tracking-wide">무료 이용중</span>
                    )}
                </div>
                <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-1 space-y-3 w-full">
                        <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                            <span className="text-slate-500">현재 플랜</span>
                            <span className="font-bold text-slate-900 dark:text-white">{planName} 플랜</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                            <span className="text-slate-500">{isCanceled ? '이용 종료일' : '다음 결제일'}</span>
                            <span className="font-medium">{paymentDate}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                            <span className="text-slate-500">결제 금액</span>
                            <span className="font-medium">{amount ? `₩${amount.toLocaleString()} / 월` : '무료'}</span>
                        </div>
                        <div className="pt-4 flex gap-3">
                            {isActive && !isCanceled && (
                                <>
                                    <button className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-bold text-white hover:bg-blue-600 transition-colors">플랜 변경</button>
                                    <button 
                                        onClick={() => setShowConfirm(true)}
                                        className="flex-1 rounded-lg bg-slate-100 dark:bg-slate-800 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        구독 취소
                                    </button>
                                </>
                            )}
                            {(!isActive || isCanceled) && (
                                <button 
                                    onClick={() => router.push('/dashboard/subscription')}
                                    className="w-full rounded-lg bg-primary py-2.5 text-sm font-bold text-white hover:bg-blue-600 transition-colors"
                                >
                                    {isCanceled ? '구독 다시 시작하기' : 'Pro 플랜으로 업그레이드'}
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="w-full md:w-48 h-32 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-700 overflow-hidden relative" style={{ backgroundImage: 'linear-gradient(135deg, #007bff22 0%, #007bff00 100%)' }}>
                        <span className="material-symbols-outlined text-4xl text-primary/40">credit_card</span>
                        {isCanceled && (
                            <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center">
                                <span className="material-symbols-outlined text-amber-500 font-bold">event_busy</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                                    <span className="material-symbols-outlined">warning</span>
                                </div>
                                <h3 className="text-xl font-bold">정말 구독을 취소하시겠습니까?</h3>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                                구독을 취소하시면 다음 결제일부터는 서비스 이용이 어려워집니다. <br />
                                하지만 **이번 결제 주기인 {paymentDate}까지는** 모든 프리미엄 기능을 중단 없이 계속 사용하실 수 있습니다.
                            </p>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setShowConfirm(false)}
                                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    유지하기
                                </button>
                                <button 
                                    onClick={handleCancel}
                                    disabled={isCanceling}
                                    className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-colors disabled:opacity-50"
                                >
                                    {isCanceling ? '처리 중...' : '구독 취소'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
