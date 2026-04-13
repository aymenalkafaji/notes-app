import { SidebarWrapper } from '@/components/layout/SidebarWrapper'
import { SplashScreen } from '@/components/layout/SplashScreen'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', position: 'relative' }}>
      <SplashScreen />
      <SidebarWrapper>{children}</SidebarWrapper>
    </div>
  )
}
