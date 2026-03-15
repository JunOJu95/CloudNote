'use client'

import { usePathname } from 'next/navigation'
import Footer from '@/components/layout/Footer'
import Navbar from '@/components/layout/Navbar'

export default function RootShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPrivatePage = pathname?.startsWith('/dashboard')

  if (isPrivatePage) {
    return <>{children}</>
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )
}
