import { auth } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { SidebarWrapper } from '@/components/layout/SidebarWrapper'
import { SessionProvider } from 'next-auth/react'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <SessionProvider session={session}>
      <div style={{ display: 'flex', flexDirection: 'row', height: '100vh', width: '100vw', overflow: 'hidden' }}>
        <SidebarWrapper>{children}</SidebarWrapper>
      </div>
    </SessionProvider>
  )
}
