import type { Metadata } from 'next'
import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/components/AuthProvider'
import AuthProtection from '@/components/AuthProtection'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { headers } from 'next/headers'

const inter = Inter({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
})

async function getChat(chatId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/chat/${chatId}`
  )
  return res.json()
}

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  const chatId = pathname.split('/chat/')[1]

  if (!chatId) {
    return {
      title: 'Chat',
      description: 'Interactive chat experience',
      icons: '/favicon.ico',
    }
  }

  const chat = await getChat(chatId)

  return {
    title: chat?.seo_title || chat?.name || 'Chat',
    description:
      chat?.seo_description ||
      chat?.description ||
      'Interactive chat experience',
    icons: chat?.favicon_url || '/favicon.ico',
    openGraph: {
      images: [chat?.share_image || '/share.png'],
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <AuthProvider>
      <html lang='pt-br'>
        <body className={inter.className}>
          {children}
          <ToastContainer />
        </body>
      </html>
    </AuthProvider>
  )
}
