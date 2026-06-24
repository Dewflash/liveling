import type { ReactNode } from 'react'
import '../styles/AppShell.css'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell">
      <div className="app-shell-glow app-shell-glow--left" aria-hidden="true" />
      <div className="app-shell-glow app-shell-glow--right" aria-hidden="true" />
      <div className="app-shell-frame">{children}</div>
    </div>
  )
}
