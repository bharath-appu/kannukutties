import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <div className="text-center">
        <h1 className="text-6xl font-extrabold text-[#1D9BF0]">404</h1>
        <h2 className="mt-4 text-2xl font-bold text-[var(--text-primary)]">Page not found</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1D9BF0] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#1A8CD8] transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
