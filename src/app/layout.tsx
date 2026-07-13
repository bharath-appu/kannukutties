import type { Metadata } from 'next'
import { Providers } from '@/components/Providers'
import { ThemeProvider } from '@/components/ThemeProvider'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'kanukuties',
    template: '%s | kanukuties',
  },
  description:
    'Share your world with kanukuties — a vibrant social community for sharing photos, videos, and connecting with friends.',
  openGraph: {
    title: 'kanukuties',
    description:
      'Share your world with kanukuties — a vibrant social community for sharing photos, videos, and connecting with friends.',
    siteName: 'kanukuties',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'kanukuties',
    description:
      'Share your world with kanukuties — a vibrant social community for sharing photos, videos, and connecting with friends.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              var t = localStorage.getItem('theme');
              if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              }
            } catch(e) {}
          `,
        }} />
      </head>
      <body className="pb-16 md:pb-0 md:pl-[68px] md:pt-[48px]">
        <ThemeProvider>
          <Providers>
            <Navbar />
            <main className="mx-auto w-full max-w-[600px] border-x border-[var(--border)] min-h-screen">
              {children}
            </main>
            <Footer />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
