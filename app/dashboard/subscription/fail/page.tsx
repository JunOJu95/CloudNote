type SubscriptionFailPageProps = {
  searchParams?: Promise<{
    code?: string
    message?: string
    orderId?: string
  }>
}

import { updatePaymentLogStatus } from '@/utils/payment-log-actions'

export default async function SubscriptionFailPage({ searchParams }: SubscriptionFailPageProps) {
  const params = (await searchParams) ?? {}

  const code = params.code ?? 'UNKNOWN_ERROR'
  const message = params.message ?? '결제가 취소되었거나 처리 중 오류가 발생했습니다.'
  const orderId = params.orderId ?? '-'

  if (orderId && orderId !== '-') {
    const status = code === 'PAY_PROCESS_CANCELED' || code === 'PAY_PROCESS_ABORTED' ? 'CANCELED' : 'FAILED'
    await updatePaymentLogStatus(orderId, status, `${code}: ${decodeURIComponent(message)}`)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-10 flex items-center justify-center">
      <div className="max-w-[560px] w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">결제를 완료하지 못했습니다.</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">실패 사유를 확인하고 다시 시도해 주세요.</p>

        <div className="mt-6 space-y-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 p-4 text-sm">
          <p><span className="font-semibold">에러 코드:</span> {code}</p>
          <p><span className="font-semibold">메시지:</span> {decodeURIComponent(message)}</p>
          <p><span className="font-semibold">주문번호:</span> {orderId}</p>
        </div>

        <a
          href="/dashboard/subscription"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold text-white"
        >
          결제 페이지로 돌아가기
        </a>
      </div>
    </div>
  )
}
