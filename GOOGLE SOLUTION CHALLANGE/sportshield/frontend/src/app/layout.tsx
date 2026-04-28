import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { AuthProvider } from '@/context/auth-context'

export const metadata: Metadata = {
  title: 'AthletiChain AI - Protect Your Digital Sports Legacy',
  description: 'The first comprehensive platform for protecting athlete content using AI, blockchain, and C2PA authenticity standards.',
  keywords: ['sports', 'NFT', 'blockchain', 'content protection', 'AI', 'athlete'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-sport-darker text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
