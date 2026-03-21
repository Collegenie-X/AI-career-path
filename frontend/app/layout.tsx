import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { RootLayoutClient } from '@/components/layout'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'CareerPath - 나만의 커리어 패스',
  description: '적성 검사부터 직업 체험까지, 게임처럼 즐기는 진로 탐색',
  generator: '10000 Labs',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-icon.svg', type: 'image/svg+xml', sizes: '180x180' }],
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#6C5CE7',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="dark">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="font-sans antialiased min-h-screen bg-black text-white">

        <RootLayoutClient>{children}</RootLayoutClient>

        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
