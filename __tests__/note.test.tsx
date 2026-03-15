import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import NotesPage from '../app/dashboard/notes/page'

let currentPlan = 'pro'
const redirectMock = vi.fn()

const createMockBuilder = (table: string) => {
    const builder: any = {}

    builder.select = vi.fn(() => builder)
    builder.eq = vi.fn(() => builder)
    builder.order = vi.fn(() => builder)
    builder.limit = vi.fn(() => builder)
    builder.single = vi.fn(() => builder)

    builder.then = (resolve: any) => {
        if (table === 'users') {
            resolve({ data: { full_name: '홍길동', plan: currentPlan, storage_used: 7500000000, ai_summary_count: 42 }, error: null })
        } else if (table === 'notes') {
            resolve({
                data: [
                    { id: '1', title: '주간 업무 보고 및 성과 측정', content: '이번 주 주요 진행 사항 및...', created_at: new Date('2023-10-27T14:30:00+09:00').toISOString() },
                    { id: '2', title: '아이디어 브레인스토밍', content: '신규 프로젝트를 위한 창의적인 아이디어 모음...', created_at: new Date('2023-10-25T11:15:00+09:00').toISOString() }
                ], count: 2, error: null
            })
        } else {
            resolve({ data: null, error: null })
        }
    }

    return builder
}

vi.mock('next/navigation', () => ({
    redirect: (url: string) => redirectMock(url),
}))

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

describe('Notes Page', () => {
    beforeEach(() => {
        currentPlan = 'pro'
        redirectMock.mockReset()
    })

    it('renders note list and main note view', async () => {
        const jsx = await NotesPage({})
        render(jsx)

        // Check left sidebar
        expect(screen.getByText('내 노트')).toBeInTheDocument()
        expect(screen.getByText('새 노트 작성')).toBeInTheDocument()

        // Check fetched mock notes list
        expect(screen.getAllByText('주간 업무 보고 및 성과 측정')[0]).toBeInTheDocument()
        expect(screen.getByText('아이디어 브레인스토밍')).toBeInTheDocument()

        // Check right main content area
        expect(screen.getAllByText('이번 주 주요 진행 사항 및...')[0]).toBeInTheDocument()
    })

    it('redirects free users to subscription page', async () => {
        currentPlan = 'free'
        await NotesPage({})

        expect(redirectMock).toHaveBeenCalledWith('/dashboard/subscription')
    })
})
