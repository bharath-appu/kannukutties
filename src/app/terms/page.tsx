import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for kanukuties.',
}

export default function TermsPage() {
  return (
    <div className="px-4 py-8">
      <div className="flex justify-center mb-6">
        <Image src="/mf.webp" alt="MF" width={200} height={200} className="rounded-full object-cover" />
      </div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Terms of Service</h1>
      <p className="text-[var(--text-secondary)] leading-relaxed">
        By using kanukuties, you agree to follow our community guidelines and terms.
        Respect others, share responsibly, and have fun.
      </p>
    </div>
  )
}
