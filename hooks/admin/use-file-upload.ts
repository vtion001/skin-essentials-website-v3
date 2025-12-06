import { useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null

interface UseFileUploadProps {
  bucketName: string
  onSuccess?: (url: string) => void
  onError?: (error: any) => void
}

export function useFileUpload({ bucketName, onSuccess, onError }: UseFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const uploadFile = async (file: File, path: string) => {
    if (!supabase) {
      onError?.(new Error('Supabase is not configured'))
      return null
    }

    try {
      const { error } = await supabase.storage
        .from(bucketName)
        .upload(path, file, { upsert: true, contentType: file.type })

      if (error) throw error

      const { data } = supabase.storage.from(bucketName).getPublicUrl(path)
      onSuccess?.(data.publicUrl)
      return data.publicUrl
    } catch (error) {
      onError?.(error)
      return null
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return {
    fileInputRef,
    uploadFile,
    handleUploadClick
  }
}
