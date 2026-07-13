import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for kanukuties.',
}

export default function PrivacyPage() {
  return (
    <div className="px-4 py-8">
      <div className="flex justify-center mb-6">
        <Image src="/mf.webp" alt="MF" width={200} height={200} className="rounded-full object-cover" />
      </div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Privacy Policy</h1>
      <p className="text-[var(--text-secondary)] leading-relaxed">
        Your privacy matters. We collect only what is necessary to provide our services.
        We do not sell your data to third parties.
      </p>
    </div>
  )
}
