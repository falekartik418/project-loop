'use client'

import { useSession } from 'next-auth/react'
import { Modal } from 'antd'

export function useReadOnly() {
  const { data: session } = useSession()
  const isViewer = session?.user?.role === 'VIEWER'
  const [modal, contextHolder] = Modal.useModal()

  const showReadOnly = () => {
    modal.info({
      title: 'Read-only access',
      content: 'You are logged in as a Viewer. You can explore everything, but you cannot change anything.',
      okText: 'Got it',
    })
  }

  return { isViewer, showReadOnly, contextHolder }
}