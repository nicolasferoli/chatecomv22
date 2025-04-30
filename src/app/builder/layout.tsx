import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chat Builder',
  description: 'Construa seu chat interativo',
}

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className='min-h-screen bg-slate-50'>{children}</div>
}
