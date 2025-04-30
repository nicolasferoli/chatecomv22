'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface DomainProviderProps {
  children: React.ReactNode
  chatId: string
}

export default function DomainProvider({
  children,
  chatId,
}: DomainProviderProps) {
  const [isValidDomain, setIsValidDomain] = useState(false)

  useEffect(() => {
    const checkDomain = async () => {
      if (
        window.location.hostname === process.env.NEXT_PUBLIC_DOMAIN ||
        window.location.hostname === process.env.NEXT_PUBLIC_SHARE_DOMAIN
      ) {
        setIsValidDomain(true)
        return
      }
      try {
        const currentDomain = window.location.hostname

        const response = await fetch(
          `/api/domain/info?domain=${currentDomain}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )

        if (!response.ok) {
          throw new Error('Failed to fetch domain info')
        }

        const data = await response.json()
        setIsValidDomain(data.some((domain) => domain.chat_id === chatId))
      } catch (error) {
        console.error('Error checking domain:', error)
        setIsValidDomain(false)
      }
    }

    checkDomain()
  }, [chatId])

  return <>{isValidDomain ? children : <></>}</>
}
