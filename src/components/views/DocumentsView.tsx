import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import AdminDocumentsPanel from '@/components/documents/AdminDocumentsPanel'
import PartnerDocumentsList from '@/components/documents/PartnerDocumentsList'

const DocumentsView = () => {
  const { user } = useAuth()

  return (
    <main>
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Documents</h2>
        <p className="text-muted-foreground mt-1">Upload, share, download, and print documents.</p>
      </header>

      {user?.role === 'admin' || user?.role === 'finance_officer' ? (
        <AdminDocumentsPanel />
      ) : (
        <PartnerDocumentsList />
      )}
    </main>
  )
}

export default DocumentsView
