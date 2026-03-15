import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TossPaymentButton } from '@/components/subscription/TossPaymentButton'

const requestPayment = vi.fn()

vi.mock('@/utils/tosspayments', () => ({
  buildSubscriptionRedirectUrls: vi.fn(() => ({
    successUrl: 'https://example.com/dashboard/subscription/done',
    failUrl: 'https://example.com/dashboard/subscription/fail',
  })),
  generateSubscriptionOrderId: vi.fn(() => 'sub_order_123456'),
  loadTossPaymentInstance: vi.fn(async () => ({
    requestPayment,
  })),
}))

describe('TossPaymentButton', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_TOSS_CLIENT_KEY', 'test_ck_dummy')
    requestPayment.mockReset()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('requests CARD payment with TossPayments v2 payload on click', async () => {
    render(
      <TossPaymentButton
        amount={31900}
        orderName="Pro 플랜 월간 구독"
        customerName="테스트 사용자"
        customerEmail="test@example.com"
        customerKey="user-123"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '31,900원 결제하기' }))

    await waitFor(() => {
      expect(requestPayment).toHaveBeenCalledTimes(1)
    })

    expect(requestPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'CARD',
        orderId: 'sub_order_123456',
        orderName: 'Pro 플랜 월간 구독',
        successUrl: 'https://example.com/dashboard/subscription/done',
        failUrl: 'https://example.com/dashboard/subscription/fail',
        amount: {
          currency: 'KRW',
          value: 31900,
        },
      }),
    )
  })
})
