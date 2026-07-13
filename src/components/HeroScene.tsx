'use client'

import Aurora from '@/components/reactbits/Aurora'
import SplitText from '@/components/reactbits/SplitText'

interface HeroSceneProps {
  imageUrl?: string
  title?: string
  subtitle?: string
}

export default function HeroScene({
  imageUrl,
  title = 'kanukuties',
  subtitle = 'Share your world',
}: HeroSceneProps) {
  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl">
      <div className="relative flex min-h-[300px] items-center justify-center">
        <Aurora
          colorStops={["#8b5cf6", "#6366f1", "#3b82f6", "#8b5cf6"]}
          speed={2}
          blur={60}
        />
        <div className="relative z-10 flex flex-col items-center gap-6 p-8 md:flex-row md:gap-10">
          <div className="h-32 w-32 shrink-0 overflow-hidden rounded-2xl border-2 border-white/30 shadow-xl md:h-40 md:w-40">
            <img
              src={imageUrl || '/cat.webp'}
              alt="kanukuties"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="text-center md:text-left">
            <SplitText
              text={title}
              className="text-4xl font-bold text-white drop-shadow-lg md:text-5xl"
              stagger={0.04}
            />
            <p className="mt-2 text-lg text-gray-200 drop-shadow">{subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
