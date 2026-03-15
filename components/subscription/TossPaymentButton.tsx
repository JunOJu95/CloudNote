'use client'

import { useState } from 'react'
import {
  buildSubscriptionRedirectUrls,
  generateSubscriptionOrderId,
  loadTossPaymentInstance,
} from '@/utils/tosspayments'
import { createPaymentLog } from '@/utils/payment-log-actions'

type TossPaymentButtonProps = {
  amount: number
  orderName: string
  customerKey: string
  customerName?: string
  customerEmail?: string
  customerMobilePhone?: string
  testRedirectUrl?: string
}

export function TossPaymentButton({
  amount,
  orderName,
  customerKey,
  customerName,
  customerEmail,
  customerMobilePhone,
  testRedirectUrl,
}: TossPaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const formattedAmount = `${amount.toLocaleString('ko-KR')}원 결제하기`

  const handlePayment = async () => {
    if (testRedirectUrl) {
      window.location.assign(testRedirectUrl)
      return
    }

    const tossClientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY

    if (!tossClientKey) {
      setErrorMessage('NEXT_PUBLIC_TOSS_CLIENT_KEY가 설정되지 않았습니다.')
      return
    }

    setErrorMessage(null)
    setIsLoading(true)

    try {
      const payment = await loadTossPaymentInstance(tossClientKey, customerKey)
      const { successUrl, failUrl } = buildSubscriptionRedirectUrls(window.location.origin)
      const orderId = generateSubscriptionOrderId()

      // Log pending status first
      const logResult = await createPaymentLog(orderId, amount)
      if (!logResult.success) {
        setErrorMessage('결제 시스템 초기화에 실패했습니다. 다시 시도해 주세요.')
        setIsLoading(false)
        return
      }

      await payment.requestBillingAuth({
        method: 'CARD', // 자동결제(빌링)는 카드만 지원
        successUrl,
        failUrl,
        customerEmail,
        customerName,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : '결제 요청 중 오류가 발생했습니다.'
      setErrorMessage(message)
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={handlePayment}
        disabled={isLoading}
        className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-4 bg-primary text-white text-lg font-bold leading-normal shadow-lg shadow-primary/20 hover:brightness-110 transition-all disabled:cursor-not-allowed disabled:opacity-70"
      >
        <span>{isLoading ? '결제창 여는 중...' : formattedAmount}</span>
      </button>
      {errorMessage && <p className="mt-3 text-sm text-red-600">{errorMessage}</p>}
    </div>
  )
}
