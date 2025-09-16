import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { Download, Printer, Trash2, Upload } from 'lucide-react'
import { addDocument, getDocuments, getDocumentBlob, deleteDocument, type DocumentRecord } from '@/services/documentStorage'
import { useAuth } from '@/contexts/AuthContext'
import { showPersistentToast } from '@/components/ui/persistent-toast'

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export default function AdminDocumentsPanel() {
  const { user } = useAuth()
  const [files, setFiles] = useState<FileList | null>(null)
  const [docs, setDocs] = useState<DocumentRecord[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const load = async () => setDocs(await getDocuments())
  
  useEffect(() => { 
    // Only load documents when user is authenticated
    if (user) {
      console.log('Loading documents for authenticated user:', user.email);
      load();
    } else {
      console.log('No user authenticated, clearing documents');
      setDocs([]);
    }
  }, [user])

  const onUpload = async () => {
    if (!files || !user) return
    setIsUploading(true)
    try {
      const items = Array.from(files)
      for (const f of items) {
        await addDocument(f, user.name)
      }
      setFiles(null)
      await load()
      showPersistentToast({
        title: 'Documents uploaded',
        description: `${files.length} file(s) added successfully`,
        variant: 'success',
        category: 'Document Management'
      })
    } catch (e) {
      showPersistentToast({ title: 'Upload failed', description: 'Please try again.', variant: 'error', category: 'Document Management' })
    } finally {
      setIsUploading(false)
    }
  }

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

  const onDelete = async (rec: DocumentRecord) => {
    await deleteDocument(rec.id)
    await load()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="file">Upload files</Label>
            <Input id="file" type="file" multiple onChange={(e) => setFiles(e.target.files)} />
          </div>
          <Button onClick={onUpload} disabled={!files || isUploading} className="w-full md:w-auto">
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>

        <div>
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
                  <TableCell colSpan={5} className="text-center text-muted-foreground">No documents yet</TableCell>
                </TableRow>
              )}
              {docs.map(d => (
                <TableRow key={d.id}>
                  <TableCell>{d.name}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{d.type || '—'}</TableCell>
                  <TableCell>{formatSize(d.size)}</TableCell>
                  <TableCell>{new Date(d.uploadedAt).toLocaleString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => onDownload(d)}>
                      <Download className="h-4 w-4 mr-1" /> Download
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => onPrint(d)}>
                      <Printer className="h-4 w-4 mr-1" /> Print
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(d)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
