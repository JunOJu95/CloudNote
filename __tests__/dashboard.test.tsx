import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import DashboardPage from '../app/dashboard/page'

const createMockBuilder = (table: string) => {
    const isOrdersOrUsers = ['users', 'notes', 'activity_logs', 'subscriptions'].includes(table);
    const builder: any = {}

    builder.select = vi.fn(() => builder)
    builder.eq = vi.fn(() => builder)
    builder.order = vi.fn(() => builder)
    builder.limit = vi.fn(() => builder)
    builder.single = vi.fn(() => builder)

    builder.then = (resolve: any) => {
        if (table === 'users') {
            resolve({ data: { full_name: '홍길동', plan: 'pro', storage_used: 7500000000, ai_summary_count: 42 }, error: null })
        } else if (table === 'notes') {
            resolve({ data: [{ id: '1' }], count: 1240, error: null })
        } else if (table === 'activity_logs') {
            resolve({ data: [{ id: '1', action_type: 'edit', description: '메모 수정', created_at: new Date().toISOString() }], error: null })
        } else if (table === 'subscriptions') {
            resolve({ data: { plan: 'pro', amount: 9900, status: 'active', current_period_end: new Date('2024-12-24').toISOString() }, error: null })
        } else {
            resolve({ data: null, error: null })
        }
    }

    return builder
}

vi.mock('@/utils/supabase/server', () => ({
    createClient: vi.fn(() => ({
        auth: {
            getUser: vi.fn().mockResolvedValue({
                data: { user: { id: 'test-user-id', email: 'test@example.com', user_metadata: { full_name: '홍길동' } } },
                error: null,
            }),
        },
        from: vi.fn((table) => createMockBuilder(table)),
    })),
}))

describe('Dashboard Page', () => {
    it('renders overall dashboard structure', async () => {
        const jsx = await DashboardPage()
        render(jsx)

        expect(screen.getByText('구독 정보')).toBeInTheDocument()
        expect(screen.getByText('이번 달 사용량')).toBeInTheDocument()
        expect(screen.getByText('최근 활동')).toBeInTheDocument()
    })

    it('displays user greeting', async () => {
        const jsx = await DashboardPage()
        render(jsx)
        expect(screen.getByText(/홍길동/i)).toBeInTheDocument()
    })
})
