'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

const LayoutSettings = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const pathname = usePathname()
  return (
    <div className='mx-auto max-w-[1450px] p-8'>
      <h1 className='mb-1 text-[30px] font-semibold'>Configurações</h1>
      <p className='mb-8 text-muted-foreground'>
        Gerencie sua conta e configurações.
      </p>

      <div className='flex flex-col gap-16 md:flex-row'>
        <div className='hidden w-48 md:block'>
          <nav className='space-y-2'>
            <Button
              variant={pathname === '/settings' ? 'secondary' : 'ghost'}
              className='w-full justify-start font-medium'
              onClick={() => router.push('/settings')}
            >
              Assinaturas
            </Button>
          </nav>
        </div>

        <div className='flex-1'>{children}</div>
      </div>
    </div>
  )
}

export default LayoutSettings
