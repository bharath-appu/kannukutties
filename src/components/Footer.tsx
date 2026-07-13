import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="py-3 text-center">
      <div className="inline-flex items-center gap-3 text-xs text-[var(--text-secondary)]">
        <Link href="/about" className="hover:underline">
          About
        </Link>
        <Link href="/privacy" className="hover:underline">
          Privacy
        </Link>
        <Link href="/terms" className="hover:underline">
          Terms
        </Link>
        <span>&copy; {new Date().getFullYear()} kanukuties</span>
      </div>
    </footer>
  )
}
