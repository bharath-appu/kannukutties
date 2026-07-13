import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'About',
  description: 'About kanukuties — a vibrant social community.',
}

export default function AboutPage() {
  return (
    <div className="px-4 py-8">
      <div className="flex justify-center mb-6">
        <Image src="/mf.webp" alt="MF" width={200} height={200} className="rounded-full object-cover" />
      </div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">About kanukuties</h1>
      <p className="text-[var(--text-secondary)] leading-relaxed">
        kanukuties is a vibrant social community for sharing photos, videos, and connecting with friends.
        Share your world with us.
      </p>
    </div>
  )
}
