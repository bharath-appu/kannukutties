'use client'

import { useState, useEffect } from 'react'
import { X, Download, FileText, AlertCircle, Loader2 } from 'lucide-react'

interface Props {
  src: string
  filename?: string
  onClose: () => void
}

export default function PDFViewer({ src, filename, onClose }: Props) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    fetch(src, { method: 'HEAD' })
      .then(r => {
        if (r.ok && r.headers.get('content-type')?.includes('pdf')) {
          setState('ready')
        } else {
          setState('error')
        }
      })
      .catch(() => setState('error'))
  }, [src])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div
        className="relative flex h-[90vh] w-[90vw] max-w-4xl flex-col rounded-xl bg-[var(--background)] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#1D9BF0]" />
            <span className="text-sm font-medium text-[var(--text-primary)] truncate max-w-[300px]">
              {filename || 'Document'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={src}
              download
              className="rounded-full p-2 text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-colors"
              title="Download"
            >
              <Download className="h-5 w-5" />
            </a>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-[#1a1a1a]">
          {state === 'loading' ? (
            <div className="flex h-full flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--text-secondary)]" />
              <p className="text-sm text-[var(--text-secondary)]">Loading document...</p>
            </div>
          ) : state === 'error' ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
              <AlertCircle className="h-12 w-12 text-[var(--text-secondary)]" />
              <p className="text-[var(--text-primary)] font-medium">Unable to display this document</p>
              <p className="text-sm text-[var(--text-secondary)]">The file might be unavailable or in an unsupported format.</p>
              <a
                href={src}
                download
                className="inline-flex items-center gap-2 rounded-full bg-[#1D9BF0] px-5 py-2 text-sm font-bold text-white hover:bg-[#1A8CD8] transition-colors"
              >
                <Download className="h-4 w-4" />
                Download instead
              </a>
            </div>
          ) : (
            <iframe
              src={src}
              className="h-full w-full"
              title={filename || 'PDF Viewer'}
            />
          )}
        </div>
      </div>
    </div>
  )
}
