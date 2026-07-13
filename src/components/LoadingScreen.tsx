'use client'

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--background)]">
      <img
        src="/cat.webp"
        alt="kanukuties"
        className="h-24 w-24 object-contain"
      />
      <div className="mt-6 h-1 w-48 overflow-hidden rounded-full bg-[var(--border)]">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-[#1D9BF0]" />
      </div>
    </div>
  )
}
