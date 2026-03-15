import { render, screen } from '@testing-library/react'
import LandingPage from '../app/page'

describe('Landing Page', () => {
    it('renders standard hero section', () => {
        // Next.js App Router root page may be async, but usually just sync if no data fetching.
        render(<LandingPage />)
        expect(screen.getByText(/당신의 아이디어를/i)).toBeInTheDocument()
        expect(screen.getByText(/어디서든 메모하고/i)).toBeInTheDocument()
        expect(screen.getByText('무료로 시작하기')).toBeInTheDocument()
        expect(screen.getByText('서비스 둘러보기')).toBeInTheDocument()
    })

    it('renders features highlight', () => {
        render(<LandingPage />)
        expect(screen.getByText('실시간 동기화')).toBeInTheDocument()
        expect(screen.getByText('AI 자동 정리')).toBeInTheDocument()
        expect(screen.getByText('철저한 보안')).toBeInTheDocument()
    })

    it('renders pricing section', () => {
        render(<LandingPage />)
        expect(screen.getByText('요금제 안내')).toBeInTheDocument()
        expect(screen.getByText('Free')).toBeInTheDocument()
        expect(screen.getByText('Pro')).toBeInTheDocument()
        expect(screen.getByText('Enterprise')).toBeInTheDocument()
    })
})
