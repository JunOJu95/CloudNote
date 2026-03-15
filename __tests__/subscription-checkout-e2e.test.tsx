import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SubscriptionPage from '../app/dashboard/subscription/page'

const requestPayment = vi.fn()

vi.mock('@/utils/tosspayments', () => ({
  buildSubscriptionRedirectUrls: vi.fn(() => ({
    successUrl: 'https://example.com/dashboard/subscription/done',
    failUrl: 'https://example.com/dashboard/subscription/fail',
  })),
  generateSubscriptionOrderId: vi.fn(() => 'sub_order_abcdef'),
  loadTossPaymentInstance: vi.fn(async () => ({ requestPayment })),
}))

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      }),
    },
  })),
}))

describe('Subscription checkout flow (E2E-style)', () => {
  const originalLocation = window.location

  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_TOSS_CLIENT_KEY', 'test_ck_dummy')
    requestPayment.mockReset()
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        ...originalLocation,
        assign: vi.fn(),
      },
    })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    })
  })

  it('redirects to done page when user clicks pay in test mode', async () => {
    const jsx = await SubscriptionPage()
    render(jsx)

    fireEvent.click(screen.getByRole('button', { name: '31,900원 결제하기' }))

    await waitFor(() => {
      expect(window.location.assign).toHaveBeenCalledWith('/dashboard/subscription/done')
    })

    expect(screen.getByText('결제 수단 선택')).toBeInTheDocument()
  })
})
