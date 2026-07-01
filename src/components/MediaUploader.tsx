'use client'

import { useState, useRef } from 'react'
import { Upload, X, FileImage, FileVideo, FileAudio, FileText } from 'lucide-react'
import type { MediaUploadResult } from '@/lib/actions/upload'

interface Props {
  onMediaChange: (media: MediaUploadResult[]) => void
  existing?: MediaUploadResult[]
}

export default function MediaUploader({ onMediaChange, existing = [] }: Props) {
  const [files, setFiles] = useState<MediaUploadResult[]>(existing)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (selectedFiles: FileList | File[]) => {
    setError('')
    setUploading(true)

    const results: MediaUploadResult[] = []

    for (const file of Array.from(selectedFiles)) {
      if (file.size > 50 * 1024 * 1024) {
        setError('File too large. Max 50MB per file.')
        continue
      }
      const isDoc = file.type === 'application/pdf' || file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.type === 'text/plain'
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/') && !file.type.startsWith('audio/') && !isDoc) {
        setError('Only images, videos, audio, PDF, and DOCX files are supported.')
        continue
      }

      try {
        const formData = new FormData()
        formData.append('file', file)
        const response = await fetch('/api/upload', { method: 'POST', body: formData })
        if (!response.ok) throw new Error('Upload failed')
        const result = await response.json()
        results.push(result)
      } catch {
        setError(`Failed to upload ${file.name}`)
      }
    }

    const updated = [...files, ...results]
    setFiles(updated)
    onMediaChange(updated)
    setUploading(false)
  }

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index)
    setFiles(updated)
    onMediaChange(updated)
  }

  const getIcon = (type: string) => {
    if (type.startsWith('image')) return <FileImage className="h-10 w-10 text-green-500" />
    if (type.startsWith('video')) return <FileVideo className="h-10 w-10 text-purple-500" />
    if (type === 'document') return <FileText className="h-10 w-10 text-orange-500" />
    return <FileAudio className="h-10 w-10 text-blue-500" />
  }

  return (
    <div className="space-y-3">
      <div
        className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
          dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={e => e.target.files && handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            <p className="text-sm text-gray-500">Uploading...</p>
          </div>
        ) : (
          <>
            <Upload className="mb-2 h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-500">Drop files here or click to browse</p>
            <p className="mt-1 text-xs text-gray-400">Max 50MB • Images, video, audio, PDF, DOCX</p>
          </>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {files.map((file, i) => (
            <div key={i} className="group relative overflow-hidden rounded-lg border">
              {file.type === 'image' ? (
                <img src={file.url} alt="" className="h-24 w-full object-cover" />
              ) : file.type === 'document' ? (
                <a href={file.url} target="_blank" rel="noopener noreferrer" className="flex h-24 items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors">
                  {getIcon(file.type)}
                </a>
              ) : (
                <div className="flex h-24 items-center justify-center bg-gray-100">
                  {getIcon(file.type)}
                </div>
              )}
              <button
                onClick={() => removeFile(i)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-1">
                <span className="text-[10px] text-white capitalize">{file.type}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
