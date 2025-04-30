import AuthProtection from '@/components/AuthProtection'
import BuilderHeader from '@/components/Headers/BuilderHeader'
import Header from '@/components/Headers/Header'
import BuilderScreen from '@/containers/BuilderScreen'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chat Builder',
  description: 'Construa seu chat interativo',
}

export default function BuilderPage({ params }: { params: { id: string } }) {
  return (
    <div className='z-0'>
      <AuthProtection>
        <Header />
        <BuilderHeader chatId={params.id} activeSection='builder' />
        <BuilderScreen chatId={params.id} />
      </AuthProtection>
    </div>
  )
}

// Validação opcional do ID na rota
export async function generateStaticParams() {
  return []
}
