import { useState } from 'react'
import { supabaseBrowserClient } from '@/lib/supabase/client'

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const supabaseBrowser = supabaseBrowserClient()

  /**
   * Uploads a file to a Supabase storage bucket
   */
  const uploadToSupabase = async (
    file: File,
    bucket: string,
    path: string
  ): Promise<string> => {
    if (!supabaseBrowser) {
      throw new Error('Supabase is not configured')
    }

    setIsUploading(true)
    try {
      const { error } = await supabaseBrowser.storage.from(bucket).upload(path, file, { upsert: true, contentType: file.type })
      if (error) throw error

      const { data } = supabaseBrowser.storage.from(bucket).getPublicUrl(path)
      return data.publicUrl
    } finally {
      setIsUploading(false)
    }
  }

  /**
   * Uploads a file via the internal API route
   */
  const uploadToApi = async (file: File, type: string): Promise<string> => {
    setIsUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', type)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const j = await res.json()
      const url = j?.url ? String(j.url) : ''
      if (!url) throw new Error('Upload failed')
      return url
    } finally {
      setIsUploading(false)
    }
  }

  return { uploadToSupabase, uploadToApi, isUploading }
}
