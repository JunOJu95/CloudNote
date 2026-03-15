import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import PricingCard from '@/components/PricingCard';
import { TossPaymentButton } from '@/components/subscription/TossPaymentButton';

export default async function SubscriptionPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth')
    }

    // Real data could be fetched here to prepopulate plan states if needed

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
            <div className="layout-container flex h-full grow flex-col">
                <div className="px-4 md:px-20 lg:px-40 flex flex-1 justify-center py-5">
                    <div className="layout-content-container flex flex-col max-w-[960px] flex-1">


                        {/* Page Title */}
                        <div className="flex flex-wrap justify-between gap-3 p-6">
                            <p className="tracking-light text-[32px] font-bold leading-tight min-w-72">구독 플랜 선택</p>
                        </div>

                        {/* Pricing Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 py-3">
                            <PricingCard
                                planName="Free"
                                price="0원"
                                features={["기본 기능 이용", "1GB 저장공간"]}
                                buttonText="현재 플랜"
                                variant="dashboard"
                            />
                            <PricingCard
                                planName="Pro"
                                price="29,000원"
                                features={["모든 프리미엄 기능", "10GB 저장공간", "우선 고객 지원"]}
                                buttonText="Pro 선택됨"
                                isPopular={true}
                                popularLabel="추천"
                                variant="dashboard"
                            />
                            <PricingCard
                                planName="Enterprise"
                                price="99,000원"
                                features={["커스텀 API 연동", "무제한 저장공간", "전담 매니저 배정"]}
                                buttonText="문의하기"
                                variant="dashboard"
                            />
                        </div>

                        {/* Payment Summary & Selection Section */}
                        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-10 p-4">
                            {/* Order Summary */}
                            <div className="flex flex-col gap-4">
                                <h3 className="text-xl font-bold leading-tight tracking-[-0.015em] mb-2">주문 요약</h3>
                                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/50 p-6 flex flex-col gap-4">
                                    <div className="flex justify-between gap-x-6 py-1">
                                        <p className="text-slate-500 dark:text-slate-400 text-sm font-normal">선택한 플랜</p>
                                        <p className="font-bold text-sm text-right">Pro 플랜</p>
                                    </div>
                                    <div className="flex justify-between gap-x-6 py-1">
                                        <p className="text-slate-500 dark:text-slate-400 text-sm font-normal">결제 주기</p>
                                        <p className="font-medium text-sm text-right">매월 결제</p>
                                    </div>
                                    <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>
                                    <div className="flex justify-between gap-x-6 py-1">
                                        <p className="text-slate-900 dark:text-white font-bold">총 결제 금액 <span className="text-xs font-normal text-slate-500">(VAT 포함)</span></p>
                                        <p className="text-primary text-xl font-black text-right">31,900원</p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Methods */}
                            <div className="flex flex-col gap-4">
                                <h3 className="text-xl font-bold leading-tight tracking-[-0.015em] mb-2">결제 수단 선택</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="flex items-center justify-center lg:justify-start gap-3 p-4 rounded-xl border border-primary bg-primary/5 text-sm font-bold">
                                        <span className="material-symbols-outlined text-primary">credit_card</span>
                                        신용/체크카드
                                    </button>
                                    <button className="flex items-center justify-center lg:justify-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary transition-colors text-sm font-bold group">
                                        <div className="w-6 h-6 rounded bg-yellow-400 flex items-center justify-center text-[10px] text-black font-black">P</div>
                                        <span>카카오페이</span>
                                    </button>
                                    <button className="flex items-center justify-center lg:justify-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary transition-colors text-sm font-bold group">
                                        <div className="w-6 h-6 rounded bg-[#03C75A] flex items-center justify-center text-[10px] text-white font-black">N</div>
                                        <span>네이버페이</span>
                                    </button>
                                    <button className="flex items-center justify-center lg:justify-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary transition-colors text-sm font-bold group">
                                        <div className="w-6 h-6 rounded bg-[#0064FF] flex items-center justify-center text-[10px] text-white font-black">T</div>
                                        <span>토스페이</span>
                                    </button>
                                </div>
                                <TossPaymentButton
                                    amount={31900}
                                    orderName="Pro 플랜 월간 구독"
                                    customerKey={user.id}
                                    customerName={user.user_metadata?.name ?? user.email ?? '구독 사용자'}
                                    customerEmail={user.email}
                                />
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="mt-12 px-4 py-8 border-t border-slate-200 dark:border-slate-800">
                            <div className="flex flex-col gap-4 text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold mb-1">
                                    <span className="material-symbols-outlined text-sm">info</span>
                                    유의사항 및 환불 정책
                                </div>
                                <p>• 구독 서비스는 결제 즉시 활성화되며, 다음 결제 예정일에 자동으로 갱신됩니다.</p>
                                <p>• 결제 후 7일 이내, 서비스를 이용하지 않은 경우에 한해 전액 환불이 가능합니다. 단, 일부 기능을 이미 사용한 경우 이용 내역에 따라 부분 환불될 수 있습니다.</p>
                                <p>• 구독 취소는 설정 페이지에서 언제든지 가능하며, 취소 시 현재 남은 이용 기간까지는 Pro 기능을 계속 이용하실 수 있습니다.</p>
                                <p>• 부가세(VAT) 10%가 포함된 금액입니다.</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
