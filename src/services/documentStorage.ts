export type DocumentRecord = {
  id: string
  name: string
  type: string
  size: number
  uploadedAt: string
  uploadedBy: string
}

import { get, set, del } from 'idb-keyval'

const META_KEY = 'documents_meta'

async function getAllMeta(): Promise<DocumentRecord[]> {
  return (await get(META_KEY)) || []
}

async function saveAllMeta(list: DocumentRecord[]) {
  await set(META_KEY, list)
}

export async function addDocument(file: File, uploadedBy: string): Promise<DocumentRecord> {
  const id = crypto.randomUUID()
  const record: DocumentRecord = {
    id,
    name: file.name,
    type: file.type || 'application/octet-stream',
    size: file.size,
    uploadedAt: new Date().toISOString(),
    uploadedBy,
  }

  const docs = await getAllMeta()
  await set(`doc:${id}`, file)
  await saveAllMeta([record, ...docs])
  return record
}

export async function getDocuments(): Promise<DocumentRecord[]> {
  return await getAllMeta()
}

export async function getDocumentBlob(id: string): Promise<Blob | undefined> {
  return await get(`doc:${id}`)
}

export async function deleteDocument(id: string): Promise<void> {
  await del(`doc:${id}`)
  const docs = await getAllMeta()
  await saveAllMeta(docs.filter(d => d.id !== id))
}
