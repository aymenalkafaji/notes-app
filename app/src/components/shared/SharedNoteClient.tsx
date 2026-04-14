'use client'
import { SidebarWrapper } from '@/components/layout/SidebarWrapper'
import { SharedEditor } from './SharedEditor'

interface Props {
  note: any
  token: string
  permission: 'view' | 'edit'
  currentUser: { id?: string; name?: string | null; email?: string | null; image?: string | null } | null
}

export function SharedNoteClient({ note, token, permission, currentUser }: Props) {
  return (
    <SidebarWrapper>
      <SharedEditor
        note={note}
        token={token}
        permission={permission}
      />
    </SidebarWrapper>
  )
}
