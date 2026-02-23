import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'DreamPath - 나만의 커리어 RPG',
  description: '적성 검사부터 직업 체험까지, 게임처럼 즐기는 진로 탐색',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#6C5CE7',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
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
      <body className="font-sans antialiased min-h-screen spaceship-bg">
        {/* Animated Grid Background */}
        <div className="fixed inset-0 pointer-events-none opacity-20" style={{
          backgroundImage: `
            linear-gradient(rgba(108,92,231,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(108,92,231,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'grid-pulse 4s ease-in-out infinite'
        }} />
        
        {/* Floating Stars */}
        <div className="fixed inset-0 pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 3 + 1 + 'px',
                height: Math.random() * 3 + 1 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                opacity: Math.random() * 0.5 + 0.2,
                animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite ${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        
        {/* Main Cockpit Container */}
        <div className="w-full max-w-[430px] mx-auto min-h-screen relative">
          {/* Cockpit Frame Corners */}
          <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] h-8 pointer-events-none z-50">
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-primary/40 rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-primary/40 rounded-tr-2xl" />
          </div>
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] h-8 pointer-events-none z-50">
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-primary/40 rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-primary/40 rounded-br-2xl" />
          </div>
          
          {/* Side Status Indicators */}
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[430px] h-full pointer-events-none z-40">
            {/* Left Indicators */}
            <div className="absolute left-2 top-1/4 space-y-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: '0.6s' }} />
            </div>
            {/* Right Indicators */}
            <div className="absolute right-2 top-1/4 space-y-2">
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0.6s' }} />
            </div>
          </div>
          
          {/* Content */}
          <div className="relative z-10">
            {children}
          </div>
        </div>
        <Analytics />
      </body>
    </html>
  )
}
