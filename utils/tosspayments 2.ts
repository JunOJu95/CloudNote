const TOSS_SCRIPT_ID = 'tosspayments-sdk-v2'
const TOSS_SCRIPT_SRC = 'https://js.tosspayments.com/v2/standard'

type TossPaymentAmount = {
  currency: 'KRW'
  value: number
}

type TossPaymentRequest = {
  method: 'CARD'
  amount: TossPaymentAmount
  orderId: string
  orderName: string
  successUrl: string
  failUrl: string
  customerName?: string
  customerEmail?: string
  customerMobilePhone?: string
  card?: {
    useEscrow?: boolean
    useCardPoint?: boolean
    useAppCardOnly?: boolean
  }
}

type TossPayment = {
  requestPayment: (paymentRequest: TossPaymentRequest) => Promise<void>
}

type TossPaymentsFactory = {
  (clientKey: string): {
    payment: (params: { customerKey: string }) => TossPayment
  }
  ANONYMOUS?: string
}

declare global {
  interface Window {
    TossPayments?: TossPaymentsFactory
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(TOSS_SCRIPT_ID) as HTMLScriptElement | null
    if (existing) {
      if (window.TossPayments) {
        resolve()
        return
      }

      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('TossPayments SDK 로드 실패')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.id = TOSS_SCRIPT_ID
    script.src = src
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('TossPayments SDK 로드 실패'))
    document.head.appendChild(script)
  })
}

export function generateSubscriptionOrderId(): string {
  return `sub_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`
}

export function buildSubscriptionRedirectUrls(origin: string) {
  return {
    successUrl: `${origin}/dashboard/subscription/done`,
    failUrl: `${origin}/dashboard/subscription/fail`,
  }
}

export async function loadTossPaymentInstance(clientKey: string, customerKey: string): Promise<TossPayment> {
  await loadScript(TOSS_SCRIPT_SRC)

  if (!window.TossPayments) {
    throw new Error('TossPayments SDK를 초기화할 수 없습니다.')
  }

  const tossPayments = window.TossPayments(clientKey)
  return tossPayments.payment({ customerKey })
}

export type { TossPaymentRequest, TossPayment }
