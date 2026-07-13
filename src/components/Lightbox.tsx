'use client'

import { X } from 'lucide-react'
import { useEffect } from 'react'

interface Props {
  src: string
  type?: string
  onClose: () => void
}

export default function Lightbox({ src, type, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
      >
        <X className="h-6 w-6" />
      </button>
      {type === 'video' ? (
        <video src={src} controls className="max-h-full max-w-full rounded-[16px]" onClick={e => e.stopPropagation()} />
      ) : (
        <img src={src} alt="" className="max-h-full max-w-full rounded-[16px] object-contain" onClick={e => e.stopPropagation()} />
      )}
    </div>
  )
}
