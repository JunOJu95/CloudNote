import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import SubscriptionDonePage from '../app/dashboard/subscription/done/page'

const rpc = vi.fn()

vi.mock('@/utils/supabase/server', () => ({
    createClient: vi.fn(() => ({
        auth: {
            getUser: vi.fn().mockResolvedValue({
                data: { user: { id: 'test-user-id', email: 'test@example.com' } },
                error: null,
            }),
        },
        rpc,
    })),
}))

describe('Subscription Done Page', () => {
    it('renders the success message and activates test subscription', async () => {
        rpc.mockResolvedValue({ data: null, error: null })
        const jsx = await SubscriptionDonePage()
        render(jsx)

        expect(rpc).toHaveBeenCalledWith('activate_test_subscription', {
            p_plan: 'pro',
            p_amount: 31900,
            p_payment_method: 'TEST_CARD',
        })
        expect(screen.getByText('결제가 완료되었습니다!')).toBeInTheDocument()
        expect(screen.getByText('Pro 플랜이 활성화되었습니다')).toBeInTheDocument()
        expect(screen.getByText('주문번호')).toBeInTheDocument()
        expect(screen.getByText('대시보드로 이동')).toBeInTheDocument()
    })
})
