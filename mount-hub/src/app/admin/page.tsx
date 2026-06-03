'use client'

import { useEffect, useState } from 'react'
import { AddMountDrawer } from '@/components/admin/AddMountDrawer'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { HttpsSettings } from '@/components/admin/HttpsSettings'
import { ProtocolPortSettings } from '@/components/admin/ProtocolPortSettings'
import { StorageManager } from '@/components/admin/StorageManager'
import { TransferLimitSettings } from '@/components/admin/TransferLimitSettings'
import { UserPermissionManager } from '@/components/admin/UserPermissionManager'
import { WebDAVSettings } from '@/components/admin/WebDAVSettings'
import { adminApi } from '@/lib/api'
import type { AdminCategoryId } from '@/types'

export default function AdminPage() {
  const [activeCategory, setActiveCategory] = useState<AdminCategoryId>('mounts')
  const [isAddMountOpen, setIsAddMountOpen] = useState(false)
  const [storageRefreshSignal, setStorageRefreshSignal] = useState(0)
  const [driverNames, setDriverNames] = useState<string[]>([])

  useEffect(() => {
    adminApi.listDriverNames().then(setDriverNames).catch(() => setDriverNames([]))
  }, [])

  const renderContent = () => {
    switch (activeCategory) {
      case 'mounts':
        return <StorageManager onAddMount={() => setIsAddMountOpen(true)} refreshSignal={storageRefreshSignal} />
      case 'users':
        return <UserPermissionManager />
      case 'webdav':
        return <WebDAVSettings />
      case 'https':
        return <HttpsSettings />
      case 'speed':
        return <TransferLimitSettings />
      case 'ports':
        return <ProtocolPortSettings />
      default:
        return null
    }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <AdminSidebar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-4xl mx-auto p-8">{renderContent()}</div>
      </main>
      <AddMountDrawer
        isOpen={isAddMountOpen}
        driverNames={driverNames}
        onClose={() => setIsAddMountOpen(false)}
        onCreated={() => setStorageRefreshSignal((value) => value + 1)}
      />
    </div>
  )
}
