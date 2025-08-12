import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Download, Printer, Eye } from 'lucide-react'
import { getDocuments, getDocumentBlob, type DocumentRecord } from '@/services/documentStorage'
import { showPersistentToast } from '@/components/ui/persistent-toast'

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export default function PartnerDocumentsList() {
  const [docs, setDocs] = useState<DocumentRecord[]>([])
  const load = async () => setDocs(await getDocuments())
  useEffect(() => { load() }, [])

  const onDownload = async (rec: DocumentRecord) => {
    const blob = await getDocumentBlob(rec.id)
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = rec.name
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const onView = async (rec: DocumentRecord) => {
    const blob = await getDocumentBlob(rec.id)
    if (!blob) return
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank', 'noopener,noreferrer')
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  }

  const onPrint = async (rec: DocumentRecord) => {
    const blob = await getDocumentBlob(rec.id)
    if (!blob) return
    if (!(rec.type.startsWith('image/') || rec.type === 'application/pdf')) {
      showPersistentToast({ title: 'Print not supported', description: 'Printing is available for PDF and images. Please download instead.', variant: 'warning', category: 'Document Management' })
      return
    }
    const url = URL.createObjectURL(blob)
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.src = url
    document.body.appendChild(iframe)
    iframe.onload = () => {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
      setTimeout(() => {
        URL.revokeObjectURL(url)
        document.body.removeChild(iframe)
      }, 1000)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shared Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {docs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">No documents available yet</TableCell>
              </TableRow>
            )}
            {docs.map(d => (
              <TableRow key={d.id}>
                <TableCell>{d.name}</TableCell>
                <TableCell className="text-muted-foreground text-xs">{d.type || '—'}</TableCell>
                <TableCell>{formatSize(d.size)}</TableCell>
                <TableCell>{new Date(d.uploadedAt).toLocaleString()}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="ghost" onClick={() => onView(d)}>
                    <Eye className="h-4 w-4 mr-1" /> View
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onDownload(d)}>
                    <Download className="h-4 w-4 mr-1" /> Download
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => onPrint(d)}>
                    <Printer className="h-4 w-4 mr-1" /> Print
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
