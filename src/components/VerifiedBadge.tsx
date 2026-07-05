interface Props {
  size?: number
  className?: string
}

export default function VerifiedBadge({ size = 16, className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 rounded-full bg-blue-500 ${className}`}
      style={{ width: size, height: size }}
      aria-label="Verified"
    >
      <svg viewBox="0 0 24 24" fill="none" className="text-white" style={{ width: size * 0.6, height: size * 0.6 }}>
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor" />
      </svg>
    </span>
  )
}
