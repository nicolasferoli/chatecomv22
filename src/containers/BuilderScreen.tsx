'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ChatBuilderDropdown from '@/components/ChatBuilder/ChatBuilderDropdown'
import ChatBuilderFrame from '@/components/ChatBuilder/ChatBuilderFrame'
import { useChats } from '@/stores/useChats'
import { toast } from 'react-toastify'
import {
  Calendar,
  Icon,
  Image,
  Inbox,
  Loader,
  Search,
  Settings,
  Sidebar,
  X,
  XCircle,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useModals } from '@/stores/useModals'
import { ImageCard } from '@/components/editModals'
import { ImageMessage } from '@/components/ChatBuilder/Message/ImageMessage'
import ImageUpload from '@/components/Forms/FormImageUpload'
import FormInput from '@/components/Forms/FormInput'
import { Switch } from '@/components/ui/switch'
import FaviconUpload from '@/components/Forms/FormFaviconUpload'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { stat } from 'fs'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AnimatePresence, motion } from 'framer-motion'

interface BuilderScreenProps {
  chatId: string
}

export default function BuilderScreen({ chatId }: BuilderScreenProps) {
  const router = useRouter()
  const { createChat, chats, loading, error, getChats, updateChat } = useChats()
  const { isSidebarOpen, setSidebarOpen, toggleSidebar } = useModals()
  const [imageData, setImageData] = useState('')
  const [selectBackground, setSelectBackground] = useState('default')
  const [updatedChat, setUpdatedChat] = useState<any>({
    id: '',
    bot_name: '',
    description: '',
    bot_picture: '',
    theme: '',
    status: 'online',
    verified: true,
    // hasNotifySound: false,
  })

  // Inicializa ou carrega o chat existente
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Tenta criar um novo chat com o ID fornecido
        const chat = await createChat({
          id: chatId, // Usa o ID da rota
          name: 'Novo Chat',
          description: 'Chat criado automaticamente',
        })

        if (!chat) {
          router.push('/builder') // Redireciona para criar novo chat
          return
        }
      } catch (error) {
        console.error('❌ -> Erro ao inicializar chat:', error)
        router.push('/builder')
      }
    }

    initializeChat()
  }, [chatId])

  useEffect(() => {
    const currentChat = chats.find((chat) => chat.id === chatId)
    if (currentChat) {
      // Sanitize the description fetched from the store/backend
      const sanitizedDescription = (currentChat.description || '').replace(/\[.*?\]/g, '').trim();
      console.log('Sanitized Description in BuilderScreen:', sanitizedDescription); // Log for verification

      setUpdatedChat({
        id: currentChat.id,
        status: currentChat.status,
        name: currentChat.name || '',
        description: sanitizedDescription, // Use sanitized description
        favicon_url: currentChat.favicon_url || '',
        theme: currentChat.theme,
        bot_name: currentChat.bot_name || '',
        bot_picture: currentChat.bot_picture || '',
        verified: currentChat.verified,
        // hasNotifySound: currentChat.hasNotifySound,
      })
      setImageData(currentChat.favicon_url || '')
    }
  }, [chats, chatId])

  useEffect(() => {
    getChats()
  }, [])

  const closeModal = () => {
    setSidebarOpen(false)
  }

  const handleSaveChanges = async () => {
    try {
      await updateChat(chatId, { ...updatedChat })
      closeModal()
      toast.success('Alterações salvas!')
    } catch (error) {
      toast.error('Erro ao salvar alterações.')
    }
  }

  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-lg'>
          <Loader className='animate-spin text-zinc-600' size={50} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-lg text-red-500'>Erro ao carregar chat</div>
      </div>
    )
  }

  return (
    <div className='relative flex flex-col bg-transparent lg:ml-10 lg:flex lg:flex-row'>
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`m-auto mt-[32px] w-[346px] text-zinc-950 lg:m-0 lg:w-[346px]`}
          >
            <div className='flex flex-col items-center justify-center gap-6'>
              <div className='mt-10 flex w-full justify-between gap-6'>
                <h1 className='font-semibold'>Customizar chat</h1>
                <button onClick={closeModal}>
                  <XCircle size={20} className='text-zinc-500' />
                </button>
              </div>
              <div className='flex w-full flex-col'>
                <span>Foto do chatbot</span>
                <FaviconUpload
                  label='Favicon'
                  imageUrl={updatedChat?.favicon_url || ''}
                  onUpload={(url) =>
                    setUpdatedChat((prevChat: any) => ({
                      ...prevChat,
                      favicon_url: url,
                    }))
                  }
                  chatId={chatId}
                  type='favicon'
                />
              </div>
              <div className='flex w-full flex-col'>
                <span>Título do chat</span>
                <FormInput
                  id={updatedChat.id}
                  placeholder='Nome do chat'
                  value={updatedChat?.bot_name || ''}
                  onChange={(e) =>
                    setUpdatedChat((prev) => ({
                      ...prev,
                      bot_name: e.target.value,
                    }))
                  }
                  className='mt-2'
                />
              </div>
              <div className='flex w-full gap-2'>
                <Switch
                  checked={updatedChat?.verified || false}
                  onCheckedChange={(isChecked) =>
                    setUpdatedChat((prevChat) => ({
                      ...prevChat,
                      verified: isChecked,
                    }))
                  }
                />
                <span>Quero um perfil verificado</span>
              </div>
              <div className='flex w-full flex-col'>
                <span>Background</span>
                <div
                  className={`mt-2 flex h-fit min-h-[120px] w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-6 ${
                    updatedChat.theme === 'whatsapp-dark'
                      ? 'bg-darkWhatsappBackground text-white'
                      : 'bg-whatsappBackground'
                  }`}
                >
                  <Select
                    value={updatedChat?.theme || 'default'}
                    onValueChange={(value) =>
                      setUpdatedChat((prev) => ({
                        ...prev,
                        theme: value,
                      }))
                    }
                  >
                    <SelectTrigger className='w-[200px] border-2 outline-none'>
                      <SelectValue placeholder='Selecione o background' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value='whatsapp'>Default</SelectItem>
                        <SelectItem value='whatsapp-dark'>Dark</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className='flex w-full gap-2'>
                <Switch
                  checked={updatedChat?.status === 'online'}
                  onCheckedChange={(isChecked) =>
                    setUpdatedChat((prevChat) => ({
                      ...prevChat,
                      status: isChecked ? 'online' : 'offline',
                    }))
                  }
                />
                <span>Quero aparecer online</span>
              </div>

              {/* notificações de audio  */}

              {/* <div className='flex w-full gap-2'>
                <Switch
                  checked={updatedChat?.hasNotifySound === true}
                  onCheckedChange={(isChecked) =>
                    setUpdatedChat((prevChat) => ({
                      ...prevChat,
                      hasNotifySound: isChecked ? true : false,
                    }))
                  }
                />
                <span>Ativar notificações sonoras</span>
              </div> */}

              <Button
                onClick={handleSaveChanges}
                className='mt-2 self-start bg-[#0C88EE]'
              >
                Salvar configurações
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className='mx-auto w-[90%] py-6 md:w-[758px]'>
        <div className='relative flex w-full rounded-xl'>
          <ChatBuilderFrame chatId={chatId} updatedChat={updatedChat} />
        </div>
      </main>
    </div>
  )
}
