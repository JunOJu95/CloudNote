import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import SubscriptionPage from '../app/dashboard/subscription/page'

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

describe('Subscription Page', () => {
    it('renders the subscription plans and payment summary', async () => {
        const jsx = await SubscriptionPage()
        render(jsx)

        expect(screen.getByText('구독 플랜 선택')).toBeInTheDocument()
        expect(screen.getByText('Pro')).toBeInTheDocument()
        expect(screen.getByText('Enterprise')).toBeInTheDocument()
        expect(screen.getByText('주문 요약')).toBeInTheDocument()
        expect(screen.getByText('결제 수단 선택')).toBeInTheDocument()
        expect(screen.getByText(/신용\/체크카드/)).toBeInTheDocument()
        expect(screen.getByText(/카카오페이/)).toBeInTheDocument()
    })
})
