import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import DashboardLayout from '@/app/dashboard/layout'

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      }),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: { storage_used: 3 * 1024 ** 3, plan: 'free' },
            error: null,
          }),
        })),
      })),
    })),
  })),
}))

describe('Dashboard Private Layout', () => {
  it('renders shared sidebar and top navigation for private pages', async () => {
    const jsx = await DashboardLayout({ children: <div>Private Page Content</div> })
    render(jsx)

    expect(screen.getByText('CloudNote Workspace')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /내 메모/ })).toHaveAttribute('href', '/dashboard/notes')
    expect(screen.getByText('Private Page Content')).toBeInTheDocument()
  })
})
