import { describe, expect, it } from 'vitest'
import { buildSubscriptionRedirectUrls, generateSubscriptionOrderId } from '@/utils/tosspayments'

describe('tosspayments utils', () => {
  it('generates an order id within TossPayments length/charset constraints', () => {
    const orderId = generateSubscriptionOrderId()

    expect(orderId.length).toBeGreaterThanOrEqual(6)
    expect(orderId.length).toBeLessThanOrEqual(64)
    expect(orderId).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('builds absolute success/fail redirect urls for subscription checkout', () => {
    const urls = buildSubscriptionRedirectUrls('https://example.com')

    expect(urls.successUrl).toBe('https://example.com/dashboard/subscription/done')
    expect(urls.failUrl).toBe('https://example.com/dashboard/subscription/fail')
  })
})
