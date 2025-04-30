'use client'

import Link from 'next/link'
import {
  Settings,
  Menu,
  User,
  ChevronDown,
  MessageSquare,
  TrendingUp,
  SlidersVertical,
  Shuffle,
  Play,
  CircleHelp,
  BookOpen,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from '@/components/ui/menubar'
import Blocked from '@/components/Blocked'
import { Logo } from '@/components/Logo'
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs'
interface HeaderProps {
  sections?: {
    nome: string
    link: string
    active?: boolean
    disabled?: boolean
  }[]
}

export const defaultSections = [
  { nome: 'Dashboard', link: '/dashboard', active: false, disabled: true },
  { nome: 'Conversas', link: '/chat/i', active: false },
  { nome: 'Contatos', link: '/contacts', active: false },
  { nome: 'Automações', link: '/automations', active: false },
  { nome: 'Regras', link: '/triggers', active: false },
]

export default function Header({ sections }: HeaderProps) {
  const { user } = useKindeAuth()
  const [isAuthenticated, setIsAuthenticated] = useState(true)

  const router = useRouter()
  const pathname = usePathname()

  const activeSections = (sections || defaultSections).map((section) => {
    const isChatRoute = pathname?.startsWith('/chat')

    if (section.link.startsWith('/chat') && isChatRoute) {
      return {
        ...section,
        active: true,
      }
    }

    return {
      ...section,
      active: pathname === section.link,
    }
  })
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleNavigation = (url: string) => {
    if (url === pathname) {
      window.location.reload()
    } else {
      window.location.href = url
    }
  }

  const getSubscription = async (kinde_id: string, pathname: string) => {
    const excludedPaths = ['/welcome']

    const response = await fetch(
      `/api/global/webhook/search?email=${user?.email}`
    )
    const data = await response.json()

    console.log('data', data)

    if (!data.allow_access && !excludedPaths.includes(pathname)) {
      return router.push('/welcome')
    }

    // if (data.subscription && excludedPaths.includes(pathname)) {
    //   return router.push('/')
    // }
  }

  // useEffect(() => {
  //   user && getSubscription(user.id, pathname)
  // }, [user])

  return (
    <header className='flex h-[64px] items-center border-b-[1px] border-b-[#0C88EE] bg-[#0C88EE] px-4 md:px-8'>
      <div className='mx-auto flex w-full max-w-[1800px] items-center justify-between'>
        <div className='flex items-center space-x-4 md:space-x-8'>
          <Link href='/' className='flex items-center space-x-2 text-white'>
            <Logo />
          </Link>
        </div>

        <div className='flex items-center space-x-3'>
          {isAuthenticated ? (
            <div className='flex cursor-pointer items-center space-x-3'>
              <button
                aria-label='Settings'
                className='mr-4 text-gray-100 transition-colors hover:text-blue-100'
                onClick={() => handleNavigation('/settings')}
              >
                <Settings size={20} />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className='flex flex-row items-center space-x-2'>
                    <button
                      aria-label='User Profile'
                      className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-100'
                    >
                      <User size={16} />
                    </button>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='bg-white'>
                  <DropdownMenuItem
                    className='cursor-pointer hover:!bg-white'
                    onClick={() => handleNavigation('/api/auth/logout')}
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className='flex items-center space-x-4 font-medium'>
              <Button
                className='text-white hover:bg-blue-600 hover:text-white'
                variant={'ghost'}
                onClick={() => handleNavigation('/api/auth/login')}
              >
                Login
              </Button>
              <Button
                className='border-white/30 bg-[#0C88EE] text-white hover:bg-[#0C88EE]/80 hover:text-white'
                variant={'outline'}
                onClick={() => handleNavigation('/api/auth/register')}
              >
                Criar conta
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
