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
  Pencil,
  PencilLine,
  Loader,
  ArrowLeft,
  Send,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
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
import Header from '@/components/Headers/Header'
import { useChats } from '@/stores/useChats'
import PreviewButton from '@/containers/PreviewModal'
import ShareModal from '@/containers/ShareModal'
import { useModals } from '@/stores/useModals'
import { toast, ToastContainer } from 'react-toastify'

interface HeaderProps {
  chatId: string
  activeSection?: string
}

export default function BuilderHeader({ chatId, activeSection }: HeaderProps) {
  const { getChats, chats, error, updateChat } = useChats()
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [chatName, setChatName] = useState('')
  const [loading, setLoading] = useState(true)
  const { toggleSidebar } = useModals()
  const [isEditingName, setIsEditingName] = useState(false)
  const [updatedChat, setUpdatedChat] = useState<any>({
    id: '',
    bot_name: '',
    description: '',
    bot_picture: '',
    theme: '',
  })

  useEffect(() => {
    setLoading(true)
    const fetchData = async () => {
      await getChats()
    }
    fetchData()
    setLoading(false)
  }, [getChats])

  // {
  //   name: string
  //   description?: string
  //   status?: 'Online' | 'Offline' | 'Busy'
  //   favicon_url?: string
  //   Theme?: string
  // }

  useEffect(() => {
    const currentChat = chats.find((chat) => chat.id === chatId)
    if (currentChat) {
      setUpdatedChat({
        id: currentChat.id,
        status: currentChat.status,
        name: currentChat.name || '',
        description: currentChat.description || '',
        favicon_url: currentChat.favicon_url || '',
        theme: currentChat.theme,
        bot_name: currentChat.bot_name || '',
        bot_picture: currentChat.bot_picture || '',
      })
    }
  }, [chats, chatId])

  const handleEditChatName = async () => {
    try {
      await updateChat(chatId, { ...updatedChat })
      toggleEditName()
      toast.success('Alterações salvas!')
    } catch (error) {
      toast.error('Erro ao salvar alterações.')
    }
  }

  const toggleEditName = () => {
    setIsEditingName(!isEditingName)
  }

  const chatDataById = chats.find((chat) => chat.id === chatId)
  const chatNameById = chatDataById?.name

  const router = useRouter()
  const pathname = usePathname()

  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleNavigation = (url: string) => {
    if (url === pathname) {
      window.location.reload()
    } else {
      window.location.href = url
    }
  }

  return (
    <div className='flex h-[60px] w-full flex-row items-center justify-center border-b-[1px] border-t border-[#FFFFFF24] bg-[#0C88EE] px-4 md:px-8'>
      <section className='flex h-[60px] w-full max-w-[1850px] flex-row items-center justify-between border-b-[1px] border-t border-[#FFFFFF24] bg-[#0C88EE] px-4 md:px-8'>
        <div className='flex cursor-pointer items-center gap-4 text-sm text-white'>
          <ArrowLeft size={18} onClick={() => router.push('/')} />
          {loading ? (
            <div className='animate-spin'>
              <Loader />
            </div>
          ) : (
            <div>
              {isEditingName ? (
                <div className='flex items-center'>
                  <input
                    value={updatedChat.name}
                    className='flex h-[32px] rounded-bl-lg rounded-tl-lg border border-white bg-transparent p-2 text-sm text-white outline-none'
                    type='text'
                    placeholder='Altere o nome da conversa'
                    required
                    onChange={(e) =>
                      setUpdatedChat((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                  <button
                    className='r h-[32px] rounded-br-lg rounded-tr-lg bg-white px-2 text-[#0C88EE] transition-all hover:font-bold'
                    onClick={handleEditChatName}
                  >
                    Salvar
                  </button>
                </div>
              ) : (
                <div
                  className='flex w-fit cursor-pointer items-center gap-1 text-white'
                  onClick={toggleEditName}
                >
                  <span className='w-full max-w-[100px] truncate md:max-w-full'>
                    {chatNameById}
                  </span>
                  <PencilLine className='w-4' />
                </div>
              )}
            </div>
          )}
        </div>
        <div className='flex items-center gap-1 text-xs'>
          <Button
            className={`${activeSection == 'builder' ? '!bg-white !text-[#0C88EE]' : 'bg-[#43A3F2]'} hidden h-[32px] text-white hover:bg-[#43A3F2]/90 md:flex`}
            onClick={() => router.push(`/builder/${chatId}`)}
          >
            Construtor
          </Button>
          <Button
            className={`${activeSection == 'settings' ? '!bg-white !text-[#0C88EE]' : 'bg-[#43A3F2]'} hidden h-[32px] text-white hover:bg-[#43A3F2]/90 md:flex`}
            onClick={() => router.push(`/settings/${chatId}`)}
          >
            Configurações
          </Button>

          <Button
            className={`${activeSection == 'results' ? '!bg-white !text-[#0C88EE]' : 'bg-[#43A3F2]'} hidden h-[32px] text-white hover:bg-[#43A3F2]/90 md:flex`}
            onClick={() => router.push(`/results/${chatId}`)}
          >
            Resultados
          </Button>

          {activeSection !== 'builder' && activeSection !== 'results' && (
            <Button
              className='h-[32px] bg-white text-xs text-[#43A3F2] hover:bg-[#43A3F2]/90 md:hidden'
              onClick={() => router.push(`/builder/${chatId}`)}
            >
              Construtor
            </Button>
          )}

          {activeSection !== 'settings' && activeSection !== 'results' && (
            <Button
              className={`h-[32px] bg-white text-xs text-[#43A3F2] hover:bg-[#43A3F2]/90 md:hidden ${isEditingName ? 'hidden' : 'block'}`}
              onClick={() => router.push(`/settings/${chatId}`)}
            >
              Configurações
            </Button>
          )}

          {activeSection !== 'settings' && activeSection !== 'builder' && (
            <Button
              className={`h-[32px] bg-white text-xs text-[#43A3F2] hover:bg-[#43A3F2]/90 md:hidden ${isEditingName ? 'hidden' : 'block'}`}
              onClick={() => router.push(`/builder/${chatId}`)}
            >
              Construtor
            </Button>
          )}

          <Menubar className='flex md:hidden'>
            <MenubarMenu>
              <MenubarTrigger>
                <Menu className='text-white' />
              </MenubarTrigger>
              <MenubarContent>
                <PreviewButton chatId={chatId}>
                  <button className='relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-3 text-sm outline-none hover:bg-[#F1F4F9] focus:cursor-pointer focus:bg-accent focus:text-black data-[disabled]:pointer-events-none data-[disabled]:opacity-50'>
                    Preview
                  </button>
                </PreviewButton>
               
                <MenubarItem>
                  <button
                    onClick={() => router.push(`/results/${chatId}`)}
                    className='!text-black'
                  >
                    Resultados
                  </button>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>

          <PreviewButton chatId={chatId}>
            <Button className='hidden h-[32px] bg-[#43A3F2] text-white hover:bg-[#43A3F2]/90 md:flex'>
              Preview
            </Button>
          </PreviewButton>

          {/* <ShareModal chatId={chatId}>
            <Button className='hidden h-[32px] bg-[#43A3F2] text-white hover:bg-[#43A3F2]/90 md:flex'>
              Compartilhar
            </Button>
          </ShareModal> */}
        </div>
      </section>
      <ToastContainer />
    </div>
  )
}
